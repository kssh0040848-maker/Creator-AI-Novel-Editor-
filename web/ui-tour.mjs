/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
const STEPS = [
  { target:'beginnerMode', panel:'library', title:'没想好怎么写？', description:'点「新手模式」，回答六个小问题，就能整理出人物、世界和文风。' },
  { target:'newStory', panel:'library', title:'想好了，直接写', description:'点「开始一个新故事」，打开一张空白页。以前的故事还在书架上。' },
  { target:'editorWrap', title:'在这里写正文', description:'写下第一句，也可以修改已有文字。薄荷绿是你写的，浅色是 AI 写的。' },
  { target:'memory', panel:'inspector', title:'故事记忆', description:'写下主角是谁、之前发生了什么。每次续写，AI 都会先读这些内容。' },
  { target:'note', panel:'inspector', title:'作者注', description:'想写得紧张一点，还是温柔一点？把文风、视角和要求写在这里。' },
  { target:'worldSettingGuide', panel:'inspector', tab:'World', title:'世界设定', description:'点「添加」，写下地点、人物或规则，再填一个关键词，比如「月亮村」。最近正文或前章摘要提到它时，AI 会读这条设定。' },
  { target:'generate', title:'让 AI 接着写', description:'连接模型后，点「继续写作」。写得不满意可以撤销；演示模式只显示示例。' },
  { target:'chapterNext', title:'准备写下一章', description:'先整理本章发生的事，检查后再开新章。人物和世界设定会保留。' },
  { target:'backupAll', panel:'library', title:'给故事留一份备份', description:'故事保存在这个浏览器里。点「备份全部故事」下载一份，换电脑时可以导入。' }
];

export function mountUiTour({ openLibrary, openInspector, closeDrawer, revealInspector, selectPanel, leaveFocus, restoreFocusMode, completed }) {
  const $ = id => document.getElementById(id);
  const overlay = $('uiTour'), card = $('tourCard'), spot = $('tourSpotlight');
  let step = -1, restoreFocus = null, wasFocused = false, frame = 0;
  let scrollPositions=[], initialTab='Story', wasInspectorHidden=false;
  const active = () => !overlay.hidden;

  function position() {
    if (!active()) return;
    const target = $(STEPS[step].target);
    if (!target) return;
    const r = target.getBoundingClientRect(), pad = 5;
    spot.style.left = Math.max(0,r.left-pad)+'px';
    spot.style.top = Math.max(0,r.top-pad)+'px';
    spot.style.width = Math.min(innerWidth,r.width+pad*2)+'px';
    spot.style.height = Math.max(0,Math.min(innerHeight,r.bottom+pad)-Math.max(0,r.top-pad))+'px';
    const w = Math.min(360,innerWidth-24), h = card.offsetHeight;
    const bottomLimit=innerHeight-76;
    const below = r.bottom+18, above = r.top-h-18;
    let y = below+h < bottomLimit ? below : above >= 12 ? above : bottomLimit-h;
    y = Math.max(12,Math.min(y,bottomLimit-h));
    let x = Math.max(12,Math.min(r.left,innerWidth-w-12));
    if (r.left > innerWidth*.65) x = Math.max(12,innerWidth-w-12);
    // Put the card beside tall targets when there is room, keeping controls visible.
    if(r.right+w+30<innerWidth){x=r.right+18;y=Math.max(12,Math.min(r.top,bottomLimit-h));}
    else if(r.left>w+30){x=r.left-w-18;y=Math.max(12,Math.min(r.top,bottomLimit-h));}
    card.style.left = x+'px';card.style.top = y+'px';
  }
  function schedulePosition() { cancelAnimationFrame(frame); frame=requestAnimationFrame(position); }
  function show(index) {
    step=index;
    closeDrawer(false);
    const item=STEPS[step];
    if (item.panel==='library') openLibrary();
    else if (item.panel==='inspector') {revealInspector();openInspector();selectPanel(item.tab||'Story');}
    const target=$(item.target);
    target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
    $('tourProgress').textContent='界面指引 · '+(step+1)+' / '+STEPS.length;
    $('tourTitle').textContent=item.title;
    $('tourDescription').textContent=item.description;
    $('tourBack').hidden=step===0;
    $('tourNext').textContent=step===STEPS.length-1?'完成':'下一步';
    schedulePosition();
    $('tourNext').focus();
  }
  function finish() {
    if (!active()) return;
    overlay.hidden=true;cancelAnimationFrame(frame);closeDrawer(false);
    completed();
    if (wasFocused) restoreFocusMode();
    wasFocused=false;
    selectPanel(initialTab);
    if(wasInspectorHidden&&!document.body.classList.contains('settings-hidden')&&innerWidth>1240&&!wasFocused)$('closeInspector').click();
    if (restoreFocus?.getClientRects().length) restoreFocus.focus({preventScroll:true});
    for(const [node,top] of scrollPositions)node.scrollTop=top;
    scrollPositions=[];
    restoreFocus=null;step=-1;
  }
  function start() {
    if (active() || document.querySelector('dialog[open]')) return;
    restoreFocus=document.activeElement;
    initialTab=document.querySelector('.tabs [aria-selected="true"]').id.slice(3);
    wasInspectorHidden=document.body.classList.contains('settings-hidden');
    scrollPositions=[...document.querySelectorAll('#writingScroll,#libraryPanel,.inspector-scroll,#storyList')].map(node=>[node,node.scrollTop]);
    wasFocused=leaveFocus();overlay.hidden=false;show(0);
  }
  $('tourNext').onclick=()=>step===STEPS.length-1?finish():show(step+1);
  $('tourBack').onclick=()=>show(step-1);
  $('tourSkip').onclick=finish;
  overlay.addEventListener('keydown',e=>{
    if (e.key==='Escape') {e.preventDefault();finish();}
    if (e.key==='Tab') {
      const items=[$('tourBack'),$('tourNext'),$('tourSkip')].filter(b=>!b.hidden);
      const first=items[0],last=items.at(-1);
      if (e.shiftKey&&document.activeElement===first) {e.preventDefault();last.focus();}
      else if (!e.shiftKey&&document.activeElement===last) {e.preventDefault();first.focus();}
    }
  });
  window.addEventListener('scroll',()=>{if(active())schedulePosition();},true);
  window.addEventListener('resize',()=>{if(active())requestAnimationFrame(()=>show(step));});
  return {start,active};
}
