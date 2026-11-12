/* SUHAS MESSENGER — isolated interaction bridge.
   Reuses the existing authenticated SUHAS-MAX messaging module inside a same-origin frame;
   does not initialize a second Supabase client or alter shared app code. */
(() => {
  'use strict';
  const frame=document.getElementById('messenger-frame');
  const search=document.getElementById('messenger-search');
  const filterButtons=[...document.querySelectorAll('.messenger-shortcuts [data-filter]')];
  const navButtons=[...document.querySelectorAll('.messenger-bottom [data-dest]')];
  let activeFilter='all',frameReady=false,showingPeople=false;
  const frameCss=`
    html,body{background:#fff!important;color:#1c1e21!important;overflow:auto!important}
    .site-header,.social-left,.social-right,.book-heading,.social-mobile-nav{display:none!important}
    .social-shell{display:block!important;max-width:none!important;padding:0!important;margin:0!important}
    .social-center{display:block!important;width:100%!important;max-width:none!important;margin:0!important;padding:0!important}
    .social-center>section:not(#messages){display:none!important}
    #messages{display:block!important;visibility:visible!important;margin:0!important;padding:14px 16px 24px!important;border:0!important;border-radius:0!important;box-shadow:none!important;background:#fff!important;color:#1c1e21!important;min-height:100%!important}
    #messages>h2{display:none!important}
    #messages .message-start{padding:0 0 12px!important;margin:0 0 12px!important;border:0!important;background:#fff!important}
    #messages .message-start h3{display:none!important}
    #messages #message-member-search,#messages #message-thread-search{width:100%!important;height:44px!important;border:0!important;border-radius:24px!important;background:#f0f2f5!important;color:#1c1e21!important;padding:0 16px!important;font-size:15px!important;outline:none!important}
    #messages .message-member-list{display:flex!important;gap:10px!important;overflow-x:auto!important;padding:8px 0!important;grid-template-columns:none!important}
    #messages .message-member{flex:0 0 220px!important;max-width:220px!important;border:1px solid #e4e6eb!important;border-radius:12px!important;background:#fff!important;color:#1c1e21!important;padding:8px!important}
    #messages .message-member img,#messages .message-member-avatar{width:40px!important;height:40px!important;flex:0 0 40px!important;border-radius:50%!important;object-fit:cover!important}
    #messages .message-member b{color:#1c1e21!important}
    #messages .message-member small{color:#65676b!important}
    #messages .social-grid{display:flex!important;flex-direction:column!important;gap:12px!important}
    #messages .social-grid>div:first-child{min-width:0!important}
    #messages .message-subtitle{font-size:20px!important;margin:4px 0 8px!important;color:#1c1e21!important}
    #messages #threads{display:flex!important;flex-direction:column!important;gap:0!important}
    #messages .message-thread{display:flex!important;align-items:center!important;gap:12px!important;width:100%!important;min-height:76px!important;padding:10px 4px!important;border:0!important;border-bottom:1px solid #edf0f2!important;border-radius:0!important;background:#fff!important;color:#1c1e21!important;text-align:left!important}
    #messages .message-thread img,#messages .message-thread .message-member-avatar{width:58px!important;height:58px!important;flex:0 0 58px!important;border-radius:50%!important;object-fit:cover!important}
    #messages .message-thread-name{font-size:16px!important;font-weight:750!important;color:#111!important}
    #messages .message-thread-preview{font-size:14px!important;color:#65676b!important}
    #messages .message-thread-unread{background:#0866ff!important;color:white!important;border-radius:50px!important;padding:3px 7px!important}
    #messages .message-chat-panel{display:none;min-width:0!important;background:#fff!important}
    #messages .msg-list{height:calc(100dvh - 270px)!important;min-height:220px!important;max-height:none!important;background:#fff!important}
    #messages .bubble{max-width:82%!important;border-radius:18px!important}
    #messages .bubble.mine{background:#0866ff!important;color:#fff!important}
    #messages .compose{position:sticky!important;bottom:0!important;background:#fff!important;padding:10px 0!important}
    #messages .compose input{border-radius:22px!important;background:#f0f2f5!important;color:#1c1e21!important;min-height:44px!important}
    #messages .compose .action{border-radius:22px!important;background:#0866ff!important}
    #messages .empty{padding:28px 14px!important;text-align:center!important;color:#65676b!important}
    @media(max-width:600px){#messages{padding:10px 14px 20px!important}#messages .message-member{flex-basis:205px!important}#messages .message-thread{min-height:74px!important}#messages .message-thread img,#messages .message-thread .message-member-avatar{width:54px!important;height:54px!important;flex-basis:54px!important}}
  `;
  function doc(){try{return frame.contentDocument||frame.contentWindow.document}catch(_){return null}}
  function inject(){
    const d=doc();if(!d||!d.head||!d.body)return false;
    if(!d.getElementById('suhas-messenger-isolated-inbox-style')){
      const style=d.createElement('style');style.id='suhas-messenger-isolated-inbox-style';style.textContent=frameCss;d.head.appendChild(style);
    }
    const messages=d.getElementById('messages');
    const tab=d.querySelector('[data-tab="messages"]');
    if(tab && messages?.hidden)tab.click();
    if(messages)messages.hidden=false;
    frameReady=true;applyFilter();return true;
  }
  function applyFilter(){
    const d=doc();if(!d)return;
    const threads=d.querySelector('#threads');if(!threads)return;
    const rows=[...threads.querySelectorAll('.message-thread')];
    rows.forEach(row=>{
      const unread=!!row.querySelector('.message-thread-unread');
      const isGroup=row.dataset.group==='true'||row.classList.contains('is-group');
      row.hidden=(activeFilter==='unread'&&!unread)||(activeFilter==='groups'&&!isGroup);
    });
    const empty=d.querySelector('#threads .empty');
    if(activeFilter==='groups'&&!rows.some(r=>r.dataset.group==='true'||r.classList.contains('is-group'))&&empty){
      empty.textContent='Group conversations will appear here when group messaging is enabled.';
    }
  }
  function setFilter(value){
    activeFilter=value;
    filterButtons.forEach(b=>{const on=b.dataset.filter===value;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
    applyFilter();
  }
  function selectNav(value){
    navButtons.forEach(b=>b.classList.toggle('selected',b.dataset.dest===value));
  }
  function switchFrameTab(tab){
    const d=doc();if(!d)return;
    const b=d.querySelector('[data-tab="'+tab+'"]');if(b)b.click();
  }
  frame?.addEventListener('load',()=>{inject();setTimeout(inject,500);setTimeout(inject,1400)});
  filterButtons.forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.filter)));
  search?.addEventListener('input',()=>{
    const d=doc();if(!d)return;
    const member=d.getElementById('message-member-search'),thread=d.getElementById('message-thread-search');
    if(member){member.value=search.value;member.dispatchEvent(new Event('input',{bubbles:true}))}
    if(thread){thread.value=search.value;thread.dispatchEvent(new Event('input',{bubbles:true}))}
  });
  document.getElementById('messenger-compose')?.addEventListener('click',()=>{
    const d=doc();const input=d?.getElementById('message-member-search');
    if(input){input.focus();input.scrollIntoView({behavior:'smooth',block:'center'})}
  });
  navButtons.forEach(b=>b.addEventListener('click',()=>{
    const dest=b.dataset.dest;selectNav(dest);
    if(dest==='messages'){switchFrameTab('messages');inject()}
    if(dest==='friends'){switchFrameTab('friends');showingPeople=true;const d=doc();d?.getElementById('message-member-search')?.focus()}
    if(dest==='notifications')switchFrameTab('notifications');
  }));
  document.getElementById('messenger-menu')?.addEventListener('click',()=>{
    const panel=document.getElementById('messenger-settings-panel');
    if(panel)panel.hidden=!panel.hidden;
  });
  document.getElementById('messenger-back')?.addEventListener('click',()=>{location.href='suhas-max.html'});
  document.getElementById('messenger-notice')?.addEventListener('click',()=>{
    const d=doc();const push=d?.getElementById('suhas-enable-push');
    if(push)push.click();else if('Notification'in window)Notification.requestPermission();
  });
  document.getElementById('messenger-settings-close')?.addEventListener('click',()=>{
    const panel=document.getElementById('messenger-settings-panel');if(panel)panel.hidden=true;
  });
  if(frameReady)inject();
  setInterval(()=>{if(!frameReady)inject();else applyFilter()},1800);
})();
