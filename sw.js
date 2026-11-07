/* Service worker minimal : sert uniquement à rouvrir la page quand le réseau est coupé.
   - En ligne : la page vient du réseau, exactement comme sans service worker (aucune copie, aucune tâche en arrière-plan).
   - Réseau coupé : copie de la page gardée à l'installation.
   - Tout le reste (GitHub, sources d'infos, manifeste, icônes) n'est pas intercepté.
   L'installation se refait quand ce fichier change : le repère BUILD ci-dessous est mis à jour à chaque publication de l'application. */
const BUILD = "2026-11-07T15:45:07Z";
const CACHE = "livrotheque-shell-" + BUILD;
const SHELL = ["./", "index.html"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))));
self.addEventListener("fetch", e => {
  if (e.request.mode !== "navigate") return;
  e.respondWith(fetch(e.request).catch(async () => {
    const u = new URL(e.request.url);
    return (await caches.match(u.origin + u.pathname)) || Response.error();
  }));
});
