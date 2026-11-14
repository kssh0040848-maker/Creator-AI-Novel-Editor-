/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
import { STARTER_KEY, createStarterStory } from './starter.mjs';
const legacy = {"title": "雾港来信", "sample": "雾是从凌晨三点开始涨起来的。\n\n林舟推开旧书店的门时，街对面的钟楼只剩下一个模糊的轮廓。门铃响了两声，第二声比第一声慢了半拍，像有人在很远的地方迟疑着回应。\n\n柜台上放着一封信。\n\n信封没有邮戳，只有一行他熟悉的字迹：“潮水退去之前，不要打开。”\n\n那是父亲的笔迹。可父亲已经失踪七年了。", "demo": "\n\n他把信翻过来，指腹碰到封口处一粒细小的盐晶。信纸是干的，边缘却留着海水浸过的痕迹。\n\n门外传来脚步声，在台阶前停住了。\n\n“林先生，”一个陌生的声音说，“今天的潮水，不会照常退去。”\n\n林舟抬起头。玻璃门上映着一个撑黑伞的人，伞沿压得很低。他没有敲门，只把一枚黄铜钥匙放在窗台上，随后转身走进雾里。\n\n钥匙上刻着一个数字：七。", "memory": "沿海小城雾港。林舟经营一家旧书店，父亲七年前失踪。一个没有邮戳的信封，重新打开了这段往事。", "note": "第三人称。克制、有画面感；通过环境与动作推动悬念，暂时不要揭开信件的秘密。", "lore": {"title": "雾港", "keys": "雾港，潮水", "text": "雾港是一座古老的港口小城。居民相信，异常的潮汐总会带回被遗忘的东西。", "enabled": true}};

// Only replace the exact former demo, including known demo-generated continuations.
// Any changed text, settings, or meaningful editing history keeps the user's story.
function demoRuns(runs) {
  if (!Array.isArray(runs) || runs[0]?.origin !== 'author' || runs[0]?.text !== legacy.sample || runs.slice(1).some(r => r.origin !== 'ai' || typeof r.text !== 'string')) return false;
  const tail = runs.slice(1).map(r => r.text).join('');
  const repeats = Math.floor(tail.length / legacy.demo.length);
  return tail === legacy.demo.repeat(repeats) + legacy.demo.slice(0, tail.length % legacy.demo.length);
}
export function upgradeWorkspace(workspace) {
  if (workspace.productVersion >= 3) return false;
  workspace.stories = workspace.stories.filter(s => {
    const sameLore = s.lore?.length === 1 && Object.entries(legacy.lore).every(([k,v]) => s.lore[0][k] === v);
    const cleanHistory = ['past','future'].every(key => (s[key] || []).every(entry => demoRuns(entry.runs)));
    const legacyOnly = s.title === legacy.title && s.memory === legacy.memory && s.note === legacy.note && sameLore && demoRuns(s.runs) && cleanHistory && !s.draftGeneration;
    const emptyOnly = s.title === '未命名作品' && !s.runs?.length && !s.memory && !s.note && !s.lore?.length && !s.past?.length && !s.future?.length && !s.draftGeneration;
    return !legacyOnly && !emptyOnly;
  });
  let starter = workspace.stories.find(s => s.seedKey === STARTER_KEY);
  if (!starter) { starter = createStarterStory(); workspace.stories.unshift(starter); }
  // Explicitly select the new example once, even if the previous default was edited.
  // Edited stories remain in the bookshelf; later launches retain the user's choice.
  workspace.activeId = starter.id;
  workspace.productVersion = 3;
  return true;
}
