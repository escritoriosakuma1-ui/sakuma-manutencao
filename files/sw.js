/* Service Worker — Checklist de Manutenção SAKUMA Agronegócios
   Guarda o aplicativo no aparelho para funcionar sem internet.
   Ao publicar uma versão nova do index.html, troque o número do CACHE
   (v1 -> v2) para que os aparelhos baixem a atualização. */
const CACHE = "sakuma-checklist-v1";
const ARQUIVOS = [
  "./", "./index.html", "./manifest.json",
  "./icone-192.png", "./icone-512.png", "./icone-maskable-512.png", "./apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cacheado =>
      cacheado || fetch(e.request).then(resp => {
        const copia = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copia)).catch(() => {});
        return resp;
      }).catch(() => caches.match("./index.html"))
    )
  );
});
