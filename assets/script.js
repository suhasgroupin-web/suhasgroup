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

(function () {
  var deferredPrompt = null;
  var btn = null;

  function makeButton() {
    var b = document.createElement('button');
    b.textContent = 'Install App';
    b.className = 'btn btn-gold btn-sm';
    b.style.position = 'fixed';
    b.style.right = '16px';
    b.style.bottom = '16px';
    b.style.zIndex = '999';
    b.style.boxShadow = '0 14px 30px rgba(0,0,0,.3)';
    b.addEventListener('click', async function () {
      if (!deferredPrompt) return;
      b.style.display = 'none';
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
    });
    document.body.appendChild(b);
    return b;
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (!btn) btn = makeButton();
    btn.style.display = 'inline-flex';
  });

  window.addEventListener('appinstalled', function () {
    if (btn) btn.style.display = 'none';
    deferredPrompt = null;
  });
})();
