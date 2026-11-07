// Serveur imitant GitHub Pages : préfixe /books-manager/, ETag + 304, max-age=600, Vary
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto"), { spawn } = require("child_process");
const ROOT = process.env.APP_DIR || path.join(__dirname, "..", ".."), PORT = 8766, CH = process.env.CH, P = "/books-manager/";
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png" };
let srv, hits = [], tag = "", delay = 0;
const handler = (req, res) => {
  let u = req.url.split("?")[0];
  if (u === "/books-manager") { res.writeHead(301, { Location: P }); return res.end() }
  if (!u.startsWith(P)) { res.writeHead(404); return res.end() }
  u = u.slice(P.length) || "index.html"; if (u.endsWith("/")) u += "index.html";
  const f = path.join(ROOT, u); hits.push(req.method + " " + req.url + (req.headers["if-none-match"] ? " (inm)" : "") + " cc=" + (req.headers["cache-control"] || "-"));
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end() }
  let b = fs.readFileSync(f); if (u === "index.html" && tag) b = Buffer.from(b.toString().replace("<title>Ma Livrothèque", "<title>Ma Livrothèque" + tag));
  const etag = '"' + crypto.createHash("md5").update(b).digest("hex") + '"';
  const send = () => {
    if (req.headers["if-none-match"] === etag) { res.writeHead(304, { ETag: etag, "Cache-Control": "max-age=600" }); return res.end() }
    res.writeHead(200, { "Content-Type": types[path.extname(f)] || "application/octet-stream", ETag: etag, "Cache-Control": "max-age=600", Vary: "Accept-Encoding" }); res.end(b) };
  delay ? setTimeout(send, delay) : send();
};
const start = () => new Promise(r => { srv = http.createServer(handler); srv.listen(PORT, "127.0.0.1", r) });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await start();
  const ch = spawn(CH, ["--no-sandbox", "--disable-gpu", "--remote-debugging-port=9334", "--user-data-dir=" + path.join(require("os").tmpdir(), "livrotheque-sw-chrome-profile"), "about:blank"], { stdio: "ignore" });
  let tgt; for (let i = 0; i < 50 && !tgt; i++) { await sleep(200); try { tgt = (await (await fetch("http://127.0.0.1:9334/json")).json()).find(t => t.type === "page") } catch (e) {} }
  const ws = new WebSocket(tgt.webSocketDebuggerUrl); await new Promise(r => ws.onopen = r);
  let id = 0; const pend = new Map(); ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id) } };
  const cmd = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) });
  const ev = async e => { const r = await cmd("Runtime.evaluate", { expression: e, awaitPromise: true, returnByValue: true }); return r.result.result && r.result.result.value };
  await cmd("Page.enable");
  const done = async () => { for (let i = 0; i < 100; i++) { await sleep(200); if (await ev("document.readyState") === "complete") break } };
  const nav = async () => { await cmd("Page.navigate", { url: `http://localhost:${PORT}${P}` }); await done() };
  const f5 = async () => { await cmd("Page.reload", { ignoreCache: false }); await done() };
  const ctrlF5 = async () => { await cmd("Page.reload", { ignoreCache: true }); await done() };
  const title = () => ev("document.title");
  const out = {};
  await nav(); await sleep(5000);   // enregistrement différé de 3 s après le chargement
  out["1_service_worker_après_5_s"] = await ev("navigator.serviceWorker.getRegistrations().then(r=>r.map(x=>(x.active&&x.active.state)||(x.installing&&x.installing.state)||(x.waiting&&x.waiting.state)).join())");
  out["1_copies_gardées"] = await ev("caches.keys().then(async ks=>{const r={};for(const k of ks){r[k.slice(0,26)]=(await (await caches.open(k)).keys()).map(x=>new URL(x.url).pathname).join(\" \")}return r})");
  await nav(); out["2_page_contrôlée_à_la_visite_suivante"] = await ev("!!navigator.serviceWorker.controller");
  tag = " v2"; hits = [];
  await cmd("Page.reload", { ignoreCache: false }); await done(); out["3_F5_après_publication_v2"] = { titre: await title(), requêtes: hits.length };
  out["3_copies_inchangées_après_F5"] = await ev("caches.keys().then(async ks=>{const r={};for(const k of ks){r[k.slice(0,26)]=(await (await caches.open(k)).keys()).length}return r})");
  delay = 3000; { const t0 = Date.now(); await cmd("Page.reload", { ignoreCache: false }); await done(); out["4_réseau_lent_3_s"] = { titre: await title(), attente_ms: Date.now() - t0 } } delay = 0;
  srv.closeAllConnections(); await new Promise(r => srv.close(r));
  await cmd("Page.reload", { ignoreCache: false }); await done();
  out["5_réseau_coupé_puis_F5"] = { titre: await title(), tableau_construit: await ev("!!document.getElementById(\"tbody\")") };
  console.log(JSON.stringify(out, null, 1));
  ch.kill(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1) });
