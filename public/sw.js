// KILL SWITCH per il vecchio Service Worker
// Questo script elimina tutte le cache vecchie e disinstalla il Service Worker
// permettendo al nuovo sistema version.json di funzionare correttamente senza interferenze.

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map(key => caches.delete(key)));
    })
    .then(() => self.registration.unregister())
    .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Non intercettare più nulla, lascia fare tutto alla rete
});
