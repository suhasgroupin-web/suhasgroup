const RELEASE_VERSION = new URL(self.location.href).searchParams.get('v') || 'v103';
const CACHE = 'suhas-max-secure-entry-' + RELEASE_VERSION;
const CORE = [
  'index.html','social.html','jobs.html','job.html','group.html','about.html','employers.html','contact.html',
  'login.html','signup.html','profile.html','member-tools.html','member-page.html','reset.html','app.html','edit-suhas.html','hrm.html','admin.html','ai.html','technical.html','quality.html','departments.html','measurement-studio.html','apply-for-job.html','o5-desk.html','related-apk.html','suhas-calculator.html','o5-calculator.html','o5-all-in-one.html','o5-barcode.html','factories.html','factory-profile.html','job-portals.html','privacy-policy.html','religion.html','suhas-group-logo.webp','assets/suhas-group-logo.webp','assets/suhas-group-3d.svg',
  'assets/styles.css','assets/suhas-max-composer-v1.css','assets/script.js','assets/auth.js','assets/display-mode.js','assets/config.js','assets/hrm.js','assets/update-manager.js','release.json','assets/icons/o5-international-logo.svg',
  'barcode/','assets/logo.png','assets/icon-192.png','assets/icon-512.png','manifest.json'
];

self.addEventListener('install', function(e){
  // Updated workers wait until the member chooses Install update.
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }));
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
  // Never cache Supabase API/auth calls or privileged pages.
  if (url.indexOf('supabase.co') > -1 || url.indexOf('admin.html') > -1 || url.indexOf('edit-suhas.html') > -1) return;
  var requestUrl = new URL(url);
  if (requestUrl.origin !== self.location.origin) return;

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
      return (await caches.open(CACHE)).match(e.request) || Response.error();
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
      return (await caches.open(CACHE)).match(e.request, { ignoreSearch: true }) || Response.error();
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
        return (await cache.match('index.html', { ignoreSearch: true })) || Response.error();
      }
    })
  );
});


// SUHAS-MAX Web Push: display notifications even when the app tab is not open.
self.addEventListener('push', function(event){
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (_) { data = { body: event.data ? event.data.text() : 'You have a new SUHAS-MAX notification.' }; }
  const title = data.title || 'SUHAS-MAX';
  const options = {
    body: data.body || 'You have a new notification.',
    icon: data.icon || '/assets/icon-192.png',
    badge: data.badge || '/assets/icon-192.png',
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
