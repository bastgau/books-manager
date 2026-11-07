/* Service worker : permet de rouvrir la page sans réseau (ou avec un réseau très lent).
   - La page (navigation) : réseau d'abord ; au bout de 3 s ou en cas d'échec, copie gardée. Une nouvelle version publiée est prise dès qu'elle est joignable.
   - Les fichiers annexes (manifeste, icônes) : copie gardée immédiatement, rafraîchie en arrière-plan. Aucune attente du réseau : sinon le chargement
     semblerait ne jamais finir sur une connexion lente.
   Les appels à GitHub et aux sources d'infos (autres domaines) ne passent pas par ici. */
const CACHE = "livrotheque-shell-2";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(r.mode === "navigate" ? pageFirstNet(r) : assetFromCache(r, e));
});
async function pageFirstNet(r) {
  const c = await caches.open(CACHE);
  const net = fetch(new Request(r, { cache: "no-cache" })).then(res => { if (res.ok) c.put(r, res.clone()); return res });
  const cached = await c.match(r, { ignoreSearch: true });
  if (!cached) return net;                                            // rien en réserve : on attend le réseau
  return Promise.race([
    net.then(res => (res.ok || res.type === "opaqueredirect") ? res : cached, () => cached),
    new Promise(ok => setTimeout(() => ok(cached), 3000)),
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
