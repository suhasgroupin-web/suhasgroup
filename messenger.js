/* SUHAS Messenger layout bridge — isolated to messenger.html iframe presentation.
   The social.html iframe remains the sole owner of Supabase auth, messages and realtime. */
(function(){
 'use strict';
 const frame=document.getElementById('messenger-frame');
 if(!frame)return;
 const styleText=`
 html,body{width:100%!important;max-width:100%!important;min-width:0!important;height:100%!important;margin:0!important;padding:0!important;overflow:hidden!important;background:#fff!important;color:#050505!important;font-family:Arial,Helvetica,sans-serif!important}
 body{padding:0!important}
 .site-header,.social-topnav,.social-left,.social-right,.social-mobile-nav,.suhas-messenger-pagebar{display:none!important}
 .social-shell,.social-center,main{width:100%!important;max-width:100%!important;min-width:0!important;height:100%!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;background:#fff!important}
 #messages{position:relative!important;display:flex!important;flex-direction:column!important;width:100%!important;max-width:100%!important;min-width:0!important;height:100%!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;background:#fff!important;border:0!important;border-radius:0!important;box-shadow:none!important}
 #messages>h2,#messages>.message-start,#messages>.message-subtitle,#messages #message-thread-search{display:none!important}
 #messages .social-grid{display:flex!important;flex:1 1 0!important;flex-direction:column!important;width:100%!important;max-width:100%!important;min-width:0!important;min-height:0!important;height:auto!important;margin:0!important;padding:0 14px!important;gap:0!important;overflow:hidden!important;background:#fff!important}
 #messages .social-grid>div:first-child{display:flex!important;flex:1 1 0!important;flex-direction:column!important;width:100%!important;max-width:100%!important;min-width:0!important;min-height:0!important;height:auto!important;margin:0!important;padding:0!important;overflow:hidden!important}
 #messages .social-grid>div:first-child>h3,#messages .social-grid>div:first-child>input{display:none!important}
 #message-member-list{display:none!important}
 #threads{display:flex!important;flex:1 1 0!important;flex-direction:column!important;gap:0!important;width:100%!important;max-width:100%!important;min-width:0!important;min-height:0!important;height:auto!important;margin:0!important;padding:0!important;overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior:contain!important;background:#fff!important}
 #messages .message-thread{display:flex!important;flex:0 0 auto!important;align-items:center!important;gap:13px!important;width:100%!important;max-width:100%!important;min-width:0!important;min-height:86px!important;margin:0!important;padding:10px 0!important;border:0!important;border-bottom:1px solid #e4e6eb!important;border-radius:0!important;background:#fff!important;color:#050505!important;text-align:left!important}
 #messages .message-thread>img,#messages .message-thread>.message-member-avatar{display:grid!important;place-items:center!important;width:60px!important;height:60px!important;flex:0 0 60px!important;border-radius:50%!important;object-fit:cover!important;background:#e4e6eb!important}
 #messages .message-thread-copy{display:flex!important;flex:1 1 0!important;flex-direction:column!important;gap:4px!important;min-width:0!important}
 #messages .message-thread-name{display:block!important;overflow:hidden!important;color:#050505!important;font-size:16px!important;font-weight:750!important;text-overflow:ellipsis!important;white-space:nowrap!important}
 #messages .message-thread-preview{display:block!important;overflow:hidden!important;color:#65676b!important;font-size:14px!important;text-overflow:ellipsis!important;white-space:nowrap!important}
 #messages .message-thread-unread{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:20px!important;min-height:20px!important;padding:2px 7px!important;border-radius:14px!important;background:#0866ff!important;color:#fff!important;font-size:12px!important;font-weight:700!important}
 #messages .message-status-dot{width:13px!important;height:13px!important;flex:0 0 13px!important;border:2px solid #fff!important;border-radius:50%!important;background:#31a24c!important}
 #messages .message-chat-panel{position:absolute!important;inset:0!important;z-index:10!important;display:none!important;flex-direction:column!important;width:100%!important;height:100%!important;min-width:0!important;min-height:0!important;margin:0!important;padding:10px 12px!important;overflow:hidden!important;border:0!important;border-radius:0!important;background:#fff!important;color:#050505!important}
 #messages.chat-open .message-chat-panel{display:flex!important}
 #messages.chat-open .social-grid>div:first-child{display:none!important}
 #chat-title{flex:0 0 auto!important;padding:10px 4px 14px!important;border-bottom:1px solid #e4e6eb!important;color:#050505!important;font-size:18px!important;font-weight:750!important}
 #messages .msg-list{display:flex!important;flex:1 1 0!important;flex-direction:column!important;min-width:0!important;min-height:0!important;width:100%!important;height:auto!important;max-height:none!important;margin:0!important;padding:12px 0!important;overflow-y:auto!important;overflow-x:hidden!important;border:0!important;border-radius:0!important;background:#fff!important}
 #compose{display:flex!important;flex:0 0 auto!important;gap:8px!important;width:100%!important;min-width:0!important;margin:8px 0 0!important;padding:0!important;background:#fff!important}
 #compose input{display:block!important;flex:1 1 0!important;width:0!important;min-width:0!important;height:48px!important;padding:0 17px!important;border:0!important;border-radius:26px!important;background:#f0f2f5!important;color:#050505!important;font-size:16px!important}
 #compose button{flex:0 0 auto!important;min-width:58px!important;border:0!important;border-radius:25px!important;background:#0866ff!important;color:#fff!important}
 #messages .bubble{max-width:82%!important;padding:10px 14px!important;border-radius:19px!important;background:#f0f2f5!important;color:#050505!important}
 #messages .bubble.mine{background:#0866ff!important;color:#fff!important}
 #messages .empty{padding:24px 12px!important;color:#65676b!important;text-align:center!important}
 /* One visible filter row: the shell owns All / Unread / Groups. */
 #messages .suhas-inbox-filters{display:none!important}
 #messages .message-subtitle{display:none!important}
 #messages .social-grid{display:flex!important;flex:1 1 auto!important;min-height:0!important;height:100%!important;overflow:hidden!important}
 #messages .social-grid>div:first-child{display:flex!important;flex:1 1 auto!important;min-height:0!important;height:100%!important;overflow:hidden!important}
 #messages #threads{display:flex!important;flex:1 1 auto!important;min-height:0!important;height:100%!important;overflow-y:auto!important;overflow-x:hidden!important}
 #messages #threads>.empty{display:block!important;flex:0 0 auto!important;padding:26px 12px!important;color:#65676b!important;text-align:center!important}
 #messages .message-chat-panel{display:none!important}
 #messages.chat-open .message-chat-panel{display:flex!important}
 @media(max-width:600px){#messages .social-grid{padding:0 14px!important}#messages .message-thread{min-height:82px!important}#messages .message-thread>img,#messages .message-thread>.message-member-avatar{width:58px!important;height:58px!important;flex-basis:58px!important}}
 `;
 function apply(){
  try{
   const d=frame.contentDocument;
   if(!d||!d.head||!d.getElementById('messages'))return;
   let s=d.getElementById('suhas-messenger-layout-v4');
   if(!s){s=d.createElement('style');s.id='suhas-messenger-layout-v4';d.head.appendChild(s)}
   s.textContent=styleText;
  }catch(e){console.warn('SUHAS Messenger frame styling unavailable',e)}
 }
 frame.addEventListener('load',()=>{apply();setTimeout(apply,250);setTimeout(apply,900)});
 if(frame.contentDocument?.readyState==='complete')apply();
 const observeFrame=()=>{try{const d=frame.contentDocument;if(!d||!d.documentElement)return;apply();if(d.documentElement.dataset.suhasMessengerObserved==='1')return;d.documentElement.dataset.suhasMessengerObserved='1';const mo=new MutationObserver(()=>{if(d.getElementById('messages')&&!d.getElementById('messages').hidden)apply();});mo.observe(d.documentElement,{subtree:true,attributes:true,attributeFilter:['hidden','class']});}catch(e){}};
 frame.addEventListener('load',()=>setTimeout(observeFrame,80));
 window.addEventListener('pageshow',()=>{apply();observeFrame();});

 const search=document.getElementById('messenger-search');
 search?.addEventListener('input',()=>{
  try{const d=frame.contentDocument;const q=d?.getElementById('message-thread-search');if(q){q.value=search.value;q.dispatchEvent(new Event('input',{bubbles:true}))}}catch(e){}
 });
 document.querySelectorAll('.shortcut').forEach(btn=>btn.addEventListener('click',()=>{
  const d=frame.contentDocument;if(!d)return;
  const rows=[...d.querySelectorAll('#threads .message-thread')];
  if(btn.dataset.filter==='groups'){
   rows.forEach(r=>r.hidden=true);
   let note=d.getElementById('suhas-groups-unavailable');
   if(!note){note=d.createElement('div');note.id='suhas-groups-unavailable';note.className='empty';note.textContent='Group conversations are not available yet.';d.getElementById('threads')?.append(note)}
   note.hidden=false;
  }else{
   d.getElementById('suhas-groups-unavailable')?.remove();
   rows.forEach(r=>{r.hidden=btn.dataset.filter==='unread'&&!r.querySelector('.message-thread-unread')});
  }
 }));
 document.getElementById('messenger-compose')?.addEventListener('click',()=>{
  try{const d=frame.contentDocument;const field=d?.getElementById('message-member-search');const box=d?.querySelector('#messages .message-start');if(box)box.style.setProperty('display','block','important');field?.focus()}catch(e){}
 });
})();
