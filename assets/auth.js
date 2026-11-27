(function(){
  // Keep the retired GitHub Pages fallback from accepting new sessions or signup callbacks.
  // Preserve the exact route and query while moving visitors to the canonical Cloudflare app.
  if(location.hostname==='suhasgroupin-web.github.io'){
    location.replace('https://suhasgroup.pages.dev'+location.pathname.replace(/^\/suhasgroup(?=\/|$)/,'')+location.search+location.hash);
    return;
  }
  var authScriptUrl=document.currentScript&&document.currentScript.src?document.currentScript.src:location.href;
  var appRootPath=new URL('../',authScriptUrl).pathname;
  var routeParts=location.pathname.split('/').filter(Boolean);
  function canonicalPageName(value){
    var name=(value||'index.html').toLowerCase();
    if(name && name.indexOf('.')===-1) name += '.html';
    return name || 'index.html';
  }
  var routeEarly=canonicalPageName(routeParts[routeParts.length-1]||'index.html');
  var isSuhasMaxRoute=['home.html','social.html','messenger.html','suhas-max-ai.html','max-profile.html'].indexOf(routeEarly)!==-1 || (routeEarly==='login.html' && new URLSearchParams(location.search).get('max')==='1');
  // Public authentication pages live only at the site root.
  var isRootAuthRoute=routeParts.length<=1;
  var publicEarly=['index.html','login.html','signup.html','reset.html'];
  if(!(isRootAuthRoute&&publicEarly.indexOf(routeEarly)!==-1)){
    document.documentElement.classList.add('suhas-auth-pending');
    var gateStyle=document.createElement('style');
    gateStyle.id='suhas-auth-gate-style';
    gateStyle.textContent='html.suhas-auth-pending body{visibility:hidden!important;pointer-events:none!important}';
    (document.head||document.documentElement).appendChild(gateStyle);
  }

  // ---- Blank-screen protection -------------------------------------------------
  // Protected pages stay hidden until a verified session exists. If that check can never
  // finish (CDN blocked, slow network, stale cache, storage error), show a visible recovery
  // card instead of an empty white screen. The protected page itself stays hidden.
  var authRescueTimer=null;
  function removeAuthRescue(){
    if(authRescueTimer){clearTimeout(authRescueTimer);authRescueTimer=null;}
    var old=document.getElementById('suhas-auth-rescue');
    if(old&&old.parentNode)old.parentNode.removeChild(old);
  }
  function repairAppAndReload(){
    var tasks=[];
    try{if('serviceWorker' in navigator)tasks.push(navigator.serviceWorker.getRegistrations().then(function(list){return Promise.all(list.map(function(r){return r.unregister();}));}));}catch(e){}
    try{if(window.caches)tasks.push(caches.keys().then(function(keys){return Promise.all(keys.map(function(k){return caches.delete(k);}));}));}catch(e){}
    Promise.all(tasks.map(function(t){return t.catch(function(){});})).then(function(){location.reload();},function(){location.reload();});
  }
  function showAuthRescue(){
    if(document.getElementById('suhas-auth-rescue'))return;
    if(!document.documentElement.classList.contains('suhas-auth-pending'))return;
    var wrap=document.createElement('div');
    wrap.id='suhas-auth-rescue';
    wrap.setAttribute('role','alert');
    wrap.style.cssText='position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:20px;background:linear-gradient(160deg,#0a2a66,#050f22);font-family:Arial,sans-serif';
    var card=document.createElement('div');
    card.style.cssText='width:100%;max-width:380px;padding:26px 22px;border-radius:20px;background:#fff;color:#152b4b;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.45)';
    var h=document.createElement('h2');h.textContent='SUHAS MAX';h.style.cssText='margin:0 0 8px;font-size:22px;color:#0a2a66';
    var p=document.createElement('p');p.textContent='The page could not finish loading. Your connection may be slow, or the app files may be outdated.';p.style.cssText='margin:0 0 18px;font-size:14px;line-height:1.5;color:#52627b';
    function btn(label,primary,fn){
      var b=document.createElement('button');b.type='button';b.textContent=label;
      b.style.cssText='display:block;width:100%;margin:8px 0 0;padding:13px;border:0;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;'+(primary?'background:#1877f2;color:#fff':'background:#e9eef6;color:#17345f');
      b.addEventListener('click',fn);return b;
    }
    card.appendChild(h);card.appendChild(p);
    card.appendChild(btn('Try again',true,function(){location.reload();}));
    card.appendChild(btn('Go to Login',false,function(){location.replace(appRootPath+'login.html?next='+encodeURIComponent(location.pathname+location.search));}));
    card.appendChild(btn('Repair app (clear old files)',false,repairAppAndReload));
    wrap.appendChild(card);
    document.documentElement.appendChild(wrap);
  }
  if(document.documentElement.classList.contains('suhas-auth-pending')){
    authRescueTimer=setTimeout(showAuthRescue,9000);
  }
  // Last-resort safety net: scripts that crash before the session check starts.
  window.addEventListener('error',function(ev){
    if(ev&&ev.filename&&/supabase|auth\.js/i.test(ev.filename))showAuthRescue();
  });
  window.addEventListener('unhandledrejection',function(){
    window.setTimeout(function(){showAuthRescue();},4000);
  });

  function revealAuthenticatedPage(){
    removeAuthRescue();
    document.documentElement.classList.add('suhas-authenticated');
    document.dispatchEvent(new Event('suhas-auth-ready'));
    document.documentElement.classList.remove('suhas-auth-pending');
  }

  // Keep all app navigation hidden until a verified session and completed profile exist.
  var navGateStyle=document.createElement('style');
  navGateStyle.id='suhas-auth-nav-gate';
  navGateStyle.textContent=".tabbar,.social-mobile-nav{display:none!important}html.suhas-authenticated .tabbar{display:grid!important;visibility:visible!important;pointer-events:auto!important}html.suhas-authenticated .social-mobile-nav{display:grid!important}html.suhas-authenticated body:has(#login-form) .tabbar,html.suhas-authenticated body:has(#signup-form) .tabbar,html.suhas-authenticated body:has(#login-form) .social-mobile-nav,html.suhas-authenticated body:has(#signup-form) .social-mobile-nav{display:none!important}html.suhas-authenticated body.has-tabbar{padding-bottom:54px!important}html.suhas-authenticated body:not(:has(#login-form)):not(:has(#signup-form)) .tabbar{position:fixed!important;left:0!important;right:0!important;bottom:0!important;transform:none!important;width:100%!important;max-width:1440px!important;min-height:50px!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;grid-auto-flow:row!important;gap:2px!important;padding:4px 5px calc(4px + env(safe-area-inset-bottom,0px))!important;box-sizing:border-box!important;background:rgba(255,255,255,.98)!important;border-top:1px solid #dce5f2!important;box-shadow:0 -5px 18px rgba(7,20,43,.13)!important;z-index:2147482000!important}html.suhas-authenticated body:not(:has(#login-form)):not(:has(#signup-form)) .tabbar>a,html.suhas-authenticated body:not(:has(#login-form)):not(:has(#signup-form)) .tabbar>button{display:flex!important;visibility:visible!important;pointer-events:auto!important;min-width:0!important;min-height:42px!important;width:100%!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:2px!important;padding:2px 1px!important;border:1px solid #d7e1ef!important;border-radius:9px!important;background:linear-gradient(180deg,#fff 0%,#edf2f9 55%,#dce5f1 100%)!important;box-shadow:inset 0 1px 0 #fff,inset 0 -1px 0 rgba(99,123,157,.22),0 2px 0 #b7c6d9,0 3px 5px rgba(24,48,83,.16)!important;color:#233e63!important;font-family:'Trebuchet MS',Arial,sans-serif!important;font-size:8px!important;font-weight:900!important;letter-spacing:.12px!important;line-height:1!important;text-decoration:none!important;white-space:nowrap!important;touch-action:manipulation!important;-webkit-tap-highlight-color:transparent!important;cursor:pointer!important;transition:transform .1s ease,box-shadow .1s ease!important}html.suhas-authenticated body:not(:has(#login-form)):not(:has(#signup-form)) .tabbar>a span{display:block!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}html.suhas-authenticated body:not(:has(#login-form)):not(:has(#signup-form)) .tabbar svg{width:17px!important;height:17px!important;flex:0 0 17px!important;overflow:visible!important;filter:drop-shadow(0 1px 0 #fff) drop-shadow(0 2px 0 #aabbd1) drop-shadow(0 3px 2px rgba(13,36,69,.45))!important}html.suhas-authenticated body:not(:has(#login-form)):not(:has(#signup-form)) .tabbar svg *{stroke-width:2.25!important;stroke-linecap:round!important;stroke-linejoin:round!important}html.suhas-authenticated body:not(:has(#login-form)):not(:has(#signup-form)) .tabbar .brand-icon,html.suhas-authenticated body:not(:has(#login-form)):not(:has(#signup-form)) .tabbar .o5-international-icon{width:17px!important;height:17px!important;max-width:17px!important;max-height:17px!important;filter:drop-shadow(0 1px 0 #fff) drop-shadow(0 2px 0 #aabbd1) drop-shadow(0 3px 2px rgba(13,36,69,.45))!important}html.suhas-authenticated body:not(:has(#login-form)):not(:has(#signup-form)) .tabbar>a.on,html.suhas-authenticated body:not(:has(#login-form)):not(:has(#signup-form)) .tabbar>button.on{color:#0755a7!important;background:linear-gradient(180deg,#f4f9ff 0%,#dceaff 55%,#c8dcf8 100%)!important;border-color:#9dbce3!important;box-shadow:inset 0 1px 0 #fff,0 2px 0 #91acd0,0 3px 6px rgba(20,67,125,.2)!important}html.suhas-authenticated body:not(:has(#login-form)):not(:has(#signup-form)) .tabbar>a:hover,html.suhas-authenticated body:not(:has(#login-form)):not(:has(#signup-form)) .tabbar>button:hover{transform:translateY(-1px)!important}html.suhas-authenticated body:not(:has(#login-form)):not(:has(#signup-form)) .tabbar>a:active,html.suhas-authenticated body:not(:has(#login-form)):not(:has(#signup-form)) .tabbar>button:active{transform:translateY(2px)!important;box-shadow:inset 0 2px 4px rgba(16,42,78,.2)!important}";
  (document.head||document.documentElement).appendChild(navGateStyle);

  if(!isSuhasMaxRoute){var displayScript=document.createElement('script');displayScript.src='assets/display-mode.js?v=9';displayScript.defer=true;document.head.appendChild(displayScript);}

  // The Supabase client normally comes from the CDN <script> tag in the page. If that file is
  // blocked or slow on the visitor's network, try alternate mirrors before giving up, so the
  // page never dies silently on a blank screen.
  function supabaseReady(){return !!(window.supabase&&window.supabase.createClient);}
  function loadSupabaseFallbacks(done){
    var mirrors=[
      'https://unpkg.com/@supabase/supabase-js@2/dist/umd/supabase.js',
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js'
    ];
    var index=0;
    (function next(){
      if(supabaseReady()){done(true);return;}
      if(index>=mirrors.length){done(false);return;}
      var s=document.createElement('script');
      s.src=mirrors[index++];
      s.async=true;
      s.onload=function(){next();};
      s.onerror=function(){next();};
      (document.head||document.documentElement).appendChild(s);
    })();
  }
  if(supabaseReady()){
    startAuth();
  }else{
    loadSupabaseFallbacks(function(ok){
      if(ok){startAuth();}
      else{
        console.warn('SUHAS-MAX: Supabase library could not be loaded from any source.');
        if(document.documentElement.classList.contains('suhas-auth-pending'))showAuthRescue();
        else document.documentElement.classList.remove('suhas-auth-pending');
      }
    });
  }

  function startAuth(){
  var cfg = window.SUHAS_CONFIG;
  window.sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: window.localStorage,
      storageKey: 'suhas-group-auth-v2'
    }
  });

  // Recover a still-valid browser session saved by an older SUHAS-MAX auth storage key.
  // This is device-local only; no credentials are copied to a server or shared between devices.
  async function getRestoredSession(){
    var result=await sb.auth.getSession();
    if(result.data&&result.data.session)return result;
    try{
      var keys=[];
      for(var i=0;i<localStorage.length;i++){
        var key=localStorage.key(i);
        if(key && key!== 'suhas-group-auth-v2' && (key.indexOf('auth-token')!==-1 || key.indexOf('suhas-group-auth')!==-1))keys.push(key);
      }
      for(var k=0;k<keys.length;k++){
        try{
          var saved=JSON.parse(localStorage.getItem(keys[k])||'null');
          var candidate=saved&&(saved.currentSession||saved.session||saved);
          if(!candidate||!candidate.access_token||!candidate.refresh_token)continue;
          var restored=await sb.auth.setSession({access_token:candidate.access_token,refresh_token:candidate.refresh_token});
          if(!restored.error&&restored.data&&restored.data.session)return {data:{session:restored.data.session},error:null};
        }catch(ignore){}
      }
    }catch(ignore){}
    return result;
  }

  var page = canonicalPageName(routeParts[routeParts.length-1] || 'index.html');
  function isO5Account(user){ return !!(user && user.email && user.email.toLowerCase().endsWith('@o5-intl.com')); }
  // Only authentication screens are public. Every other route, including the home route, requires a real session.
  var route = page;
  var publicPages = ['index.html','login.html','signup.html','reset.html'];
  function isPublicAuthPage(){return isRootAuthRoute && publicPages.indexOf(page)!==-1;}
  function requireWorkspaceSession(session){
    if(!isPublicAuthPage() && !session){
      var next = location.pathname + location.search + location.hash;
      var loginTarget=isSuhasMaxRoute?'login.html?max=1&next=':'login.html?next=';
      location.replace(appRootPath+loginTarget+encodeURIComponent(next));
      return false;
    }
    return true;
  }

  window.showMsg = function(id, text, ok){
    var el = document.getElementById(id);
    if(!el) return;
    el.textContent = text;
    el.style.display = 'block';
    el.style.background = ok ? '#E7F6EC' : '#FDECEA';
    el.style.color = ok ? '#1B6B3A' : '#A5321F';
  };

  window.safeNext = function(value){
    return typeof value === 'string' && value.charAt(0) === '/' &&
      value.charAt(1) !== '/' && value.indexOf(String.fromCharCode(92)) === -1 ? value : 'main-menu.html';
  };

  window.checkIsAdmin = async function(){
    try {
      var userResult = await sb.auth.getUser();
      if(userResult.error || !userResult.data.user) return false;
      var result = await sb.rpc('has_suhas_role', {
        p_roles: ['OWNER', 'ADMIN']
      });
      if(!result.error && result.data === true) return true;
      // Secure fallback for the designated, verified SUHAS owner account.
      return !!(userResult.data.user.email_confirmed_at && userResult.data.user.email && userResult.data.user.email.toLowerCase() === 'suhasgroup.in@gmail.com');
    } catch(e) { return false; }
  };

  window.requireAuth = async function(){
    var result = await sb.auth.getUser();
    if(result.error || !result.data.user){
      var next = location.pathname + location.search + location.hash;
      location.replace('login.html?next=' + encodeURIComponent(next));
      return null;
    }
    return result.data.user;
  };

  window.requireAdmin = async function(){
    var user = await window.requireAuth();
    if(!user) return null;
    if(!await window.checkIsAdmin()){
      var gate = document.getElementById('gate');
      if(gate) gate.innerHTML = '<div class="container"><div class="form-card"><h3>Access restricted</h3><p>This page is only available to approved SUHAS GROUP administrators.</p><a class="btn btn-primary" href="index.html">Return home</a></div></div>';
      return null;
    }
    return user;
  };

  async function enforceMemberProfile(session){
    // The profile page must remain reachable so members can complete a missing/incomplete profile.
    // Blocking it until profile_complete is true creates a redirect loop through the legacy profile.html route.
    if(!session || page==='main-menu.html' || page==='profile.html' || (isPublicAuthPage()&&!isSuhasMaxRoute)) return true;
    try{
      if(isSuhasMaxRoute){
        if(page==='max-profile.html') return true;
        var maxProfile=await sb.from('suhas_public_profiles').select('profile_complete').eq('user_id',session.user.id).maybeSingle();
        // Only send the member to profile setup when the database confirms the profile is incomplete.
        // A temporary network/database error must never bounce the member to the profile screen.
        if(!maxProfile.error && (!maxProfile.data || maxProfile.data.profile_complete!==true)){
          location.replace(appRootPath+'max-profile.html?setup=1');
          return false;
        }
        return true;
      }
      // Corporate pages (Job, Careers, O5'Intl, ...) must stay usable. An incomplete profile, or a
      // temporary network/database error, is shown as a gentle reminder instead of forcing every
      // button to open the profile screen.
      var result=await sb.from('suhas_member_profiles').select('profile_complete').eq('user_id',session.user.id).maybeSingle();
      if(!result.error && (!result.data || result.data.profile_complete!==true)) showProfileReminder();
      return true;
    }catch(e){
      // A failed profile check is not proof that the profile is incomplete: never redirect on errors.
      return true;
    }
  }

  function showProfileReminder(){
    try{
      if(page==='profile.html'||page==='max-profile.html')return;
      if(sessionStorage.getItem('suhas-profile-reminder-dismissed')==='1')return;
    }catch(e){}
    if(document.getElementById('suhas-profile-reminder'))return;
    var bar=document.createElement('div');
    bar.id='suhas-profile-reminder';
    bar.setAttribute('role','status');
    bar.style.cssText='position:fixed;left:10px;right:10px;bottom:calc(86px + env(safe-area-inset-bottom,0px));z-index:2147483000;display:flex;align-items:center;gap:10px;max-width:520px;margin:0 auto;padding:11px 12px;border-radius:12px;background:#0a2a66;color:#fff;font:600 13px/1.35 Arial,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.28)';
    var text=document.createElement('span');text.style.cssText='flex:1;min-width:0';text.textContent='Complete your profile to unlock all features.';
    var go=document.createElement('a');go.href=appRootPath+'profile.html?setup=1';go.textContent='Complete';go.style.cssText='flex:none;padding:8px 12px;border-radius:9px;background:#f5c542;color:#241802;font-weight:800;text-decoration:none';
    var close=document.createElement('button');close.type='button';close.setAttribute('aria-label','Dismiss');close.textContent='×';close.style.cssText='flex:none;border:0;background:transparent;color:#fff;font-size:22px;line-height:1;padding:2px 6px;cursor:pointer';
    close.addEventListener('click',function(){try{sessionStorage.setItem('suhas-profile-reminder-dismissed','1');}catch(e){}if(bar.parentNode)bar.parentNode.removeChild(bar);});
    bar.appendChild(text);bar.appendChild(go);bar.appendChild(close);
    (document.body||document.documentElement).appendChild(bar);
  }

  async function paintNav(session){
    var isAdmin = session ? await window.checkIsAdmin() : false;
    var navs = document.querySelectorAll('.nav-links');
    navs.forEach(function(nav){
      if(session){nav.querySelectorAll('a').forEach(function(link){if(link.textContent.trim().toLowerCase()==='home'){link.href='home.html';link.textContent='SUHAS MAX';}});}
      var old = nav.querySelector('.js-session-links');
      if(old) old.remove();
      var mobileAuth = nav.querySelector('.nav-cta-m');
      if(session){
        if(mobileAuth) mobileAuth.style.display='none';
        var box=document.createElement('div');
        box.className='js-session-links';
        box.innerHTML='<a href="home.html" class="js-home-social">SUHAS MAX</a><a href="profile.html">My Profile</a><a href="#" class="js-logout">Logout</a>';
        if(isAdmin) box.innerHTML='<a href="admin.html">Owner Dashboard</a>'+box.innerHTML;
        nav.appendChild(box);
      }else if(mobileAuth){
        mobileAuth.style.display='';
      }
    });
    document.querySelectorAll('.nav-wrap > .nav-cta').forEach(function(box){
      if(session){ box.innerHTML=''; box.style.display='none'; }
      else { box.style.display=''; box.innerHTML='<a href="login.html" class="btn btn-outline btn-sm">Login</a><a href="signup.html" class="btn btn-primary btn-sm">Sign Up</a>'; }
    });
    document.querySelectorAll('.js-logout').forEach(function(b){
      b.addEventListener('click', async function(e){
        e.preventDefault();
        b.textContent='Signing out...';
        var result=await sb.auth.signOut({scope:'local'});
        if(result.error){b.textContent='Logout';window.showMsg('msg','Could not sign out. Please try again.',false);return;}
        location.replace('index.html');
      });
    });
  }

  getRestoredSession().then(async function(r){
    var session = r && r.data && r.data.session;
    // A storage/network error is not treated as an intentional logout.
    if(r && r.error && !session){
      console.warn('SUHAS-MAX could not verify the saved login session yet:',r.error.message);
      if(isPublicAuthPage())document.documentElement.classList.remove('suhas-auth-pending');
      else showAuthRescue();
      return;
    }
    if(!requireWorkspaceSession(session)) return;
    if(!isPublicAuthPage()) paintNav(session);
    if(session){
      var profileReady=await enforceMemberProfile(session);
      if(profileReady) revealAuthenticatedPage();
    }else if(isPublicAuthPage()){document.documentElement.classList.remove('suhas-auth-pending');}
    if(session && page==='login.html' && isSuhasMaxRoute){
      enforceMemberProfile(session).then(function(ok){if(ok){var next=window.safeNext(new URLSearchParams(location.search).get('next'));if(next==='main-menu.html')next='/home.html';location.replace(next);}});
    }else if(session && (page === 'index.html' || page === 'login.html' || page === 'signup.html')){
      sb.from('suhas_member_profiles').select('profile_complete').eq('user_id',session.user.id).maybeSingle().then(function(pr){location.replace('main-menu.html');}).catch(function(){location.replace('profile.html?setup=1');});
    }
  }).catch(function(error){
    console.warn('SUHAS-MAX session restoration failed:',error);
    if(isPublicAuthPage())document.documentElement.classList.remove('suhas-auth-pending');
    else showAuthRescue();
  });

  sb.auth.onAuthStateChange(function(event, session){
    if(event === 'PASSWORD_RECOVERY' && page !== 'reset.html'){
      location.href = appRootPath+'reset.html' + location.hash;
      return;
    }
    if(event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED'){
      if(!requireWorkspaceSession(session)) return;
      if(!isPublicAuthPage()) paintNav(session);
      if((event==='SIGNED_IN' || event==='TOKEN_REFRESHED') && !isPublicAuthPage()){
        enforceMemberProfile(session).then(function(ok){if(ok)revealAuthenticatedPage();});
      }
      if(event==='SIGNED_OUT') { document.documentElement.classList.remove('suhas-authenticated'); if(!isPublicAuthPage()) document.documentElement.classList.add('suhas-auth-pending'); }
    }
  });

  // Load the staged PWA update and in-app release notification manager on every route.
  var suhasUpdateManager=document.createElement('script');
  suhasUpdateManager.src=appRootPath+'assets/update-manager.js?v=20261127-nav3d-fix';
  suhasUpdateManager.async=true;
  (document.head||document.documentElement).appendChild(suhasUpdateManager);
  }
})();