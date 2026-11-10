const RELEASE_VERSION = new URL(self.location.href).searchParams.get('v') || 'v96';
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
