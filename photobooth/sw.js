var CACHE_NAME = 'grinzy-beta-1.7';
var ASSETS = [
  'index.html',
  'dl.html',
  'print.html',
  'manifest.json'
];

self.addEventListener('install', function(event){
  /* Activate this new SW immediately, don't wait */
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache){return cache.addAll(ASSETS)})
      .catch(function(){})
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      /* Delete ALL old caches */
      return Promise.all(keys.map(function(k){
        if(k!==CACHE_NAME){return caches.delete(k)}
      }));
    }).then(function(){
      return self.clients.claim();
    }).then(function(){
      /* Tell all open pages to reload with the fresh version */
      return self.clients.matchAll({type:'window'}).then(function(clients){
        for(var i=0;i<clients.length;i++){
          clients[i].postMessage({type:'SW_UPDATED'});
        }
      });
    }).catch(function(){})
  );
});

self.addEventListener('fetch', function(event){
  var req = event.request;
  /* Never intercept uploads (Cloudinary POST) or other non-GET requests */
  if(req.method !== 'GET'){return;}
  /* Network-first for navigation + the app's own HTML/JS/JSON (e.g. templates/templates.json) */
  if(req.mode === 'navigate' || /\.(html|js|json)(\?|$)/.test(req.url)){
    event.respondWith(
      fetch(req).then(function(response){
        if(response && response.status === 200){
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache){cache.put(req, clone)});
        }
        return response;
      }).catch(function(){
        return caches.match(req).then(function(cached){
          return cached || caches.match('index.html');
        });
      })
    );
    return;
  }
  /* Cache-first for everything else (icons, etc.) */
  event.respondWith(
    caches.match(req).then(function(cached){
      return cached || fetch(req).then(function(response){
        if(response && response.status === 200){
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache){cache.put(req, clone)});
        }
        return response;
      });
    }).catch(function(){})
  );
});
