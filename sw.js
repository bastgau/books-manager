/* Service worker : permet de rouvrir la page sans réseau (ou avec un réseau très lent).
   - La page (navigation) : réseau d'abord ; au bout de 3 s ou en cas d'échec, copie gardée. Une nouvelle version publiée est prise dès qu'elle est joignable.
   - Les fichiers annexes (manifeste, icônes) : copie gardée immédiatement, rafraîchie en arrière-plan. Aucune attente du réseau : sinon le chargement
     semblerait ne jamais finir sur une connexion lente.
   Les appels à GitHub et aux sources d'infos (autres domaines) ne passent pas par ici. */
const CACHE = "livrotheque-shell-3";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(r.mode === "navigate" ? pageFirstNet(r, e) : assetFromCache(r, e));
});
/* Si la copie gardée est servie (réseau lent), la mise à jour continue sous waitUntil : sans cela le navigateur peut arrêter le service worker
   avant la fin du téléchargement et la page resterait pour toujours dans l'ancienne version. La page est prévenue quand la nouvelle est prête. */
async function pageFirstNet(r, e) {
  const c = await caches.open(CACHE);
  const cached = await c.match(r, { ignoreSearch: true });
  let servedCached = false;
  const net = fetch(new Request(r, { cache: "no-cache" })).then(async res => { if (res.ok) await c.put(r, res.clone()); return res });
  e.waitUntil(net.then(async res => {
    if (servedCached && res.ok && cached && res.headers.get("etag") !== cached.headers.get("etag")) {
      for (const cl of await self.clients.matchAll()) cl.postMessage({ type: "update-ready" });
    }
  }).catch(() => {}));
  if (!cached) return net;                                            // rien en réserve : on attend le réseau
  return Promise.race([
    net.then(res => (res.ok || res.type === "opaqueredirect") ? res : (servedCached = true, cached), () => (servedCached = true, cached)),
    new Promise(ok => setTimeout(() => { servedCached = true; ok(cached) }, 3000)),
  ]);
}
async function assetFromCache(r, e) {
  const c = await caches.open(CACHE);
  const cached = await c.match(r, { ignoreSearch: true });
  const net = fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res });
  if (!cached) return net;
  e.waitUntil(net.catch(() => {}));                                  // mise à jour en arrière-plan, sans retarder la réponse
  return cached;
}
