/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=f=>readFile(new URL(f,root),'utf8');
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const texts=await Promise.all(['LICENSE.txt','THIRD_PARTY_NOTICES.txt'].map(read));
const block='<!--LEGAL:START--><dialog id="legalDialog" aria-labelledby="legalTitle"><form method="dialog"><button autofocus aria-label="Close / 关闭">关闭 / Close ×</button></form><h2 id="legalTitle">使用许可与第三方声明 / Licenses</h2>'+texts.map((s,i)=>'<details'+(i?'':' open')+'><summary>'+(i?'第三方软件声明 / Third-party notices':'个人创作许可 / Personal writing license')+'</summary><pre>'+esc(s)+'</pre></details>').join('')+'</dialog><!--LEGAL:END-->';
for(const file of ['web/index.html','web/intro.html']){
 const html=await read(file);if(!html.includes('<!--LEGAL:START-->'))throw Error(file+' missing legal mount');
 await writeFile(new URL(file,root),html.replace(/<!--LEGAL:START-->[\s\S]*?<!--LEGAL:END-->/,()=>block));
}
