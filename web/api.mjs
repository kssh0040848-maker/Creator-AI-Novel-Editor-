/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
import { createContinuationFilter } from './continuation.mjs';

export async function readSSE(body, onEvent) {
  const reader = body.getReader(), decoder = new TextDecoder();
  let buffer = '', data = [];
  function line(value) {
    if (!value) {
      if (data.length) onEvent(data.join('\n'));
      data = [];
    } else if (value.startsWith('data:')) data.push(value.slice(5).replace(/^ /, ''));
  }
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      let i;
      while ((i = buffer.indexOf('\n')) >= 0) { line(buffer.slice(0, i).replace(/\r$/, '')); buffer = buffer.slice(i + 1); }
      if (buffer.length > 2000000) throw Error('接口返回内容过大。');
      if (done) { if (buffer) line(buffer); line(''); break; }
    }
  } catch(e) { await reader.cancel().catch(()=>{}); throw e; }
  finally { reader.releaseLock(); }
}
async function localFetch(path, options) {
  try { return await fetch(path, options); }
  catch(e) {
    if (e.name === 'AbortError' || options?.signal?.aborted) throw e;
    throw Error('无法连接创作家本地服务。请重新双击启动器，并从 http://127.0.0.1:4317 打开页面。');
  }
}
export async function connectSession(signal) {
  return (await localServiceInfo(signal)).token;
}
export async function localServiceInfo(signal) {
  if (!/^https?:$/.test(location.protocol)) throw Error('真实 API 需要先双击 start-windows.bat 启动本地服务。');
  const res = await localFetch('/api/session', { signal });
  if (!res.ok) throw Error('本地服务未就绪，请重新启动。');
  const session = await res.json().catch(() => ({}));
  if (typeof session.token !== 'string' || !session.token) throw Error('当前页面没有连接到创作家本地服务，请使用启动器打开。');
  return session;
}
export async function localOperation(path,body) {
  const token=await connectSession();
  const res=await localFetch(path,{method:'POST',headers:{'content-type':'application/json','x-local-token':token},body:JSON.stringify(body)});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw Error(data.error||'本地操作失败，请重试。');
  return data;
}
export async function listModels(config, signal, onInfo) {
  const token = await connectSession(signal);
  const res = await localFetch('/api/models', { method:'POST', headers:{'content-type':'application/json','x-local-token':token}, body:JSON.stringify(config), signal });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Error(data.error || '模型列表检查失败（' + res.status + '）。');
  if (!Array.isArray(data.models)) throw Error('接口没有返回可识别的模型列表，请使用试写验证。');
  onInfo?.(Array.isArray(data.modelInfo) ? data.modelInfo : []);
  return data.models;
}
export async function generateRemote(config, messages, signal, onText, onUsage) {
  const token = await connectSession(signal);
  const res = await localFetch('/api/generate', { method: 'POST', headers: { 'content-type': 'application/json', 'x-local-token': token }, body: JSON.stringify({ ...config, messages }), signal });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw Error(err.error || '接口请求失败（' + res.status + '）。'); }
  if (!res.headers.get('content-type')?.includes('text/event-stream') || !res.body) throw Error('接口没有返回可识别的流式正文。');
  let finished = false, hasText = false;
  const receipt = { requestId:'', model:'', finishReason:'', characters:0, usage:null };
  await readSSE(res.body, event => {
    if (event === '[DONE]') { finished = true; return; }
    let obj;try { obj = JSON.parse(event); } catch { throw Error('模型返回了无法解析的数据，已收到的正文仍保留。'); }
    if (obj.error) throw Error(typeof obj.error.message === 'string' ? obj.error.message : '模型返回错误，请检查模型名称和账户额度。');
    if (typeof obj.id === 'string') receipt.requestId = obj.id.slice(0,200);
    if (typeof obj.model === 'string') receipt.model = obj.model.slice(0,120);
    if (obj.usage) {receipt.usage=obj.usage;onUsage?.(obj.usage);}
    const c = obj.choices?.[0];
    if (typeof c?.delta?.content === 'string') {hasText ||= Boolean(c.delta.content.trim());receipt.characters+=Array.from(c.delta.content).length;onText(c.delta.content);}
    if (c?.finish_reason === 'content_filter') throw Error('模型服务商停止了本次输出。');
    if (c?.finish_reason) { finished = true;receipt.finishReason=c.finish_reason; }
  });
  if (!finished && !signal.aborted) throw Error('连接提前结束，已收到的正文已保留。');
  if (!hasText && !signal.aborted) throw Error('模型未返回有效正文，不能算作生成成功。请检查模型与生成设置。');
  return receipt;
}
// Only novel continuation uses overlap filtering; setup JSON and summaries do not.
export async function generateContinuationRemote(config,messages,base,signal,onText,onUsage) {
  const filter=createContinuationFilter(base,onText);let receipt;
  try{receipt=await generateRemote(config,messages,signal,chunk=>{if(!signal.aborted)filter.write(chunk);},onUsage);}
  finally{filter.finish();} // Keep buffered new text even on stop or stream failure.
  return {...receipt,removedPrefixCharacters:filter.removedCharacters};
}
export async function verifyGeneration(config, signal) {
  let text = '';
  const receipt = await generateRemote({...config,maxTokens:64,temperature:.7},[
    {role:'system',content:'你是一名小说作者。只输出一句简短的中文小说开头，不要解释。'},
    {role:'user',content:'写一个雨后车站的小说开头，约二十个汉字。'}
  ],signal,chunk=>text+=chunk);
  if (signal.aborted) throw Error('试写验证已停止。');
  return {text,receipt};
}
