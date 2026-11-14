/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
import {renameShelfStory,moveShelfStory,deleteShelfStory,saveShelfChange} from './shelf-model.mjs';

export function mountShelf(h){
  const el=id=>document.getElementById(id),name=s=>s.title||'未命名故事';
  let ordering=false,managedId='',saving=false;
  function refresh(){
    el('toggleStoryOrder').textContent=ordering?'完成排序':'调整顺序';el('toggleStoryOrder').setAttribute('aria-pressed',String(ordering));
    el('toggleStoryOrder').disabled=h.busy();el('search').disabled=ordering||h.busy();el('orderHelp').hidden=!ordering;
  }
  async function change(makePatch,message,status){
    if(saving||h.busy())return false;
    h.commit();saving=true;h.lock(true);
    document.querySelectorAll('.shelf-dialog button,.shelf-dialog input').forEach(x=>x.disabled=true);
    try{await saveShelfChange(h.state(),makePatch(h.state()),h.save);h.render();h.toast(message);if(status)el(status).textContent='';return true;}
    catch(e){h.render();h.toast(e.message);if(status)el(status).textContent=e.message;return false;}
    finally{saving=false;h.lock(false);document.querySelectorAll('.shelf-dialog button,.shelf-dialog input').forEach(x=>x.disabled=false);refresh();}
  }
  function manage(id){
    if(h.busy())return;h.commit();const story=h.state().stories.find(s=>s.id===id);if(!story)return;
    managedId=id;el('storyRename').value=name(story);el('storyManageStatus').textContent='';el('storyManageDialog').showModal();el('storyRename').focus();el('storyRename').select();
  }
  function rowControls(row,story,index){
    if(ordering){
      const controls=document.createElement('div');controls.className='story-order-controls';
      for(const [direction,label] of [[-1,'上移'],[1,'下移']]){
        const b=document.createElement('button');b.type='button';b.textContent=direction<0?'↑':'↓';b.title=label;b.setAttribute('aria-label',label+'《'+name(story)+'》');
        b.disabled=h.busy()||(direction<0?index===0:index===h.state().stories.length-1);
        b.onclick=async()=>{if(await change(w=>moveShelfStory(w,story.id,direction),'书架顺序已保存。')){
          const moved=Array.from(el('storyList').querySelectorAll('.story-row')).find(r=>r.dataset.storyId===story.id);
          (moved?.querySelectorAll('.story-order-controls button')[direction<0?0:1]||moved?.querySelector('.story-item'))?.focus();
        }};controls.append(b);
      }row.append(controls);
    }else{
      const b=document.createElement('button');b.type='button';b.className='story-manage';b.textContent='管理';b.title='改名或删除';b.setAttribute('aria-label','管理《'+name(story)+'》');b.disabled=h.busy();b.onclick=()=>manage(story.id);row.append(b);
    }
  }
  el('toggleStoryOrder').onclick=()=>{if(h.busy())return;h.commit();ordering=!ordering;if(ordering)el('search').value='';h.renderList();refresh();};
  el('storyManageForm').onsubmit=async e=>{e.preventDefault();if(await change(w=>renameShelfStory(w,managedId,el('storyRename').value),'故事名称已修改。','storyManageStatus'))el('storyManageDialog').close();};
  el('requestStoryDelete').onclick=()=>{
    if(saving||h.busy())return;const story=h.state().stories.find(s=>s.id===managedId);if(!story)return;
    el('storyDeleteName').textContent='《'+name(story)+'》';el('storyDeleteStatus').textContent='';el('storyDeleteDialog').showModal();
  };
  el('confirmStoryDelete').onclick=async()=>{
    if(await change(w=>deleteShelfStory(w,managedId),'故事已删除。','storyDeleteStatus')){
      el('storyDeleteDialog').close();el('storyManageDialog').close();h.message('故事已删除。');el('toggleStoryOrder').focus();
    }
  };
  document.querySelectorAll('.shelf-dialog').forEach(d=>d.addEventListener('cancel',e=>{if(saving)e.preventDefault();}));
  refresh();return {refresh,rowControls};
}
