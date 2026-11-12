/* SUHAS-MAX staged app updates: notify 15 days after each published release. */
(function(){
 'use strict';
 if(!('serviceWorker' in navigator))return;
 var script=document.currentScript;
 var root=new URL('../',script&&script.src?script.src:location.href);
 var DAY=86400000,release=null,registration=null,session=null,card=null,applying=false;
 function getInstalled(){try{return localStorage.getItem('suhas-installed-release')||'';}catch(e){return '';}}
 function setInstalled(v){try{localStorage.setItem('suhas-installed-release',v);}catch(e){}}
 function buildCard(){
  if(card||!document.body)return;
  var style=document.createElement('style');
  style.textContent='.suhas-update-card{position:fixed;z-index:100000;left:16px;right:16px;bottom:calc(18px + env(safe-area-inset-bottom));max-width:560px;margin:auto;padding:17px 18px;border:1px solid #d8e3f3;border-radius:18px;background:linear-gradient(145deg,#fff,#f4f8ff);color:#14233d;box-shadow:0 18px 55px #061a3b35;font:14px/1.5 Arial,sans-serif}.suhas-update-card strong{display:block;font-size:16px;margin-bottom:4px}.suhas-update-card p{margin:0 0 13px;color:#52627b}.suhas-update-actions{display:flex;gap:9px;align-items:center;justify-content:flex-end}.suhas-update-actions button{border:0;border-radius:10px;padding:10px 15px;font-weight:800;cursor:pointer}.suhas-update-install{background:#17439a;color:#fff}.suhas-update-later{background:#e9eef6;color:#34445e}.suhas-update-card[hidden]{display:none}';
  document.head.appendChild(style);
  card=document.createElement('section');card.className='suhas-update-card';card.setAttribute('role','status');card.setAttribute('aria-live','polite');
  card.innerHTML='<strong>Software updated</strong><p id="suhas-update-copy">A new SUHAS-MAX version is ready. Install it to use the latest features and improvements.</p><div class="suhas-update-actions"><button type="button" class="suhas-update-later">Later</button><button type="button" class="suhas-update-install">Install</button></div>';
  document.body.appendChild(card);
  card.querySelector('.suhas-update-later').addEventListener('click',function(){card.hidden=true;});
  card.querySelector('.suhas-update-install').addEventListener('click',function(){
   if(!registration||!registration.waiting)return;
   applying=true;var button=card.querySelector('.suhas-update-install');button.disabled=true;button.textContent='Installing…';
   registration.waiting.postMessage({type:'SUHAS_SKIP_WAITING'});
  });
 }
 function maybeNotify(){
  if(!release||!registration||!registration.waiting)return;
  if(getInstalled()===release.version)return;
  var published=Date.parse(release.published_at||'');
  var delayDays=Number(release.notify_after_days);if(!Number.isFinite(delayDays)||delayDays<0)delayDays=15;
  if(!Number.isFinite(published)||Date.now()-published<delayDays*DAY)return;
  buildCard();if(card){card.hidden=false;var copy=card.querySelector('#suhas-update-copy');if(copy)copy.textContent=release.update_message||('Version '+release.version+' is ready. Install the update to get the latest SUHAS-MAX features and improvements.');}
 }
 async function start(){
  try{
   var response=await fetch(new URL('release.json',root).href,{cache:'no-store'});
   if(!response.ok)throw new Error('Release information unavailable');
   release=await response.json();
   if(!release.version||!release.published_at)throw new Error('Invalid release information');
   var workerUrl=new URL('sw.js?v='+encodeURIComponent(release.version),root).href;
   registration=await navigator.serviceWorker.register(workerUrl,{scope:root.pathname,updateViaCache:'none'});
   await registration.update().catch(function(){});
   if(registration.waiting)maybeNotify();
   registration.addEventListener('updatefound',function(){
    var worker=registration.installing;if(!worker)return;
    worker.addEventListener('statechange',function(){if(worker.state==='installed'&&navigator.serviceWorker.controller)maybeNotify();});
   });
   navigator.serviceWorker.addEventListener('controllerchange',function(){
    if(applying){setInstalled(release.version);location.reload();}
   });
   window.addEventListener('focus',function(){registration.update().catch(function(){});maybeNotify();});
   document.addEventListener('visibilitychange',function(){if(!document.hidden){registration.update().catch(function(){});maybeNotify();}});
   if(registration.waiting)maybeNotify();
  }catch(error){console.warn('SUHAS-MAX update service:',error);}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
