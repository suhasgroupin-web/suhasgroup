/* SUHAS-MAX automatic software update notice and service-worker registration. */
(function(){
 'use strict';
 if(!('serviceWorker' in navigator))return;
 var script=document.currentScript;
 var root=new URL('../',script&&script.src?script.src:location.href);
 function read(key){try{return localStorage.getItem(key)||'';}catch(e){return '';}}
 function write(key,value){try{localStorage.setItem(key,value);}catch(e){}}
 function showNotice(release){
  if(document.getElementById('suhas-software-updated'))return;
  var style=document.createElement('style');
  style.textContent='.suhas-software-updated{position:fixed;z-index:100001;left:16px;right:16px;top:calc(14px + env(safe-area-inset-top));max-width:480px;margin:auto;padding:13px 16px;border:1px solid #cfe1ff;border-radius:14px;background:#fff;color:#152b4b;box-shadow:0 12px 36px #10294a2b;font:14px/1.45 Arial,sans-serif;display:flex;gap:12px;align-items:center}.suhas-software-updated strong{display:block;font-size:15px}.suhas-software-updated small{display:block;color:#52627b;margin-top:2px}.suhas-software-updated button{margin-left:auto;border:0;background:transparent;color:#52627b;font-size:22px;line-height:1;cursor:pointer;padding:4px 7px}';
  document.head.appendChild(style);
  var toast=document.createElement('div');toast.id='suhas-software-updated';toast.className='suhas-software-updated';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');
  var copy=document.createElement('span');
  var title=document.createElement('strong');title.textContent='Software Updated';
  var detail=document.createElement('small');detail.textContent=release.update_message||('SUHAS-MAX is now updated to version '+release.version+'.');
  copy.append(title,detail);
  var close=document.createElement('button');close.type='button';close.setAttribute('aria-label','Dismiss update notification');close.textContent='×';close.addEventListener('click',function(){toast.remove();});
  toast.append(copy,close);
  (document.body||document.documentElement).appendChild(toast);
  window.setTimeout(function(){toast.remove();},9000);
 }
 async function start(){
  try{
   var hadController=!!navigator.serviceWorker.controller;
   var response=await fetch(new URL('release.json',root).href,{cache:'no-store'});
   if(!response.ok)throw new Error('Release information unavailable');
   var release=await response.json();
   if(!release.version||!release.published_at)throw new Error('Invalid release information');
   var previous=read('suhas-last-seen-release');
   if(hadController&&previous!==release.version)showNotice(release);
   write('suhas-last-seen-release',release.version);
   var workerUrl=new URL('sw.js?v='+encodeURIComponent(release.version),root).href;
   var registration=await navigator.serviceWorker.register(workerUrl,{scope:root.pathname,updateViaCache:'none'});
   registration.update().catch(function(){});
  }catch(error){console.warn('SUHAS-MAX update service:',error);}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
