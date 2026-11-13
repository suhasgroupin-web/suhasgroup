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
 /* FB-style inbox rows (additive v1): time label, bold unread rows, blue unread dot, active dot on avatar. */
 #messages .message-thread{position:relative!important;border-bottom:0!important;min-height:78px!important;padding:8px 0!important}
 #messages .message-thread>img,#messages .message-thread>.message-member-avatar{width:56px!important;height:56px!important;flex-basis:56px!important}
 #messages .message-thread-name{font-weight:500!important;font-size:16px!important}
 #messages .message-thread-preview{font-size:14px!important}
 #messages .message-thread.is-unread .message-thread-name,#messages .message-thread.is-unread .message-thread-preview{color:#050505!important;font-weight:700!important}
 #messages .message-thread-time{align-self:flex-start!important;margin-top:8px!important;flex:0 0 auto!important;color:#65676b!important;font-size:13px!important;font-weight:400!important}
 #messages .message-thread.is-unread .message-thread-time{color:#050505!important;font-weight:600!important}
 #messages .message-thread-unread{position:absolute!important;right:6px!important;bottom:16px!important;min-width:12px!important;width:12px!important;min-height:12px!important;height:12px!important;padding:0!important;overflow:hidden!important;border-radius:50%!important;background:#0866ff!important;color:transparent!important;font-size:0!important}
 #messages .message-status-dot.is-online{position:absolute!important;left:42px!important;bottom:12px!important;width:15px!important;height:15px!important;border:2px solid #fff!important;border-radius:50%!important;background:#31a24c!important}

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

 // Single authoritative search + All/Unread/Groups behavior for the Messenger shell.
 const shellSearch=document.getElementById('messenger-search');
 function syncMemberSearch(){
  try{
   const d=frame.contentDocument;if(!d)return;
   const list=d.getElementById('message-member-list');
   const q=(shellSearch?.value||'').trim();
   if(list){
    list.style.setProperty('display',q?'grid':'none','important');
    list.style.setProperty('max-height',q?'42vh':'0','important');
    list.style.setProperty('overflow-y','auto','important');
    list.style.setProperty('padding',q?'8px 0':'0','important');
    list.style.setProperty('background','#fff','important');
    list.style.setProperty('position','relative','important');
    list.style.setProperty('z-index','3','important');
   }
   d.documentElement.classList.toggle('suhas-messenger-searching',!!q);
  }catch(e){}
 }
 shellSearch?.addEventListener('input',()=>setTimeout(syncMemberSearch,0));
 shellSearch?.addEventListener('focus',()=>setTimeout(syncMemberSearch,0));
 frame.addEventListener('load',()=>setTimeout(syncMemberSearch,180));
 document.querySelectorAll('.messenger-shortcuts .shortcut').forEach(btn=>{
  btn.addEventListener('click',event=>{
   event.preventDefault();event.stopImmediatePropagation();
   document.querySelectorAll('.messenger-shortcuts .shortcut').forEach(x=>x.classList.toggle('active',x===btn));
   const d=frame.contentDocument;if(!d)return;
   const rows=[...d.querySelectorAll('#threads .message-thread')];
   let empty=d.getElementById('suhas-groups-unavailable');
   if(empty)empty.remove();
   if(btn.dataset.filter==='groups'){
    const groupRows=rows.filter(r=>r.matches('[data-group],.group-thread,.message-thread-group,[data-conversation-type="group"]')||r.querySelector('[data-conversation-type="group"],.group-avatar'));
    rows.forEach(r=>r.hidden=!groupRows.includes(r));
    if(!groupRows.length){
     empty=d.createElement('div');empty.id='suhas-groups-unavailable';empty.className='empty';
     empty.textContent='No group conversations yet. Groups will appear here after a group is created.';
     d.getElementById('threads')?.append(empty);
    }
   }else{
    rows.forEach(r=>{const unread=!!r.querySelector('.message-thread-unread');r.hidden=btn.dataset.filter==='unread'&&!unread;});
   }
  },true);
 });
 // Facebook-inspired People view, scoped to the Messenger iframe only.
 const peopleStyle=`
 #friends{display:block!important;position:relative!important;flex:1 1 auto!important;min-height:0!important;height:100%!important;overflow-y:auto!important;overflow-x:hidden!important;padding:0 18px 24px!important;border:0!important;border-radius:0!important;background:#fff!important;color:#050505!important}
 #friends>h2{margin:0!important;padding:18px 0 20px!important;font-size:30px!important;font-weight:800!important;color:#050505!important}
 #friends .messenger-people-stories{display:flex!important;gap:12px!important;overflow-x:auto!important;padding:0 0 18px!important;scrollbar-width:none!important}
 #friends .messenger-people-stories::-webkit-scrollbar{display:none!important}
 #friends .messenger-people-story{display:flex!important;flex:0 0 112px!important;flex-direction:column!important;align-items:center!important;gap:7px!important;border:0!important;background:#fff!important;padding:0!important;color:#050505!important}
 #friends .messenger-people-story .home-story-ring{width:104px!important;height:144px!important;padding:3px!important;border-radius:18px!important;background:#e4e6eb!important}
 #friends .messenger-people-story .home-story-avatar{border:0!important;border-radius:15px!important}
 #friends .messenger-people-story .home-story-name{font-size:13px!important;color:#050505!important}
 #friends .messenger-people-tabs{display:flex!important;align-items:center!important;gap:10px!important;overflow-x:auto!important;padding:12px 0 16px!important;scrollbar-width:none!important}
 #friends .messenger-people-tabs button{flex:0 0 auto!important;border:0!important;border-radius:24px!important;padding:11px 18px!important;background:#f0f2f5!important;color:#65676b!important;font-size:14px!important;font-weight:700!important}
 #friends .messenger-people-tabs button.active{background:#e7f3ff!important;color:#0866ff!important}
 #friends #friends-list{display:grid!important;gap:0!important}
 #friends #friends-list .member{display:flex!important;align-items:center!important;gap:14px!important;min-height:88px!important;padding:10px 0!important;border:0!important;border-bottom:1px solid #f0f2f5!important;border-radius:0!important;background:#fff!important}
 #friends #friends-list .member>img,.messenger-people-avatar{width:68px!important;height:68px!important;flex:0 0 68px!important;border-radius:50%!important;object-fit:cover!important}
 #friends #friends-list .member-info{flex:1 1 auto!important;min-width:0!important}
 #friends #friends-list .member-info b{font-size:16px!important;color:#050505!important}
 #friends #friends-list .member-info .muted{font-size:14px!important;color:#65676b!important}
 #friends #friends-list .member .actions{display:flex!important;flex-wrap:wrap!important;gap:6px!important}
 #friends #friends-list .member .action{min-height:34px!important;padding:7px 11px!important;border-radius:8px!important;font-size:12px!important}
 #friends .messenger-people-active-count{display:inline-flex!important;align-items:center!important;gap:7px!important;padding:9px 14px!important;border-radius:22px!important;background:#f0f2f5!important;color:#1c1e21!important;font-size:14px!important;font-weight:700!important}
 #friends .messenger-people-active-count{font-weight:700!important}
 @media(max-width:600px){#friends{padding:0 18px 26px!important}#friends>h2{font-size:30px!important;padding-top:16px!important}}
 `;
 function installPeopleView(){
  try{
   const d=frame.contentDocument;if(!d)return;
   let st=d.getElementById('suhas-messenger-people-style');
   if(!st){st=d.createElement('style');st.id='suhas-messenger-people-style';d.head.appendChild(st)}
   st.textContent=peopleStyle;
   const panel=d.getElementById('friends');if(!panel)return;
   if(!panel.querySelector('.messenger-people-tabs')){
    const heading=panel.querySelector(':scope > h2');if(heading)heading.textContent='People';
    const source=d.getElementById('home-stories-list');
    const storyWrap=d.createElement('div');storyWrap.className='messenger-people-stories';
    const own=d.createElement('button');own.type='button';own.className='messenger-people-story';own.innerHTML='<span class="home-story-ring"><span class="home-story-avatar">＋</span></span><span class="home-story-name">Add to story</span>';
    own.addEventListener('click',()=>{const form=d.getElementById('story-create-form');form?.scrollIntoView({behavior:'smooth',block:'center'});d.getElementById('story-content')?.focus();});
    storyWrap.append(own);
    if(source){source.querySelectorAll('.home-story-card').forEach(card=>{const clone=card.cloneNode(true);clone.classList.add('messenger-people-story');clone.addEventListener('click',()=>card.click());storyWrap.append(clone);});}
    panel.insertBefore(storyWrap,panel.querySelector('#friends-list'));
    const tabs=d.createElement('div');tabs.className='messenger-people-tabs';
    tabs.innerHTML='<span class="messenger-people-active-count">Friends</span><button type="button" data-people-view="requests">Friend requests</button><button type="button" class="active" data-people-view="all">All</button>';
    panel.insertBefore(tabs,panel.querySelector('#friends-list'));
    tabs.querySelector('[data-people-view="requests"]').addEventListener('click',()=>{const w=frame.contentWindow;if(w?.activateMaxTab)w.activateMaxTab('requests');});
    tabs.querySelector('[data-people-view="all"]').addEventListener('click',()=>{tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x.dataset.peopleView==='all'));});
   }
  }catch(e){console.warn('Messenger People view unavailable',e)}
 }
 document.querySelector('.messenger-bottom [data-dest="friends"]')?.addEventListener('click',()=>{setTimeout(installPeopleView,80);setTimeout(installPeopleView,500);});
 frame.addEventListener('load',()=>{setTimeout(installPeopleView,150);});

})();
