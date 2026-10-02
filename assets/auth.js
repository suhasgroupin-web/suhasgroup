(function(){
  var cfg = window.SUHAS_CONFIG;
  window.ADMIN_EMAIL = 'suhasgroup.in@gmail.com'; // fallback only; real check uses is_admin()
  window.sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_PUBLISHABLE_KEY);

  // Current page file name, works on GitHub Pages subpaths (/suhasgroup/login.html)
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  window.showMsg = function(id, text, ok){
    var el = document.getElementById(id);
    if(!el) return;
    el.textContent = text;
    el.style.display = 'block';
    el.style.background = ok ? '#E7F6EC' : '#FDECEA';
    el.style.color = ok ? '#1B6B3A' : '#A5321F';
  };

  window.checkIsAdmin = async function(){
    try{
      var r = await sb.rpc('is_admin');
      return !r.error && r.data === true;
    }catch(e){ return false; }
  };

  async function paintNav(session){
    var isAdmin = false;
    if(session){ isAdmin = await window.checkIsAdmin(); }
    document.querySelectorAll('.nav-cta').forEach(function(box){
      if(session){
        box.innerHTML =
          (isAdmin ? '<a href="admin.html#post" class="btn btn-gold btn-sm">+ Create Job Post</a><a href="admin.html" class="btn btn-outline btn-sm">Dashboard</a>' : '') +
          '<a href="profile.html" class="btn btn-outline btn-sm">My Profile</a>' +
          '<a href="#" class="btn btn-primary btn-sm js-logout">Logout</a>';
      } else {
        box.innerHTML = '<a href="login.html" class="btn btn-outline btn-sm">Login</a><a href="signup.html" class="btn btn-primary btn-sm">Sign Up</a>';
      }
    });
    document.querySelectorAll('.js-logout').forEach(function(b){
      b.addEventListener('click', function(e){
        e.preventDefault();
        sb.auth.signOut().then(function(){ window.location.href = 'index.html'; });
      });
    });
  }

  // Initial load: paint nav, and send logged-in people away from login/signup
  sb.auth.getSession().then(function(r){
    var session = r.data && r.data.session;
    paintNav(session);
    if(session && (page === 'login.html' || page === 'signup.html')){
      window.location.replace('index.html');
    }
  });

  sb.auth.onAuthStateChange(function(event, session){
    if(event === 'PASSWORD_RECOVERY' && location.pathname.indexOf('reset') === -1){
      window.location.href = 'reset.html' + location.hash;
      return;
    }
    if(event === 'SIGNED_OUT'){ paintNav(null); }
  });
})();
