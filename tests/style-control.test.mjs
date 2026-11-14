import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { STYLE_PRESETS, stylePresetFor, localSetupDraft, applySetupStyle, setupMessages, parseSetupReply } from '../web/writing-tools.mjs';
import { newStory, contextFor, ensureChapters, addChapter, parseImport } from '../web/model.mjs';
import { generateRemote } from '../web/api.mjs';
import { createApp } from '../server.mjs';

const answers=['童话故事','小鹿阿叶，森林邮差，勇敢、细心','送达一封迟到的信','河上的桥被大雨冲断','回声森林，树木可以说话',''];
const prefs={provider:'deepseek',baseUrl:'https://api.deepseek.com',model:'deepseek-flash',temperature:.9,maxTokens:512,apiKey:'test-placeholder-not-a-key'};

test('每种文风的规则和示例进入 system；自定义补充、章节与备份不丢失',()=>{
  for(const p of STYLE_PRESETS){
    const a=[...answers];a[5]=p.name+'\n补充要求：第一人称，对话少一点。';
    const d=localSetupDraft(a),s=Object.assign(newStory(d.title,'小鹿阿叶走到河边。'),d);ensureChapters(s);
    assert.equal(stylePresetFor(a[5]),p);assert.ok(s.note.includes(p.rules));assert.ok(s.note.includes(p.example));assert.match(s.note,/补充要求优先/);
    assert.ok(!s.memory.includes(p.example));assert.ok(!s.lore.some(l=>l.text.includes(p.example)));
    const before=contextFor(s).messages[0].content;assert.ok(before.includes(p.rules));assert.match(before,/第一人称，对话少一点/);
    addChapter(s,'阿叶抵达河边，桥已断。','第二章');assert.equal(s.note,d.note);assert.ok(contextFor(s).messages[0].content.includes(p.rules));
    const [restored]=parseImport(JSON.stringify({format:'storydesk-local-v2',stories:[s]}),'story.json');assert.equal(restored.note,d.note);
  }
  const custom=[...answers];custom[5]='书信体，用第二人称，像写给远方朋友的信。';const d=localSetupDraft(custom);
  assert.ok(d.note.includes(custom[5]));assert.equal(stylePresetFor(custom[5]),null);assert.ok(!d.note.includes('阿宁'));
});

test('AI 整理即使省略文风，应用时仍恢复原选项规则；JSON 指令与正文指令分开',()=>{
  const a=[...answers];a[5]='文言文';
  const fake={title:'林间来信',memory:'阿叶送信。',note:'保持邮差身份与目标。',lore:[{title:'回声森林',keys:'回声森林',text:'树木会说话。',enabled:true}]};
  const draft=applySetupStyle(parseSetupReply(JSON.stringify(fake)),a);
  assert.ok(draft.note.includes(STYLE_PRESETS.find(p=>p.name==='文言文').rules));assert.ok(draft.note.includes(fake.note));
  assert.ok(setupMessages(a)[0].content.endsWith('本轮只整理设定，必须输出前述 JSON 对象，不写小说正文。'));
});

test('两种文风的续写经过前端与 HTTP 代理，实际请求载荷不同；新章继承文风',async()=>{
  const nativeFetch=globalThis.fetch,oldLocation=globalThis.location,seen=[];
  const server=createApp({resolveTarget:async()=>new URL('https://mock.example/chat/completions'),fetchImpl:async(url,opts)=>{
    seen.push(JSON.parse(opts.body));
    return new Response('data: '+JSON.stringify({model:'test-model',choices:[{delta:{content:'测试正文'},finish_reason:'stop'}]})+'\n\ndata: [DONE]\n\n',{headers:{'content-type':'text/event-stream'}});
  }});
  server.listen(0,'127.0.0.1');await once(server,'listening');const base='http://127.0.0.1:'+server.address().port;
  globalThis.location={protocol:'http:'};globalThis.fetch=(url,opts)=>nativeFetch(new URL(url,base),opts);
  try{
    for(const style of ['网络小说','文言文']){
      const a=[...answers];a[5]=style;const d=localSetupDraft(a),s=Object.assign(newStory(d.title,'阿叶来到了河边。'),d);
      ensureChapters(s);addChapter(s,'阿叶在河边找到一条船。','第二章');
      let text='';await generateRemote(prefs,contextFor(s).messages,new AbortController().signal,c=>text+=c);assert.equal(text,'测试正文');
    }
    assert.equal(seen.length,2);assert.match(seen[0].messages[0].content,/文风：网络小说/);assert.match(seen[1].messages[0].content,/文风：文言文/);
    assert.match(seen[1].messages[0].content,/叙述与对白均用浅近文言/);assert.match(seen[1].messages[0].content,/阿叶在河边找到一条船/);
    for(const request of seen){assert.equal(request.model,'deepseek-flash');assert.deepEqual(request.thinking,{type:'disabled'});}
  }finally{globalThis.fetch=nativeFetch;if(oldLocation===undefined)delete globalThis.location;else globalThis.location=oldLocation;server.close();await once(server,'close');}
});
