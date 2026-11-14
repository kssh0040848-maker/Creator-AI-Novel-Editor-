import {test} from 'node:test';
import assert from 'node:assert/strict';
import {newStory,addChapter,snapshot,checkpoint,textOf,parseImport} from '../web/model.mjs';
import {renameShelfStory,moveShelfStory,deleteShelfStory,recoverLegacyTrash,saveShelfChange,parseShelfImport} from '../web/shelf-model.mjs';

test('老书架的作品改名、移动后，正文、章节、来源与设定不变',async()=>{
  const a=newStory('第一篇','林夏起身。'),b=newStory('第二篇','钥匙落地。');
  a.memory='人物与目标';a.note='短句';a.lore=[{id:'l1',title:'秘密',keys:'钥匙',text:'只有一把',enabled:true}];
  const before=snapshot(a);a.runs.push({origin:'ai',text:'门开了。'});checkpoint(a,before,'AI续写');
  addChapter(a,'刚才门开了','第二章');a.runs.push({origin:'author',text:'她回头看。'});
  const w={stories:[a,b],activeId:a.id};
  await saveShelfChange(w,renameShelfStory(w,a.id,'  新名字  '),async()=>true);
  assert.equal(w.stories[0].title,'新名字');assert.equal(w.stories[0].chapters.length,2);
  await saveShelfChange(w,moveShelfStory(w,b.id,-1),async()=>true);
  assert.deepEqual(w.stories.map(s=>s.id),[b.id,a.id]);assert.equal(w.activeId,a.id);
  assert.equal(textOf(w.stories[1]),'她回头看。');assert.equal(w.stories[1].memory,'人物与目标');assert.equal(w.stories[1].note,'短句');assert.equal(w.stories[1].lore[0].text,'只有一把');
  assert.equal(w.stories[1].chapters[0].past.length,1);
});
test('确认删除后直接移除整篇，当前故事切换；最后一篇删除时留下空白页',async()=>{
  const first=newStory('第一篇','段落'),second=newStory('第二篇','后文');first.memory='人物';
  const w={stories:[first,second],activeId:first.id};
  await saveShelfChange(w,deleteShelfStory(w,first.id),async()=>true);
  assert.deepEqual(w.stories.map(s=>s.id),[second.id]);assert.equal(w.activeId,second.id);
  assert.equal('trash' in w,false);
  await saveShelfChange(w,deleteShelfStory(w,second.id),async()=>true);
  assert.equal(w.stories.length,1);assert.equal(w.stories[0].title,'未命名故事');assert.notEqual(w.activeId,second.id);
  assert.equal(textOf(w.stories[0]),'');assert.equal('trash' in w,false);
});
test('升级时旧回收站故事回到书架，旧版备份导入为普通故事',()=>{
  const a=newStory('保留','正文'),old=newStory('旧版暂存','段落');old.memory='人物';old.runs.push({origin:'ai',text:'续写'});
  const w={stories:[a],activeId:a.id,trash:[{story:old,position:0,deletedAt:new Date().toISOString()}]};
  const exported=JSON.stringify({format:'storydesk-local-v3',version:3,stories:w.stories,trash:w.trash});
  const imported=parseShelfImport(exported,'backup.json');
  assert.equal(imported.restoredLegacyCount,1);assert.equal(imported.stories.length,2);
  assert.equal(imported.stories[1].memory,'人物');assert.deepEqual(imported.stories[1].runs.map(r=>r.origin),['author','ai']);
  assert.equal(parseImport(exported,'backup.json')[0].title,'保留');
  assert.equal(recoverLegacyTrash(w),1);assert.deepEqual(w.stories.map(s=>s.title),['旧版暂存','保留']);
  assert.equal(textOf(w.stories[0]),'段落续写');assert.equal('trash' in w,false);
});
test('浏览器保存失败时，改名、重排和直接删除全部回滚',async()=>{
  const a=newStory('甲','正文甲'),b=newStory('乙','正文乙');const w={stories:[a,b],activeId:a.id};
  for(const create of [()=>renameShelfStory(w,a.id,'改名'),()=>moveShelfStory(w,a.id,1),()=>deleteShelfStory(w,a.id)]){
    const before=JSON.stringify(w);
    await assert.rejects(saveShelfChange(w,create(),async()=>false),/未能保存书架/);
    assert.equal(JSON.stringify(w),before);
  }
  assert.throws(()=>renameShelfStory(w,b.id,' '),/故事名称/);
});
