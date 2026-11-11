(function(){
  var authScriptUrl=document.currentScript&&document.currentScript.src?document.currentScript.src:location.href;
  var appRootPath=new URL('../',authScriptUrl).pathname;
  var routeParts=location.pathname.split('/').filter(Boolean);
  function canonicalPageName(value){
    var name=(value||'index.html').toLowerCase();
    if(name && name.indexOf('.')===-1) name += '.html';
    return name || 'index.html';
  }
  var routeEarly=canonicalPageName(routeParts[routeParts.length-1]||'index.html');
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
  function revealAuthenticatedPage(){
    document.documentElement.classList.add('suhas-authenticated');
    document.dispatchEvent(new Event('suhas-auth-ready'));
    document.documentElement.classList.remove('suhas-auth-pending');
  }

  // Keep all app navigation hidden until a verified session and completed profile exist.
  var navGateStyle=document.createElement('style');
  navGateStyle.id='suhas-auth-nav-gate';
  navGateStyle.textContent='.tabbar,.social-mobile-nav{display:none!important}html.suhas-authenticated .tabbar{display:grid!important}html.suhas-authenticated .social-mobile-nav{display:grid!important}html.suhas-authenticated body.suhas-desktop-mode .tabbar,html.suhas-authenticated body.suhas-desktop-mode .social-mobile-nav{display:none!important}html.suhas-authenticated body:has(#login-form) .tabbar,html.suhas-authenticated body:has(#signup-form) .tabbar{display:none!important}html.suhas-authenticated body:has(#login-form) .social-mobile-nav,html.suhas-authenticated body:has(#signup-form) .social-mobile-nav{display:none!important}';
  (document.head||document.documentElement).appendChild(navGateStyle);

  var displayScript=document.createElement('script');displayScript.src='assets/display-mode.js?v=4';displayScript.defer=true;document.head.appendChild(displayScript);

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
      location.replace(appRootPath+'login.html?next=' + encodeURIComponent(next));
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
    if(!session || page==='profile.html' || page==='main-menu.html' || page==='max-profile.html' || isPublicAuthPage()) return true;
    try{
      // Every authenticated account, including OWNER/admin, must have the same completed member profile.
      var result=await sb.from('suhas_member_profiles').select('profile_complete').eq('user_id',session.user.id).maybeSingle();
      if(result.error || !result.data || result.data.profile_complete!==true){location.replace(appRootPath+'profile.html?setup=1');return false;}
      // SUHAS-MAX is an independent platform: require its own profile only when opening its app launcher, feed, or Messenger.
      if(['home.html','social.html','messenger.html'].indexOf(page)!==-1){
        var maxProfile=await sb.from('suhas_public_profiles').select('profile_complete').eq('user_id',session.user.id).maybeSingle();
        if(maxProfile.error || !maxProfile.data || maxProfile.data.profile_complete!==true){
          location.replace(appRootPath+'max-profile.html?setup=1');
          return false;
        }
      }
      return true;
    }catch(e){
      if(['home.html','social.html','messenger.html'].indexOf(page)!==-1){location.replace(appRootPath+'max-profile.html?setup=1');return false;}
      location.replace('profile.html?setup=1');return false;
    }
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
      return;
    }
    if(!requireWorkspaceSession(session)) return;
    if(!isPublicAuthPage()) paintNav(session);
    if(session){
      var profileReady=await enforceMemberProfile(session);
      if(profileReady) revealAuthenticatedPage();
    }else if(isPublicAuthPage()){document.documentElement.classList.remove('suhas-auth-pending');}
    if(session && (page === 'index.html' || page === 'login.html' || page === 'signup.html')){
      sb.from('suhas_member_profiles').select('profile_complete').eq('user_id',session.user.id).maybeSingle().then(function(pr){
        location.replace('main-menu.html');
      }).catch(function(){ location.replace('profile.html?setup=1'); });
    }
  }).catch(function(error){
    console.warn('SUHAS-MAX session restoration failed:',error);
    if(isPublicAuthPage())document.documentElement.classList.remove('suhas-auth-pending');
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
  suhasUpdateManager.src=appRootPath+'assets/update-manager.js?v=1';
  suhasUpdateManager.async=true;
  (document.head||document.documentElement).appendChild(suhasUpdateManager);
})();