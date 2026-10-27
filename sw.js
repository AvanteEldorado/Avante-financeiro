// Service worker do Portal Financeiro AVANTE — necessário para o celular
// "instalar" o portal como aplicativo. Só guarda a página principal para abrir
// mesmo sem internet; os dados continuam vindo sempre da planilha (as chamadas
// ao Google passam direto, nunca ficam guardadas aqui).
var CACHE = 'avante-portal-v1';

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(['./', './index.html']); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n !== CACHE; }).map(function (n) { return caches.delete(n); }));
  }));
  self.clients.claim();
});

// Página: busca sempre a versão nova na internet; sem internet, usa a guardada.
self.addEventListener('fetch', function (event) {
  if (event.request.mode !== 'navigate') return;
  event.respondWith(
    fetch(event.request).then(function (resp) {
      var copia = resp.clone();
      caches.open(CACHE).then(function (c) { c.put('./', copia); });
      return resp;
    }).catch(function () {
      return caches.match('./');
    })
  );
});
