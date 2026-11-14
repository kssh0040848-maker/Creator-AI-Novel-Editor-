import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp, preparePayload } from '../server.mjs';
import { listModels, generateRemote, generateContinuationRemote, verifyGeneration } from '../web/api.mjs';
import { newStory, contextFor, editRuns, textOf } from '../web/model.mjs';

const config={provider:'deepseek',baseUrl:'https://api.deepseek.com',apiKey:' audit-dummy-key ',model:'deepseek-flash',maxTokens:256,temperature:1.2};
const chunks=(content='雨停时，她在站台上看见了昨天的自己。')=>[
  {id:'audit-request-01',model:'deepseek-flash',choices:[{delta:{content},finish_reason:null}]},
  {id:'audit-request-01',model:'deepseek-flash',choices:[{delta:{},finish_reason:'stop'}],usage:{prompt_tokens:42,completion_tokens:18,total_tokens:60}}
];
const sse=(values=chunks(),done=true)=>new Response(values.map(v=>'data: '+JSON.stringify(v)+'\n\n').join('')+(done?'data: [DONE]\n\n':''),{headers:{'content-type':'text/event-stream'}});

test('服务商预设只发送兼容的文本参数',()=>{
  const base={...config,messages:[{role:'system',content:'小说设定'},{role:'user',content:'接着写'}]};
  for(const provider of ['deepseek','qwen','gemini','xai','siliconflow','openrouter','custom']){
    const p=preparePayload({...base,provider});assert.equal(p.max_tokens,256);assert.equal(p.temperature,1.2);
    assert.deepEqual(p.thinking,provider==='deepseek'?{type:'disabled'}:undefined);
  }
  const claude=preparePayload({...base,provider:'anthropic'});assert.equal(claude.max_tokens,256);assert.equal(claude.temperature,undefined);
  const openai=preparePayload({...base,provider:'openai',model:'gpt-6-sol'});
  assert.equal(openai.max_completion_tokens,256);assert.equal(openai.max_tokens,undefined);assert.equal(openai.temperature,undefined);
  const older=preparePayload({...base,provider:'openai',model:'gpt-4o'});assert.equal(older.temperature,1.2);
});

test('主流入口经本地代理发送到各自的 Chat Completions 路径',async()=>{
  const destinations={
    openai:'https://api.openai.com/v1',anthropic:'https://api.anthropic.com/v1',
    gemini:'https://generativelanguage.googleapis.com/v1beta/openai',
    qwen:'https://dashscope.aliyuncs.com/compatible-mode/v1',xai:'https://api.x.ai/v1',
    siliconflow:'https://api.siliconflow.cn/v1',openrouter:'https://openrouter.ai/api/v1'
  };
  for(const [provider,baseUrl] of Object.entries(destinations)){
    await withBridge(async()=>sse(),async seen=>{
      let result='';await generateRemote({...config,provider,baseUrl,model:'user-chosen-model'},[{role:'user',content:'下一章'}],new AbortController().signal,chunk=>result+=chunk);
      assert.equal(seen.length,1,provider);assert.equal(seen[0].url,baseUrl+'/chat/completions');
      assert.equal(seen[0].options.headers.authorization,'Bearer audit-dummy-key');
      assert.equal(JSON.parse(seen[0].options.body).model,'user-chosen-model');assert.ok(result.length>0);
    });
  }
});

async function withBridge(upstream,run){
  const realFetch=globalThis.fetch,oldLocation=Object.getOwnPropertyDescriptor(globalThis,'location');
  const seen=[];
  const app=createApp({resolveTarget:async(base,route)=>new URL(base.replace(/\/$/,'')+'/'+route),fetchImpl:async(url,options)=>{seen.push({url:String(url),options});return upstream(url,options);}});
  await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));
  const origin='http://127.0.0.1:'+app.address().port;
  globalThis.location={protocol:'http:'};
  globalThis.fetch=(url,options)=>realFetch(typeof url==='string'&&url.startsWith('/')?origin+url:url,options);
  try{await run(seen);}finally{globalThis.fetch=realFetch;if(oldLocation)Object.defineProperty(globalThis,'location',oldLocation);else delete globalThis.location;app.closeAllConnections();await new Promise(resolve=>app.close(resolve));}
}

test('前端到本地代理到模型的调用检查（上游为可控模拟，无真实 Key）',async t=>{
  await t.test('手改末句经 HTTP 发出最新正文，模型重复前缀不进入新增正文',async()=>{
    const story=newStory('测试','林夏走到了门前。');story.runs=editRuns(story.runs,'林夏走到了门前。林夏从口袋拿出了一把旧钥匙');
    const echo='林夏从口袋拿出了一把旧钥匙',next='，门锁却自己转动起来。';
    const values=[...Array.from(echo+next).map(content=>({choices:[{delta:{content},finish_reason:null}]})),{choices:[{delta:{},finish_reason:'stop'}]}];
    await withBridge(async()=>sse(values),async seen=>{
      let output='';const receipt=await generateContinuationRemote(config,contextFor(story).messages,textOf(story),new AbortController().signal,c=>output+=c);
      assert.equal(output,next);assert.equal(receipt.removedPrefixCharacters,echo.length);assert.equal(seen.length,1);
      assert.ok(JSON.parse(seen[0].options.body).messages[1].content.endsWith(textOf(story)));
    });
  });
  await t.test('流式错误时尚未判定为重复的文字不会丢失',async()=>{
    await withBridge(async()=>sse([{choices:[{delta:{content:'abcdefgh'},finish_reason:null}]}],false),async()=>{
      let output='';await assert.rejects(generateContinuationRemote(config,[{role:'user',content:'继续'}],'abcdefghijklmnop',new AbortController().signal,c=>output+=c),/连接提前结束/);
      assert.equal(output,'abcdefgh');
    });
  });
  await t.test('停止请求时保留去重缓冲中的非重复文字',async()=>{
    const controller=new AbortController();
    await withBridge(async(_url,options)=>new Response(new ReadableStream({start(c){
      c.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"abcdefgh"},"finish_reason":null}],"usage":{"completion_tokens":1}}\n\n'));
      options.signal.addEventListener('abort',()=>{try{c.close();}catch{}},{once:true});
    }}),{headers:{'content-type':'text/event-stream'}}),async()=>{
      let output='';
      // Abort from usage in a following event, after the preceding text was buffered.
      const abortAfterText=()=>setTimeout(()=>controller.abort(),10);
      await assert.rejects(generateContinuationRemote(config,[{role:'user',content:'继续'}],'abcdefghijklmnop',controller.signal,c=>output+=c,abortAfterText),/abort/i);
      assert.equal(output,'abcdefgh');
    });
  });
  await t.test('测试连接只取模型列表，不发起生成',async()=>{
    await withBridge(async()=>Response.json({data:[{id:'deepseek-flash'},{id:'deepseek-v4-pro'}]}),async seen=>{
      assert.deepEqual(await listModels(config,new AbortController().signal),['deepseek-flash','deepseek-v4-pro']);
      assert.equal(seen.length,1);assert.equal(seen[0].url,'https://api.deepseek.com/models');assert.equal(seen[0].options.method,'GET');assert.equal(seen[0].options.body,undefined);assert.equal(seen[0].options.headers.authorization,'Bearer audit-dummy-key');
    });
  });
  await t.test('续写实际携带前情、作者要求、命中设定和生成参数',async()=>{
    const story=newStory('标题不用于提示词','旧秘密不应发送。'.repeat(100)+'小舟抵达灯塔。');story.memory='她在寻找失散的姐姐';story.note='用第一人称，节奏克制';
    story.lore=[{id:'hit',enabled:true,keys:'灯塔',title:'灯塔',text:'灯塔只在午夜亮起'},{id:'off',enabled:false,keys:'小舟',title:'禁用',text:'禁用内容不发送'},{id:'miss',enabled:true,keys:'雪山',title:'未命中',text:'未命中内容不发送'}];
    const context=contextFor(story,8);assert.equal(context.omitted,true);assert.deepEqual(context.activeLore.map(x=>x.id),['hit']);
    await withBridge(async()=>sse(),async seen=>{
      let text='',usage;const receipt=await generateRemote(config,context.messages,new AbortController().signal,c=>text+=c,u=>usage=u);
      assert.equal(seen.length,1);assert.equal(seen[0].url,'https://api.deepseek.com/chat/completions');assert.equal(seen[0].options.method,'POST');
      const sent=JSON.parse(seen[0].options.body);assert.equal(sent.model,'deepseek-flash');assert.equal(sent.stream,true);assert.equal(sent.max_tokens,256);assert.equal(sent.temperature,1.2);assert.deepEqual(sent.thinking,{type:'disabled'});
      assert.match(sent.messages[0].content,/寻找失散的姐姐/);assert.match(sent.messages[0].content,/第一人称/);assert.match(sent.messages[0].content,/午夜亮起/);
      assert.doesNotMatch(JSON.stringify(sent),/禁用内容|未命中内容|旧秘密/);assert.match(sent.messages[1].content,/小舟抵达灯塔/);
      assert.match(text,/昨天的自己/);assert.equal(receipt.requestId,'audit-request-01');assert.equal(receipt.model,'deepseek-flash');assert.equal(usage.completion_tokens,18);
      assert.equal(sent.apiKey,undefined);assert.equal(sent.uiFontSize,undefined);
    });
  });
  await t.test('试写验证请求短句，限制 64 tokens 并返回回执',async()=>{
    await withBridge(async()=>sse(),async seen=>{
      const result=await verifyGeneration(config,new AbortController().signal);assert.match(result.text,/雨停/);assert.equal(result.receipt.usage.total_tokens,60);
      const sent=JSON.parse(seen[0].options.body);assert.equal(sent.max_tokens,64);assert.match(sent.messages[1].content,/雨后车站/);assert.equal(seen.length,1);
    });
  });
  for(const [status,message] of [[401,/密钥无效/],[402,/余额不足/],[429,/调用限制/]])await t.test('HTTP '+status+' 明确报错且只请求一次',async()=>{
    await withBridge(async()=>new Response('{}',{status}),async seen=>{
      let received='';await assert.rejects(generateRemote(config,[{role:'user',content:'开头'}],new AbortController().signal,c=>received+=c),message);
      assert.equal(received,'');assert.equal(seen.length,1);
    });
  });
  await t.test('空正文和只有思考内容均不能报告成功',async()=>{
    for(const values of [chunks('   '),[{choices:[{delta:{reasoning_content:'思考'},finish_reason:'stop'}]}]]){
      await withBridge(async()=>sse(values),async()=>await assert.rejects(verifyGeneration(config,new AbortController().signal),/未返回有效正文/));
    }
  });
  await t.test('流式中途断开会报错，并保留已返回正文',async()=>{
    await withBridge(async()=>sse([{choices:[{delta:{content:'部分正文'},finish_reason:null}]}],false),async()=>{
      let received='';await assert.rejects(generateRemote(config,[{role:'user',content:'开头'}],new AbortController().signal,c=>received+=c),/连接提前结束/);assert.equal(received,'部分正文');
    });
  });
  await t.test('服务商错误流保留具体原因',async()=>{
    await withBridge(async()=>sse([{error:{message:'模拟上游超时'}}]),async()=>{
      await assert.rejects(verifyGeneration(config,new AbortController().signal),/模拟上游超时/);
    });
  });
  await t.test('停止操作会取消本地代理的上游请求',async()=>{
    let stopped=false;const controller=new AbortController();
    await withBridge(async(_url,options)=>new Response(new ReadableStream({start(c){
      c.enqueue(new TextEncoder().encode('data: {"choices":[{"delta":{"content":"一段正文"},"finish_reason":null}]}\n\n'));
      options.signal.addEventListener('abort',()=>{stopped=true;try{c.close();}catch{}},{once:true});
    }}),{headers:{'content-type':'text/event-stream'}}),async seen=>{
      await assert.rejects(generateRemote(config,[{role:'user',content:'开头'}],controller.signal,()=>controller.abort()),/abort/i);
      for(let i=0;i<20&&!stopped;i++)await new Promise(r=>setTimeout(r,10));
      assert.equal(stopped,true);assert.equal(seen.length,1);
    });
  });
  await t.test('本地服务连接失败给出操作提示',async()=>{
    const realFetch=globalThis.fetch,oldLocation=Object.getOwnPropertyDescriptor(globalThis,'location');globalThis.location={protocol:'http:'};globalThis.fetch=async()=>{throw new TypeError('Failed to fetch');};
    try{await assert.rejects(listModels(config,new AbortController().signal),/重新双击启动器/);}finally{globalThis.fetch=realFetch;if(oldLocation)Object.defineProperty(globalThis,'location',oldLocation);else delete globalThis.location;}
  });
});
