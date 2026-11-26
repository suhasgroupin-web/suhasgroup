const RELEASE_VERSION = new URL(self.location.href).searchParams.get('v') || 'v127';
const CACHE = 'suhas-group-app-' + RELEASE_VERSION;
const CORE = [
  'index.html','home.html','social.html','ai.html','messenger.html','messenger.js','messenger.css','jobs.html','job.html','group.html','about.html','employers.html','contact.html',
  'login.html','signup.html','main-menu.html','profile.html','member-tools.html','member-page.html','reset.html','app.html','edit-suhas.html','hrm.html','admin.html','ai.html','technical.html','quality.html','departments.html','measurement-studio.html','apply-for-job.html','o5-desk.html','related-apk.html','suhas-calculator.html','o5-calculator.html','o5-all-in-one.html','o5-barcode.html','factories.html','factory-profile.html','job-portals.html','resume-builder.html','privacy-policy.html','religion.html','suhas-group-logo.webp','assets/suhas-group-logo.webp','assets/suhas-group-3d.svg',
  'assets/styles.css','assets/welcome-onboarding.js','assets/ambient-scenes/manifest.json','assets/suhas-max-composer-v1.css','assets/suhas-max-fb-mobile-v1.css','assets/suhas-max-bottom-nav-locked-v1.css','assets/script.js','assets/auth.js','assets/display-mode.js','assets/config.js','assets/hrm.js','assets/update-manager.js','release.json','assets/icons/o5-international-logo.svg',
  'barcode/index.html','assets/suhas-max-app-icon.svg','assets/suhas-max-icon-192.png','assets/suhas-max-icon-512.png','manifest.json','download.html'
];

var OFFLINE_HTML = '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0A2A66"><title>SUHAS GROUP</title></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a2a66;font-family:Arial,sans-serif;padding:20px;box-sizing:border-box"><div style="max-width:360px;width:100%;background:#fff;color:#152b4b;border-radius:18px;padding:26px 22px;text-align:center"><h2 style="margin:0 0 8px;color:#0a2a66">SUHAS GROUP</h2><p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#52627b">No connection right now. Please check your internet and try again.</p><button onclick="location.reload()" style="width:100%;padding:13px;border:0;border-radius:10px;background:#1877f2;color:#fff;font-size:15px;font-weight:700">Try again</button></div></body></html>';

function offlineResponse(request){
  if (request && request.mode === 'navigate') {
    return new Response(OFFLINE_HTML, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
  }
  return Response.error();
}

async function cachedOrOffline(request, options){
  try {
    var cache = await caches.open(CACHE);
    var hit = await cache.match(request, options);
    if (hit) return hit;
  } catch (err) {}
  return offlineResponse(request);
}

// The Supabase library lives on a public CDN. Keep a copy so the app still opens when that CDN is slow or blocked.
function isSupabaseLibrary(url){
  return /^https:\/\/(cdn\.jsdelivr\.net|unpkg\.com)\/.*supabase-js/i.test(url);
}

self.addEventListener('install', function(e){
  // Releases flagged "mandatory" in release.json activate immediately so a broken version never stays installed.
  // Other releases wait until the member explicitly chooses Install.
  e.waitUntil(fetch('release.json', { cache: 'no-store' }).then(function(r){ return r.ok ? r.json() : null; }).then(function(info){ if (info && info.mandatory === true) return self.skipWaiting(); }).catch(function(){}));
  e.waitUntil(caches.open(CACHE).then(function(c){ return Promise.all(CORE.map(function(path){ return c.add(path).catch(function(err){ console.warn('SUHAS GROUP optional cache skipped:', path, err); return null; }); })); }));
});

self.addEventListener('message', function(e){
  if(e.data && e.data.type === 'SUHAS_SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;
  if (e.request.method !== 'GET') return;
  if (isSupabaseLibrary(url)) {
    e.respondWith(caches.open(CACHE).then(async function(cache){
      var cached = await cache.match(e.request);
      var network = fetch(e.request).then(function(response){
        if (response && (response.ok || response.type === 'opaque')) { cache.put(e.request, response.clone()).catch(function(){}); }
        return response;
      }).catch(function(){ return null; });
      if (cached) { e.waitUntil(network); return cached; }
      var fresh = await network;
      return fresh || Response.error();
    }));
    return;
  }
  // Never cache Supabase API/auth calls or privileged pages.
  if (url.indexOf('supabase.co') > -1 || url.indexOf('admin.html') > -1 || url.indexOf('edit-suhas.html') > -1) return;
  var requestUrl = new URL(url);
  if (requestUrl.origin !== self.location.origin) return;

  // Versioned CSS and JavaScript must never be served from an older query-string variant.
  // Fetch current assets first so a refresh cannot mix the latest HTML with stale styling or behavior.
  if (/\.(?:css|js)$/i.test(requestUrl.pathname)) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }).then(async function(response) {
      if (response && response.ok) {
        var assetCache = await caches.open(CACHE);
        await assetCache.put(e.request, response.clone());
      }
      return response;
    }).catch(async function() {
      return cachedOrOffline(e.request);
    }));
    return;
  }

  // Page refreshes must stay on the exact requested URL and fetch the latest HTML.
  // If the network is unavailable, fall back only to that same page (never index.html).
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request, { cache: 'no-store' }).then(async function(response) {
      if (response && response.ok) {
        var pageCache = await caches.open(CACHE);
        await pageCache.put(e.request, response.clone());
      }
      return response;
    }).catch(async function() {
      return cachedOrOffline(e.request);
    }));
    return;
  }

  // Messenger assets use network-first so merged UI fixes cannot remain trapped in an old PWA cache.
  if (requestUrl.pathname.endsWith('/messenger.html') || requestUrl.pathname.endsWith('/messenger.js') || requestUrl.pathname.endsWith('/messenger.css')) {
    e.respondWith(fetch(e.request, { cache: 'no-store' }).then(async function(response) {
      if (response && response.ok) {
        var messengerCache = await caches.open(CACHE);
        await messengerCache.put(e.request, response.clone());
      }
      return response;
    }).catch(async function() {
      return cachedOrOffline(e.request, { ignoreSearch: true });
    }));
    return;
  }

  // Release metadata must always be refreshed from the network so clients can detect new versions.
  if (requestUrl.pathname.endsWith('/release.json') || requestUrl.pathname === '/release.json') {
    e.respondWith(fetch(e.request, { cache: 'no-store' }).then(async function(response) {
      if (response && response.ok) {
        var cache = await caches.open(CACHE);
        await cache.put(e.request, response.clone());
      }
      return response;
    }).catch(async function() {
      return cachedOrOffline(e.request, { ignoreSearch: true });
    }));
    return;
  }

  // Keep the currently installed app version until the member installs a waiting worker.
  e.respondWith(
    caches.open(CACHE).then(async function(cache){
      var cached = await cache.match(e.request, { ignoreSearch: true });
      if (cached) return cached;
      try {
        var response = await fetch(e.request);
        if (response && response.ok) await cache.put(e.request, response.clone());
        return response;
      } catch (error) {
        return e.request.mode === 'navigate' ? ((await cache.match('index.html', { ignoreSearch: true })) || offlineResponse(e.request)) : Response.error();
      }
    })
  );
});


// SUHAS GROUP Web Push: display notifications even when the app tab is not open.
self.addEventListener('push', function(event){
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (_) { data = { body: event.data ? event.data.text() : 'You have a new SUHAS GROUP notification.' }; }
  const title = data.title || 'SUHAS GROUP';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: data.icon || '/assets/logo.png',
    badge: data.badge || '/assets/logo.png',
    tag: data.tag || ('suhas-' + (data.kind || 'activity')),
    renotify: true,
    data: { url: data.url || '/social.html', notificationId: data.notificationId || null },
    timestamp: data.timestamp || Date.now()
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event){
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || '/social.html', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windows){
    for (const client of windows) {
      if (client.url === target && 'focus' in client) return client.focus();
    }
    if (self.clients.openWindow) return self.clients.openWindow(target);
  }));
});
