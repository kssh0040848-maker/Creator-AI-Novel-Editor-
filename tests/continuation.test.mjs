import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createContinuationFilter } from '../web/continuation.mjs';
import { newStory, editRuns, textOf, snapshot, checkpoint, travel, mergeRuns } from '../web/model.mjs';
import { writingContext } from '../web/writing-tools.mjs';

function filtered(base,parts){let output='';const f=createContinuationFilter(base,c=>output+=c);parts.forEach(c=>f.write(c));f.finish();return {output,removed:f.removedCharacters};}

test('手改末句的流式重复开头只追加一次，保留颜色及整次撤销重做',()=>{
  const s=newStory('回归测试','风雨渐急。她握紧旧钥匙。');
  s.runs=editRuns(s.runs,'风雨渐急。林夏从口袋拿出了一把旧钥匙');
  const base=textOf(s),before=snapshot(s),echo='林夏从口袋拿出了一把旧钥匙',next='，门内忽然传来脚步声。';
  for(let size=1;size<=echo.length+next.length;size++){
    const reply=Array.from(echo+next),parts=[];for(let i=0;i<reply.length;i+=size)parts.push(reply.slice(i,i+size).join(''));
    const result=filtered(base,parts);assert.equal(result.output,next);assert.equal(result.removed,echo.length);
  }
  s.runs=mergeRuns([...before,{origin:'ai',text:filtered(base,[echo,next]).output}]);checkpoint(s,before,'AI 续写');
  assert.equal(textOf(s),base+next);assert.equal(s.runs.at(-1).origin,'ai');
  assert.ok(travel(s,'undo'));assert.deepEqual(s.runs,before);assert.ok(travel(s,'redo'));assert.equal(textOf(s),base+next);
});
test('多段重复和空白差异可过滤；仅过滤开头，保留后文正常重复',()=>{
  const base='她收起那封迟到的信。\n\n林夏从口袋拿出了一把旧钥匙。';
  const response='\n　她收起那封迟到的信。\r\n林夏从口袋拿出了一把旧钥匙。\n\n门响了。门响了。';
  assert.equal(filtered(base,Array.from(response)).output,'\n\n门响了。门响了。');
  assert.equal(filtered(base,['林夏从口袋拿出了一把旧钥匙。','\n原句再次被她念出：林夏从口袋拿出了一把旧钥匙。']).output,'\n原句再次被她念出：林夏从口袋拿出了一把旧钥匙。');
});
test('短词、语义相近、标点不同、正文中段相同，都不擅自删除',()=>{
  for(const [base,reply] of [
    ['她看着林夏','林夏低下头。'],
    ['她说走吧','走吧，我们该回家了。'],
    ['林夏从口袋拿出了一把旧钥匙','林夏从袖中摸出一把旧钥匙，走向门口。'],
    ['她说：“今晚一定会有人回来。”','她说，“今晚一定会有人回来。”'],
    ['林夏从口袋拿出了一把旧钥匙。然后她坐了下来。','林夏从口袋拿出了一把旧钥匙。']
  ])assert.deepEqual(filtered(base,Array.from(reply)),{output:reply,removed:0});
});
test('候选开头只出现一部分时，结束或失败保留所有已收文字',()=>{
  const prefix='abcdefgh',base=prefix+'ijklmnop';let output='';const f=createContinuationFilter(base,c=>output+=c);
  f.write(prefix);assert.equal(output,'');f.finish();f.finish();assert.equal(output,prefix);assert.equal(f.removedCharacters,0);
  assert.equal(filtered('', ['\n新故事🌙']).output,'\n新故事🌙');
});
test('多个重叠候选选择完整的最长匹配；全部重复不制造新增文字',()=>{
  const unit='abcdefgh';assert.equal(filtered(unit+unit,[unit,unit,'!']).output,'!');
  assert.equal(filtered(unit+unit,[unit,'?']).output,'?');
  assert.equal(filtered(unit+unit,[unit,unit]).output,'');
  assert.equal(filtered('林夏举起🌙形状的灯笼',Array.from('林夏举起🌙形状的灯笼，走进屋里。')).output,'，走进屋里。');
});
test('停止生成后再次续写，按停止时的最新正文比对',()=>{
  const base='林夏从口袋拿出了一把旧钥匙';
  const first=filtered(base,[base,'，门后站着一个戴帽子的人']);
  const updated=base+first.output;
  assert.equal(filtered(updated,['门后站着一个戴帽子的人','，却没有影子。']).output,'，却没有影子。');
});
test('修改后即点续写，发送最新正文；中段编辑不会自动插入或覆盖旧后文',()=>{
  const s=newStory('测试','林夏收好信。她等在桥上。');
  s.runs=editRuns(s.runs,'林夏收好钥匙。她等在桥上。');
  const result=writingContext(s,{provider:'custom',baseUrl:'https://example.com',contextLength:12000,maxTokens:512});
  assert.ok(result.context.messages[1].content.endsWith(textOf(s)));
  assert.doesNotMatch(result.context.messages[1].content,/收好信/);
  assert.match(result.context.messages[0].content,/最新的手动修改/);
});
