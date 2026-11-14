/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { APP_ID, APP_VERSION } from './app-info.mjs';

const directory=dirname(fileURLToPath(import.meta.url));
export async function localSession(port) {
  try{const r=await fetch('http://127.0.0.1:'+port+'/api/session',{signal:AbortSignal.timeout(800),redirect:'error',headers:{connection:'close'}});return await r.json();}
  catch{return null;}
}
async function stopOwnSession(port,session) {
  if(session.app!==APP_ID)throw Error('4317 端口正被其他程序使用，请先关闭占用程序。');
  if(session.canShutdown!==true||typeof session.token!=='string')throw Error('旧版创作家仍在运行，请关闭旧启动窗口后重试。');
  const r=await fetch('http://127.0.0.1:'+port+'/api/shutdown',{method:'POST',headers:{'content-type':'application/json','x-local-token':session.token,connection:'close'},body:'{}',signal:AbortSignal.timeout(5000)});
  const result=await r.json();if(!r.ok)throw Error(result.error||'旧版服务未能退出，请手动关闭后重试。');
  for(let i=0;i<30;i++){if(!await localSession(port))return result;await delay(100);}
  throw Error('旧版服务尚未退出，请稍后重试。');
}
export function openLocalPage(port) {
  const url='http://127.0.0.1:'+port;
  const [cmd,args]=process.platform==='win32'?['cmd.exe',['/d','/s','/c',`start "" "${url}"`]]:process.platform==='darwin'?['open',[url]]:['xdg-open',[url]];
  const child=spawn(cmd,args,{stdio:'ignore',windowsHide:true,windowsVerbatimArguments:process.platform==='win32'});child.on('error',()=>{});child.unref();
}
export async function launch({port=4317,open=true,stop=false}={}) {
  if(!Number.isInteger(port)||port<1024||port>65535)throw Error('本地端口不正确。');
  let session=await localSession(port);
  if(stop){
    if(!session)return{stopped:true,alreadyStopped:true};
    return stopOwnSession(port,session);
  }
  if(session){
    if(session.app!==APP_ID)throw Error('4317 端口正被其他程序使用，请先关闭占用程序。');
    if(session.version===APP_VERSION){if(open)openLocalPage(port);return{reused:true};}
    if(!/^(?:0\.4\.[34567]|0\.5\.[01234])$/.test(String(session.version)))throw Error('检测到其他版本的创作家，请先从原页面退出本地服务。');
    await stopOwnSession(port,session);
  }
  let failed=false;
  const child=spawn(process.execPath,[join(directory,'server.mjs'),'--background','--port',String(port)],{cwd:directory,detached:true,windowsHide:true,stdio:'ignore'});
  child.once('error',()=>{failed=true;});child.once('exit',code=>{if(code!==0)failed=true;});child.unref();
  for(let i=0;i<40;i++){
    if(failed)break;await delay(150);session=await localSession(port);
    if(session?.app===APP_ID&&session.version===APP_VERSION){if(open)openLocalPage(port);return{started:true};}
  }
  throw Error('后台服务未能启动。请完整解压文件，并检查 4317 端口是否被占用；可双击 start-windows-debug.bat 查看提示。');
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const i=process.argv.indexOf('--port'),port=i<0?4317:Number(process.argv[i+1]);
  try{const result=await launch({port,open:!process.argv.includes('--no-open'),stop:process.argv.includes('--stop')});console.log(result.stopped?'创作家本地服务已退出。':'创作家已在后台运行。关闭启动窗口不会停止服务；结束时可在页面左侧点「退出本地服务」。');}
  catch(e){console.error(e.message);process.exitCode=1;}
}
