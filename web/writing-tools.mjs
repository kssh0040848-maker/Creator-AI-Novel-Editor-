/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
import { contextFor, textOf, uid } from './model.mjs';

// Original examples show the same scene, so readers can compare language rather than plots.
export const STYLE_PRESETS = [
  {name:'网络小说',description:'直白好读，推进快，有悬念',rules:'使用现代白话，常用词为主，句子长短交替；一段集中写一个动作或反应。通过行动、对话和明确的因果推进情节，让人物的目标与眼前阻力清楚可见。在合适的场景转折处留下待解问题，不强行每段反转，不重复解释已知信息。',example:'信箱里只有一把旧钥匙。阿宁刚拿起来，楼上的灯就亮了。那间屋子，已经空了十年。'},
  {name:'言情散文',description:'细腻抒情，用细节写情绪',rules:'使用自然、细腻的现代汉语，长短句有呼吸感。用触感、声音、动作与对话停顿表现人物感情，让情绪依附于具体事物。比喻少而准确，抒情之后回到人物行动；不堆砌华丽形容词，不反复直说爱与痛，不为文风擅自新增恋爱关系。',example:'信箱里躺着一把旧钥匙。阿宁捂了片刻，金属仍是凉的。她忽然记起，那人出门时，总要回头问一句：钥匙带了吗？'},
  {name:'文言文',description:'简练典雅，叙事清楚',rules:'叙述与对白均用浅近文言，以简洁动词、短句和省略表达为主，虚词自然，人物指代清楚，保留现代标点便于阅读。叙事连贯，不夹现代网络口语，不堆砌生僻字、典故或对仗，不附白话翻译。专名与世界规则仍遵循故事设定，不擅自改成古代背景。',example:'阿宁启函匣，得旧钥一枚，锈迹斑然。方取之，楼上灯忽明。彼室无人居，已十年矣。'},
  {name:'朴素写实',description:'少修饰，像生活里发生的事',rules:'使用朴素准确的现代白话，以具体动作、物件和生活化对白呈现人物。情绪藏在选择与细节里，少用抽象评判、夸张比喻和抒情总结。节奏从容但每段有新信息，保留生活的因果与阻力，不替读者下结论。',example:'阿宁从信箱里取出一把旧钥匙，指尖沾了点锈。她拿纸擦了擦，放进外套口袋，又照常上楼做饭。'},
  {name:'轻松幽默',description:'轻快自然，笑点来自反差',rules:'使用轻快的现代口语和利落的句子，用人物处境、认知差异和动作反差制造幽默。对白有来有往，笑点之后继续推进事情。少用过时网络梗，不强行每句抖包袱，不贬低人物，不把严肃场面随意改成笑话。',example:'信箱里多了一把旧钥匙。阿宁看了半天，决定先不高兴。上个月收到一张免费券，她为此花了三百块。'},
  {name:'童话叙述',description:'简单温暖，有想象力',rules:'使用儿童容易理解的词语和较短句子，意象具体，因果清晰。用温柔的叙述、少量有节奏的重复与好奇心推动故事，让人物通过行动面对困难。只有世界设定允许时才加入拟人或魔法，不堆叠抽象哲理，不在结尾硬加道理。',example:'阿宁在信箱里发现一把小小的旧钥匙。她把它放在掌心，轻轻问：“你是哪扇门的钥匙呀？”她决定带它去找一找。'}
];
export function stylePresetFor(answer='') {
  let text=String(answer).trim();const aliases=['Web fiction','Lyrical romance','Classical Chinese','Plain realism','Light humor','Fairy-tale narration'];for(let i=0;i<aliases.length;i++)if(text===aliases[i]||text.startsWith(aliases[i]+'\n')||text.startsWith(aliases[i]+':')){text=STYLE_PRESETS[i].name+text.slice(aliases[i].length);break;}
  return STYLE_PRESETS.find(p=>text===p.name||text.startsWith(p.name+'\n')||text.startsWith(p.name+'：'))||null;
}
export function stylePrompt(answer='') {
  const text=String(answer).trim()||STYLE_PRESETS[0].name,preset=stylePresetFor(text);
  if(globalThis.CreatorLocale?.get()==='en'){
    const rules=[
      'Use clear contemporary prose, varied sentence lengths and a brisk pace. Show goals and obstacles through action, dialogue and cause and effect. Leave questions at natural scene turns; avoid forced twists or repeated explanations.',
      'Use natural, lyrical prose. Convey feelings through touch, sound, small actions and pauses. Keep metaphors precise and sparse; return to action after reflection. Do not invent a romance just to suit the style.',
      'Write narration and dialogue in accessible Classical Chinese. Use concise verbs and short clauses with clear references and modern punctuation. Avoid modern slang, obscure allusions and appended translations. Preserve the existing world and proper names.',
      'Use plain, precise language and everyday dialogue. Reveal emotion through choices and concrete details. Avoid abstract judgments, inflated metaphors and moralizing. Let every paragraph add information.',
      'Use light conversational prose and concise sentences. Build humor from situations, differences in understanding and unexpected actions. Keep the plot moving. Avoid forced jokes, stale memes or belittling characters.',
      'Use simple, warm language, short sentences and concrete images. Keep cause and effect clear. Let curiosity and action drive the story. Add personification or magic only if the world allows it; do not append a moral.'
    ];
    return '[Style direction]\n'+(preset?globalThis.CreatorLocale.t(preset.name)+'\n'+rules[STYLE_PRESETS.indexOf(preset)]:'Follow the user’s requested vocabulary, rhythm, pace and emotional tone.')+(preset?'\n\n[Language sample only: do not reuse its characters, objects or events]\n'+globalThis.CreatorLocale.t(preset.example):'')+'\n\n[User’s choice and additions]\n'+text+'\n\nUser additions override defaults. Preserve established characters, world facts, language and viewpoint. For an empty story, use English unless the user requests another language or chooses Classical Chinese. Advance one scene without ending the whole story. Output only new story text; do not repeat the instructions or sample.';
  }
  const parts=['【文风要求】',preset?'文风：'+preset.name+'\n'+preset.rules:'按下面的自定义文风要求安排用词、句式、节奏与情绪表达。'];
  if(preset)parts.push('【文风示例：仅参考语言，不属于故事事实，不复用其中的人名、物品或情节】\n'+preset.example);
  parts.push('【用户的文风选择与补充】\n'+text,'补充要求优先于默认文风规则。保持已确定的人物、世界与剧情事实；延续已有叙述视角，开篇未指定视角时用第三人称。每次推进一个场景，不提前替故事收尾。只输出小说正文，不复述上述要求或示例。');
  return parts.join('\n\n');
}
export function applySetupStyle(draft,answers) {
  return {...draft,note:(draft.note.trim()?(globalThis.CreatorLocale?.get()==='en'?'[Other writing directions]\n':'【其他写作要求】\n')+draft.note.trim()+'\n\n':'')+stylePrompt(answers[5])};
}
export const SETUP_QUESTIONS = [
  {title:'你想写哪种故事？',help:'选一种喜欢的，也可以在下面写自己的想法',placeholder:'例如：一只小狐狸，出发去寻找丢失的月亮。',choices:['都市奇幻','悬疑推理','现实生活','冒险成长','浪漫爱情','童话故事'],fallback:'都市奇幻，普通人的生活出现一件不寻常的事。'},
  {title:'主角是谁？',help:'写下名字、身份和性格特质，比如勇敢、细心或好奇',placeholder:'例如：陈照，修理店店主，细心、热情，喜欢琢磨新点子。',choices:['陈照，修理店店主，细心又热情','林夏，实习生，开朗、认真','周野，旅人，安静又好奇'],fallback:'陈照，修理店店主，细心、热情，喜欢琢磨新点子。'},
  {title:'主角最想做到什么？',help:'给主角一个具体愿望，故事就有了方向。',placeholder:'例如：在月底之前保住家里的小店。',choices:['保住家里的小店','找回失踪的重要的人','证明一次被误解的选择','重新修复一段关系'],fallback:'在月底之前保住家里的小店。'},
  {title:'主角将要面临的困难是什么？',help:'想一想：有什么事，让主角很难实现愿望',placeholder:'例如：唯一肯帮忙的人，要求主角隐瞒一个真相。',choices:['帮忙的人提出了难以接受的条件','越接近真相，越可能伤害朋友','时间不够，必须放弃一样重要的东西'],fallback:'唯一肯帮忙的人要求主角隐瞒一个真相，主角必须在眼前的生计和承诺之间作选择。'},
  {title:'故事发生在哪里，有什么特别的规则？',help:'现实故事也可以写：今天的某座城市，遵循现实规律。',placeholder:'例如：青禾街，修好的旧物会重现原主人的一段记忆，但只能看一次。',choices:['青禾街：修好的旧物会重现一次记忆','当代小城：一切遵循现实规律','远航列车：每站只能带走一样东西'],fallback:'青禾街，修好的旧物会重现原主人的一段记忆，但只能看一次。'},
  {title:'你希望是什么文风？',help:'选一种，看一小段示例；也可以自己写要求',placeholder:'例如：网络小说\n补充要求：第一人称，对话多一点，不要夸张的比喻。',choices:STYLE_PRESETS.map(p=>p.name),fallback:'网络小说'}
];
export function localSetupDraft(answers) {
  const a=SETUP_QUESTIONS.map((q,i)=>String(answers[i]||globalThis.CreatorLocale?.t(q.fallback)||q.fallback).trim());
  const keyword=s=>s.split(/[，,：:。\s]/)[0].slice(0,20);
  if(globalThis.CreatorLocale?.get()==='en')return {title:'Untitled story',memory:`Genre: ${a[0]}\nMain character: ${a[1]}\nGoal: ${a[2]}\nChallenge: ${a[3]}\nWorld: ${a[4]}`,note:stylePrompt(a[5]),lore:[{title:'Main character',keys:keyword(a[1]),text:a[1],enabled:true},{title:'Story world',keys:keyword(a[4]),text:a[4],enabled:true}]};
  return {title:'未命名的新故事',memory:`故事类型：${a[0]}\n主角：${a[1]}\n主角的目标：${a[2]}\n主角将面临的困难：${a[3]}\n故事世界：${a[4]}`,note:stylePrompt(a[5]),lore:[{title:'主角',keys:keyword(a[1]),text:a[1],enabled:true},{title:'故事世界',keys:keyword(a[4]),text:a[4],enabled:true}]};
}
export function setupMessages(answers) {
  return [{role:'system',content:(globalThis.CreatorLocale?.get()==='en'?'Write the title, memory and note in English unless the user requests otherwise. Preserve names, facts and user-specified language.\n':'')+'你是帮助新手建立小说设定的编辑。根据六个回答整理设定，保留用户指定的人物、性格特质、类型、边界和规则，不强行为主角添加弱点。缺失的细节可以提出合理的创作建议，但不要写成已发生剧情。只输出 JSON 对象，字段 title、memory、note、lore。title 是故事名，memory 是故事背景、主角关系和主要目标，note 只写与用户选择一致的视角和补充写作要求，不重新选择文风或擅自改写视角。文风示例仅用于语言参考，绝不能混入人物设定、故事记忆或世界书。lore 是 2–5 个世界书词条，词条字段 title、keys（以逗号分隔的实际人名/地名/物品名）、text、enabled（true）。关键词应能在正文出现。memory 500 字内，note 200 字内，每个词条 180 字内。不要输出 Markdown。\n\n第六题的文风约束如下，整理时必须保留其意图；具体规则由应用原样写入作者注：\n'+stylePrompt(answers[5])+'\n\n以上文风规则用于未来的正文续写。本轮只整理设定，必须输出前述 JSON 对象，不写小说正文。'}, {role:'user',content:JSON.stringify(SETUP_QUESTIONS.map((q,i)=>({question:q.title,answer:answers[i]||q.fallback})))}];
}
export function validateSetupDraft(value) {
  if(!value||typeof value!=='object'||Array.isArray(value))throw Error('整理结果格式不完整，请重试或使用直接整理。');
  for(const [key,max] of [['title',100],['memory',16000],['note',8000]])if(typeof value[key]!=='string'||!value[key].trim()||value[key].length>max)throw Error('请检查故事名称、故事记忆和作者注，内容不能为空或过长。');
  if(!Array.isArray(value.lore)||!value.lore.length||value.lore.length>30)throw Error('需要至少 1 个、最多 30 个世界书词条。');
  const lore=value.lore.map(l=>{for(const [key,max]of [['title',80],['keys',500],['text',4000]])if(typeof l?.[key]!=='string'||!l[key].trim()||l[key].length>max)throw Error('请补全每个世界书词条的名称、关键词和内容。');return{id:uid(),title:l.title.trim(),keys:l.keys.trim(),text:l.text.trim(),enabled:l.enabled!==false};});
  return {title:value.title.trim(),memory:value.memory.trim(),note:value.note.trim(),lore};
}
export function parseSetupReply(text) {
  let value;try{value=JSON.parse(text.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));}catch{throw Error('模型未返回完整的设定格式，已有回答仍保留。可以重试或点「按回答直接整理」。');}
  return validateSetupDraft(value);
}
// Conservative heuristic, NOT a tokenizer. Keep a safety margin and show this as an estimate.
export function estimateTokens(text) {
  let ascii=0,other=0;for(const c of text)if(c.codePointAt(0)<128)ascii++;else other++;
  return Math.ceil(ascii/3+other*1.5);
}
export function messageTokens(messages){return 64+messages.reduce((n,m)=>n+estimateTokens(m.content)+16,0);}
export function modelCapacity(prefs) {
  const manual=Number(prefs.contextWindow);
  if(Number.isInteger(manual)&&manual>=2048&&manual<=2097152)return{tokens:manual,label:'手动设置',assumed:false};
  const found=(prefs.modelInfo||[]).find(m=>m.id===prefs.model&&m.baseUrl===prefs.baseUrl&&Number.isInteger(m.contextWindow)&&m.contextWindow>=2048&&m.contextWindow<=2097152);
  if(found)return{tokens:found.contextWindow,label:'模型接口返回',assumed:false};
  if(prefs.provider==='deepseek'&&/^https:\/\/api\.deepseek\.com\/?$/.test(prefs.baseUrl)&&['deepseek-flash','deepseek-v4-pro','deepseek-v4-flash','deepseek-v4-flash-vision-exp'].includes(prefs.model))return{tokens:1048576,label:'官方规格 · 2026-11-02',assumed:false};
  return{tokens:8192,label:'未识别规格 · 暂按 8,192 预警',assumed:true};
}
export function writingContext(story,prefs) {
  const capacity=modelCapacity(prefs),fullChars=Array.from(textOf(story)).length,range=Math.max(1,Number(prefs.contextLength)||12000),output=Number(prefs.maxTokens)||512;
  const requested=contextFor(story,range);let context=requested,sentRange=Math.min(fullChars,range);
  const exceeds=c=>messageTokens(c.messages)+output>capacity.tokens*.9||c.messages.reduce((n,m)=>n+m.content.length,0)>90000;
  while(exceeds(context)&&sentRange>0){sentRange=Math.floor(sentRange/2);context=contextFor(story,sentRange);}
  const blocked=exceeds(context)||(fullChars>0&&sentRange===0);
  const input=messageTokens(context.messages),requestedInput=messageTokens(requested.messages),sentChars=Array.from(context.recent).length;
  return {context,capacity,input,output,total:input+output,fullChars,sentChars,range,omittedChars:fullChars-sentChars,adjusted:sentChars<Math.min(fullChars,range),blocked,pressure:blocked||fullChars>=range*.85||requestedInput+output>=capacity.tokens*.8||requested.messages.reduce((n,m)=>n+m.content.length,0)>=76500};
}
export const SUMMARY_SYSTEM='你是小说连续性编辑。只总结已发生的剧情，不续写，不编造，不把写作计划当成事实。整合既有前情和本段正文，保留仍有效的人物身份、关系变化、时间地点、重要物品、未解伏笔、人物当前状态，以及最后一幕的接续位置。区分事实和人物猜测。用简短分项文本，控制在约 500 个汉字，最多 2,000 字符。后续会据此写新章，不要输出 Markdown 代码围栏。';
export function summaryMessages(carry,chunk){return[{role:'system',content:SUMMARY_SYSTEM},{role:'user',content:'既有前情摘要：\n'+(carry||'无')+'\n\n本段正文：\n'+chunk}];}
export function summaryPlan(story,prefs) {
  const text=textOf(story);if(!text.trim())throw Error('本章还没有正文。可以先写一段，或手动整理前情。');
  const capacity=modelCapacity(prefs),carry=story.carrySummary||'',reserve=Math.max(estimateTokens(carry),3000),available=Math.floor(capacity.tokens*.85)-1536-reserve-messageTokens(summaryMessages('',''));
  if(available<128)throw Error('当前模型容量不足以安全分段总结。请核实模型上下文容量，或手动压缩前章摘要。');
  const chunks=[];let chunk='',cost=0;
  for(const c of text){const unit=c.codePointAt(0)<128?1/3:1.5;if(chunk&&(cost+unit>available||chunk.length+c.length>12000)){chunks.push(chunk);chunk='';cost=0;}chunk+=c;cost+=unit;}
  if(chunk)chunks.push(chunk);
  return {chunks,capacity,output:1536};
}
export async function summarizeChapter(story,prefs,signal,generate,onProgress) {
  const plan=summaryPlan(story,prefs);let carry=story.carrySummary||'';let receipt=null;
  for(let i=0;i<plan.chunks.length;i++){
    if(signal.aborted)throw new DOMException('已停止','AbortError');
    onProgress?.(i+1,plan.chunks.length);
    const messages=summaryMessages(carry,plan.chunks[i]);
    if(messageTokens(messages)+plan.output>plan.capacity.tokens*.9||messages.reduce((n,m)=>n+m.content.length,0)>90000)throw Error('中间摘要超出当前容量，请缩短前情或调整容量后重试。');
    let reply='';receipt=await generate({...prefs,maxTokens:plan.output,temperature:.3},messages,signal,c=>reply+=c);
    if(signal.aborted)throw new DOMException('已停止','AbortError');
    if(receipt?.finishReason==='length'||!reply.trim()||reply.trim().length>2000)throw Error('摘要不完整或过长，未应用到章节。请重试或手动填写。');
    carry=reply.trim();
  }
  return {summary:carry,receipt,calls:plan.chunks.length};
}
