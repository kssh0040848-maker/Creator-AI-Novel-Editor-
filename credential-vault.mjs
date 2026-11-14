/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { randomBytes } from 'node:crypto';

export function credentialScope(config) {
  let u;try{u=new URL(config.baseUrl);}catch{throw Error('接口地址不正确。');}
  if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash)throw Error('接口地址需要使用 HTTPS，且不能包含账号或查询参数。');
  if(!['deepseek','custom'].includes(config.provider))throw Error('服务商不正确。');
  if(config.provider==='deepseek'&&u.origin!=='https://api.deepseek.com')throw Error('DeepSeek 预设仅使用官方接口。');
  return config.provider+'|'+u.href.replace(/\/+$/,'');
}
function validKey(value){if(typeof value!=='string'||!value.trim()||value.length>600||/[\r\n]/.test(value))throw Error('请填写有效的 API Key。');return value.trim();}

// Secrets travel only over stdin/stdout, never in command arguments or shell history.
export function windowsProtect(bytes, decrypt=false, spawnImpl=spawn) {
  const method=decrypt?'Unprotect':'Protect';
  const script=`$ErrorActionPreference='Stop';try{Add-Type -AssemblyName System.Security;$s=[Console]::In.ReadToEnd();$b=[Convert]::FromBase64String($s);$r=[Security.Cryptography.ProtectedData]::${method}($b,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser);[Console]::Out.Write([Convert]::ToBase64String($r))}catch{exit 1}`;
  return new Promise((resolve,reject)=>{
    const executable=join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe');
    const child=spawnImpl(executable,['-NoLogo','-NoProfile','-NonInteractive','-EncodedCommand',Buffer.from(script,'utf16le').toString('base64')],{windowsHide:true,stdio:['pipe','pipe','pipe']});
    let output='',size=0,settled=false;
    const fail=()=>{if(settled)return;settled=true;clearTimeout(timer);reject(Error('Windows 账户加密服务不可用，密钥未保存。请取消勾选后临时使用。'));};
    const timer=setTimeout(()=>{child.kill();fail();},15000);
    child.on('error',fail);child.stdin.on('error',fail);
    child.stdout.on('data',c=>{size+=c.length;if(size>100000){child.kill();fail();}else output+=c;});
    child.stderr.resume();
    child.on('close',code=>{if(settled)return;if(code!==0||!output.trim()||!/^[A-Za-z0-9+/=\s]+$/.test(output))return fail();settled=true;clearTimeout(timer);resolve(Buffer.from(output.trim(),'base64'));});
    child.stdin.end(Buffer.from(bytes).toString('base64'));
  });
}
export function createCredentialVault({platform=process.platform,directory=join(process.env.LOCALAPPDATA||join(homedir(),'AppData','Local'),'CreatorStudio'),codec=windowsProtect}={}) {
  const supported=platform==='win32',file=join(directory,'api-credential.dpapi.json');let queue=Promise.resolve();
  const serial=fn=>{const result=queue.then(fn);queue=result.catch(()=>{});return result;};
  const requireSupport=()=>{if(!supported)throw Error('这个系统暂不支持加密记住密钥，请在本次打开时填写。');};
  async function load(config){
    if(!supported)return {saved:false,apiKey:''};
    const scope=credentialScope(config);let raw;
    try{raw=await readFile(file,'utf8');}catch(e){if(e.code==='ENOENT')return{saved:false,apiKey:''};throw Error('无法读取已保存的密钥，请重新填写。');}
    try{
      if(raw.length>100000)throw Error();
      const envelope=JSON.parse(raw);if(envelope.scheme!=='windows-dpapi-current-user-v1'||typeof envelope.data!=='string')throw Error();
      const value=JSON.parse((await codec(Buffer.from(envelope.data,'base64'),true)).toString('utf8'));
      if(value.scope!==scope)return{saved:false,apiKey:''};
      return {saved:true,apiKey:validKey(value.apiKey)};
    }catch{throw Error('无法解锁已保存的密钥，请用原 Windows 账户打开，或重新输入后保存。');}
  }
  async function save(config){
    requireSupport();const scope=credentialScope(config),apiKey=validKey(config.apiKey);
    const encrypted=await codec(Buffer.from(JSON.stringify({scope,apiKey}),'utf8'));
    await mkdir(directory,{recursive:true,mode:0o700});
    const temp=file+'.'+randomBytes(6).toString('hex')+'.tmp';
    try{await writeFile(temp,JSON.stringify({scheme:'windows-dpapi-current-user-v1',data:encrypted.toString('base64')}),{mode:0o600,flag:'wx'});await rename(temp,file);}
    catch{await unlink(temp).catch(()=>{});throw Error('无法保存加密密钥，原来的密钥未改动。');}
    return{saved:true};
  }
  async function forget(){requireSupport();try{await unlink(file);}catch(e){if(e.code!=='ENOENT')throw Error('无法移除已保存的密钥，请检查文件权限。');}return{saved:false};}
  return {supported,label:supported?'Windows 账户加密':'此系统暂不支持',load:config=>serial(()=>load(config)),save:config=>serial(()=>save(config)),forget:()=>serial(forget)};
}
