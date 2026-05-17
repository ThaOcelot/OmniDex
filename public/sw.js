const CACHE_NAME = 'omnidex-cache-v0.1.4-1778977300600';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './favicon.svg'
];

// Install Event - Precache dei file di base
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Ascolto messaggi per saltare l'attesa (aggiornamento forzato su richiesta)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Activate Event - Pulizia delle vecchie cache
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Stale-While-Revalidate)
self.addEventListener('fetch', (e) => {
  // Gestisci solo richieste HTTP/HTTPS locali (non chrome-extension, cordova, ecc.)
  if (!e.request.url.startsWith(self.location.origin)) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      const fetchPromise = fetch(e.request).then((networkResponse) => {
        // Se la risposta è valida, aggiorna la cache in background
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Gestione offline silenziosa
      });

      // Ritorna la risorsa in cache immediatamente (se presente) o aspetta la rete
      return cachedResponse || fetchPromise;
    })
  );
});
