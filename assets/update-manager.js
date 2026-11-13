/* SUHAS-MAX update prompt with an explicit Install action. */
(function(){
 'use strict';
 if(!('serviceWorker' in navigator))return;
 var script=document.currentScript;
 var root=new URL('../',script&&script.src?script.src:location.href);
 function read(key){try{return localStorage.getItem(key)||'';}catch(e){return '';}}
 function write(key,value){try{localStorage.setItem(key,value);}catch(e){}}
 function showNotice(release,registration){
  if(document.getElementById('suhas-software-updated'))return;
  var style=document.createElement('style');
  style.textContent='.suhas-software-updated{position:fixed;z-index:100001;left:16px;right:16px;top:calc(14px + env(safe-area-inset-top));max-width:480px;margin:auto;padding:13px 16px;border:1px solid #cfe1ff;border-radius:14px;background:#fff;color:#152b4b;box-shadow:0 12px 36px #10294a2b;font:14px/1.45 Arial,sans-serif;display:flex;gap:12px;align-items:center}.suhas-software-updated strong{display:block;font-size:15px}.suhas-software-updated small{display:block;color:#52627b;margin-top:2px}.suhas-update-actions{margin-left:auto;display:flex;align-items:center;gap:8px}.suhas-update-install{border:0;border-radius:8px;background:#1877f2;color:#fff;font-weight:700;font-size:14px;padding:9px 13px;cursor:pointer}.suhas-update-close{border:0;background:transparent;color:#52627b;font-size:22px;line-height:1;cursor:pointer;padding:4px 7px}';
  document.head.appendChild(style);
  var toast=document.createElement('div');toast.id='suhas-software-updated';toast.className='suhas-software-updated';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');
  var copy=document.createElement('span');
  var title=document.createElement('strong');title.textContent='Software Update Available';
  var detail=document.createElement('small');detail.textContent='Version '+release.version+' is ready to install.';
  copy.append(title,detail);
  var actions=document.createElement('span');actions.className='suhas-update-actions';
  var install=document.createElement('button');install.type='button';install.className='suhas-update-install';install.textContent='Install';
  var close=document.createElement('button');close.type='button';close.className='suhas-update-close';close.setAttribute('aria-label','Dismiss update notification');close.textContent='×';
  close.addEventListener('click',function(){toast.remove();});
  install.addEventListener('click',function(){
   var waiting=registration.waiting;
   if(!waiting){install.disabled=true;install.textContent='Preparing…';registration.update().catch(function(){});return;}
   install.disabled=true;install.textContent='Installing…';
   write('suhas-pending-installed-release',release.version);
   waiting.postMessage({type:'SUHAS_SKIP_WAITING'});
  });
  actions.append(install,close);toast.append(copy,actions);
  (document.body||document.documentElement).appendChild(toast);
  window.clearTimeout(window.__suhasUpdateNoticeTimer);
  window.__suhasUpdateNoticeTimer=window.setTimeout(function(){toast.remove();},30000);
 }
 async function start(){
  try{
   var response=await fetch(new URL('release.json',root).href,{cache:'no-store'});
   if(!response.ok)throw new Error('Release information unavailable');
   var release=await response.json();
   if(!release.version||!release.published_at)throw new Error('Invalid release information');
   var workerUrl=new URL('sw.js?v='+encodeURIComponent(release.version),root).href;
   var registration=await navigator.serviceWorker.register(workerUrl,{scope:root.pathname,updateViaCache:'none'});
   function watchInstalling(worker){
    if(!worker)return;
    worker.addEventListener('statechange',function(){
     if(worker.state==='installed'&&navigator.serviceWorker.controller)showNotice(release,registration);
    });
   }
   registration.addEventListener('updatefound',function(){watchInstalling(registration.installing);});
   watchInstalling(registration.installing);
   await registration.update().catch(function(){});
   var pending=read('suhas-pending-installed-release');
   if(pending&&pending===release.version){
    write('suhas-pending-installed-release','');
    write('suhas-last-seen-release',release.version);
    showCompleted(release);
    return;
   }
   if(registration.waiting){
    showNotice(release,registration);
   }
   navigator.serviceWorker.addEventListener('controllerchange',function(){
    if(read('suhas-pending-installed-release')===release.version)location.reload();
   });
  }catch(error){console.warn('SUHAS update service:',error);}
 }
 function showCompleted(release){
  if(document.getElementById('suhas-software-updated'))return;
  var box=document.createElement('div');box.id='suhas-software-updated';box.className='suhas-software-updated';box.setAttribute('role','status');
  var copy=document.createElement('span');var title=document.createElement('strong');title.textContent='Software Updated';
  var detail=document.createElement('small');detail.textContent='SUHAS is now updated to version '+release.version+'.';
  copy.append(title,detail);box.append(copy);(document.body||document.documentElement).appendChild(box);
  window.setTimeout(function(){box.remove();},9000);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
