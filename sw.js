/* Service worker : permet de rouvrir la page sans réseau.
   - En ligne (cas normal) : la page vient TOUJOURS du réseau, comme sans service worker (un rechargement récupère donc la dernière version).
     La copie gardée ne sert que si le réseau échoue (hors connexion).
   - Mode « Hors ligne » choisi dans l'application (drapeau « offline-flag » posé par la page) : copie gardée immédiatement, sans attendre le réseau
     (connexion faible) ; une nouvelle version est téléchargée en arrière-plan et la page en est prévenue.
   - Fichiers annexes (manifeste, icônes) : copie gardée immédiatement, rafraîchie en arrière-plan.
   Les appels à GitHub et aux sources d'infos (autres domaines) ne passent pas par ici. */
const CACHE = "livrotheque-shell-6", FLAGS = "livrotheque-flags";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png"];
const FLAG = () => new URL("offline-flag", self.registration.scope).href;
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && k !== FLAGS).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith(r.mode === "navigate" ? page(r, e) : assetFromCache(r, e));
});
const key = r => { const u = new URL(r.url); return u.origin + u.pathname };   // sans ?maj=… : une seule copie par page
async function page(r, e) {
  const c = await caches.open(CACHE);
  const flagged = !!(await caches.open(FLAGS).then(f => f.match(FLAG())));
  if (!flagged) {
    try {                                                              // normal : réseau d'abord, sans délai d'attente
      let res;                                                          // revalidation à chaque ouverture : une page publiée est vue sans attendre l'expiration du cache (10 min)
      try { res = await fetch(r.url, { cache: "no-cache" }) } catch (err) { res = await fetch(r) }
      if (res.ok) e.waitUntil(c.put(key(r), res.clone()).catch(() => {}));
      return res;
    } catch (err) {
      return (await c.match(key(r))) || Response.error();   // hors connexion : copie gardée
    }
  }
  const cached = await c.match(key(r));            // mode hors ligne choisi : copie gardée tout de suite
  const net = fetch(r).then(async res => { if (res.ok) await c.put(key(r), res.clone()); return res });
  if (!cached) return net;
  e.waitUntil(net.then(async res => {
    if (res.ok && res.headers.get("etag") !== cached.headers.get("etag")) for (const cl of await self.clients.matchAll()) cl.postMessage({ type: "update-ready" });
  }).catch(() => {}));
  return cached;
}
async function assetFromCache(r, e) {
  const c = await caches.open(CACHE);
  const cached = await c.match(key(r));
  const net = fetch(r).then(res => { if (res.ok) c.put(key(r), res.clone()); return res });
  if (!cached) return net;
  e.waitUntil(net.catch(() => {}));                                  // mise à jour en arrière-plan, sans retarder la réponse
  return cached;
}
