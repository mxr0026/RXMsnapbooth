var CACHE_NAME = 'snapbooth-v3';
var ASSETS = [
  'index.html',
  'dl.html',
  'manifest.json'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache){return cache.addAll(ASSETS)})
      .then(function(){return self.skipWaiting()})
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){return k!==CACHE_NAME}).map(function(k){return caches.delete(k)}));
    }).then(function(){return self.clients.claim()})
  );
});

self.addEventListener('fetch', function(event){
  event.respondWith(
    caches.match(event.request)
      .then(function(cached){
        return cached || fetch(event.request)
          .then(function(response){
            if(response.status===200){
              var clone=response.clone();
              caches.open(CACHE_NAME).then(function(cache){cache.put(event.request,clone)});
            }
            return response;
          });
      })
      .catch(function(){
        if(event.request.mode==='navigate'){
          return caches.match('index.html');
        }
      })
  );
});
