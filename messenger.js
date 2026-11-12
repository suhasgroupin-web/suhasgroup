/* SUHAS MESSENGER isolated presentation bridge.
   Existing iframe retains the only Supabase session/client and realtime chat logic. */
(function(){
 'use strict';
 const frame=document.getElementById('messenger-frame');
 const groups=document.querySelector('.shortcut[data-filter="groups"]');
 const theme=`
 html,body{background:#fff!important;color:#1c1e21!important}
 .site-header,.social-left,.social-right,.social-mobile-nav,.book-heading{display:none!important}
 .social-shell{display:block!important;width:100%!important;max-width:none!important;margin:0!important;padding:0 12px 12px!important;background:#fff!important}
 .social-center{width:100%!important;max-width:none!important}
 #messages{display:block!important;min-height:100%;padding:5px 12px 12px!important;margin:0!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:#fff!important;color:#1c1e21!important}
 #messages>h2{display:none!important}
 #messages h2,#messages h3,#messages .message-subtitle{color:#1c1e21!important}
 #messages .message-start{padding:0 0 8px!important;border:0!important;background:#fff!important}
 #messages .message-start h3{font-size:14px!important;margin:3px 0 7px!important;color:#65676b!important}
 #messages .search{background:#f0f2f5!important;color:#1c1e21!important;border:0!important;border-radius:24px!important;padding:12px 16px!important}
 #messages .social-grid{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:8px!important}
 #messages .message-subtitle{margin:9px 0 5px!important;font-size:18px!important}
 #message-thread-search{display:none!important}
 #threads{display:flex!important;flex-direction:column!important;gap:0!important;max-height:34vh!important;overflow:auto!important}
 #messages .message-thread{display:flex!important;align-items:center!important;gap:12px!important;width:100%!important;min-height:78px!important;padding:10px 2px!important;border:0!important;border-bottom:1px solid #e4e6eb!important;border-radius:0!important;background:#fff!important;color:#1c1e21!important;text-align:left!important}
 #messages .message-thread img,#messages .message-thread .message-member-avatar{width:58px!important;height:58px!important;flex:0 0 58px!important;border-radius:50%!important;object-fit:cover!important}
 #messages .message-thread-name{color:#050505!important;font-size:16px!important;font-weight:750!important}
 #messages .message-thread-preview{color:#65676b!important;font-size:13px!important}
 #messages .message-thread-unread{background:#0866ff!important;color:#fff!important;border-radius:50px!important;padding:3px 7px!important}
 #messages .message-chat-panel{display:none!important;flex-direction:column!important;min-height:48vh!important;border:1px solid #e4e6eb!important;border-radius:16px!important;background:#fff!important;padding:12px!important}
 #chat-title{color:#1c1e21!important;font-size:18px!important;font-weight:750!important;padding:2px 0 12px!important;border-bottom:1px solid #e4e6eb!important}
 .msg-list{height:38vh!important;min-height:250px!important;overflow:auto!important;border:0!important;border-radius:0!important;padding:12px 0!important;background:#fff!important}
 .bubble{background:#e4e6eb!important;color:#050505!important;border-radius:20px!important;padding:11px 15px!important;font-size:15px!important}
 .bubble.mine{background:#0866ff!important;color:#fff!important}
 .message-seen-status{color:#65676b!important}
 #compose{display:flex!important;gap:9px!important;margin-top:8px!important;background:#fff!important}
 #compose input{background:#f0f2f5!important;color:#050505!important;border:0!important;border-radius:28px!important;padding:15px 18px!important;font-size:16px!important}
 #compose button{background:#0866ff!important;color:#fff!important;border:0!important;border-radius:22px!important;padding:12px 19px!important;font-size:15px!important}
 #messages .empty{color:#65676b!important}
 #messages .message-member{background:#fff!important;color:#1c1e21!important;border-color:#e4e6eb!important}
 #messages .message-member small{color:#65676b!important}
 @media(max-width:600px){.social-shell{padding:0 8px 10px!important}#messages{padding:8px 8px 12px!important}#threads{max-height:30vh!important}.msg-list{height:34vh!important;min-height:220px!important}#messages .message-chat-panel{min-height:44vh!important}}
 `;
 function apply(){
  try{const d=frame.contentDocument;if(!d?.head||!d.querySelector('#messages'))return;
   let s=d.getElementById('suhas-messenger-light-inbox');if(!s){s=d.createElement('style');s.id='suhas-messenger-light-inbox';d.head.appendChild(s)}s.textContent=theme;
   const title=d.getElementById('chat-title'),panel=d.querySelector('#messages .message-chat-panel');
   const sync=()=>{if(title&&panel){const open=!!title.textContent.trim()&&!/choose a conversation/i.test(title.textContent);panel.style.setProperty('display',open?'flex':'none','important')}};
   if(title&&!title.dataset.suhasLightObserver){new MutationObserver(sync).observe(title,{childList:true,subtree:true,characterData:true});title.dataset.suhasLightObserver='1'}sync();
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
})();
