import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { upgradeWorkspace } from '../web/migrations.mjs';
import { newStory, textOf } from '../web/model.mjs';
import { STARTER_TITLE, STARTER_TEXT, createStarterStory } from '../web/starter.mjs';

const fixture = JSON.parse(readFileSync(new URL('./legacy-demo.json',import.meta.url),'utf8'));
function workspace(story = structuredClone(fixture)) { return {stories:[story],activeId:story.id}; }
test('旧版默认示例升级为新故事，标题、正文和设定同步替换，且只执行一次',()=>{
 const state=workspace();assert.equal(upgradeWorkspace(state),true);
 assert.equal(state.stories[0].title,STARTER_TITLE);assert.equal(textOf(state.stories[0]),STARTER_TEXT);
 assert.equal(state.activeId,state.stories[0].id);assert.match(state.stories[0].memory,/许眠/);
 const id=state.activeId;assert.equal(upgradeWorkspace(state),false);assert.equal(state.activeId,id);
});
test('升级保留用户修改过的正文、设定及普通故事',()=>{
 for(const mutate of [s=>s.runs.push({origin:'author',text:'我自己的内容'}),s=>s.note='自己的风格',s=>s.lore[0].text='自己的设定']){
  const s=structuredClone(fixture);mutate(s);const before=structuredClone(s),state=workspace(s);state.productVersion=2;upgradeWorkspace(state);assert.deepEqual(state.stories.find(x=>x.id===s.id),before);assert.equal(state.stories.find(x=>x.id===state.activeId).title,STARTER_TITLE);
 }
 const personal=newStory('我的作品','自己的正文'),state=workspace(personal);upgradeWorkspace(state);assert.deepEqual(state.stories.find(x=>x.id===personal.id),personal);
});
test('即使当前正文回到旧示例，含用户创作的历史也会保留',()=>{
 const s=structuredClone(fixture);s.future.push({label:'手动编辑',runs:[{origin:'author',text:'用户曾经写过的文字'}]});
 const before=structuredClone(s),state=workspace(s);upgradeWorkspace(state);assert.deepEqual(state.stories.find(x=>x.id===s.id),before);
});
test('v0.2 空白存档打开新开头，新版本再次进入保留用户选择且不重复添加',()=>{
 const blank=newStory('未命名作品'),state=workspace(blank);state.productVersion=2;
 upgradeWorkspace(state);assert.equal(state.stories.length,1);assert.equal(textOf(state.stories[0]),STARTER_TEXT);
 const own=newStory('我的另一个故事','正文');state.stories.push(own);state.activeId=own.id;
 assert.equal(upgradeWorkspace(state),false);assert.equal(state.activeId,own.id);assert.equal(state.stories.length,2);
 const fresh=createStarterStory();assert.equal(fresh.title,STARTER_TITLE);assert.equal(textOf(fresh),STARTER_TEXT);
});
