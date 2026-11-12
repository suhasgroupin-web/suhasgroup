/* SUHAS MESSENGER isolated presentation bridge.
   Existing iframe retains the only Supabase session/client and realtime chat logic. */
(function(){
 'use strict';
 const frame=document.getElementById('messenger-frame');
 const groups=document.querySelector('.shortcut[data-filter="groups"]');
 const theme=`
 html,body{background:#000!important;color:#f0f2f5!important}
 body{margin:0!important}
 .site-header,.social-left,.social-right,.social-mobile-nav,.book-heading{display:none!important}
 .social-shell{display:block!important;width:100%!important;max-width:none!important;margin:0!important;padding:0 12px 8px!important;background:#000!important}
 .social-center{width:100%!important;max-width:none!important}
 #messages{display:block!important;min-height:100%!important;padding:0 12px 12px!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:#000!important;color:#f0f2f5!important}
 #messages>h2{display:none!important}
 #messages h2,#messages h3,#messages .message-subtitle{color:#f0f2f5!important}
 #messages .message-start{padding:0!important;margin:0!important;border:0!important;background:#000!important}
 #messages .message-start h3{display:none!important}
 #messages .search{background:#242526!important;color:#f0f2f5!important;border:0!important;border-radius:24px!important;padding:12px 16px!important}
 #messages .social-grid{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:0!important}
 #messages .message-subtitle{display:none!important}
 #message-thread-search{display:none!important}
 #threads{display:flex!important;flex-direction:column!important;gap:0!important;max-height:none!important;height:auto!important;overflow:visible!important}
 #messages .message-thread{display:flex!important;align-items:center!important;gap:12px!important;width:100%!important;min-height:78px!important;padding:10px 2px!important;border:0!important;border-bottom:1px solid #242526!important;border-radius:0!important;background:#000!important;color:#f0f2f5!important;text-align:left!important}
 #messages .message-thread img,#messages .message-thread .message-member-avatar{width:58px!important;height:58px!important;flex:0 0 58px!important;border-radius:50%!important;object-fit:cover!important}
 #messages .message-thread-name{color:#f5f5f5!important;font-size:16px!important;font-weight:750!important}
 #messages .message-thread-preview{color:#b0b3b8!important;font-size:13px!important}
 #messages .message-thread-unread{background:#0866ff!important;color:#fff!important;border-radius:50px!important;padding:3px 7px!important}
 #messages .message-chat-panel{display:none;flex-direction:column!important;min-height:0!important;height:100%!important;border:0!important;border-radius:0!important;background:#000!important;padding:8px 0!important}
 #chat-title{color:#f0f2f5!important;font-size:18px!important;font-weight:750!important;padding:8px 0 12px!important;border-bottom:1px solid #303030!important}
 .msg-list{height:calc(100dvh - 300px)!important;min-height:180px!important;overflow:auto!important;border:0!important;border-radius:0!important;padding:12px 0!important;background:#000!important}
 .bubble{background:#303136!important;color:#fff!important;border-radius:20px!important;padding:11px 15px!important;font-size:15px!important}
 .bubble.mine{background:#0866ff!important;color:#fff!important}
 .message-seen-status{color:#dce8ff!important}
 #compose{display:flex!important;gap:9px!important;margin-top:8px!important;background:#000!important}
 #compose input{background:#303136!important;color:#fff!important;border:0!important;border-radius:28px!important;padding:14px 18px!important;font-size:16px!important}
 #compose button{background:#0866ff!important;color:#fff!important;border:0!important;border-radius:22px!important;padding:12px 19px!important;font-size:15px!important}
 #messages .empty{color:#b0b3b8!important}
 #messages .message-member{background:#171717!important;color:#fff!important;border-color:#303030!important}
 #messages .message-member small{color:#b0b3b8!important}
 @media(max-width:600px){.social-shell{padding:0 8px 8px!important}#messages{padding:0 8px 8px!important}.msg-list{height:calc(100dvh - 280px)!important;min-height:160px!important}}
 `;
 function apply(){
  try{const d=frame.contentDocument;if(!d?.head||!d.querySelector('#messages'))return;
   let s=d.getElementById('suhas-messenger-dark-inbox');if(!s){s=d.createElement('style');s.id='suhas-messenger-dark-inbox';d.head.appendChild(s)}s.textContent=theme;
   const title=d.getElementById('chat-title'),panel=d.querySelector('#messages .message-chat-panel');
   const sync=()=>{if(title&&panel){const open=!!title.textContent.trim()&&!/choose a conversation/i.test(title.textContent);panel.style.setProperty('display',open?'flex':'none','important')}};
   if(title&&!title.dataset.suhasDarkObserver){new MutationObserver(sync).observe(title,{childList:true,subtree:true,characterData:true});title.dataset.suhasLightObserver='1'}sync();
  }catch(e){console.warn('Messenger isolated theme not applied',e)}
 }
 frame?.addEventListener('load',()=>{apply();setTimeout(apply,400);setTimeout(apply,1200)});
 // Also handle an iframe that finished loading before this deferred script attached its listener.
 if(frame?.contentDocument?.readyState==='complete')apply();
 // Group conversations are not enabled in the current data model. Keep the existing chat DOM intact.
 const all=document.querySelector('.shortcut[data-filter="all"]');
 let groupNotice=null;
 groups?.addEventListener('click',e=>{
  e.preventDefault();e.stopImmediatePropagation();
  document.querySelectorAll('.shortcut').forEach(b=>b.classList.toggle('active',b===groups));
  const d=frame.contentDocument,host=d?.getElementById('threads');
  if(!host)return;
  host.hidden=true;
  host.style.setProperty('display','none','important');
  if(!groupNotice){
   groupNotice=d.createElement('div');
   groupNotice.className='empty';
   groupNotice.textContent='Group conversations are not enabled yet. Individual Messenger chats remain available.';
   groupNotice.style.cssText='padding:22px 14px;text-align:center;color:#65676b;font-size:14px;line-height:1.5';
   host.parentNode.insertBefore(groupNotice,host);
  }
  groupNotice.hidden=false;
 },true);
 all?.addEventListener('click',()=>{
  const host=frame.contentDocument?.getElementById('threads');
  if(host){host.hidden=false;host.style.removeProperty('display');}
  if(groupNotice)groupNotice.hidden=true;
 });

 // Keep browser pull-to-refresh available on this dedicated page and check for fresh app releases.
 // A waiting worker is activated automatically; the current URL is reloaded after activation.
 (function enableMessengerRefreshAndAutoUpdate(){
  if(!('serviceWorker' in navigator))return;
  var root=new URL('./',location.href);
  var registration=null, applying=false, reloading=false;
  function activateWaiting(){
   if(!registration||!registration.waiting||applying)return;
   applying=true;
   registration.waiting.postMessage({type:'SUHAS_SKIP_WAITING'});
  }
  navigator.serviceWorker.addEventListener('controllerchange',function(){
   if(!applying||reloading)return;
   reloading=true;
   // Preserve the exact Messenger route and query parameters across the update reload.
   location.reload();
  });
  async function check(){
   try{
    var releaseResponse=await fetch(new URL('release.json',root).href,{cache:'no-store'});
    if(!releaseResponse.ok)return;
    var release=await releaseResponse.json();
    if(!release||!release.version)return;
    registration=await navigator.serviceWorker.register(new URL('sw.js?v='+encodeURIComponent(release.version),root).href,{scope:root.pathname,updateViaCache:'none'});
    await registration.update();
    activateWaiting();
    registration.addEventListener('updatefound',function(){
     var worker=registration.installing;
     if(!worker)return;
     worker.addEventListener('statechange',function(){
      if(worker.state==='installed'&&navigator.serviceWorker.controller)activateWaiting();
     });
    });
    if(registration.waiting)activateWaiting();
   }catch(error){console.warn('SUHAS Messenger update check:',error);}
  }
  check();
  window.addEventListener('focus',check);
  document.addEventListener('visibilitychange',function(){if(!document.hidden)check();});
 })();

})();