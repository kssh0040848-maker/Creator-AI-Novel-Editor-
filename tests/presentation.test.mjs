import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {once} from 'node:events';
import vm from 'node:vm';
import {createApp} from '../server.mjs';
import {localSetupDraft,stylePresetFor} from '../web/writing-tools.mjs';

const read=name=>readFile(new URL('../'+name,import.meta.url),'utf8');

test('介绍页与语言资源在实际 CSP 下可加载，入口不含内联交互脚本',async()=>{
 const server=createApp({preview:true});server.listen(0,'127.0.0.1');await once(server,'listening');
 try{const base='http://127.0.0.1:'+server.address().port;
  for(const file of ['intro.html','intro.js','lang.js']){const r=await fetch(base+'/'+file);assert.equal(r.status,200);assert.match(r.headers.get('content-security-policy'),/script-src 'self';/);const body=await r.text();if(file.endsWith('.js')){assert.match(r.headers.get('content-type'),/javascript/);new vm.Script(body);}else for(const match of body.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc=/.test(match[1]))assert.equal(match[2].trim(),'');}
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
});

test('离线介绍页完整嵌入写作台，含美元字符与嵌套脚本的源码不会被替换损坏',async()=>{
 const html=await read('offline-writing-demo.html'),intro=await read('product-introduction.html');
 const embedded=JSON.parse(intro.match(/window\.__demoHtml=(.*?)<\/script>/s)[1]);assert.equal(embedded,html);
 const about=JSON.parse(html.match(/window\.__introHtml=(.*?)<\/script>/s)[1]);
 assert.match(about,/data-language-toggle/);assert.match(about,/dataset\.interactive='ready'/);
 for(const f of [html,intro,about])assert.ok(!/<script[^>]+src=/.test(f));
 assert.match(html,/name="creator-about"/);assert.match(intro,/name="creator-demo"/);
});

test('首次启动先介绍；已有故事、已看介绍和离线演示保持各自入口',async()=>{
 const source=await read('web/app.mjs');const fn=source.slice(source.indexOf('function finishStartup('),source.indexOf("document.querySelectorAll('.close-dialog')"));
 function run({saved=null,seen=false,offline=false,storageOK=true}={}){
  const events=[],data=new Map(seen?[['creator-studio.welcome.v1','seen']]:[]);
  const context=vm.createContext({window:offline?{__introHtml:'demo'}:{},location:{protocol:'http:'},localStorage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)},document:{documentElement:{removeAttribute:k=>events.push('ready')}},requestAnimationFrame:fn=>fn(),showIntroduction:w=>events.push(['intro',w]),uiTour:{start:()=>events.push('tour')},welcomeTourPending:false});
  vm.runInContext(fn,context);context.finishStartup(saved,storageOK);return{events,data,context};
 }
 const first=run();assert.equal(first.events[0][0],'intro');assert.equal(first.context.welcomeTourPending,true);assert.ok(!first.events.includes('tour'));assert.equal(first.data.get('creator-studio.welcome.v1'),'seen');
 const old=run({saved:{stories:[{title:'世界设定',runs:[{text:'原文'}]}],prefs:{uiTourDone:true}}});assert.deepEqual(old.events,['ready']);
 assert.ok(!run({seen:true}).events.some(e=>Array.isArray(e)&&e[0]==='intro'));
 assert.ok(!run({offline:true}).events.some(e=>Array.isArray(e)&&e[0]==='intro'));
 assert.ok(!run({storageOK:false}).events.includes('tour'));
});

// Lightweight DOM fixtures exercise language boundaries without browser dependencies.
function element(tag,{id='',text='',user=false,toggle=false}={}){
 const attrs=new Map(),node={nodeType:1,tag,id,childNodes:[],parentElement:null,value:'',attrs,
  matches(selector){return selector.split(',').some(s=>s===tag||s==='#'+id||(s==='[data-user-content]'&&user)||(s==='[data-language-toggle]'&&toggle));},
  closest(selector){return this.matches(selector)?this:this.parentElement?.closest(selector);},
  hasAttribute:k=>attrs.has(k),getAttribute:k=>attrs.get(k),setAttribute:(k,v)=>attrs.set(k,v)};
 const textNode={nodeType:3,nodeValue:text,parentElement:node};node.childNodes=[textNode];
 Object.defineProperty(node,'textContent',{get:()=>node.childNodes.map(n=>n.nodeValue||'').join(''),set:v=>{textNode.nodeValue=v;node.childNodes=[textNode];}});return node;
}
async function localeFixture(language='zh-CN',stored=null){
 const menu=element('button',{text:'世界设定'}),story=element('div',{id:'colorLayer',text:'世界设定'}),title=element('strong',{id:'breadcrumbTitle',text:'新手模式'}),input=element('textarea',{text:'故事记忆'});input.value='保持我的原文';
 const custom=element('div',{user:true,text:'继续写作'}),toggle=element('button',{toggle:true}),events={},data=new Map(stored?[['creator-studio.locale.v1',stored]]:[]);
 const root={nodeType:9,childNodes:[menu,story,title,input,custom,toggle],documentElement:{lang:'zh-CN'},querySelectorAll:()=>[],addEventListener:(e,f)=>events['document:'+e]=f};
 const window={name:'',addEventListener:(e,f)=>events[e]=f,dispatchEvent:()=>{}};window.parent=window;
 class MutationObserver{observe(){}disconnect(){}}
 const context=vm.createContext({document:root,window,navigator:{language},localStorage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)},MutationObserver,CustomEvent:class{constructor(type,detail){this.type=type;this.detail=detail;}}});
 vm.runInContext(await read('web/lang.js'),context);
 return {locale:window.CreatorLocale,menu,story,title,input,custom,toggle,events,data,root};
}

test('中英切换可逆并保存；即便正文与菜单同名，也不能改动用户作品',async()=>{
 const f=await localeFixture();assert.equal(f.menu.textContent,'世界设定');f.locale.set('en');
 assert.equal(f.menu.textContent,'World notes');assert.equal(f.story.textContent,'世界设定');assert.equal(f.title.textContent,'新手模式');assert.equal(f.input.textContent,'故事记忆');assert.equal(f.input.value,'保持我的原文');assert.equal(f.custom.textContent,'继续写作');
 assert.equal(f.toggle.textContent,'中文');assert.equal(f.data.get('creator-studio.locale.v1'),'en');assert.equal(f.root.documentElement.lang,'en');
 f.locale.set('zh');assert.equal(f.menu.textContent,'世界设定');assert.equal(f.toggle.textContent,'English');
 const persisted=await localeFixture('en-US','zh');assert.equal(persisted.locale.get(),'zh');
 const automatic=await localeFixture('en-US');assert.equal(automatic.locale.get(),'en');
 automatic.events.message({source:{},data:{type:'creator-locale',locale:'zh'}});assert.equal(automatic.locale.get(),'en');
});

test('英文新手选项保留文风规则，创建英文设定；已有输入不被翻译',async()=>{
 const f=await localeFixture('en-US');const previous=globalThis.CreatorLocale;globalThis.CreatorLocale=f.locale;
 try{const answers=['Urban fantasy','名字保持原样','A goal','A challenge','A world','Web fiction'];const d=localSetupDraft(answers);assert.match(d.memory,/名字保持原样/);assert.match(d.note,/brisk pace/);assert.equal(d.title,'Untitled story');assert.equal(stylePresetFor('Classical Chinese').name,'文言文');assert.equal(f.locale.t('第 3 题，共 6 题'),'Question 3 of 6');assert.equal(f.locale.t('管理《世界设定》'),'Manage “世界设定”');}
 finally{globalThis.CreatorLocale=previous;}
});
