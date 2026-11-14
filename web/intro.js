/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
const scenes=[
{num:'01 / ENTER THE STORY',title:'先走进去，听见潮声。',copy:'把人物、地点和规则交给故事记忆与世界设定。写一句你想做的事，再点「继续写作」，看看故事如何回应。',quote:'“末班船刚离岸，候船室里却有人喊出了你的名字。”',feature:'故事记忆 · 世界设定 · 继续写作'},
{num:'02 / CHANGE THE COURSE',title:'不喜欢结局，就从这里改。',copy:'直接改正文中的决定，再从新版本往下续写。不满意可以撤销或重做；如果想保存旧版本，先备份。',quote:'“她把船票撕成两半。这个夜晚，没有人必须按原来的剧本登船。”',feature:'编辑正文 · 撤销 / 重做 · 备份故事'},
{num:'03 / HEAR AN ANSWER',title:'让角色认真回答你的想象。',copy:'把人物关系写进故事记忆，在作者注里说明这段对话的语气。模型会参考你提供的设定续写，你仍然可以修改它的回答。',quote:'“你真的会等我吗？”她问。那人把灯挪近了些：“这次我不走。”',feature:'故事记忆 · 作者注 · 真实模型续写'},
{num:'04 / FOLLOW AN IDEA',title:'一个念头，也够开场。',copy:'不知道人物和世界怎么搭？新手模式用六个简单问题帮你整理初稿；从回答到设定，都可以自己改。',quote:'“岛上的人每年都会忘记同一个名字。直到今晚，名字被你叫了出来。”',feature:'六题新手模式 · 可编辑设定 · 文风提示'},
{num:'05 / FINISH A CHAPTER',title:'把故事稳稳写到下一章。',copy:'管理章节和前情摘要，检查故事记忆、世界设定与上下文用量。决定开新章时，先核对摘要，再继承设定继续写。',quote:'“这一章结束于潮水退去。下一章，她终于看见了岛的轮廓。”',feature:'上下文提示 · 可编辑前情 · 继续下一章 · 导出'}];
const tabs=[...document.querySelectorAll('.scene-choice')];function choose(i){const s=scenes[i];tabs.forEach((t,n)=>{t.classList.toggle('active',n===i);t.setAttribute('aria-selected',String(n===i));t.tabIndex=n===i?0:-1});document.querySelector('#sceneNumber').textContent=s.num;document.querySelector('#sceneTitle').textContent=s.title;document.querySelector('#sceneCopy').textContent=s.copy;document.querySelector('#sceneQuote').textContent=s.quote;document.querySelector('#sceneFeature').textContent=s.feature}tabs.forEach((t,i)=>{t.addEventListener('click',()=>choose(i));t.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowLeft'){e.preventDefault();const n=(i+(e.key==='ArrowDown'||e.key==='ArrowRight'?1:4))%5;choose(n);tabs[n].focus()}})});
function embeddedAbout(){return window.parent!==window && window.name==='creator-about';}
function openStudio(){
 if(window.__demoHtml){const shell=document.querySelector('#demoShell'),frame=document.querySelector('#demoFrame');if(!frame.srcdoc)frame.srcdoc=window.__demoHtml;shell.hidden=false;document.body.style.overflow='hidden';document.querySelector('#demoClose').focus();return;}
 if(embeddedAbout()){window.parent.postMessage({type:'creator-intro-close'},'*');return;}
 try{localStorage.setItem('creator-studio.welcome.v1','seen');}catch{}
 window.location.href='./';
}
document.querySelectorAll('.enter-studio').forEach(b=>b.addEventListener('click',openStudio));
document.querySelector('#demoClose').addEventListener('click',()=>{document.querySelector('#demoShell').hidden=true;document.body.style.overflow='';document.querySelector('.enter-studio').focus();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!document.querySelector('#demoShell').hidden)document.querySelector('#demoClose').click();else if(embeddedAbout())window.parent.postMessage({type:'creator-intro-close'},'*');}});
document.querySelectorAll('.scene-choice,.enter-studio').forEach(b=>b.disabled=false);
document.documentElement.dataset.interactive='ready';

document.querySelector('[data-legal-open]').addEventListener('click',()=>document.getElementById('legalDialog').showModal());
