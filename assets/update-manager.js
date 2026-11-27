/* SUHAS GROUP automatic software update notice with an explicit Install Now action. */
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
  style.textContent='.suhas-software-updated{position:fixed;z-index:2147482500;left:12px;right:12px;top:calc(12px + env(safe-area-inset-top));max-width:430px;margin:auto;padding:10px 12px;border:1px solid #c8d7ee;border-radius:13px;background:linear-gradient(180deg,#fff 0%,#edf3fc 100%);color:#152b4b;box-shadow:0 2px 0 #c8d7ee,0 10px 28px rgba(10,34,73,.2),0 2px 4px #fff inset;font:13px/1.35 Arial,sans-serif;display:flex;gap:9px;align-items:center}.suhas-software-updated strong{display:block;font-size:14px}.suhas-software-updated small{display:block;color:#52627b;margin-top:2px}.suhas-update-actions{margin-left:auto;display:flex;align-items:center;gap:6px}.suhas-update-install{border:1px solid #0b4eae;border-radius:8px;background:linear-gradient(180deg,#398bff 0%,#1265d8 55%,#0849a9 100%);color:#fff;font-weight:800;font-size:12px;padding:8px 11px;white-space:nowrap;box-shadow:0 3px 0 #073b89,0 5px 10px rgba(13,73,150,.2),0 1px 0 rgba(255,255,255,.45) inset;cursor:pointer}.suhas-update-install:hover{filter:brightness(1.06);transform:translateY(-1px)}.suhas-update-install:active{transform:translateY(2px);box-shadow:0 1px 0 #073b89}.suhas-update-install:disabled{opacity:.7;cursor:wait}.suhas-update-close{border:0;background:transparent;color:#52627b;font-size:20px;line-height:1;cursor:pointer;padding:3px 5px}';
  document.head.appendChild(style);
  var toast=document.createElement('div');toast.id='suhas-software-updated';toast.className='suhas-software-updated';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');
  var copy=document.createElement('span');
  var title=document.createElement('strong');title.textContent='Software Updated';
  var detail=document.createElement('small');detail.textContent='A new version is ready. Install now to update SUHAS GROUP.';
  copy.append(title,detail);
  var actions=document.createElement('span');actions.className='suhas-update-actions';
  var install=document.createElement('button');install.type='button';install.className='suhas-update-install';install.textContent='Install Now';
  var close=document.createElement('button');close.type='button';close.className='suhas-update-close';close.setAttribute('aria-label','Dismiss update notification');close.textContent='×';
  close.addEventListener('click',function(){toast.remove();});
  install.addEventListener('click',function(){
   var waiting=registration.waiting;
   install.disabled=true;install.textContent='Installing…';
   write('suhas-pending-installed-release',release.version);
   if(waiting){waiting.postMessage({type:'SUHAS_SKIP_WAITING'});return;}
   var active=registration.active;
   if(active&&active.state==='activated'){
    location.reload();
    return;
   }
   navigator.serviceWorker.addEventListener('controllerchange',function(){location.reload();},{once:true});
   registration.update().catch(function(){});
  });
  actions.append(install,close);toast.append(copy,actions);
  (document.body||document.documentElement).appendChild(toast);
  // Keep the update notice visible until the member installs or dismisses it.
 }
 async function start(){
  var hadControllerAtStart=!!navigator.serviceWorker.controller;
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
   var previous=read('suhas-last-seen-release');
   var activeVersion='';
   try{activeVersion=new URL(registration.active&&registration.active.scriptURL||'').searchParams.get('v')||'';}catch(e){}
   if(registration.waiting){
    showNotice(release,registration);
   }else if(activeVersion===release.version&&((previous&&previous!==release.version)||(!previous&&hadControllerAtStart))){
    write('suhas-last-seen-release',release.version);
    showCompleted(release);
   }else if(activeVersion===release.version){
    write('suhas-last-seen-release',release.version);
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
