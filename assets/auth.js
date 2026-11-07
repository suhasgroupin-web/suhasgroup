(function(){
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

  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  function isO5Account(user){ return !!(user && user.email && user.email.toLowerCase().endsWith('@o5-intl.com')); }

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
      value.charAt(1) !== '/' && value.indexOf(String.fromCharCode(92)) === -1 ? value : 'profile.html';
  };

  window.checkIsAdmin = async function(){
    try {
      var userResult = await sb.auth.getUser();
      if(userResult.error || !userResult.data.user) return false;
      var result = await sb.rpc('has_suhas_role', {
        p_user_id: userResult.data.user.id,
        p_roles: ['OWNER']
      });
      return !result.error && result.data === true;
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
    if(!session || page==='profile.html' || page==='login.html' || page==='signup.html' || page==='reset.html') return;
    try{
      if(await window.checkIsAdmin()) return;
      var result=await sb.from('suhas_member_profiles').select('profile_complete').eq('user_id',session.user.id).maybeSingle();
      if(result.error || !result.data || result.data.profile_complete!==true) location.replace('profile.html?setup=1');
    }catch(e){ location.replace('profile.html?setup=1'); }
  }

  async function paintNav(session){
    var isAdmin = session ? await window.checkIsAdmin() : false;
    var navs = document.querySelectorAll('.nav-links');
    navs.forEach(function(nav){
      var old = nav.querySelector('.js-session-links');
      if(old) old.remove();
      var mobileAuth = nav.querySelector('.nav-cta-m');
      if(session){
        if(mobileAuth) mobileAuth.style.display='none';
        var box=document.createElement('div');
        box.className='js-session-links';
        box.innerHTML='<a href="profile.html">My Profile</a><a href="#" class="js-logout">Logout</a>';
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
        var result=await sb.auth.signOut({scope:'global'});
        if(result.error){b.textContent='Logout';window.showMsg('msg','Could not sign out. Please try again.',false);return;}
        location.replace('index.html');
      });
    });
  }

  sb.auth.getSession().then(function(r){
    var session = r.data && r.data.session;
    paintNav(session);
    enforceMemberProfile(session);
    if(session && (page === 'login.html' || page === 'signup.html')){
      location.replace('profile.html');
    }
  });

  sb.auth.onAuthStateChange(function(event, session){
    if(event === 'PASSWORD_RECOVERY' && page !== 'reset.html'){
      location.href = 'reset.html' + location.hash;
      return;
    }
    if(event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED'){
      paintNav(session);
      if(event==='SIGNED_IN' || event==='TOKEN_REFRESHED') enforceMemberProfile(session);
    }
  });
})();