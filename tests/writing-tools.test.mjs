import test from 'node:test';
import assert from 'node:assert/strict';
import { newStory,ensureChapters,syncChapter,activateChapter,addChapter,chapterFingerprint,chapterContinuityStale,wholeStoryText,parseImport,contextFor,checkpoint,travel,textOf } from '../web/model.mjs';
import { SETUP_QUESTIONS,localSetupDraft,validateSetupDraft,parseSetupReply,setupMessages,writingContext,modelCapacity,summaryPlan,summarizeChapter,messageTokens } from '../web/writing-tools.mjs';
import { generateRemote } from '../web/api.mjs';
import { createApp } from '../server.mjs';
import { once } from 'node:events';
const prefs={provider:'deepseek',baseUrl:'https://api.deepseek.com',model:'deepseek-flash',temperature:.9,maxTokens:512,contextLength:12000};
test('六问整理覆盖三类设定，关键词可触发；无有效 AI JSON 时拒绝应用',()=>{
 assert.equal(SETUP_QUESTIONS.length,6);const a=['现实生活','张明，修车师傅','找回家人','旅途受阻','海桥镇，一切遵循现实','第一人称，克制'];
 const d=validateSetupDraft(localSetupDraft(a));const s=Object.assign(newStory(d.title,'张明回到海桥镇。'),d);
 assert.equal(contextFor(s).activeLore.length,2);for(const text of a)assert.ok((d.memory+d.note).includes(text));assert.ok(setupMessages(a)[1].content.includes('海桥镇'));
 assert.throws(()=>parseSetupReply('{"title":"未完成"'));assert.throws(()=>validateSetupDraft({...d,lore:[{title:'空词条'}]}));
});
test('旧故事迁为首章，新建/切换/撤销和 JSON 往返保留全部正文及前情',()=>{
 const s=newStory('长篇','第一章的原文');const first=ensureChapters(s);checkpoint(s,[],'第一章写作');const fingerprint=chapterFingerprint(s);
 const next=addChapter(s,'主角张明已经到海桥镇。','第二章');assert.equal(textOf(s),'');assert.equal(next.sourceHash,fingerprint);assert.equal(s.past.length,0);
 assert.match(contextFor(s).messages[1].content,/承接前章/);s.runs=[{text:'第二章内容',origin:'ai'}];checkpoint(s,[],'AI 续写');travel(s,'undo');assert.equal(textOf(s),'');travel(s,'redo');syncChapter(s);
 activateChapter(s,first.id);assert.equal(textOf(s),'第一章的原文');assert.equal(s.past.length,1);activateChapter(s,next.id);assert.equal(textOf(s),'第二章内容');
 assert.match(contextFor(s).messages[0].content,/主角张明已经到海桥镇/);assert.match(wholeStoryText(s),/第一章的原文[\s\S]*第二章内容/);
 const [restored]=parseImport(JSON.stringify({format:'storydesk-local-v2',stories:[s]}),'backup.json');assert.equal(restored.chapters.length,2);assert.equal(textOf(restored),'第二章内容');assert.equal(restored.past.length,1);assert.equal(restored.chapters[1].sourceChapterId,restored.chapters[0].id);
 const third=addChapter(s,'前两章人物已经见面。','第三章');activateChapter(s,first.id);s.runs=[{origin:'author',text:'第一章发生了修改'}];syncChapter(s);assert.equal(chapterContinuityStale(s,third),true);assert.throws(()=>addChapter(s,'摘要','错误的分支'),/最后一章/);
 assert.throws(()=>parseImport(JSON.stringify({stories:[{...s,chapters:[{id:'bad',runs:[{text:4}]}]}]}),'x.json'));
});
test('上下文区分模型容量与本地裁剪，预警、保留输出空间和硬阻断',()=>{
 const s=newStory('长篇','中'.repeat(13000));const b=writingContext(s,prefs);assert.equal(b.capacity.tokens,1048576);assert.equal(b.sentChars,12000);assert.equal(b.omittedChars,1000);assert.equal(b.pressure,true);assert.equal(b.blocked,false);
 const small=writingContext(s,{...prefs,contextWindow:8192});assert.equal(small.adjusted,true);assert.ok(small.total<=8192*.9);assert.equal(small.context.recent.length,small.sentChars);
 s.memory='设'.repeat(16000);assert.equal(writingContext(s,{...prefs,contextWindow:2048}).blocked,true);
 assert.equal(modelCapacity({...prefs,provider:'custom',baseUrl:'https://example.com',modelInfo:[{id:prefs.model,baseUrl:prefs.baseUrl,contextWindow:1048576}]}).assumed,true);
 assert.equal(modelCapacity({...prefs,modelInfo:[{id:prefs.model,baseUrl:prefs.baseUrl,contextWindow:32768}]}).tokens,32768);
 assert.equal(contextFor(s,0).recent,'');
});
test('长章总结完整分段、顺序合并前情，确认前不修改故事',async()=>{
 const s=newStory('长章','起点'+('正文🙂'.repeat(7000))+'终点');s.carrySummary='此前人物已相识';const original=JSON.stringify(s),plan=summaryPlan(s,prefs),seen=[];
 assert.equal(plan.chunks.join(''),textOf(s));assert.ok(plan.chunks.length>1);
 const result=await summarizeChapter(s,prefs,new AbortController().signal,async(c,m,signal,append)=>{seen.push(m);assert.equal(c.maxTokens,1536);assert.ok(messageTokens(m)+1536<1048576);append('第 '+seen.length+' 段摘要，人物抵达车站。');return{finishReason:'stop',model:'fake-test'};});
 assert.equal(seen.length,plan.chunks.length);assert.match(seen[0][1].content,/此前人物已相识/);assert.match(seen[1][1].content,/第 1 段摘要/);assert.match(seen.at(-1)[1].content,/终点/);assert.match(result.summary,/车站/);assert.equal(JSON.stringify(s),original);
});
test('总结取消、截断或某段失败不会产生章节或丢失正文',async()=>{
 const s=newStory('长章','长'.repeat(25000)),before=JSON.stringify(s),ctrl=new AbortController();let n=0;
 await assert.rejects(summarizeChapter(s,prefs,ctrl.signal,async(c,m,sig,append)=>{n++;append('部分摘要');ctrl.abort();return{finishReason:'stop'};}),/停止/);assert.equal(n,1);assert.equal(JSON.stringify(s),before);
 await assert.rejects(summarizeChapter(s,prefs,new AbortController().signal,async(c,m,sig,append)=>{append('未完成');return{finishReason:'length'};}),/不完整/);assert.equal(JSON.stringify(s),before);
});
test('新手整理与分章总结均通过真实前端和本地 HTTP 代理，模拟上游核对用途',async()=>{
 const nativeFetch=globalThis.fetch,oldLocation=globalThis.location,requests=[];
 const server=createApp({resolveTarget:async(base,path)=>new URL('https://mock.example/'+path),fetchImpl:async(url,opts)=>{
   const body=JSON.parse(opts.body);requests.push(body);const text=body.messages[0].content.includes('JSON')?JSON.stringify(localSetupDraft(SETUP_QUESTIONS.map(q=>q.fallback))):'人物在街角告别，钥匙仍由陈照保管。';
   return new Response('data: '+JSON.stringify({id:'test-only',model:'mock-model',choices:[{delta:{content:text},finish_reason:'stop'}]})+'\n\ndata: [DONE]\n\n',{headers:{'content-type':'text/event-stream'}});
 }});server.listen(0,'127.0.0.1');await once(server,'listening');const base='http://127.0.0.1:'+server.address().port;
 globalThis.location={protocol:'http:'};globalThis.fetch=(url,opts)=>nativeFetch(new URL(url,base),opts);
 try{const config={...prefs,apiKey:'unit-test-placeholder-only'};let output='';await generateRemote({...config,maxTokens:2048},setupMessages([]),new AbortController().signal,c=>output+=c);assert.ok(parseSetupReply(output).lore.length);
   await summarizeChapter(newStory('测试','他们在街角告别。'),config,new AbortController().signal,generateRemote);assert.equal(requests.length,2);assert.equal(requests[0].model,'deepseek-flash');assert.equal(requests[1].max_tokens,1536);assert.ok(requests[1].messages[1].content.includes('街角告别'));assert.deepEqual(requests[1].thinking,{type:'disabled'});
 }finally{globalThis.fetch=nativeFetch;if(oldLocation===undefined)delete globalThis.location;else globalThis.location=oldLocation;server.close();await once(server,'close');}
});
