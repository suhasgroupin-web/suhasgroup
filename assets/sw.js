const CACHE = 'suhas-group-v1';
const CORE = [
  'index.html','jobs.html','group.html','about.html','employers.html','contact.html',
  'login.html','signup.html','profile.html','reset.html',
  'assets/styles.css','assets/script.js','assets/auth.js','assets/config.js',
  'assets/logo.png','assets/icon-192.png','assets/icon-512.png','manifest.json'
];

self.addEventListener('install', function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }));
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
  // Never cache Supabase API/auth calls or admin page - always fresh
  if (url.indexOf('supabase.co') > -1 || url.indexOf('admin.html') > -1) {
    return;
  }
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request).then(function(res){
      var copy = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      return res;
    }).catch(function(){
      return caches.match(e.request).then(function(cached){ return cached || caches.match('index.html'); });
    })
  );
});
