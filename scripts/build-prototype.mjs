/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
import './build-legal.mjs';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Dependency-free offline demo. Real API calls require the local server.
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const read=name=>readFile(join(root,'web',name),'utf8');
const [source,css,icon,introSource,locale,introCode]=await Promise.all(['index.html','style.css','favicon.svg','intro.html','lang.js','intro.js'].map(read));
const modules=await Promise.all(['model.mjs','continuation.mjs','api.mjs','starter.mjs','migrations.mjs','writing-tools.mjs','writing-ui.mjs','ui-tour.mjs','local-services-ui.mjs','shelf-model.mjs','shelf-ui.mjs','app.mjs'].map(read));
const js=modules.map(s=>s.replace(/^import .+ from ['"].+['"];\r?\n/gm,'').replace(/^export (?=(?:async )?function|const |let |class )/gm,'')).join('\n\n');
for(const code of [js,locale,introCode]){const check=spawnSync(process.execPath,['--input-type=module','--check'],{input:code,encoding:'utf8'});if(check.status!==0)throw Error(check.stderr||'Bundle syntax check failed');}
const json=value=>JSON.stringify(value).replace(/</g,'\\u003c');
const script=code=>'<script>'+code.replace(/<\/script/gi,'<\\/script')+'</script>';
// Load language code after the body is present in file:// previews.
let intro=introSource.replace('<script src="lang.js" defer></script>','').replace('<script src="intro.js" defer></script>',()=>script(locale)+script(introCode));
let html=source.replace('<link rel="stylesheet" href="style.css">',()=>'<style>'+css+'</style>')
 .replace('href="favicon.svg"',()=> 'href="data:image/svg+xml,'+encodeURIComponent(icon)+'"')
 .replace('<script src="lang.js" defer></script>','')
 .replace('<script type="module" src="app.mjs"></script>',()=>script(locale)+script('window.__introHtml='+json(intro))+'<script type="module">'+js.replace(/<\/script/gi,'<\\/script')+'</script>');
if(/(?:src|href)="(?:app.mjs|style.css|favicon.svg|lang.js)"/.test(html))throw Error('Offline bundle has an external asset.');
await writeFile(join(root,'offline-writing-demo.html'),html);
const standaloneIntro=intro.replace('<script id="inline-demo-placeholder"></script>',()=>script('window.__demoHtml='+json(html)));
if(standaloneIntro===intro)throw Error('Intro insertion point missing');
await writeFile(join(root,'product-introduction.html'),standaloneIntro);
console.log('Built writing preview and product introduction.');
