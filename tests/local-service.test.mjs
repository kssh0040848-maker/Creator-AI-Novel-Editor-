import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once, EventEmitter } from 'node:events';
import { PassThrough } from 'node:stream';
import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto';
import { createCredentialVault, windowsProtect } from '../credential-vault.mjs';
import { createApp } from '../server.mjs';
import { generateRemote } from '../web/api.mjs';
import { launch, localSession } from '../launcher.mjs';
import { spawn } from 'node:child_process';
import http from 'node:http';

const config={provider:'deepseek',baseUrl:'https://api.deepseek.com',apiKey:'FAKE-unit-test-key-only',model:'deepseek-flash',maxTokens:256,temperature:.8};
// Cross-platform vault behavior uses a real AES cipher; production uses Windows DPAPI.
function fixtureCodec(){const key=randomBytes(32);return async(data,decrypt=false)=>{
  if(decrypt){const d=createDecipheriv('aes-256-gcm',key,data.subarray(0,12));d.setAuthTag(data.subarray(12,28));return Buffer.concat([d.update(data.subarray(28)),d.final()]);}
  const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',key,iv),cipher=Buffer.concat([c.update(data),c.final()]);return Buffer.concat([iv,c.getAuthTag(),cipher]);
};}

test('密钥默认不落盘；显式保存后可重建读取；绑定服务商与地址；忘记后移除',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'creator-vault-')),codec=fixtureCodec();
  try{
    const v=createCredentialVault({platform:'win32',directory,codec});assert.deepEqual(await v.load(config),{saved:false,apiKey:''});assert.deepEqual(await readdir(directory),[]);
    await v.save(config);const file=await readFile(join(directory,'api-credential.dpapi.json'),'utf8');assert.ok(!file.includes(config.apiKey));assert.ok(!file.includes(config.baseUrl));
    const restarted=createCredentialVault({platform:'win32',directory,codec});assert.equal((await restarted.load({...config,baseUrl:config.baseUrl+'/'})).apiKey,config.apiKey);
    assert.equal((await restarted.load({...config,provider:'custom',baseUrl:'https://another.example/v1'})).saved,false);
    await restarted.forget();assert.equal((await restarted.load(config)).saved,false);
    await assert.rejects(v.save({...config,apiKey:'bad\nkey'}),/有效/);
    const unavailable=createCredentialVault({platform:'linux',directory,codec});await assert.rejects(unavailable.save(config),/不支持/);assert.deepEqual(await readdir(directory),[]);
  }finally{await rm(directory,{recursive:true});}
});

test('加密失败不覆盖旧密钥；DPAPI 子进程密钥只走 stdin、不进入参数',async()=>{
  let argsSeen,input='',command='',optsSeen;
  const bytes=Buffer.from('FAKE-secret-with-"quotes"-only');
  const result=await windowsProtect(bytes,false,(cmd,args,opts)=>{
    command=cmd;argsSeen=args;optsSeen=opts;const child=new EventEmitter();child.stdin=new PassThrough();child.stdout=new PassThrough();child.stderr=new PassThrough();child.kill=()=>{};
    child.stdin.on('data',b=>input+=b);child.stdin.on('finish',()=>{child.stdout.write(Buffer.from('protected').toString('base64'));child.emit('close',0);});return child;
  });
  assert.equal(result.toString(),'protected');assert.equal(Buffer.from(input,'base64').toString(),bytes.toString());assert.ok(!JSON.stringify(argsSeen).includes(bytes.toString()));assert.equal(optsSeen.windowsHide,true);
  assert.match(command,/powershell.exe$/);assert.match(Buffer.from(argsSeen.at(-1),'base64').toString('utf16le'),/CurrentUser/);
  const directory=await mkdtemp(join(tmpdir(),'creator-vault-')),codec=fixtureCodec();
  try{const v=createCredentialVault({platform:'win32',directory,codec});await v.save(config);const broken=createCredentialVault({platform:'win32',directory,codec:async()=>{throw Error('fake codec error');}});await assert.rejects(broken.save({...config,apiKey:'new-fake'}));assert.equal((await v.load(config)).apiKey,config.apiKey);}
  finally{await rm(directory,{recursive:true});}
});

test('保存与读取需要同源会话；重启后恢复的密钥用于模型调用；不暴露为静态文件',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'creator-vault-')),codec=fixtureCodec();let server,base,token,authorization;
  async function start(){
    server=createApp({vault:createCredentialVault({platform:'win32',directory,codec}),resolveTarget:async()=>new URL('https://mock.example/chat/completions'),fetchImpl:async(url,opts)=>{
      authorization=opts.headers.authorization;return new Response('data: {"choices":[{"delta":{"content":"测试正文"},"finish_reason":"stop"}]}\n\ndata: [DONE]\n\n',{headers:{'content-type':'text/event-stream'}});
    }});server.listen(0,'127.0.0.1');await once(server,'listening');base='http://127.0.0.1:'+server.address().port;token=(await(await fetch(base+'/api/session')).json()).token;
  }
  async function stop(){server.closeAllConnections();await new Promise(r=>server.close(r));}
  async function post(data,headers={}){return fetch(base+'/api/credentials',{method:'POST',headers:{'content-type':'application/json','x-local-token':token,...headers},body:JSON.stringify(data)});}
  const nativeFetch=globalThis.fetch,oldLocation=globalThis.location;
  try{
    await start();assert.equal((await post({action:'save',...config},{'x-local-token':'wrong'})).status,403);assert.equal((await post({action:'save',...config},{origin:'https://evil.example'})).status,403);
    assert.equal((await post({action:'save',...config})).status,200);await stop();await start();
    const saved=await(await post({action:'load',...config,apiKey:undefined})).json();assert.equal(saved.apiKey,config.apiKey);assert.equal((await fetch(base+'/credential-vault.mjs')).status,404);
    globalThis.location={protocol:'http:'};globalThis.fetch=(url,opts)=>nativeFetch(new URL(url,base),opts);
    await generateRemote({...config,apiKey:saved.apiKey},[{role:'user',content:'续写测试'}],new AbortController().signal,()=>{});assert.equal(authorization,'Bearer '+config.apiKey);
    globalThis.fetch=nativeFetch;await post({action:'forget'});assert.equal((await(await post({action:'load',...config})).json()).saved,false);
  }finally{globalThis.fetch=nativeFetch;if(oldLocation===undefined)delete globalThis.location;else globalThis.location=oldLocation;if(server?.listening)await stop();await rm(directory,{recursive:true});}
});

test('启动器退出后服务继续运行；再次启动复用；退出只关闭创作家',async()=>{
  // Reserve a free port only for this test, then let the detached process bind it.
  const placeholder=createApp();placeholder.listen(0,'127.0.0.1');await once(placeholder,'listening');const port=placeholder.address().port;await new Promise(r=>placeholder.close(r));
  try{
    const child=spawn(process.execPath,['launcher.mjs','--port',String(port),'--no-open'],{cwd:new URL('..',import.meta.url),stdio:'ignore'});const [code]=await once(child,'exit');assert.equal(code,0);
    assert.equal((await localSession(port)).app,'creator-studio-local');assert.equal((await launch({port,open:false})).reused,true);
    const session=await localSession(port);assert.equal((await fetch('http://127.0.0.1:'+port+'/api/shutdown',{method:'POST',body:'{}'})).status,403);
    assert.ok(session.canShutdown);await launch({port,stop:true,open:false});
  }finally{const s=await localSession(port);if(s?.app==='creator-studio-local')await launch({port,stop:true,open:false});}
});

test('启动新版时仅关闭已确认的旧版创作家服务，并自动接替端口',async()=>{
  let shutdowns=0;
  const old=http.createServer((req,res)=>{
    if(req.url==='/api/session'){
      res.setHeader('content-type','application/json');res.end(JSON.stringify({app:'creator-studio-local',version:'0.5.4',canShutdown:true,token:'fixture-token'}));return;
    }
    if(req.url==='/api/shutdown'&&req.method==='POST'&&req.headers['x-local-token']==='fixture-token'){
      shutdowns++;res.setHeader('content-type','application/json');res.end('{"stopped":true}');res.once('finish',()=>old.close());return;
    }
    res.writeHead(404).end();
  });
  old.listen(0,'127.0.0.1');await once(old,'listening');const port=old.address().port;
  try{
    assert.equal((await launch({port,open:false})).started,true);
    assert.equal(shutdowns,1);
    assert.equal((await localSession(port)).version,'0.5.5');
  }finally{
    if(old.listening)await new Promise(resolve=>old.close(resolve));
    const session=await localSession(port);if(session?.version==='0.5.5')await launch({port,stop:true,open:false});
  }
});

test('Windows 启动脚本等服务就绪后从可见的 cmd 窗口打开浏览器',async()=>{
  const bat=await readFile(new URL('../start-windows.bat',import.meta.url),'utf8');
  assert.match(bat,/launcher\.mjs --no-open[\s\S]*start "" "http:\/\/127\.0\.0\.1:4317\/"/);
  assert.match(bat,/if errorlevel 1 goto browser_failed/);
});
