import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newStory,textOf,snapshot,checkpoint,travel,editRuns,contextFor,parseImport } from '../web/model.mjs';
import { readSSE } from '../web/api.mjs';
import { createApp,preparePayload,privateIP } from '../server.mjs';

test('手动编辑保留其他 AI 段落来源，支持中文与 emoji',()=>{
 const runs=[{origin:'author',text:'开场。'},{origin:'ai',text:'他走过来🌙。'}];
 const next=editRuns(runs,'开场。他慢慢走过来🌙。');
 assert.equal(next.map(r=>r.text).join(''),'开场。他慢慢走过来🌙。');
 assert.equal(next.find(r=>r.text==='慢慢').origin,'author');
 assert.equal(next.at(-1).origin,'ai');
});
test('整次续写一次撤销，重做恢复文本和颜色，新编辑清空重做',()=>{
 const s=newStory('测试','开头');const before=snapshot(s);s.runs.push({origin:'ai',text:'续写一整段'});checkpoint(s,before,'AI续写');
 assert.ok(travel(s,'undo'));assert.equal(textOf(s),'开头');
 assert.ok(travel(s,'redo'));assert.equal(s.runs.at(-1).origin,'ai');assert.equal(textOf(s),'开头续写一整段');
 travel(s,'undo');const prev=snapshot(s);s.runs=editRuns(s.runs,'开头手写');checkpoint(s,prev,'手写');assert.equal(s.future.length,0);
});
test('空输出不制造撤销项，停止后的部分内容可完整撤销',()=>{
 const s=newStory('测试','原文');const before=snapshot(s);checkpoint(s,before,'空请求');assert.equal(s.past.length,0);
 s.runs.push({origin:'ai',text:'部分输出'});checkpoint(s,before,'停止');travel(s,'undo');assert.equal(textOf(s),'原文');
});
test('上下文包含记忆、作者注，只触发匹配词条并裁剪旧正文',()=>{
 const s=newStory('测试','很久以前。雾港出现了潮水。');s.memory='人物设定';s.note='第三人称';s.lore=[{id:'yes',enabled:true,keys:'雾港',title:'港口',text:'港口背景'},{id:'no',enabled:true,keys:'雪山',title:'雪山',text:'雪山词条独有的背景事实'}];
 const c=contextFor(s,10);assert.equal(c.activeLore.length,1);assert.ok(c.omitted);assert.match(c.messages[0].content,/人物设定/);assert.doesNotMatch(c.messages[0].content,/雪山词条独有的背景事实/);
});
test('旧 APK 备份可导入，不复制账号配置或原文身份 ID',()=>{
 const text=JSON.stringify({stories:[{id:'old',title:'旧故事',text:'小说',authorNote:'备注',lorebook:[{title:'角色',keys:['小林'],text:'描述',enabled:true}],settings:{token:'secret'}}]});
 const [s]=parseImport(text,'backup.json');assert.equal(textOf(s),'小说');assert.equal(s.note,'备注');assert.equal(s.lore[0].keys,'小林');assert.notEqual(s.id,'old');assert.equal(s.settings,undefined);
 assert.throws(()=>parseImport('{"stories":[{"text":123}]}','bad.json'));
});
test('流式解析跨 UTF-8 字节、跨行和 DONE',async()=>{
 const encoded=new TextEncoder().encode('data: {"text":"你好🌙"}\r\n\r\ndata: [DONE]\n\n');const events=[];
 const stream=new ReadableStream({start(c){for(const b of encoded)c.enqueue(new Uint8Array([b]));c.close();}});
 await readSSE(stream,s=>events.push(s));assert.deepEqual(events,['{"text":"你好🌙"}','[DONE]']);
});
test('模型参数上限与非思考模式，只发送标准消息字段',()=>{
 const body={apiKey:'test',model:'deepseek-flash',provider:'deepseek',maxTokens:512,temperature:.9,messages:[{role:'user',content:'正文',injected:'no'}]};const p=preparePayload(body);assert.deepEqual(p.thinking,{type:'disabled'});assert.equal(p.messages[0].injected,undefined);
 assert.throws(()=>preparePayload({...body,maxTokens:100000}));assert.equal(privateIP('127.0.0.1'),true);assert.equal(privateIP('192.168.1.1'),true);assert.equal(privateIP('8.8.8.8'),false);
});
test('本地代理会话验证、密钥转发、响应透传及不暴露源码',async()=>{
 let seen;const app=createApp({resolveTarget:async()=>new URL('https://model.example/chat/completions'),fetchImpl:async(url,options)=>{seen=options;return new Response('data: {"choices":[{"delta":{"content":"续写"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',{headers:{'content-type':'text/event-stream'}});}});
 await new Promise(r=>app.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+app.address().port;
 try{
  const session=await(await fetch(origin+'/api/session')).json();assert.ok(session.token);
  assert.equal((await fetch(origin+'/server.mjs')).status,404);
  assert.equal((await fetch(origin+'/api/session',{headers:{origin:'https://wrong.example'}})).status,403);
  assert.equal((await fetch(origin+'/api/generate',{method:'POST'})).status,403);
  const res=await fetch(origin+'/api/generate',{method:'POST',headers:{'content-type':'application/json','x-local-token':session.token},body:JSON.stringify({provider:'custom',baseUrl:'https://model.example/v1',apiKey:'dummy-secret',model:'test',maxTokens:256,temperature:.8,messages:[{role:'user',content:'续写'}]})});
  assert.equal(res.status,200);assert.match(await res.text(),/续写/);assert.equal(seen.headers.authorization,'Bearer dummy-secret');assert.equal(JSON.parse(seen.body).thinking,undefined);
 }finally{app.closeAllConnections();await new Promise(r=>app.close(r));}
});
