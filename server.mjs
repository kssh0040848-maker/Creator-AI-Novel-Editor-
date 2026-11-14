/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, resolve } from 'node:path';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { APP_ID, APP_VERSION } from './app-info.mjs';
import { createCredentialVault } from './credential-vault.mjs';

const root = dirname(fileURLToPath(import.meta.url));
export function privateIP(ip) {
  if (ip.includes(':')) {
    if (ip.startsWith('::ffff:')) return privateIP(ip.slice(7));
    return ip === '::' || ip === '::1' || /^(fc|fd|fe8|fe9|fea|feb)/i.test(ip);
  }
  const [a,b] = ip.split('.').map(Number);
  return a===0 || a===10 || a===127 || a>=224 || (a===169&&b===254) || (a===172&&b>=16&&b<=31) || (a===192&&b===168) || (a===100&&b>=64&&b<=127);
}
export async function targetURL(baseUrl, route) {
  let u; try { u = new URL(baseUrl); } catch { throw Error('请填写完整的 HTTPS 接口地址。'); }
  if (u.protocol !== 'https:' || u.username || u.password || u.search || u.hash || (u.port && u.port !== '443')) throw Error('本地试用版只连接标准 HTTPS 公网接口。');
  const addresses = await lookup(u.hostname, { all: true });
  if (!addresses.length || addresses.some(a => privateIP(a.address))) throw Error('此接口地址不可用。请使用模型服务商的公网 API 地址。');
  u.pathname = u.pathname.replace(/\/$/, '') + '/' + route;
  return u;
}
export function preparePayload(body) {
  if (typeof body.apiKey !== 'string' || !body.apiKey.trim() || body.apiKey.length > 600 || /[\r\n]/.test(body.apiKey)) throw Error('请在接口设置里填写有效的 API Key。');
  if (typeof body.model !== 'string' || !body.model.trim() || body.model.length > 120) throw Error('请填写模型名称。');
  if (!Array.isArray(body.messages) || body.messages.length > 6 || !body.messages.length || body.messages.some(m => !['system','user','assistant'].includes(m.role) || typeof m.content !== 'string')) throw Error('请求内容格式不正确。');
  if (body.messages.reduce((n,m)=>n+m.content.length,0) > 90000) throw Error('本次上下文过长，请缩短故事记忆或最近正文范围。');
  const max = Number(body.maxTokens), temp = Number(body.temperature);
  if (!Number.isInteger(max) || max < 64 || max > 2048 || !Number.isFinite(temp) || temp < 0 || temp > 2) throw Error('生成参数超出本地版允许的范围。');
  const payload = { model: body.model.trim(), messages: body.messages.map(({role,content})=>({role,content})), stream: true };
  // Some Chat Completions implementations accept max_completion_tokens instead;
  // current OpenAI reasoning models also reject an explicit sampling temperature.
  if (body.provider === 'openai') payload.max_completion_tokens = max;
  else payload.max_tokens = max;
  if (body.provider !== 'anthropic' && !(body.provider === 'openai' && /^(?:o\d|gpt-[56])/i.test(payload.model))) payload.temperature = temp;
  if (body.provider === 'deepseek') payload.thinking = { type: 'disabled' };
  return payload;
}
export function createApp({ preview = false, fetchImpl = fetch, resolveTarget = targetURL, vault=createCredentialVault() } = {}) {
  const token = randomBytes(32).toString('hex'); let generating = false;
  const json = (res, status, body) => { res.writeHead(status, {'content-type':'application/json; charset=utf-8','cache-control':'no-store'}); res.end(JSON.stringify(body)); };
  const server = http.createServer(async (req,res) => {
    res.setHeader('X-Content-Type-Options','nosniff'); res.setHeader('Referrer-Policy','no-referrer');
    res.setHeader('Cache-Control','no-store');
    const host = req.headers.host || '';
    if (!preview && !/^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)) return json(res,403,{error:'本地服务仅接受 localhost 访问。'});
    if (req.headers.origin) {
      let origin; try { origin = new URL(req.headers.origin).host; } catch {}
      const forwarded = preview ? req.headers['x-forwarded-host'] : null;
      if (origin !== host && origin !== forwarded) return json(res,403,{error:'请求来源不匹配，请从本地页面操作。'});
    }
    const path = new URL(req.url, 'http://localhost').pathname;
    if (req.method === 'GET' && path === '/api/session') return json(res,200,{token,app:APP_ID,version:APP_VERSION,credentials:{supported:!preview&&vault.supported,label:vault.label},canShutdown:!preview});
    if (path.startsWith('/api/')) {
      if (req.method !== 'POST' || !['/api/generate','/api/models','/api/credentials','/api/shutdown'].includes(path)) return json(res,404,{error:'接口不存在。'});
      const given = Buffer.from(String(req.headers['x-local-token'] || ''));
      const expected = Buffer.from(token);
      if (given.length !== expected.length || !timingSafeEqual(given,expected)) return json(res,403,{error:'会话已失效，请刷新页面。'});
      let body;
      try {
        const chunks=[];let size=0;for await (const chunk of req) { size+=chunk.length;if(size>400000)throw Error('请求过大。');chunks.push(chunk); }
        body = JSON.parse(Buffer.concat(chunks).toString());
        if(!body||typeof body!=='object'||Array.isArray(body))throw Error();
      } catch { return json(res,400,{error:'请求格式无效或内容过大。'}); }
      if(path==='/api/shutdown'){
        if(preview)return json(res,403,{error:'预览模式不提供退出本地服务。'});
        if(generating)return json(res,409,{error:'模型正在生成，请先停止写作，再退出服务。'});
        res.once('finish',()=>{server.close();server.closeIdleConnections();});
        return json(res,200,{stopped:true});
      }
      if(path==='/api/credentials'){
        if(preview||!vault.supported)return json(res,400,{error:'当前环境不支持加密记住密钥，请在本次打开时填写。'});
        try{
          if(body.action==='load')return json(res,200,await vault.load(body));
          if(body.action==='save')return json(res,200,await vault.save(body));
          if(body.action==='forget')return json(res,200,await vault.forget());
          return json(res,400,{error:'密钥操作不正确。'});
        }catch(e){return json(res,400,{error:e.message});}
      }
      let url,payload;
      try {
        if (body.provider === 'deepseek' && new URL(body.baseUrl).hostname !== 'api.deepseek.com') throw Error('DeepSeek 预设仅向官方接口发送密钥。');
        if (path === '/api/generate') payload = preparePayload(body);
        else if (typeof body.apiKey !== 'string' || !body.apiKey.trim() || body.apiKey.length > 600 || /[\r\n]/.test(body.apiKey)) throw Error('请填写有效的 API Key。');
        url = await resolveTarget(body.baseUrl, path === '/api/models' ? 'models' : 'chat/completions');
      } catch(e) { return json(res,400,{error:e.message.includes('getaddrinfo')?'无法解析接口地址。':e.message}); }
      if (path === '/api/generate' && generating) return json(res,429,{error:'已有续写请求进行中，请稍后再试。'});
      const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),180000);
      res.on('close',()=>controller.abort()); if(payload)generating=true;
      try {
        const upstream=await fetchImpl(url,{method:payload?'POST':'GET',headers:{authorization:'Bearer '+body.apiKey.trim(),...(payload?{'content-type':'application/json'}:{})},body:payload?JSON.stringify(payload):undefined,signal:controller.signal,redirect:'error'});
        if(!upstream.ok) {
          const friendly={401:'密钥无效或已过期。',402:'模型账户余额不足。',403:'没有访问该模型的权限。',404:'接口路径或模型不存在。',429:'模型服务繁忙或达到调用限制。'};
          await upstream.body?.cancel();
          return json(res,upstream.status>=400&&upstream.status<500?upstream.status:502,{error:friendly[upstream.status]||'模型服务返回错误（'+upstream.status+'），请稍后重试。'});
        }
        if(!payload){const value=await upstream.json();const entries=Array.isArray(value.data)?value.data.filter(m=>typeof m?.id==='string').slice(0,100):[];const models=entries.map(m=>m.id);const modelInfo=entries.map(m=>({id:m.id,contextWindow:Number.isInteger(m.context_window)&&m.context_window>=2048&&m.context_window<=2097152?m.context_window:null,maxOutputTokens:Number.isInteger(m.max_output_tokens)&&m.max_output_tokens>0?m.max_output_tokens:null}));return json(res,200,{models,modelInfo});}
        if(!upstream.headers.get('content-type')?.includes('text/event-stream')) {await upstream.body?.cancel();throw Error('服务商未返回兼容的流式格式。');}
        res.writeHead(200,{'content-type':'text/event-stream; charset=utf-8','cache-control':'no-cache','x-accel-buffering':'no'});
        for await(const chunk of upstream.body){if(res.destroyed)break;if(!res.write(chunk))await once(res,'drain',{signal:controller.signal});}
        res.end();
      } catch(e) {
        if(!res.destroyed){const msg=controller.signal.aborted?'请求超时或已停止。':e.message==='服务商未返回兼容的流式格式。'?e.message:'无法连接模型服务，请检查网络和接口地址。';if(res.headersSent)res.end('data: '+JSON.stringify({error:{message:msg}})+'\n\n');else json(res,502,{error:msg});}
      } finally {clearTimeout(timer);if(payload)generating=false;}
      return;
    }
    if(req.method!=='GET')return json(res,405,{error:'不支持的请求。'});
    const names = new Set(['index.html','style.css','app.mjs','model.mjs','continuation.mjs','api.mjs','migrations.mjs','starter.mjs','writing-tools.mjs','writing-ui.mjs','ui-tour.mjs','local-services-ui.mjs','shelf-model.mjs','shelf-ui.mjs','favicon.svg','intro.html','intro.js','lang.js']);
    const name=path==='/'?'index.html':path.slice(1);
    if(!names.has(name))return json(res,404,{error:'页面不存在。'});
    try{const bytes=await readFile(join(root,'web',name));res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'self'");res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'})[extname(name)]);res.end(bytes);}catch{json(res,404,{error:'文件不存在。'});}
  });return server;
}
if(process.argv[1] && fileURLToPath(import.meta.url)===resolve(process.argv[1])) {
  const preview=process.argv.includes('--preview');const portIndex=process.argv.indexOf('--port');const port=Number(portIndex>=0?process.argv[portIndex+1]:(process.env.PORT||4317));
  const server=createApp({preview});
  server.on('error',e=>{console.error(e.code==='EADDRINUSE'?'端口已占用，请关闭之前打开的本地服务窗口，或访问已有页面。':'本地服务启动失败。');process.exit(1);});
  server.listen(port,preview?'0.0.0.0':'127.0.0.1',()=>{
    const url='http://127.0.0.1:'+port;console.log('创作家本地版：'+url+'\n'+(process.argv.includes('--background')?'后台服务运行中，可从页面退出。':'调试模式：关闭此窗口会停止服务。')+'\n只有勾选「记住此电脑上的密钥」后才会加密保存 API Key。');
    if(process.argv.includes('--open')){
      const cmd=process.platform==='win32'?['cmd.exe',['/d','/s','/c',`start "" "${url}"`]]:process.platform==='darwin'?['open',[url]]:['xdg-open',[url]];
      const child=spawn(cmd[0],cmd[1],{stdio:'ignore',windowsVerbatimArguments:process.platform==='win32'});child.on('error',()=>{});child.unref();
    }
  });
}
