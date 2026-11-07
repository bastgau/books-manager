// Firefox (Gecko) piloté par geckodriver : mêmes scénarios que sous Chrome + indicateur « onglet occupé » (le cercle de chargement)
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto"), { spawn } = require("child_process");
const ROOT = process.env.APP_DIR || path.join(__dirname, "..", ".."), PORT = 8768, P = "/books-manager/", SWOFF = process.env.SWOFF === "1", GD = 4447;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png" };
let srv, tag = "", delay = 0, hits = [];
const handler = (req, res) => {
  let u = req.url.split("?")[0]; if (!u.startsWith(P)) { res.writeHead(404); return res.end() }
  u = u.slice(P.length) || "index.html"; const f = path.join(ROOT, u);
  hits.push(req.url.replace(P, "/"));
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end() }
  let b = fs.readFileSync(f); if (u === "index.html" && tag) b = Buffer.from(b.toString().replace("<title>Ma Livrothèque", "<title>Ma Livrothèque" + tag));
  const etag = '"' + crypto.createHash("md5").update(b).digest("hex") + '"';
  const send = () => { if (req.headers["if-none-match"] === etag) { res.writeHead(304, { ETag: etag, "Cache-Control": "max-age=600" }); return res.end() }
    res.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream", ETag: etag, "Cache-Control": "max-age=600", Vary: "Accept-Encoding" }); res.end(b) };
  delay && u === "index.html" ? setTimeout(send, delay) : send();
};
const start = () => new Promise(r => { srv = http.createServer(handler); srv.listen(PORT, "127.0.0.1", r) });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await start();
  const env = { ...process.env, MOZ_HEADLESS: "1", HOME: path.join(require("os").tmpdir(), "livrotheque-ff-home"), MOZ_DISABLE_CONTENT_SANDBOX: "1", MOZ_REMOTE_ALLOW_SYSTEM_ACCESS: "1",
    LD_LIBRARY_PATH: process.env.LD_LIBRARY_PATH || "" };
  const gd = spawn(process.env.GECKODRIVER || "geckodriver", ["--port", String(GD), "--binary", process.env.FIREFOX || "firefox"], { env, stdio: "ignore" });
  for (let i = 0; i < 50; i++) { await sleep(200); try { await fetch(`http://127.0.0.1:${GD}/status`); break } catch (e) {} }
  const wd = async (m, p, b) => { const r = await fetch(`http://127.0.0.1:${GD}${p}`, { method: m, headers: { "Content-Type": "application/json" }, body: b ? JSON.stringify(b) : undefined }); const j = await r.json(); if (j.value && j.value.error) throw new Error(j.value.error + ": " + String(j.value.message).slice(0, 160)); return j.value };
  const prefs = { "dom.serviceWorkers.enabled": !SWOFF, "dom.serviceWorkers.testing.enabled": true };
  const s = await wd("POST", "/session", { capabilities: { alwaysMatch: { browserName: "firefox", pageLoadStrategy: "normal", "moz:firefoxOptions": { args: ["-headless", "-profile", path.join(require("os").tmpdir(), "livrotheque-ff-profile")], prefs } } } });
  const sid = s.sessionId, S = p => `/session/${sid}${p}`;
  await wd("POST", S("/timeouts"), { pageLoad: 40000, script: 30000 });
  const js = async (code, args = []) => wd("POST", S("/execute/sync"), { script: code, args });
  const jsa = async code => wd("POST", S("/execute/async"), { script: "const done=arguments[arguments.length-1];(async()=>{" + code + "})().then(done,e=>done('ERR '+e))", args: [] });
  const chrome = async code => { await wd("POST", S("/moz/context"), { context: "chrome" }); try { return await js(code) } finally { await wd("POST", S("/moz/context"), { context: "content" }) } };
  const busy = () => chrome("return {busy: gBrowser.selectedTab.hasAttribute('busy'), loading: gBrowser.selectedBrowser.webProgress.isLoadingDocument}");
  const title = () => js("return document.title");
  const url = `http://localhost:${PORT}${P}`;
  // mesure : durée de la navigation (pilote) puis temps jusqu'à « onglet occupé = faux »
  const measure = async (label, action) => {
    const t0 = Date.now(); let err = "";
    try { await action() } catch (e) { err = String(e.message).slice(0, 80) }
    const tNav = Date.now() - t0; let tIdle = null, last = null;
    for (let i = 0; i < 40; i++) { last = await busy(); if (!last.busy && !last.loading) { tIdle = Date.now() - t0; break } await sleep(250) }
    const o = { navigation_ms: tNav, onglet_libre_après_ms: tIdle === null ? "JAMAIS (10 s)" : tIdle, occupé_fin: last, contrôlée_par_SW: await js("return !!navigator.serviceWorker.controller").catch(() => "?"), titre: err ? "(" + err + ")" : await title() };
    console.log(label.padEnd(44), JSON.stringify(o));
  };
  console.log(SWOFF ? "### SERVICE WORKERS DÉSACTIVÉS (équivalent navigation privée)" : "### SERVICE WORKER ACTIF (version publiée)");
  const nav = () => wd("POST", S("/url"), { url });
  await measure("1. première visite", nav);
  await sleep(6500);
  console.log("   service worker :", JSON.stringify(await jsa("const r=await navigator.serviceWorker.getRegistrations();return r.map(x=>(x.active&&x.active.state)||(x.installing&&x.installing.state)||'?').join()||'aucun'").catch(e => String(e.message).slice(0, 60))));
  await measure("2. ouverture suivante", nav);
  await measure("3. rechargement (F5 / glisser vers le bas)", () => wd("POST", S("/refresh"), {}));
  await measure("4. adresse inédite (?cccc)", () => wd("POST", S("/url"), { url: url + "?cccc" }));
  tag = " v2"; hits = [];
  await measure("5. F5 après publication d'une v2", () => wd("POST", S("/refresh"), {}));
  delay = 3000;
  await measure("6. F5 réseau lent (3 s)", () => wd("POST", S("/refresh"), {})); delay = 0;
  await measure("7. F5 de nouveau", () => wd("POST", S("/refresh"), {}));
  console.log("   avant coupure :", JSON.stringify(await jsa("const ks=await caches.keys();const o={controller:!!navigator.serviceWorker.controller,copies:{}};for(const k of ks){o.copies[k.slice(0,30)]=(await (await caches.open(k)).keys()).map(x=>x.url)};const m=await caches.match(location.origin+location.pathname);o.match_page=!!m;return o")));
  srv.closeAllConnections(); await new Promise(r => srv.close(r));
  await measure("8. réseau coupé puis F5", () => wd("POST", S("/refresh"), {}));
  await wd("DELETE", S("")).catch(() => {}); gd.kill(); process.exit(0);
})().catch(e => { console.error("ERREUR", e); process.exit(1) });
