/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
import { ensureChapters, syncChapter, activateChapter, addChapter, chapterFingerprint, chapterContinuityStale, newStory, textOf } from './model.mjs';
import { SETUP_QUESTIONS, STYLE_PRESETS, stylePresetFor, applySetupStyle, localSetupDraft, setupMessages, parseSetupReply, validateSetupDraft, writingContext, summaryPlan, summarizeChapter, messageTokens, modelCapacity } from './writing-tools.mjs';
import { generateRemote } from './api.mjs';

export function mountWritingTools(h) {
  const el=id=>document.getElementById(id),num=n=>n.toLocaleString(),tr=s=>globalThis.CreatorLocale?.t(s)||s;
  let step=0,answers=h.state().beginnerAnswers||Array(6).fill(''),setupDraft=null,task=null,nextSource=null,warningKey='';
  function remember(){h.state().beginnerAnswers=[...answers];h.save();}
  function syncAnswer(){
    const value=el('setupAnswer').value.trim(),preset=step===5?stylePresetFor(value):null;
    for(const b of el('setupChoices').children)b.setAttribute('aria-pressed',String(b.dataset.value===(preset?.name||value)||tr(b.dataset.value)===value));
    el('setupStylePreview').hidden=step!==5;
    el('setupStyleName').textContent=preset?preset.name+' · 原创示例':'先选一种，看看文风';
    el('setupStyleSample').textContent=preset?preset.example:value?'将按你填写的要求写作。你可以补充用词、句子长短、节奏和视角。':'同一个“发现旧钥匙”的场景，换一种写法，感觉就不同。';
    el('setupAnswer').removeAttribute('aria-invalid');el('setupStatus').textContent='';
  }
  function answerStep(){
    const q=SETUP_QUESTIONS[step];el('setupQuestionPanel').hidden=false;el('setupReview').hidden=true;
    el('setupNavigation').hidden=false;el('setupReviewActions').hidden=true;
    el('setupStep').textContent=`第 ${step+1} 题，共 6 题`;
    for(const [i,bar] of [...el('setupProgress').children].entries()){bar.classList.toggle('done',i<step);bar.classList.toggle('current',i===step);}
    el('setupQuestion').textContent=q.title;el('setupHelp').textContent=q.help;el('setupAnswer').value=answers[step]||'';el('setupAnswer').placeholder=q.placeholder;
    el('setupChoices').replaceChildren();for(const text of q.choices){const b=document.createElement('button');b.type='button';b.className='choice-chip';b.dataset.value=text;
      const label=document.createElement('span');label.className='choice-label';label.textContent=text;b.append(label);
      const preset=step===5?STYLE_PRESETS.find(p=>p.name===text):null;if(preset){const help=document.createElement('small');help.textContent=preset.description;b.append(help);}
      b.onclick=()=>{el('setupAnswer').value=tr(text);answers[step]=tr(text);remember();syncAnswer();el('setupAnswerFeedback').textContent='已填入，可在下方修改。';};el('setupChoices').append(b);}
    el('setupAnswerFeedback').textContent='';el('setupSurpriseLabel').textContent='给我一个例子';syncAnswer();
    el('setupBack').disabled=step===0;el('setupNext').textContent=step===5?'整理我的故事':'下一题';el('setupStatus').textContent='';
    el('setupScroll').scrollTop=0;
  }
  function focusQuestion(){el('setupScroll').scrollTop=0;el('setupQuestion').focus({preventScroll:true});}
  function drawDraft(draft,source){
    setupDraft=structuredClone(draft);el('setupQuestionPanel').hidden=true;el('setupReview').hidden=false;el('setupStep').textContent='最后一步 · 核对后开始写';
    el('setupNavigation').hidden=true;el('setupReviewActions').hidden=false;
    for(const bar of el('setupProgress').children){bar.classList.add('done');bar.classList.remove('current');}
    el('setupTitle').value=draft.title;el('setupMemory').value=draft.memory;el('setupNote').value=draft.note;el('setupDraftSource').textContent=source;
    el('setupLore').replaceChildren();draft.lore.forEach((l,i)=>{const box=document.createElement('fieldset');box.className='setup-lore';const legend=document.createElement('legend');legend.textContent='世界书词条 '+(i+1);box.append(legend);
      for(const [key,label,max]of [['title','名称',80],['keys','触发关键词（填写正文会出现的人名、地名等）',500],['text','设定内容',4000]]){const lab=document.createElement('label');lab.textContent=label;const input=document.createElement(key==='text'?'textarea':'input');input.value=l[key];input.maxLength=max;input.dataset.field=key;if(key==='text')input.rows=3;lab.append(input);box.append(lab);}el('setupLore').append(box);});
    el('setupScroll').scrollTop=0;el('setupReviewTitle').focus({preventScroll:true});
  }
  function readDraft(){return validateSetupDraft({title:el('setupTitle').value,memory:el('setupMemory').value,note:el('setupNote').value,lore:[...el('setupLore').children].map(box=>Object.fromEntries([...box.querySelectorAll('[data-field]')].map(i=>[i.dataset.field,i.value])))});}
  function toolsBusy(value,controller){h.lock(value,controller);for(const id of ['setupBackToQuestions','setupLocal','setupAI','setupApply','summaryGenerate','summaryApply','summaryConnect'])el(id).disabled=value;for(const selector of ['#setupReview input','#setupReview textarea','#chapterDialog input','#chapterDialog textarea'])document.querySelectorAll(selector).forEach(i=>i.disabled=value);el('toolStopSetup').hidden=!value;el('toolStopSummary').hidden=!value;}
  function closeTask(){task?.abort();}
  for(const id of ['beginnerDialog','chapterDialog'])el(id).addEventListener('close',closeTask);
  for(const id of ['toolStopSetup','toolStopSummary'])el(id).onclick=closeTask;
  el('beginnerMode').onclick=()=>{if(h.busy())return;h.commit();h.closeDrawer();answers=h.state().beginnerAnswers||answers;answerStep();el('beginnerDialog').showModal();focusQuestion();};
  el('setupAnswer').oninput=()=>{answers[step]=el('setupAnswer').value;remember();syncAnswer();el('setupAnswerFeedback').textContent='';};
  el('setupSurprise').onclick=()=>{const q=SETUP_QUESTIONS[step],examples=[q.fallback,...q.choices.filter(c=>c!==q.fallback)].map(tr),current=examples.indexOf(el('setupAnswer').value);answers[step]=examples[(current+1)%examples.length];el('setupAnswer').value=answers[step];remember();syncAnswer();el('setupSurpriseLabel').textContent='换个例子';el('setupAnswerFeedback').textContent='例子已填入，可以改成你的想法。';};
  el('setupBack').onclick=()=>{step--;answerStep();focusQuestion();};
  el('setupNext').onclick=()=>{if(!el('setupAnswer').value.trim()){el('setupStatus').textContent='先选一个答案、写几句话，或点「给我一个例子」。';el('setupAnswer').setAttribute('aria-invalid','true');el('setupAnswer').focus();return;}answers[step]=el('setupAnswer').value.trim();remember();if(step<5){step++;answerStep();focusQuestion();}else drawDraft(localSetupDraft(answers),'已按回答整理，可以直接修改。还没有调用模型。');};
  el('setupBackToQuestions').onclick=()=>{step=0;answerStep();focusQuestion();};
  el('setupLocal').onclick=()=>drawDraft(localSetupDraft(answers),'按你的回答直接整理 · 未调用模型');
  el('setupAI').onclick=async()=>{
    if(!h.key()){el('beginnerDialog').close();h.connect();h.toast('先连接模型，再回来点击新手模式；回答已保存。');return;}
    const config={...h.state().prefs,apiKey:h.key()},messages=setupMessages(answers);
    if(messageTokens(messages)+2048>modelCapacity(config).tokens*.9){el('setupStatus').textContent='回答过长，或模型容量过小；请缩短回答或核实容量。';return;}
    task=new AbortController();const signal=task.signal;toolsBusy(true,task);el('setupStatus').textContent='AI 正在整理，完成后仍需你确认…';let text='';
    try{const receipt=await generateRemote({...config,maxTokens:2048,temperature:.7},messages,signal,c=>text+=c);if(signal.aborted)return;if(receipt.finishReason==='length')throw Error('整理结果未完成，未覆盖当前草案。请重试或使用直接整理。');drawDraft(applySetupStyle(parseSetupReply(text),answers),'AI 已整理。请检查人物和世界设定，文风要求已保留。');el('setupStatus').textContent='整理完成，尚未创建故事。';}
    catch(e){el('setupStatus').textContent=signal.aborted?'已停止，原草案和回答仍保留。':e.message;}
    finally{task=null;toolsBusy(false);}
  };
  el('setupApply').onclick=async()=>{try{const state=h.state();if(state.stories.length>=50)throw Error('最多 50 个故事，请先备份。');const draft=readDraft();const s=newStory(draft.title);Object.assign(s,draft);ensureChapters(s);if(globalThis.CreatorLocale?.get()==='en')s.chapters[0].title='Chapter 1';h.commit();state.stories.unshift(s);state.activeId=s.id;el('beginnerDialog').close();h.render();await h.saveNow();h.toast('故事已建立，右侧设定已填入。写下第一句，或点击继续写作。');}catch(e){el('setupStatus').textContent=e.message;}};
  function refresh(){
    const s=h.current(),ch=ensureChapters(s),p=h.state().prefs,b=writingContext(s,p);syncChapter(s);
    const options=s.chapters.map(c=>[c.id,c.title]);const signature=JSON.stringify(options);
    if(el('chapterSelect').dataset.signature!==signature){el('chapterSelect').replaceChildren();for(const [id,title]of options){const opt=document.createElement('option');opt.value=id;opt.textContent=title;el('chapterSelect').append(opt);}el('chapterSelect').dataset.signature=signature;}
    el('chapterSelect').value=ch.id;if(document.activeElement!==el('chapterTitle'))el('chapterTitle').value=ch.title;
    if(document.activeElement!==el('carrySummary'))el('carrySummary').value=s.carrySummary||'';
    el('carrySection').hidden=s.chapters.length===1&&!s.carrySummary;
    const stale=chapterContinuityStale(s,ch);
    el('carryWarning').textContent=stale?'前序章节已修改，请从前往后重新核对摘要。':'';
    el('carryConfirm').hidden=!stale;
    el('contextWatch').classList.toggle('context-warning',b.pressure||stale);
    el('contextReadout').textContent=`本次正文 ${num(b.sentChars)} / 本章 ${num(b.fullChars)} 字符`+(b.omittedChars?` · 较早 ${num(b.omittedChars)} 字符未带入`:'');
    el('contextModelReadout').textContent=`预估 ${num(b.total)} / ${num(b.capacity.tokens)} tokens（含输出预留）`;
    el('contextMeter').value=Math.min(1,b.total/b.capacity.tokens);el('contextMeter').setAttribute('aria-label','预估模型上下文占用');
    for(const id of ['beginnerMode','chapterSelect','chapterTitle','chapterNext','contextDetails','carrySummary','carryConfirm','contextWindow'])el(id).disabled=h.busy();
    return b;
  }
  el('chapterSelect').onchange=()=>{h.commit();activateChapter(h.current(),el('chapterSelect').value);h.save();h.render();h.scrollTop();h.message("已切换章节，从本章末尾继续写。");};
  el('chapterTitle').oninput=()=>{syncChapter(h.current()).title=el('chapterTitle').value||'未命名章节';h.save();};
  el('carrySummary').oninput=()=>{h.current().carrySummary=el('carrySummary').value;h.save();refresh();};
  el('carryConfirm').onclick=()=>{const s=h.current(),ch=syncChapter(s),source=s.chapters.find(c=>c.id===ch.sourceChapterId);if(source)ch.sourceHash=chapterFingerprint(source);h.save();refresh();};
  function warningText(b){if(globalThis.CreatorLocale?.get()==='en')return `Chapter: ${num(b.fullChars)} characters. Recent text sent: ${num(b.sentChars)}. Earlier text omitted: ${num(b.omittedChars)}. Story memory, the prior recap and matching world notes are included separately.\n\nEstimated input: ${num(b.input)} tokens. Output reserve: ${num(b.output)}. Context window: ${num(b.capacity.tokens)} tokens. This is a character-based estimate; the provider reports actual usage.\n${b.adjusted?'Recent text was shortened to reserve context space. ':''}${b.blocked?'The settings or text exceed the safe request size. Shorten them or check model capacity before continuing.':''}`;return `本章有 ${num(b.fullChars)} 个字符，本次带入最近 ${num(b.sentChars)} 个；故事记忆、前章摘要和命中的世界书另行带入。\n${b.omittedChars?'已有 '+num(b.omittedChars)+' 个较早正文字符不在本次请求中。':'接近读取范围时，可先总结前情再开始下一章。'}\n\n预估输入 ${num(b.input)} tokens，输出预留 ${num(b.output)} tokens。模型容量 ${num(b.capacity.tokens)}（${b.capacity.label}）。这是字符估算，实际用量以模型回执为准。\n${b.adjusted?'为预留容量，本次最近正文范围已缩短。':''}${b.blocked?'设定或正文超出可安全发送范围，请缩短设定或核实模型容量；当前不能直接续写。':''}`;}
  function openWarning(){h.commit();const b=refresh();el('capacityText').textContent=warningText(b);el('capacityContinue').disabled=b.blocked;el('capacityDialog').showModal();return b;}
  function pressureKey(b){return[h.current().id,h.current().activeChapterId,b.range,b.capacity.tokens,Math.floor(b.fullChars/2000),Math.floor(b.total/1000),b.adjusted,b.blocked].join(':');}
  function beforeGenerate(){const b=refresh();if(b.pressure&&(b.blocked||warningKey!==pressureKey(b))){openWarning();return true;}return false;}
  el('contextDetails').onclick=openWarning;
  el('capacityContinue').onclick=()=>{const b=refresh();if(b.blocked)return;warningKey=pressureKey(b);el('capacityDialog').close();h.generate();};
  function openChapter(){
    if(h.busy())return;h.commit();const s=h.current();syncChapter(s);if(s.activeChapterId!==s.chapters.at(-1).id){h.toast('请切换到最后一章，再整理并创建下一章。');return;}nextSource={story:s.id,chapter:s.activeChapterId,hash:chapterFingerprint(s)};
    el('summaryText').value='';el('summaryApproved').checked=false;el('nextChapterTitle').value=globalThis.CreatorLocale?.get()==='en'?'Chapter '+(s.chapters.length+1):'第 '+(s.chapters.length+1)+' 章';el('summaryStatus').textContent='';
    let plan;try{plan=summaryPlan(s,h.state().prefs);el('summaryScope').textContent=`读取本章完整正文（${num(Array.from(textOf(s)).length)} 字符）与前章摘要，分 ${plan.chunks.length} 次请求逐段总结。每次输出上限 1,536 tokens，会使用模型账户额度。`;}
    catch(e){el('summaryScope').textContent=e.message;}
    el('summaryGenerate').disabled=!plan||!h.key();el('summaryConnect').hidden=Boolean(h.key());el('chapterDialog').showModal();
  }
  el('chapterNext').onclick=openChapter;
  el('capacityChapter').onclick=()=>{el('capacityDialog').close();openChapter();};
  el('summaryConnect').onclick=()=>{el('chapterDialog').close();h.connect();};
  el('summaryGenerate').onclick=async()=>{
    if(!h.key())return;task=new AbortController();const signal=task.signal;toolsBusy(true,task);el('summaryApproved').checked=false;
    try{const result=await summarizeChapter(h.current(),{...h.state().prefs,apiKey:h.key()},signal,generateRemote,(i,n)=>el('summaryStatus').textContent=`正在总结第 ${i} / ${n} 段… 可随时停止`);if(signal.aborted)return;el('summaryText').value=result.summary;el('summaryStatus').textContent=`已完成 ${result.calls} 次请求。请核对人物状态、关键事件和伏笔，再创建下一章。`;}
    catch(e){el('summaryStatus').textContent=signal.aborted?'已停止，没有切换章节；已发生的请求可能计费。':e.message;}
    finally{task=null;toolsBusy(false);}
  };
  el('summaryText').oninput=()=>el('summaryApproved').checked=false;
  el('summaryApply').onclick=async()=>{
    try{const s=h.current();if(!nextSource||s.id!==nextSource.story||s.activeChapterId!==nextSource.chapter||chapterFingerprint(s)!==nextSource.hash)throw Error('本章内容已变化，请关闭窗口并重新整理摘要。');if(!el('summaryApproved').checked)throw Error('请先核对摘要，并勾选确认。');addChapter(s,el('summaryText').value,el('nextChapterTitle').value);el('chapterDialog').close();h.render();h.scrollTop();h.message('新章已准备好，将承接前情摘要开始写作。');await h.saveNow();h.toast('下一章已建立。旧章仍可从章节菜单打开；摘要会随下一次续写发送。');}
    catch(e){el('summaryStatus').textContent=e.message;}
  };
  el('contextWindow').onchange=()=>{const n=Number(el('contextWindow').value);if(n!==0&&(!Number.isInteger(n)||n<2048||n>2097152)){h.toast('容量填 0 使用自动识别，或填写 2,048–2,097,152。');el('contextWindow').value=h.state().prefs.contextWindow||0;return;}h.state().prefs.contextWindow=n;h.save();refresh();};
  return {refresh,beforeGenerate,context:()=>writingContext(h.current(),h.state().prefs),openChapter};
}
