/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
import { mountWritingTools } from './writing-ui.mjs';
import { LIMIT, uid, textOf, snapshot, editRuns, mergeRuns, checkpoint, travel, newStory, contextFor, parseImport, ensureChapters, syncChapter, wholeStoryText } from './model.mjs';
import { generateRemote, generateContinuationRemote, listModels, verifyGeneration } from './api.mjs';
import { upgradeWorkspace } from './migrations.mjs';
import { createStarterStory } from './starter.mjs';
import { mountUiTour } from './ui-tour.mjs';
import { mountLocalServices } from './local-services-ui.mjs';
import { mountShelf } from './shelf-ui.mjs';
import { parseShelfImport, recoverLegacyTrash } from './shelf-model.mjs';
let writingTools=null, uiTour=null, localServices=null, shelf=null;
const $ = id => document.getElementById(id);
const PROVIDERS = {
  deepseek:{baseUrl:'https://api.deepseek.com',hint:'DeepSeek 官方接口；模型名称与 Key 请按你的账号填写。'},
  openai:{baseUrl:'https://api.openai.com/v1',hint:'OpenAI Chat Completions 文本接口；推理模型的参数会自动调整。'},
  anthropic:{baseUrl:'https://api.anthropic.com/v1',hint:'Claude 的 OpenAI 兼容入口；不发送创意程度参数。'},
  gemini:{baseUrl:'https://generativelanguage.googleapis.com/v1beta/openai',hint:'Gemini 的 OpenAI 兼容入口；填 Google AI Studio 的 API Key。'},
  qwen:{baseUrl:'https://dashscope.aliyuncs.com/compatible-mode/v1',hint:'百炼北京旧域名仍可使用。其他地域或业务空间专属域名，请按控制台替换地址，并使用同地域的 Key。'},
  xai:{baseUrl:'https://api.x.ai/v1',hint:'Grok 的 Chat Completions 文本接口；模型名称按 xAI 控制台填写。'},
  siliconflow:{baseUrl:'https://api.siliconflow.cn/v1',hint:'硅基流动的兼容入口；模型名称按控制台填写。'},
  openrouter:{baseUrl:'https://openrouter.ai/api/v1',hint:'OpenRouter 的兼容入口；模型名称按其目录填写。'},
  custom:{baseUrl:'',hint:'填写服务商的 HTTPS OpenAI Chat Completions 基础地址（不含 /chat/completions）。'}
};
const DEMO = '\n\n这是一次演示续写，用来体验文字逐步出现、自动跟随，以及撤销和重做。\n\n连接真实模型后，这里会沿着你的故事继续写。你可以随时停止，也可以回到上一步，试着为同一个开头寻找另一种可能。';
const initial = createStarterStory();
let state = { productVersion:3, stories: [initial], activeId: initial.id, prefs: { uiTourDone:false, mode:'demo',provider:'deepseek',baseUrl:'https://api.deepseek.com',model:'deepseek-flash',maxTokens:512,temperature:.9,contextLength:12000,contextWindow:0,modelInfo:[],fontSize:20,uiFontSize:16,focusMode:false,follow:true } };
let db, dbFailed=false, apiKey='', dirty=false, saving=0, queue=Promise.resolve(), saveTimer, typeTimer, typingBefore=null, busy=false, controller=null, follow=true, toastTimer, lastUsage=null, composing=false;
const current = () => state.stories.find(s => s.id === state.activeId) || state.stories[0];
function toast(text) { $('toast').textContent=text;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4200); }
function saveLabel(text,error=false){$('saveState').replaceChildren();const dot=document.createElement('i');$('saveState').append(dot,document.createTextNode(text));$('saveState').classList.toggle('error',error);}
function openDb(){return new Promise((resolve,reject)=>{const req=indexedDB.open('storydesk-local-v1',1);req.onupgradeneeded=()=>req.result.createObjectStore('workspace');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
function readDb(){return new Promise((resolve,reject)=>{const tx=db.transaction('workspace','readonly'),r=tx.objectStore('workspace').get('main');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
function saveNow(){
  clearTimeout(saveTimer); if(!db||dbFailed){saveLabel('未能保存，请导出备份',true);return Promise.resolve(false);}
  state.stories.forEach(syncChapter);const value=structuredClone(state);dirty=false;saving++;saveLabel('正在保存…');
  queue=queue.catch(()=>{}).then(()=>new Promise((resolve,reject)=>{const tx=db.transaction('workspace','readwrite');tx.objectStore('workspace').put(value,'main');tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);})).then(()=>{saving--;if(!saving&&!dirty)saveLabel('已保存到本地');return true;}).catch(()=>{saving--;dirty=true;saveLabel('保存失败，请立即导出备份',true);toast('浏览器未能保存，请先导出备份，不要关闭页面。');return false;});return queue;
}
function scheduleSave(){dirty=true;saveLabel('等待保存…');clearTimeout(saveTimer);saveTimer=setTimeout(saveNow,300);}
function commitTyping(){clearTimeout(typeTimer);if(typingBefore){checkpoint(current(),typingBefore,'手动编辑');typingBefore=null;scheduleSave();updateHistory();}}
function formatDate(date){return new Intl.DateTimeFormat(window.CreatorLocale?.get()==='en'?'en-US':'zh-CN',{month:'long',day:'numeric'}).format(new Date(date));}
function count(text){return Array.from(text.replace(/\s/g,'')).length;}
function renderList(){
  const list=$('storyList');list.replaceChildren();$('storyCount').textContent=state.stories.length;
  const query=$('search').value.trim().toLowerCase();
  state.stories.forEach((story,index)=>{
    if(query&&!story.title.toLowerCase().includes(query))return;
    const row=document.createElement('div');row.className='story-row'+(story.id===state.activeId?' selected':'');row.dataset.storyId=story.id;
    const b=document.createElement('button');b.className='story-item'+(story.id===state.activeId?' selected':'');b.disabled=busy;b.setAttribute('aria-current',story.id===state.activeId?'page':'false');
    b.innerHTML='<svg><use href="#i-book"/></svg><div><strong></strong><small></small></div>';
    b.querySelector('strong').textContent=story.title||'未命名故事';b.querySelector('small').textContent=count(wholeStoryText(story)).toLocaleString()+' 字 · '+formatDate(story.updatedAt);
    b.onclick=()=>{if(busy)return;commitTyping();state.activeId=story.id;scheduleSave();showMessage('从正文末尾接着写，随时可以撤销。');render();$('writingScroll').scrollTop=0;closeDrawer();};row.append(b);shelf?.rowControls(row,story,index);list.append(row);
  });
  if(!list.children.length){const p=document.createElement('p');p.className='empty-hint';p.textContent='没有找到这个故事';list.append(p);}
  shelf?.refresh();
}
function paint({replace=true,scroll=false}={}){
  const story=current(),text=textOf(story),el=$('editor'),panel=$('writingScroll'),oldScroll=panel.scrollTop;
  if(replace&&el.value!==text)el.value=text;
  const fragment=document.createDocumentFragment();for(const run of story.runs){const span=document.createElement('span');span.className=run.origin;span.textContent=run.text;fragment.append(span);}
  $('colorLayer').replaceChildren(fragment);document.documentElement.style.setProperty('--editor-font',state.prefs.fontSize+'px');
  el.style.height='0px';el.style.height=Math.max(300,el.scrollHeight)+'px';panel.scrollTop=oldScroll;
  if(scroll)requestAnimationFrame(()=>{panel.scrollTop=panel.scrollHeight;});
  $('wordCount').textContent=count(text).toLocaleString()+' 字';$('modifiedDate').textContent=formatDate(story.updatedAt);
  $('jumpLatest').hidden=!(busy&&!follow&&state.prefs.follow);
  updateHistory();writingTools?.refresh();
}
function updateHistory(){
  $('undo').disabled=busy||(!current().past.length&&!typingBefore);$('redo').disabled=busy||!current().future.length||Boolean(typingBefore);
  $('undo').title=busy?'续写停止后可以撤销':$('undo').disabled?'还没有可撤销的正文操作':'撤销：'+(typingBefore?'手动编辑':current().past.at(-1)?.label||'最近一次正文操作');
  $('redo').title=$('redo').disabled?'还没有可重做的正文操作':'恢复刚刚撤销的正文';
}
function updateMode(){
  const demo=state.prefs.mode==='demo';$('modeBadge').textContent=demo?'演示模式':apiKey?'真实 API':'待填密钥';
  $('modeHint').textContent=demo?'固定示例续写 · 不调用模型':apiKey?'续写会发送正文上下文，并使用模型账户额度':'刷新后密钥已清空，请重新连接模型。';
  $('switchToApi').innerHTML=demo?'连接模型 <span>↗</span>':'管理连接 <span>↗</span>';
  $('modelLabel').textContent=demo?'演示续写':state.prefs.model+(apiKey?'':' · 待连接');
}
function renderLore(){
  $('worldCount').textContent=current().lore.length;$('worldSummaryCount').textContent=current().lore.length;
  const activeIds=new Set((writingTools?.context().context||contextFor(current(),state.prefs.contextLength)).activeLore.map(l=>l.id));const list=$('loreList');list.replaceChildren();
  for(const item of current().lore){
    const card=document.createElement('details');card.className='lore-card';
    card.innerHTML='<summary><span></span><small class="lore-active"></small></summary><label>词条名称</label><input type="text" aria-label="词条名称" data-field="title" maxlength="80"><label>关键词（逗号分隔）</label><input type="text" aria-label="触发关键词" data-field="keys" maxlength="500"><label>设定内容</label><textarea aria-label="设定内容" data-field="text" rows="3" maxlength="4000"></textarea><div class="lore-actions"><label><input type="checkbox">启用词条</label><button class="delete-lore">删除</button></div>';
    card.querySelector('summary>span').textContent=item.title||'未命名词条';card.querySelector('small').textContent=activeIds.has(item.id)?'已触发':'';
    card.querySelectorAll('[data-field]').forEach(input=>{input.value=item[input.dataset.field];input.disabled=busy;input.oninput=()=>{item[input.dataset.field]=input.value;if(input.dataset.field==='title')card.querySelector('summary>span').textContent=input.value||'未命名词条';scheduleSave();writingTools?.refresh();};});
    const check=card.querySelector('[type=checkbox]');check.checked=item.enabled;check.disabled=busy;check.onchange=()=>{item.enabled=check.checked;scheduleSave();renderLore();writingTools?.refresh();};
    const del=card.querySelector('.delete-lore');del.disabled=busy;del.onclick=()=>{if(confirm(window.CreatorLocale?.t('删除这个世界书词条？')||'删除这个世界书词条？')){current().lore=current().lore.filter(l=>l.id!==item.id);scheduleSave();renderLore();writingTools?.refresh();}};list.append(card);
  }
  if(!current().lore.length){const p=document.createElement('p');p.className='field-help';p.textContent='添加人物、地点或物品，让设定在需要时出现。';list.append(p);}
}
function render(){
  const s=current();ensureChapters(s);$('title').value=s.title;$('breadcrumbTitle').textContent=s.title||'未命名故事';$('inspectorStoryTitle').textContent=s.title||'未命名故事';$('storyNumber').textContent=String(state.stories.indexOf(s)+1).padStart(2,'0');
  $('memory').value=s.memory;$('note').value=s.note;
  for(const id of ['mode','maxTokens','temperature','contextLength','fontSize','contextWindow'])$(id).value=state.prefs[id];$('follow').checked=state.prefs.follow;$('tempValue').textContent=state.prefs.temperature;
  applyDisplay();renderList();renderLore();paint();updateMode();
}
function setBusy(value){
  busy=value;for(const id of ['title','memory','note','newStory','importButton','mode','maxTokens','temperature','contextLength','openSettings','switchToApi','modelShortcut','addLore','exitService'])$(id).disabled=value;
  $('editor').readOnly=value;document.querySelectorAll('#loreList input,#loreList textarea,#loreList button').forEach(el=>el.disabled=value);
  document.querySelector('.composer').classList.toggle('is-generating',value);$('editor').setAttribute('aria-busy',String(value));$('generate').classList.toggle('running',value);$('generate').querySelector('span').textContent=value?'停止续写':'继续写作';$('generate').querySelector('kbd').textContent=value?'Esc':'Ctrl ↵';renderList();updateHistory();writingTools?.refresh();
}
function showMessage(text,error=false){$('generationMessage').textContent=text;$('generationMessage').classList.toggle('error',error);}
function connectionDialog(){if(busy)return;const p=state.prefs;$('provider').value=PROVIDERS[p.provider]?p.provider:'custom';$('baseUrl').value=p.baseUrl;$('modelId').value=p.model;$('apiKey').value=apiKey;$('baseUrl').readOnly=p.provider==='deepseek';$('providerHelp').textContent=PROVIDERS[$('provider').value].hint;$('connectionStatus').textContent='';$('probeResult').hidden=true;$('probeText').textContent='';$('probeMeta').textContent='';$('settingsDialog').showModal();localServices?.opened();}
function connectionForm(){return{provider:$('provider').value,baseUrl:$('baseUrl').value.trim().replace(/\/$/,''),model:$('modelId').value.trim(),apiKey:$('apiKey').value.trim()};}
async function generate(){
  if(busy){controller?.abort();return;}
  if(composing)return;commitTyping();
  if(state.prefs.mode==='api'&&!apiKey){connectionDialog();return;}
  if(writingTools?.beforeGenerate())return;
  const budget=writingTools?.context();if(budget?.blocked){toast('当前设定超出发送容量，请先调整。');return;}
  const story=current(),before=snapshot(story),base=textOf(story);if(base.length>=LIMIT){writingTools.openChapter();return;}
  controller=new AbortController();const signal=controller.signal;setBusy(true);
  if(!await saveNow()){setBusy(false);controller=null;toast('请先导出备份，解决保存问题后再生成。');return;}
  if(signal.aborted){setBusy(false);controller=null;return;}
  story.draftGeneration={before};lastUsage=null;follow=state.prefs.follow;showMessage(state.prefs.mode==='demo'?'正在演示续写（固定示例）…':'正在连接模型…');
  const context=budget?.context||contextFor(story,state.prefs.contextLength);let generated='',at=0,overflow=false,receipt=null;
  function append(chunk,receivedBeforeStop=false){
    if(signal.aborted&&!receivedBeforeStop)return;
    if(base.length+generated.length+chunk.length>LIMIT){chunk=chunk.slice(0,LIMIT-base.length-generated.length);overflow=true;}
    generated+=chunk;story.runs=mergeRuns([...before,{origin:'ai',text:generated}]);story.updatedAt=new Date().toISOString();paint({scroll:follow});
    showMessage(state.prefs.mode==='demo'?'正在演示续写（固定示例）…':'正在续写…');
    if(Date.now()-at>350){at=Date.now();scheduleSave();}if(overflow)controller.abort();
  }
  try{
    if(state.prefs.mode==='demo'){
      const demo=window.CreatorLocale?.get()==='en'?'\n\nThis is a demo continuation. It lets you try streaming text, auto-scroll, undo and redo.\n\nConnect a real model to continue your own story. You can stop at any time and try another direction.':DEMO;const chars=Array.from(base.trim()?demo:demo.trimStart());for(let i=0;i<chars.length;i+=7){if(signal.aborted)break;await new Promise(resolve=>setTimeout(resolve,45));append(chars.slice(i,i+7).join(''));}
    }else receipt=await generateContinuationRemote({...state.prefs,apiKey},context.messages,base,signal,chunk=>append(chunk,true),usage=>lastUsage=usage);
    const overlapNote=receipt?.removedPrefixCharacters?' 已略去重复的开头。':'';
    showMessage(overflow?'已到正文上限，收到的内容已保留。':signal.aborted?'已停止，收到的内容已保留。':generated.trim()?(receipt?.finishReason==='length'?'已到输出上限，正文已保留，可继续写作。':'本次续写已完成，可一键撤销。')+overlapNote:receipt?.removedPrefixCharacters?'模型只返回了与原文重复的内容，未追加正文，可以再试一次。':'模型没有返回正文，请检查模型或调整设置。');
  }catch(e){showMessage(signal.aborted?'已停止，收到的内容已保留。':e.message+(generated?' 已收到的文字已保留。':''),!signal.aborted);}
  finally{
    if(generated&&!generated.trim()){story.runs=before;generated='';}
    if(generated)checkpoint(story,before,state.prefs.mode==='demo'?'演示续写':'AI 续写');delete story.draftGeneration;
    controller=null;setBusy(false);paint({scroll:follow});renderLore();$('jumpLatest').hidden=true;
    $('composerNote').textContent=state.prefs.mode==='demo'?'演示结果 · 未请求模型':receipt?`${receipt.model||state.prefs.model} · 返回 ${count(generated)} 字`+(lastUsage?` · ${lastUsage.completion_tokens??'?'} 输出 tokens`:''):'本次未完成 · 结果见上方';$('composerNote').title=receipt?.requestId?'模型返回请求 ID：'+receipt.requestId:'';await saveNow();
  }
}
function download(name,type,content){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function backup(){commitTyping();state.stories.forEach(syncChapter);download('创作家备份-'+new Date().toISOString().slice(0,10)+'.json','application/json',JSON.stringify({format:'storydesk-local-v3',version:3,exportedAt:new Date().toISOString(),stories:state.stories},null,2));toast('备份已导出，包含书架顺序、全部章节与设定。');}
$('editor').addEventListener('compositionstart',()=>{composing=true;});$('editor').addEventListener('compositionend',()=>{composing=false;});
$('editor').addEventListener('input',()=>{if(busy)return;if(!typingBefore)typingBefore=snapshot(current());current().runs=editRuns(current().runs,$('editor').value);current().updatedAt=new Date().toISOString();paint({replace:false});scheduleSave();clearTimeout(typeTimer);typeTimer=setTimeout(commitTyping,700);});
$('editor').addEventListener('blur',()=>{
  commitTyping();
  // Keep the clicked bookshelf button mounted until its click event runs.
  const row=Array.from($('storyList').querySelectorAll('.story-row')).find(r=>r.dataset.storyId===current().id);
  const small=row?.querySelector('.story-item small');
  if(small)small.textContent=count(wholeStoryText(current())).toLocaleString()+' 字 · '+formatDate(current().updatedAt);
});
$('title').oninput=()=>{current().title=$('title').value;current().updatedAt=new Date().toISOString();$('breadcrumbTitle').textContent=current().title||'未命名故事';$('inspectorStoryTitle').textContent=current().title||'未命名故事';scheduleSave();renderList();};
for(const id of ['memory','note'])$(id).oninput=()=>{current()[id]=$(id).value;scheduleSave();writingTools?.refresh();};
$('newStory').onclick=()=>{if(busy)return;commitTyping();if(state.stories.length>=50){toast('本地版最多 50 个故事，请先备份。');return;}const s=newStory(window.CreatorLocale?.get()==='en'?'Untitled story':'未命名故事');if(window.CreatorLocale?.get()==='en')ensureChapters(s).title='Chapter 1';state.stories.unshift(s);state.activeId=s.id;scheduleSave();showMessage('从正文末尾接着写，随时可以撤销。');render();$('title').focus();$('title').select();closeDrawer();};
$('search').oninput=renderList;
$('undo').onclick=()=>{if(busy)return;commitTyping();if(travel(current(),'undo')){paint();renderList();scheduleSave();showMessage('已撤销最近一次正文操作，可以点「重做」恢复。');}};
$('redo').onclick=()=>{if(busy)return;commitTyping();if(travel(current(),'redo')){paint();renderList();scheduleSave();showMessage('已恢复正文及文字来源颜色。');}};
$('generate').onclick=generate;
$('backupAll').onclick=backup;
$('exportButton').onclick=()=>{commitTyping();const name=(current().title||'故事').replace(/[<>:"/\\|?*]/g,'_');download(name+'.txt','text/plain;charset=utf-8',wholeStoryText(current()));toast('已导出全部章节 TXT；完整设定和颜色请用「备份全部故事」。');};
$('importButton').onclick=()=>$('fileInput').click();
$('fileInput').onchange=async()=>{const file=$('fileInput').files[0];if(!file)return;try{if(file.size>20*1024*1024)throw Error('导入文件请小于 20 MB。');const {stories,restoredLegacyCount}=parseShelfImport(await file.text(),file.name);if(state.stories.length+stories.length>50)throw Error('导入后会超过 50 篇，请拆分备份。');commitTyping();state.stories.push(...stories);state.activeId=stories[0].id;await saveNow();render();toast('已添加 '+stories.length+' 个故事'+(restoredLegacyCount?'（含旧版已删除的 '+restoredLegacyCount+' 篇）':'')+'，原有故事仍保留。');}catch(e){toast('导入失败：'+e.message);}$('fileInput').value='';};
for(const id of ['openSettings','switchToApi','modelShortcut'])$(id).onclick=connectionDialog;
$('provider').onchange=()=>{const id=$('provider').value,preset=PROVIDERS[id]||PROVIDERS.custom;$('baseUrl').readOnly=id==='deepseek';$('baseUrl').value=preset.baseUrl;$('baseUrl').placeholder='https://api.example.com/v1';$('modelId').value=id==='deepseek'?'deepseek-flash':'';$('models').replaceChildren();$('providerHelp').textContent=preset.hint;$('apiKey').value='';$('connectionStatus').textContent='';};
$('baseUrl').addEventListener('input',()=>localServices?.endpointChanged());
$('provider').addEventListener('change',()=>localServices?.endpointChanged());
$('settingsForm').onsubmit=async e=>{
  e.preventDefault();if(connectionController)return;const config=connectionForm();if(!config.apiKey||!config.model)return;
  try{if(new URL(config.baseUrl).protocol!=='https:')throw Error();}catch{toast('接口地址需要使用 HTTPS。');return;}
  connectionController=new AbortController();connectionBusy(true,'save');
  $('connectionStatus').classList.remove('error');$('connectionStatus').textContent='正在保存连接设置…';
  try{
    await localServices?.remember(config);
    const {apiKey:key,...prefs}=config;apiKey=key;const changed=state.prefs.baseUrl!==prefs.baseUrl||state.prefs.model!==prefs.model;
    Object.assign(state.prefs,prefs,{mode:'api'});if(changed)state.prefs.contextWindow=0;
    $('mode').value='api';if(!await saveNow())throw Error('连接设置未能保存到浏览器，请先备份作品并检查浏览器存储。');$('settingsDialog').close();updateMode();writingTools?.refresh();
    toast($('rememberKey').checked?'密钥已加密保存，下次打开会自动读取。':'已启用，本次关闭页面后需重新输入密钥。');
  }catch(e){$('connectionStatus').classList.add('error');$('connectionStatus').textContent=e.message;}
  finally{connectionController=null;connectionBusy(false);}
};
let connectionController=null;
function connectionBusy(value,kind=''){
  for(const id of ['provider','baseUrl','modelId','apiKey'])$(id).disabled=value;
  $('rememberKey').disabled=value||$('rememberKey').dataset.supported!=='true';
  $('forgetKey').disabled=value||$('forgetKey').dataset.saved!=='true';
  $('settingsForm').querySelector('[type=submit]').disabled=value;
  $('testConnection').disabled=value;
  $('testGeneration').disabled=value&&kind!=='probe';
  $('testGeneration').textContent=value&&kind==='probe'?'停止验证':'试写验证';
}
$('testConnection').onclick=async()=>{
  if(connectionController)return;
  connectionController=new AbortController();const signal=connectionController.signal;
  $('connectionStatus').textContent='正在读取模型列表，这一步不生成正文…';$('connectionStatus').classList.remove('error');$('probeResult').hidden=true;
  const config=connectionForm();connectionBusy(true,'models');
  try{const models=await listModels(config,signal,info=>{state.prefs.modelInfo=info.map(m=>({...m,baseUrl:config.baseUrl}));scheduleSave();writingTools?.refresh();});$('models').replaceChildren();for(const model of models){const opt=document.createElement('option');opt.value=model;$('models').append(opt);}
    $('connectionStatus').textContent=models.length?'已读取 '+models.length+' 个模型。点击「试写验证」检查实际生成。':'接口可访问，但模型列表为空；请用「试写验证」检查生成。';
  }catch(e){$('connectionStatus').classList.add('error');$('connectionStatus').textContent=signal.aborted?'检查已停止。':e.message;}finally{connectionController=null;connectionBusy(false);}
};
$('testGeneration').onclick=async()=>{
  if(connectionController){connectionController.abort();return;}
  if(!$('settingsForm').reportValidity())return;
  connectionController=new AbortController();const signal=connectionController.signal,config=connectionForm();
  $('connectionStatus').classList.remove('error');$('connectionStatus').textContent='正在请求模型生成测试短句…';$('probeResult').hidden=true;connectionBusy(true,'probe');
  try{const result=await verifyGeneration(config,signal);if(signal.aborted)return;
    $('probeResult').hidden=false;$('probeText').textContent=result.text;
    $('probeMeta').textContent='返回模型：'+(result.receipt.model||'未提供')+' · 返回 '+count(result.text)+' 字'+(result.receipt.usage?' · '+result.receipt.usage.completion_tokens+' 输出 tokens':'')+'\n请求 ID：'+(result.receipt.requestId||'服务商未提供');
    $('connectionStatus').textContent='已收到模型正文。点击「保存并启用」，再到正文页续写。';
  }catch(e){$('connectionStatus').classList.add('error');$('connectionStatus').textContent=signal.aborted?'试写已停止；已产生的模型用量可能仍会计费。':e.message;}
  finally{connectionController=null;connectionBusy(false);}
};
$('settingsDialog').addEventListener('close',()=>connectionController?.abort());
for(const id of ['maxTokens','temperature','contextLength','fontSize'])$(id).oninput=()=>{state.prefs[id]=Number($(id).value);$('tempValue').textContent=state.prefs.temperature;scheduleSave();if(id==='fontSize')paint();if(id==='contextLength')renderLore();writingTools?.refresh();};
$('mode').onchange=()=>{state.prefs.mode=$('mode').value;scheduleSave();updateMode();if(state.prefs.mode==='api'&&!apiKey)connectionDialog();};
$('follow').onchange=()=>{state.prefs.follow=$('follow').checked;follow=state.prefs.follow;scheduleSave();paint({scroll:busy&&follow});};
function pauseFollow(){if(busy&&state.prefs.follow){follow=false;$('jumpLatest').hidden=false;}}
$('writingScroll').addEventListener('wheel',e=>{if(e.deltaY<0)pauseFollow();},{passive:true});let touchY=0;
$('writingScroll').addEventListener('touchstart',e=>{touchY=e.touches[0].clientY;},{passive:true});$('writingScroll').addEventListener('touchmove',e=>{if(e.touches[0].clientY>touchY+5)pauseFollow();},{passive:true});
$('jumpLatest').onclick=()=>{follow=true;paint({scroll:true});};
$('addLore').onclick=()=>{if(current().lore.length>=30){toast('最多 30 个词条。');return;}current().lore.push({id:uid(),title:window.CreatorLocale?.t('新词条')||'新词条',keys:'',text:'',enabled:true});scheduleSave();renderLore();writingTools?.refresh();$('loreList').lastElementChild.open=true;};
$('previewContext').onclick=()=>{const b=writingTools.context(),c=b.context;$('contextSummary').textContent=`带入 ${Array.from(c.recent).length.toLocaleString()} 个正文字符，触发 ${c.activeLore.length} 个词条。`+(c.omitted?' 较早正文未带入，可总结并新建章节。':'');$('contextText').textContent=c.messages.map(m=>'【'+(m.role==='system'?'写作要求与设定':'正文')+'】\n'+m.content).join('\n\n');$('contextDialog').showModal();};
const panelNames=['Story','World','Generation'];
function selectPanel(name){
  for(const n of panelNames){const selected=n===name;$('tab'+n).setAttribute('aria-selected',String(selected));$('tab'+n).tabIndex=selected?0:-1;$(n.toLowerCase()+'Panel').hidden=!selected;}
}
for(const n of panelNames)$('tab'+n).onclick=()=>selectPanel(n);
$('openWorldSettings').onclick=()=>{selectPanel('World');$('tabWorld').focus();};
document.querySelector('.tabs').addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
  e.preventDefault();const i=panelNames.findIndex(n=>document.activeElement===$('tab'+n));
  const next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:-1)+3)%3;
  selectPanel(panelNames[next]);$('tab'+panelNames[next]).focus();
});
let activeDrawer=null,drawerTrigger=null,inspectorHidden=false;
function updatePanelButtons(){
  $('showLibrary').setAttribute('aria-expanded',String(activeDrawer===$('libraryPanel')));
  $('showInspector').setAttribute('aria-expanded',String(activeDrawer===$('inspectorPanel')||(!state.prefs.focusMode&&!inspectorHidden&&innerWidth>1240)));
}
function closeDrawer(restore=true){
  if(activeDrawer){activeDrawer.classList.remove('open');activeDrawer.removeAttribute('role');activeDrawer.removeAttribute('aria-modal');}
  document.querySelector('.masthead').inert=false;document.querySelector('.main').inert=false;$('libraryPanel').inert=false;$('inspectorPanel').inert=false;
  $('drawerBackdrop').hidden=true;activeDrawer=null;updatePanelButtons();
  if(restore&&drawerTrigger?.getClientRects().length)drawerTrigger.focus();drawerTrigger=null;
}
function openDrawer(panel,trigger){
  if(activeDrawer===panel){closeDrawer();return;}closeDrawer(false);activeDrawer=panel;drawerTrigger=trigger;
  panel.classList.add('open');panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');
  document.querySelector('.masthead').inert=true;document.querySelector('.main').inert=true;(panel===$('libraryPanel')?$('inspectorPanel'):$('libraryPanel')).inert=true;
  $('drawerBackdrop').hidden=false;updatePanelButtons();(panel===$('libraryPanel')?$('closeLibrary'):$('closeInspector')).focus();
}
function toggleInspector(){
  if(innerWidth>1240&&!state.prefs.focusMode){inspectorHidden=!inspectorHidden;document.body.classList.toggle('settings-hidden',inspectorHidden);updatePanelButtons();requestAnimationFrame(()=>paint());}
  else openDrawer($('inspectorPanel'),$('showInspector'));
}
function applyDisplay(){
  state.prefs.uiFontSize=[16,18].includes(state.prefs.uiFontSize)?state.prefs.uiFontSize:16;
  document.documentElement.style.setProperty('--ui-font',state.prefs.uiFontSize+'px');$('uiFontSize').value=state.prefs.uiFontSize;
  document.body.classList.toggle('focus-mode',Boolean(state.prefs.focusMode));$('focusMode').setAttribute('aria-pressed',String(Boolean(state.prefs.focusMode)));
  $('focusMode').querySelector('span').textContent=state.prefs.focusMode?'退出专注':'专注';updatePanelButtons();
}
$('showLibrary').onclick=()=>openDrawer($('libraryPanel'),$('showLibrary'));
$('showInspector').onclick=()=>{selectPanel('World');if(innerWidth<=1240||state.prefs.focusMode)openDrawer($('inspectorPanel'),$('showInspector'));else if(inspectorHidden)toggleInspector();$('tabWorld').focus();};
$('closeLibrary').onclick=()=>closeDrawer();
$('closeInspector').onclick=()=>activeDrawer?closeDrawer():toggleInspector();
$('drawerBackdrop').onclick=()=>closeDrawer();
$('focusMode').onclick=()=>{closeDrawer(false);state.prefs.focusMode=!state.prefs.focusMode;applyDisplay();scheduleSave();requestAnimationFrame(()=>paint());};
$('displaySettings').onclick=()=>$('displayDialog').showModal();
$('uiFontSize').onchange=()=>{state.prefs.uiFontSize=Number($('uiFontSize').value);applyDisplay();scheduleSave();requestAnimationFrame(()=>paint());};
document.addEventListener('keydown',e=>{
  if(!activeDrawer||document.querySelector('dialog[open]'))return;
  if(e.key==='Escape'){e.preventDefault();closeDrawer();return;}
  if(e.key==='Tab'){const items=[...activeDrawer.querySelectorAll('button,input,textarea,select,summary,[tabindex="0"]')].filter(el=>!el.disabled&&el.tabIndex>=0&&el.getClientRects().length);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
});
$('headerTour').onclick=()=>uiTour?.start();
let welcomeTourPending=false;
function showIntroduction(welcome=false){
 closeDrawer(false);const frame=$('introFrame');
 $('closeIntro').textContent=welcome===true?'进入写作台 →':'返回写作台 ×';
 if(window.__introHtml){if(!frame.srcdoc)frame.srcdoc=window.__introHtml;}else if(frame.getAttribute('src')==='about:blank')frame.src='intro.html';
 $('introDialog').showModal();
}
$('introButton').onclick=showIntroduction;
$('closeIntro').onclick=()=>$('introDialog').close();
$('introDialog').addEventListener('close',()=>{if(welcomeTourPending){welcomeTourPending=false;requestAnimationFrame(()=>uiTour.start());}else $('introButton').focus();});
window.addEventListener('message',event=>{if(event.source===$('introFrame').contentWindow&&event.data?.type==='creator-intro-close')$('introDialog').close();});
function finishStartup(saved,storageOK){
 let seen=false;try{seen=localStorage.getItem('creator-studio.welcome.v1')==='seen';}catch{}
 const firstLocal=!window.__introHtml&&/^https?:$/.test(location.protocol)&&!saved?.stories?.length&&!seen;
 if(firstLocal){try{localStorage.setItem('creator-studio.welcome.v1','seen');}catch{}welcomeTourPending=storageOK;showIntroduction(true);}
 else if(storageOK&&(!saved||saved.prefs?.uiTourDone===false))requestAnimationFrame(()=>uiTour.start());
 document.documentElement.removeAttribute('data-starting');
}
document.querySelectorAll('.close-dialog').forEach(b=>b.onclick=()=>b.closest('dialog').close());
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
document.addEventListener('keydown',e=>{if(e.isComposing||e.defaultPrevented||uiTour?.active())return;if(e.key==='Escape'&&busy&&!activeDrawer&&!document.querySelector('dialog[open]')){controller?.abort();return;}if((e.ctrlKey||e.metaKey)&&e.key==='Enter'&&!document.querySelector('dialog[open]')){e.preventDefault();generate();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'&&document.activeElement===$('editor')){e.preventDefault();(e.shiftKey?$('redo'):$('undo')).click();}});
window.addEventListener('resize',()=>{closeDrawer(false);updatePanelButtons();paint();});
window.addEventListener('beforeunload',e=>{commitTyping();if(busy||dirty||saving){e.preventDefault();e.returnValue='';}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){commitTyping();saveNow();}});
writingTools=mountWritingTools({state:()=>state,current,key:()=>apiKey,busy:()=>busy,commit:commitTyping,save:scheduleSave,saveNow,render,toast,message:showMessage,connect:connectionDialog,closeDrawer,generate,scrollTop:()=>$('writingScroll').scrollTop=0,lock:(value,ctrl)=>{controller=value?ctrl:null;setBusy(value);if(value){$('generate').querySelector('span').textContent='停止处理';showMessage('正在整理创作资料…');}else showMessage('创作资料处理结束。');}});
uiTour=mountUiTour({openLibrary:()=>{if(innerWidth<=900)openDrawer($('libraryPanel'),$('showLibrary'));},openInspector:()=>{if(innerWidth<=1240)openDrawer($('inspectorPanel'),$('showInspector'));},closeDrawer,revealInspector:()=>{if(innerWidth>1240&&inspectorHidden)toggleInspector();},selectPanel,leaveFocus:()=>{if(state.prefs.focusMode){$('focusMode').click();return true;}return false;},restoreFocusMode:()=>{$('focusMode').click();},completed:()=>{state.prefs.uiTourDone=true;saveNow();}});
try{db=await openDb();const saved=await readDb();let migrated=false,legacyRestored=0;if(saved?.stories?.length){state=saved;state.prefs.contextWindow??=0;state.prefs.modelInfo??=[];for(const story of state.stories){if(story.draftGeneration){checkpoint(story,story.draftGeneration.before,'中断续写');delete story.draftGeneration;}}const legacy=recoverLegacyTrash(state);legacyRestored=Math.max(0,legacy);migrated=upgradeWorkspace(state)||legacy>=0;if(!state.stories.some(s=>s.id===state.activeId))state.activeId=state.stories[0].id;}render();if(!saved||migrated){const ok=await saveNow();if(ok&&legacyRestored)toast('旧版暂存的 '+legacyRestored+' 篇故事已放回书架，请核对。');}finishStartup(saved,!dbFailed);}catch(e){document.documentElement.removeAttribute('data-starting');dbFailed=true;render();saveLabel('存储不可用，请及时导出',true);toast('当前浏览器无法启用本地存储。建议使用普通 Chrome / Edge 窗口。');}

localServices=mountLocalServices({config:()=>state.prefs,form:connectionForm,key:()=>apiKey,setKey:value=>{apiKey=value;updateMode();writingTools?.refresh();},busy:()=>busy,commit:commitTyping,save:saveNow,message:showMessage});

shelf=mountShelf({state:()=>state,busy:()=>busy,commit:commitTyping,save:saveNow,render,renderList,toast,message:showMessage,lock:value=>{setBusy(value);$('generate').disabled=value;if(value)$('generate').querySelector('span').textContent='正在保存…';}});renderList();

window.addEventListener('creator-locale-change',()=>{renderList();paint({replace:false});});

document.querySelector('[data-legal-open]').addEventListener('click',()=>document.getElementById('legalDialog').showModal());
