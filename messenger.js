/* SUHAS MESSENGER isolated presentation bridge.
   Existing iframe retains the only Supabase session/client and realtime chat logic. */
(function(){
 'use strict';
 const frame=document.getElementById('messenger-frame');
 const groups=document.querySelector('.shortcut[data-filter="groups"]');
 const theme=`
 /* Single-width, single-scroll-surface chat layout. */
 html,body{width:100%!important;min-width:0!important;max-width:100%!important;height:100%!important;margin:0!important;padding:0!important;overflow-x:hidden!important}
 body{overflow-y:auto!important}
 #messages{display:block!important;position:relative!important;inset:auto!important;width:100%!important;min-width:0!important;max-width:100%!important;height:100%!important;min-height:100%!important;margin:0!important;padding:0!important;overflow-x:hidden!important;box-sizing:border-box!important}
 #messages .social-grid,#messages .social-grid>div,#threads{display:block!important;width:100%!important;min-width:0!important;max-width:100%!important;margin:0!important;padding-left:0!important;padding-right:0!important;box-sizing:border-box!important}
 #messages .message-chat-panel{position:absolute!important;inset:0!important;width:100%!important;max-width:100%!important;min-width:0!important;height:100%!important;min-height:0!important;margin:0!important;padding:10px 12px!important;box-sizing:border-box!important;overflow:hidden!important}
 #messages .msg-list{width:100%!important;max-width:100%!important;min-width:0!important;min-height:0!important;height:auto!important;flex:1 1 auto!important;box-sizing:border-box!important;overflow-y:auto!important;overflow-x:hidden!important}
 #compose{display:flex!important;width:100%!important;max-width:100%!important;min-width:0!important;flex:0 0 auto!important;box-sizing:border-box!important}
 #compose input{display:block!important;width:0!important;min-width:0!important;max-width:100%!important;flex:1 1 0%!important;box-sizing:border-box!important}
 #compose button{display:block!important;flex:0 0 auto!important;max-width:28%!important;white-space:nowrap!important;box-sizing:border-box!important}

 *,*::before,*::after{box-sizing:border-box!important}
 html,body{width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:hidden!important;background:#fff!important;color:#050505!important;margin:0!important}
 body{font-family:Arial,Helvetica,sans-serif!important;overflow-x:hidden!important}\n html,body,#messages{width:100%!important;max-width:100%!important;min-width:0!important;overflow-x:hidden!important}\n #messages{inset:0!important;right:0!important;left:0!important;touch-action:pan-y!important}\n #messages .suhas-messenger-pagebar,#messages>h2,#messages .message-subtitle,#message-thread-search{display:none!important}\n #messages .social-grid,#messages .social-grid>div:first-child,#threads{width:100%!important;max-width:100%!important;min-width:0!important}
 .site-header,.social-left,.social-right,.social-mobile-nav,.book-heading,.suhas-messenger-pagebar,.social-topbar,.social-header{display:none!important}
 .social-shell,.social-center,main,.panel,#messages{width:100%!important;max-width:100%!important;min-width:0!important;margin:0!important;padding:0!important;overflow-x:hidden!important;background:#fff!important;color:#050505!important;border:0!important;border-radius:0!important;box-shadow:none!important}
 #messages>h2,#messages .message-start h3,#messages .message-subtitle,#message-thread-search{display:none!important}
 #messages .message-start{display:block!important;padding:8px 14px!important;margin:0!important;background:#fff!important}
 #message-member-search{width:100%!important;height:42px!important;border:0!important;border-radius:22px!important;background:#f0f2f5!important;color:#050505!important;padding:0 16px!important;font-size:15px!important}
 #message-member-list{display:none!important}
 #messages .social-grid{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;margin:0!important;padding:0 12px 12px!important;background:#fff!important}
 #messages .social-grid>div:first-child{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important}
 #threads{display:flex!important;flex-direction:column!important;gap:0!important;width:100%!important;max-width:100%!important;min-width:0!important;max-height:none!important;height:auto!important;overflow:visible!important;background:#fff!important}
 #messages .message-thread{display:flex!important;align-items:center!important;gap:12px!important;width:100%!important;max-width:100%!important;min-width:0!important;min-height:78px!important;padding:10px 2px!important;border:0!important;border-bottom:1px solid #e4e6eb!important;border-radius:0!important;background:#fff!important;color:#050505!important;text-align:left!important}
 #messages .message-thread img,#messages .message-thread .message-member-avatar{width:58px!important;height:58px!important;flex:0 0 58px!important;border-radius:50%!important;object-fit:cover!important}
 #messages .message-thread-name{min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;color:#050505!important;font-size:16px!important;font-weight:750!important}
 #messages .message-thread-preview{color:#65676b!important;font-size:14px!important}
 #messages .message-thread-unread{background:#0866ff!important;color:#fff!important;border-radius:50px!important;padding:3px 7px!important}
 #messages .message-chat-panel{display:none;flex-direction:column!important;width:100%!important;max-width:100%!important;min-width:0!important;height:100%!important;min-height:0!important;padding:8px 12px!important;border:0!important;border-radius:0!important;background:#fff!important}
 #chat-title{color:#050505!important;font-size:18px!important;font-weight:750!important;padding:8px 0 12px!important;border-bottom:1px solid #e4e6eb!important}
 .msg-list{height:calc(100dvh - 220px)!important;min-height:160px!important;overflow:auto!important;border:0!important;border-radius:0!important;padding:12px 0!important;background:#fff!important}
 .bubble{background:#f0f2f5!important;color:#050505!important;border-radius:20px!important;padding:11px 15px!important;font-size:15px!important}
 .bubble.mine{background:#0866ff!important;color:#fff!important}
 #compose{display:flex!important;gap:9px!important;margin-top:8px!important;background:#fff!important}
 #compose input{min-width:0!important;flex:1!important;background:#f0f2f5!important;color:#050505!important;border:0!important;border-radius:28px!important;padding:14px 18px!important;font-size:16px!important}
 #compose button{background:#0866ff!important;color:#fff!important;border:0!important;border-radius:22px!important;padding:12px 19px!important}
 #messages .empty{padding:22px 10px!important;color:#65676b!important;text-align:center!important}
 #messages .message-member{background:#fff!important;color:#050505!important;border-color:#e4e6eb!important}
 #messages .message-member small{color:#65676b!important}
 @media(max-width:600px){.social-shell{padding:0!important}#messages .social-grid{padding:0 12px 12px!important}.msg-list{height:calc(100dvh - 200px)!important;min-height:140px!important}}
 `;

 function apply(){
  try{const d=frame.contentDocument;if(!d?.head||!d.querySelector('#messages'))return;
   let s=d.getElementById('suhas-messenger-dark-inbox');if(!s){s=d.createElement('style');s.id='suhas-messenger-dark-inbox';d.head.appendChild(s)}s.textContent=theme;
   const title=d.getElementById('chat-title'),panel=d.querySelector('#messages .message-chat-panel');
   const sync=()=>{if(title&&panel){const open=!!title.textContent.trim()&&!/choose a conversation/i.test(title.textContent);panel.style.setProperty('display',open?'flex':'none','important')}};
   // Pull down at the top of the inbox to refresh the outer Messenger URL.
   const inbox=d.getElementById('messages');
   if(inbox&&!inbox.dataset.suhasPullRefresh){
    inbox.dataset.suhasPullRefresh='1';
    let startY=0,armed=false,lastRefresh=0;
    inbox.addEventListener('touchstart',ev=>{
     if(!ev.touches||ev.touches.length!==1)return;
     const target=ev.target;
     if(target.closest('input,textarea,form,.msg-list,button,a,select')){armed=false;return;}
     startY=ev.touches[0].clientY;
     armed=inbox.scrollTop<=2;
    },{passive:true});
    inbox.addEventListener('touchend',ev=>{
     if(!armed||!ev.changedTouches||!ev.changedTouches.length)return;
     const distance=ev.changedTouches[0].clientY-startY;
     armed=false;
     if(distance>105&&inbox.scrollTop<=2&&Date.now()-lastRefresh>4000){
      lastRefresh=Date.now();
      const hint=d.createElement('div');
      hint.textContent='Refreshing Messenger…';
      hint.style.cssText='position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:99999;background:#0866ff;color:#fff;padding:10px 16px;border-radius:22px;font:600 14px Arial;box-shadow:0 2px 12px #0002';
      d.body.appendChild(hint);
      setTimeout(()=>window.parent.location.reload(),180);
     }
    },{passive:true});
   }
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