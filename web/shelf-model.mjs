/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
import {uid,newStory,parseImport,syncChapter} from './model.mjs';

export function renameShelfStory(w,id,value){
  const title=String(value).trim();if(!title||title.length>100)throw Error('故事名称请填写 1–100 个字符。');
  if(!w.stories.some(s=>s.id===id))throw Error('故事已不在书架。');
  return {stories:w.stories.map(s=>s.id===id?{...s,title,updatedAt:new Date().toISOString()}:s)};
}
export function moveShelfStory(w,id,direction){
  const stories=[...w.stories],from=stories.findIndex(s=>s.id===id);
  if(from<0)throw Error('故事已不在书架。');
  const to=direction==='top'?0:Math.max(0,Math.min(stories.length-1,from+direction));
  stories.splice(to,0,stories.splice(from,1)[0]);return {stories};
}
export function deleteShelfStory(w,id){
  const at=w.stories.findIndex(s=>s.id===id);if(at<0)throw Error('故事已不在书架。');
  const stories=w.stories.filter(s=>s.id!==id);if(!stories.length)stories.push(newStory());
  return {stories,activeId:w.activeId===id?stories[Math.min(at,stories.length-1)].id:w.activeId};
}
export function recoverLegacyTrash(w){
  if(!Array.isArray(w.trash)||!w.trash.length){if('trash' in w){delete w.trash;return 0;}return -1;}
  if(w.trash.some(entry=>!entry?.story||typeof entry.story.id!=='string'))throw Error('旧回收站数据无效，请先在旧版导出备份。');
  const existing=new Set(w.stories.map(s=>s.id));
  for(const entry of [...w.trash].reverse()){
    const story=structuredClone(entry.story);syncChapter(story);
    if(existing.has(story.id))story.id=uid();
    existing.add(story.id);
    w.stories.splice(Math.max(0,Math.min(w.stories.length,Number.isInteger(entry.position)?entry.position:w.stories.length)),0,story);
  }
  const count=w.trash.length;delete w.trash;return count;
}
export async function saveShelfChange(w,patch,save){
  const before={stories:w.stories,activeId:w.activeId};Object.assign(w,patch);
  try{if(!await save())throw Error('未能保存书架，操作已取消。请先备份作品。');}
  catch(e){Object.assign(w,before);throw e;}
}
export function parseShelfImport(value,filename){
  const stories=parseImport(value,filename);let restoredLegacyCount=0;
  if(!/\.txt$/i.test(filename)){
    const data=JSON.parse(value);
    if(data.format==='storydesk-local-v3'&&data.trash!==undefined){
      if(!Array.isArray(data.trash)||data.trash.length>200)throw Error('旧版备份中的故事格式不正确。');
      for(const entry of data.trash){
        if(!entry?.story)throw Error('旧版备份缺少故事。');
        const [story]=parseImport(JSON.stringify({format:'storydesk-local-v3',stories:[entry.story]}),'旧版故事.json');
        stories.push(story);restoredLegacyCount++;
      }
    }
  }
  return {stories,restoredLegacyCount};
}
