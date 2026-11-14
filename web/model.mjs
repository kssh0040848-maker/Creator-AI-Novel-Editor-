/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
export const LIMIT = 200000;
export function uid() { return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(16)), b => b.toString(16).padStart(2, '0')).join(''); }
export function mergeRuns(runs) {
  const out = [];
  for (const r of runs) {
    if (!r.text) continue;
    const origin = r.origin === 'ai' ? 'ai' : 'author';
    if (out.at(-1)?.origin === origin) out.at(-1).text += r.text;
    else out.push({ text: r.text, origin });
  }
  return out;
}
export function textOf(story) { return story.runs.map(r => r.text).join(''); }
export function snapshot(story) { return story.runs.map(r => ({ ...r })); }
export function sliceRuns(runs, start, end = Infinity) {
  let pos = 0; const out = [];
  for (const r of runs) {
    const a = Math.max(0, start - pos), b = Math.min(r.text.length, end - pos);
    if (b > a) out.push({ origin: r.origin, text: r.text.slice(a, b) });
    pos += r.text.length;
  }
  return mergeRuns(out);
}
export function editRuns(runs, next) {
  const old = runs.map(r => r.text).join('');
  let a = 0, b = 0;
  while (a < Math.min(old.length, next.length) && old[a] === next[a]) a++;
  while (b < Math.min(old.length - a, next.length - a) && old[old.length - 1 - b] === next[next.length - 1 - b]) b++;
  return mergeRuns([...sliceRuns(runs, 0, a), { text: next.slice(a, next.length - b), origin: 'author' }, ...sliceRuns(runs, old.length - b)]);
}
export function checkpoint(story, before, label) {
  if (JSON.stringify(before) === JSON.stringify(story.runs)) return;
  story.past.push({ runs: before, label });
  story.future = [];
  while (story.past.length > 30 || JSON.stringify(story.past).length > 1500000) story.past.shift();
  story.updatedAt = new Date().toISOString();
}
export function travel(story, direction) {
  const from = direction === 'undo' ? story.past : story.future;
  const to = direction === 'undo' ? story.future : story.past;
  const entry = from.pop(); if (!entry) return false;
  to.push({ runs: snapshot(story), label: entry.label });
  story.runs = mergeRuns(entry.runs); story.updatedAt = new Date().toISOString();
  return true;
}
export function newStory(title = '未命名故事', text = '') {
  return { id: uid(), title, runs: text ? [{ text, origin: 'author' }] : [], memory: '', note: '', lore: [], past: [], future: [], updatedAt: new Date().toISOString() };
}
export function contextFor(story, recentChars = 12000) {
  const full = textOf(story), recent = recentChars > 0 ? Array.from(full).slice(-recentChars).join('') : '';
  const recall = recent + '\n' + (story.carrySummary || '');
  const activeLore = story.lore.filter(r => r.enabled && r.text.trim() && r.keys.split(/[,，\n]/).map(x => x.trim()).filter(Boolean).some(k => recall.toLocaleLowerCase().includes(k.toLocaleLowerCase())));
  const system = [
    '当前正文包含作者最新的手动修改，以当前版本为准。只接着最后一个字符往后写；末句未结束时直接补齐余下部分，不重新写这句话的开头。不要重复、复述或改写已有文字，不要先引用原文再续写。',
    '你是小说续写助手。直接从正文末尾继续写，只输出新增小说正文。保持人物关系、时态与剧情事实。默认延续原文语言和叙述视角；本次写作要求明确指定了文风或视角时，以该要求为准。文风示例只示范语言，不是故事事实，不能带入示例情节。不复述已有段落，不添加标题、解释、Markdown围栏或写作建议。不要擅自总结整本故事。',
    story.memory.trim() ? '故事记忆：\n' + story.memory.trim() : '',
    story.carrySummary?.trim() ? '前章进度摘要（已发生的剧情，接续时参考）：\n' + story.carrySummary.trim() : '',
    ...activeLore.map(l => '世界书 / ' + l.title + '：\n' + l.text),
    story.note.trim() ? '本次写作要求：\n' + story.note.trim() : ''
  ].filter(Boolean).join('\n\n');
  return { messages: [{ role: 'system', content: system }, { role: 'user', content: recent ? '以下是已有正文。请从最后一个字符之后续写：\n\n' + recent : story.carrySummary?.trim() ? '请承接前章进度摘要的最后场景，直接写出本章的开头。不要重新开始整部小说，不复述前章。' : '请按照设定，直接写出小说的开头。' }], activeLore, recent, omitted: Array.from(full).length > recentChars };
}
export function ensureChapters(story) {
  if (!Array.isArray(story.chapters) || !story.chapters.length) {
    const ch = { id: uid(), title: '第 1 章', runs: story.runs, past: story.past, future: story.future, carrySummary: story.carrySummary || '' };
    story.chapters = [ch]; story.activeChapterId = ch.id; story.carrySummary = ch.carrySummary;
  }
  return story.chapters.find(c => c.id === story.activeChapterId) || story.chapters[0];
}
export function syncChapter(story) {
  const ch = ensureChapters(story);
  for (const key of ['runs','past','future','carrySummary']) ch[key] = story[key] ?? (key === 'carrySummary' ? '' : []);
  return ch;
}
export function activateChapter(story, id) {
  syncChapter(story);
  const ch = story.chapters.find(c => c.id === id);
  if (!ch) throw Error('章节不存在。');
  story.activeChapterId = ch.id;
  for (const key of ['runs','past','future','carrySummary']) story[key] = ch[key] ?? (key === 'carrySummary' ? '' : []);
  return ch;
}
export function chapterFingerprint(story) {
  let hash = 2166136261;
  for (const c of textOf(story) + '\n' + (story.carrySummary || '')) hash = Math.imul(hash ^ c.codePointAt(0), 16777619);
  return (hash >>> 0).toString(16);
}
export function addChapter(story, summary, title) {
  const previous = syncChapter(story);
  if (previous.id !== story.chapters.at(-1).id) throw Error('请切换到最后一章再新建下一章；当前不创建平行剧情分支。');
  if (story.chapters.length >= 100) throw Error('一部故事最多 100 章，请先备份并分卷。');
  if (!summary.trim() || summary.length > 8000) throw Error('请填写并核对前情摘要（最多 8,000 字符）。');
  const ch = { id: uid(), title: title.trim().slice(0,80) || '第 ' + (story.chapters.length + 1) + ' 章', runs: [], past: [], future: [], carrySummary: summary.trim(), sourceChapterId: previous.id, sourceHash: chapterFingerprint(story) };
  story.chapters.push(ch); activateChapter(story,ch.id); story.updatedAt = new Date().toISOString();
  return ch;
}
export function chapterContinuityStale(story, chapter) {
  const visited=new Set();let child=chapter;
  while(child?.sourceChapterId){
    if(visited.has(child.id))return true;visited.add(child.id);
    const source=story.chapters.find(c=>c.id===child.sourceChapterId);
    if(!source||chapterFingerprint(source)!==child.sourceHash)return true;
    child=source;
  }
  return false;
}
export function wholeStoryText(story) {
  syncChapter(story);
  return story.chapters.length === 1 ? textOf(story) : story.chapters.map(ch => ch.title + '\n\n' + ch.runs.map(r => r.text).join('')).join('\n\n\n');
}
export function parseImport(value, filename) {
  if (/\.txt$/i.test(filename)) {
    if (value.length > LIMIT) throw Error('单篇暂支持 20 万字符，请分卷导入。');
    return [newStory(filename.replace(/\.txt$/i, ''), value)];
  }
  const data = JSON.parse(value);
  const items = Array.isArray(data) ? data : data.stories;
  if (!Array.isArray(items) || !items.length || items.length > 50) throw Error('请选择 TXT，或包含 stories 的故事备份（最多 50 篇）。');
  return items.map(s => {
    if (!s || typeof s !== 'object') throw Error('备份中的故事格式无效。');
    const validRuns = Array.isArray(s.runs) && s.runs.every(r => r && typeof r.text === 'string' && ['author', 'ai'].includes(r.origin));
    const text = validRuns ? s.runs.map(r => r.text).join('') : s.text;
    if (typeof text !== 'string' || text.length > LIMIT) throw Error('备份正文无效或超过 20 万字符。');
    const story = newStory(String(s.title || '导入的故事').slice(0, 100), text);
    if (validRuns) story.runs = mergeRuns(s.runs);
    story.memory = String(s.memory || '').slice(0, 16000);
    story.note = String(s.note ?? s.authorNote ?? '').slice(0, 8000);
    story.lore = (Array.isArray(s.lore || s.lorebook) ? (s.lore || s.lorebook) : []).slice(0, 30).map(l => ({ id: uid(), title: String(l.title || '未命名').slice(0, 80), keys: (Array.isArray(l.keys) ? l.keys.join('，') : String(l.keys || '')).slice(0, 500), text: String(l.text || '').slice(0, 4000), enabled: l.enabled !== false }));
    if (['storydesk-local-v1','storydesk-local-v2','storydesk-local-v3'].includes(data.format)) {
      for (const name of ['past', 'future']) {
        story[name] = (Array.isArray(s[name]) ? s[name] : []).slice(-30).filter(e => Array.isArray(e?.runs) && e.runs.every(r => typeof r?.text === 'string' && ['author','ai'].includes(r.origin)) && e.runs.reduce((n,r) => n + r.text.length,0) <= LIMIT).map(e => ({label: String(e.label || '编辑'), runs: mergeRuns(e.runs)}));
      }
    }
    if (s.chapters !== undefined) {
      if (!Array.isArray(s.chapters) || !s.chapters.length || s.chapters.length > 100) throw Error('备份章节数量无效（每部最多 100 章）。');
      const ids = new Map();
      story.chapters = s.chapters.map(ch => {
        if (!ch || typeof ch.id !== 'string' || ids.has(ch.id) || !Array.isArray(ch.runs) || ch.runs.some(r => typeof r?.text !== 'string' || !['author','ai'].includes(r.origin)) || ch.runs.reduce((n,r)=>n+r.text.length,0) > LIMIT) throw Error('章节正文无效或超过 20 万字符。');
        const id = uid(); ids.set(ch.id,id);
        const history = key => (Array.isArray(ch[key]) ? ch[key] : []).slice(-30).filter(e=>Array.isArray(e?.runs)&&e.runs.every(r=>typeof r?.text==='string'&&['author','ai'].includes(r.origin))&&e.runs.reduce((n,r)=>n+r.text.length,0)<=LIMIT).map(e=>({label:String(e.label||'编辑'),runs:mergeRuns(e.runs)}));
        return { id, title:String(ch.title||'未命名章节').slice(0,80), runs:mergeRuns(ch.runs), past:history('past'), future:history('future'), carrySummary:String(ch.carrySummary||'').slice(0,8000), sourceChapterId:ch.sourceChapterId, sourceHash:String(ch.sourceHash||'') };
      });
      story.chapters.forEach(ch=>ch.sourceChapterId=ids.get(ch.sourceChapterId)||'');
      story.activeChapterId=ids.get(s.activeChapterId)||story.chapters[0].id;
      const selected=story.chapters.find(ch=>ch.id===story.activeChapterId);
      for(const key of ['runs','past','future','carrySummary'])story[key]=selected[key];
    }
    return story;
  });
}
