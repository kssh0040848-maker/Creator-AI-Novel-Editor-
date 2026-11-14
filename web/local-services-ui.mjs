/* 创作家 / Creator Studio | 项目发布者：创作家项目发布者 / Creator Studio project publisher | License: LICENSE.txt | Third-party: THIRD_PARTY_NOTICES.txt */
import { localServiceInfo, localOperation } from './api.mjs';

export function mountLocalServices(h) {
  const el=id=>document.getElementById(id);
  const scope=c=>{try{return c.provider+'|'+new URL(c.baseUrl).href.replace(/\/+$/,'');}catch{return '';}};
  let info=null,savedScope='',rememberTouched=false;
  function controls(){
    const supported=Boolean(info?.credentials?.supported);
    el('rememberKey').dataset.supported=String(supported);el('forgetKey').dataset.saved=String(Boolean(savedScope));
    el('rememberKey').disabled=!supported;
    el('forgetKey').disabled=!supported||!savedScope;
    el('credentialHelp').textContent=supported?'勾选后用当前 Windows 账户加密保存，下次自动读取。只保存最近一次启用的密钥，不放进故事备份。':'此环境暂不支持加密记住密钥；关闭页面后需重新输入。Windows 本地版可使用此功能。';
    el('exitService').hidden=!info?.canShutdown;
  }
  const ready=(async()=>{
    if(!/^https?:$/.test(location.protocol)){controls();return;}
    try{
      info=await localServiceInfo();controls();
      if(!info.credentials?.supported)return;
      const config={...h.config()},result=await localOperation('/api/credentials',{action:'load',provider:config.provider,baseUrl:config.baseUrl});
      if(result.saved&&scope(config)===scope(h.config())&&!h.key()){
        savedScope=scope(config);h.setKey(result.apiKey);controls();
      }
    }catch(e){el('credentialHelp').textContent=e.message;}
  })();
  function opened(){
    rememberTouched=false;el('rememberKey').checked=Boolean(savedScope&&savedScope===scope(h.form()));controls();
    ready.then(()=>{
      if(!el('settingsDialog').open)return;
      if(savedScope===scope(h.form())&&!el('apiKey').value)el('apiKey').value=h.key();
      if(!rememberTouched)el('rememberKey').checked=Boolean(savedScope&&savedScope===scope(h.form()));
    });
  }
  el('rememberKey').onchange=()=>{rememberTouched=true;};
  function endpointChanged(){el('apiKey').value='';el('rememberKey').checked=false;rememberTouched=true;}
  async function remember(config){
    await ready;
    if(el('rememberKey').checked){
      await localOperation('/api/credentials',{action:'save',provider:config.provider,baseUrl:config.baseUrl,apiKey:config.apiKey});
      savedScope=scope(config);
    }else if(savedScope){await localOperation('/api/credentials',{action:'forget'});savedScope='';}
    controls();
  }
  el('forgetKey').onclick=async()=>{
    el('forgetKey').disabled=true;
    try{await localOperation('/api/credentials',{action:'forget'});savedScope='';h.setKey('');el('apiKey').value='';el('rememberKey').checked=false;el('connectionStatus').textContent='已忘记保存的密钥，需要使用时重新输入。';}
    catch(e){el('connectionStatus').textContent=e.message;}
    finally{controls();}
  };
  el('exitService').onclick=()=>{if(h.busy())return;el('exitLocalStatus').textContent='';el('exitLocalDialog').showModal();};
  el('confirmExitLocal').onclick=async()=>{
    if(h.busy()){el('exitLocalStatus').textContent='请先停止生成，再退出。';return;}
    el('confirmExitLocal').disabled=true;
    try{
      h.commit();if(!await h.save())throw Error('故事未能保存，请先备份再退出。');
      await localOperation('/api/shutdown',{});h.setKey('');
      el('exitLocalTitle').textContent='本地服务已退出';el('exitLocalDescription').textContent='故事已保存，可以关闭网页。下次双击启动器就能继续使用。';
      el('confirmExitLocal').hidden=true;el('exitLocalCancel').textContent='关闭提示';el('exitService').hidden=true;
      h.message('本地服务已退出。下次请双击启动器打开。');
    }catch(e){el('exitLocalStatus').textContent=e.message;}
    finally{el('confirmExitLocal').disabled=false;}
  };
  controls();return {ready,opened,endpointChanged,remember};
}
