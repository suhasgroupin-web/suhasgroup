document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.menu-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () { links.classList.toggle('open'); });
  }

  // scroll reveal
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }

  // contact form -> mail app
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('cf-name').value.trim();
      var email = document.getElementById('cf-email').value.trim();
      var topic = document.getElementById('cf-topic').value;
      var message = document.getElementById('cf-message').value.trim();
      var subject = encodeURIComponent('[' + topic + '] Enquiry from ' + name);
      var body = encodeURIComponent(message + '\n\nName: ' + name + '\nReply to: ' + email);
      window.location.href = 'mailto:suhasgroup.in@gmail.com?subject=' + subject + '&body=' + body;
    });
  }
});

// PWA: register service worker + install prompt
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('sw.js').catch(function () {});
  });
}

/* ---------------------------------------------------------------
   SUHAS GROUP app shell: helpers, install card, mobile tab bar
   --------------------------------------------------------------- */
window.SG = window.SG || {};
SG.esc = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
};
SG.store = {
  get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked */ } },
  del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* storage blocked */ } }
};
SG.toast = function (msg, kind) {
  var t = document.getElementById('sg-toast');
  if (!t) { t = document.createElement('div'); t.id = 'sg-toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.className = 'toast ' + (kind || '');
  void t.offsetWidth; t.classList.add('show');
  clearTimeout(SG._tt); SG._tt = setTimeout(function () { t.classList.remove('show'); }, 3600);
};
SG.sheet = function (html) {
  var back = document.createElement('div'); back.className = 'sheet-back open';
  back.innerHTML = '<div class="sheet" role="dialog" aria-modal="true">' + html + '</div>';
  function close() { back.remove(); document.removeEventListener('keydown', onKey); }
  function onKey(e) { if (e.key === 'Escape') close(); }
  back.addEventListener('click', function (e) { if (e.target === back) close(); });
  back.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(back);
  return { el: back.firstChild, close: close };
};
SG.jobUrl = function (code) { return new URL('job.html?code=' + encodeURIComponent(code), location.href).href; };
SG.srcClass = function (src) {
  src = String(src || 'SUHAS GROUP').toLowerCase();
  return src === 'linkedin' ? 'src-linkedin' : src === 'bdjobs' ? 'src-bdjobs' : src === 'indeed' ? 'src-indeed' : src === 'suhas group' ? 'src-suhas' : 'src-other';
};
SG.daysLeft = function (deadline) {
  if (!deadline) return null;
  var d = new Date(deadline + 'T23:59:59'); if (isNaN(d)) return null;
  return Math.ceil((d - new Date()) / 86400000);
};
SG.nextAfterLogin = function () {
  var n = null;
  try { n = sessionStorage.getItem('sg_next'); sessionStorage.removeItem('sg_next'); } catch (e) { n = null; }
  return n && /^[a-z0-9_\-]+\.html(\?[\w=&%.\-]*)?$/i.test(n) ? n : 'profile.html';
};
SG.loginThenReturn = function () {
  try { sessionStorage.setItem('sg_next', (location.pathname.split('/').pop() || 'index.html') + location.search); } catch (e) { /* ignore */ }
  location.href = 'login.html';
};

/* install card (Android/desktop prompt, iOS instructions) */
(function () {
  var deferred = null, card = null;
  function dismissed() { var t = +SG.store.get('sg_install_dismissed') || 0; return Date.now() - t < 7 * 864e5; }
  function standalone() { return (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true; }
  function hide(remember) { if (card) { card.remove(); card = null; } if (remember) SG.store.set('sg_install_dismissed', String(Date.now())); }
  function show(kind) {
    if (card || dismissed() || standalone() || !document.body) return;
    card = document.createElement('div'); card.className = 'install-card';
    card.innerHTML = '<img src="assets/icon-192.png" alt=""><div class="t"><b>Install SUHAS GROUP app</b><small>' +
      (kind === 'ios' ? 'Tap Share, then &ldquo;Add to Home Screen&rdquo;' : 'Apply faster. Works like an app.') + '</small></div>' +
      (kind === 'ios' ? '' : '<button class="btn btn-gold btn-sm" type="button" data-i>Install</button>') +
      '<button class="x" type="button" aria-label="Dismiss" data-x>&times;</button>';
    document.body.appendChild(card);
    card.querySelector('[data-x]').addEventListener('click', function () { hide(true); });
    var ib = card.querySelector('[data-i]');
    if (ib) ib.addEventListener('click', async function () {
      if (!deferred) return;
      deferred.prompt();
      try { await deferred.userChoice; } catch (e) { /* ignore */ }
      deferred = null; hide(false);
    });
  }
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; show('prompt'); });
  window.addEventListener('appinstalled', function () { deferred = null; hide(false); SG.toast('App installed', 'ok'); });
  if (/iphone|ipad|ipod/i.test(navigator.userAgent) && /safari/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent)) {
    setTimeout(function () { show('ios'); }, 2500);
  }
})();

/* mobile bottom tab bar (shown on phones only) */
document.addEventListener('DOMContentLoaded', function () {
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  function ic(d) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + d + '</svg>'; }
  var nav = document.createElement('nav'); nav.className = 'tabbar'; nav.setAttribute('aria-label', 'App navigation');
  var tabs = [
    ['index.html', 'Home', page === 'index.html', ic('<path d="M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'), ''],
    ['jobs.html', 'Jobs', page === 'jobs.html' || page === 'job.html', ic('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>'), ''],
    ['barcode/', 'O5 Desk', false, ic('<path d="M4 5v14M7 5v14M11 5v14M14 5v14M18 5v14M21 5v14"/>'), 'desk'],
    ['login.html', 'Account', page === 'profile.html' || page === 'login.html' || page === 'signup.html', ic('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'), '']
  ];
  nav.innerHTML = tabs.map(function (t) {
    return '<a href="' + t[0] + '" class="' + (t[2] ? 'on ' : '') + t[4] + '"' + (t[1] === 'Account' ? ' id="sg-acct"' : '') + (t[2] ? ' aria-current="page"' : '') + '>' + t[3] + '<span>' + t[1] + '</span></a>';
  }).join('') + '<button type="button" id="sg-menu">' + ic('<path d="M4 7h16M4 12h16M4 17h16"/>') + '<span>Menu</span></button>';
  document.body.appendChild(nav); document.body.classList.add('has-tabbar');
  document.getElementById('sg-menu').addEventListener('click', function () {
    var l = document.querySelector('.nav-links'); if (l) l.classList.toggle('open');
  });
  if (window.sb && sb.auth) {
    sb.auth.getSession().then(function (r) {
      var a = document.getElementById('sg-acct');
      if (a && r.data && r.data.session) { a.href = 'profile.html'; a.querySelector('span').textContent = 'Profile'; }
    }).catch(function () { /* offline */ });
  }
});
