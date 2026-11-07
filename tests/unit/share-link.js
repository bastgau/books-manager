// Node tests: share link encryption (format, round trip, wrong password, iteration count, links made before the change)
const fs = require("fs");
const html = fs.readFileSync(process.env.APP || require("path").join(__dirname, "..", "..", "index.html"), "utf8");
const js = html.split("<script>")[1].split("</script>")[0];
// share-link block: from the base64url helpers to the line before fmtDT (pure functions, no DOM)
const block = js.slice(js.indexOf("const b64u="), js.indexOf("const fmtDT="));
const api = new Function(block + "\nreturn {sealCfg,unsealCfg,b64u,unb64u,KDF_ITER,SHARE_MIN};")();
const { sealCfg, unsealCfg, b64u, KDF_ITER, SHARE_MIN } = api;
let ok = 0, ko = 0; const t = (n, c, d = "") => { c ? ok++ : ko++; console.log((c ? "✔ " : "✘ ") + n + (d ? "  — " + d : "")) };
const rejects = p => p.then(() => false, () => true);
// encrypts like the code before the change: "e." prefix, PBKDF2-SHA256 with the given iteration count
async function sealWith(prefix, iterations, obj, pass) {
  const salt = crypto.getRandomValues(new Uint8Array(16)), iv = crypto.getRandomValues(new Uint8Array(12));
  const km = await crypto.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
  const k = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations, hash: "SHA-256" }, km, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k, new TextEncoder().encode(JSON.stringify(obj))));
  return prefix + "." + b64u(salt) + "." + b64u(iv) + "." + b64u(ct);
}
(async () => {
  const cfg = { v: 1, repo: "demo/depot", token: "FAUX", lib: "11111111-2222-4333-8444-555555555555", exp: Date.now() + 3600000 };
  t("mot de passe minimum : 12 caractères", SHARE_MIN === 12, String(SHARE_MIN));
  const t0 = Date.now(), link = await sealCfg(cfg, "assez-long-12"), ms = Date.now() - t0;
  t("nouveau lien au format e2 (4 parties)", link.startsWith("e2.") && link.split(".").length === 4, "chiffrement en " + ms + " ms");
  const back = await unsealCfg(link, () => "assez-long-12");
  t("aller-retour avec le bon mot de passe", back.repo === cfg.repo && back.token === cfg.token && back.lib === cfg.lib);
  t("mauvais mot de passe : refusé", await rejects(unsealCfg(link, () => "assez-long-13")));
  t("600 000 itérations (une clé dérivée en 200 000 ne déchiffre pas un lien e2)", KDF_ITER.e2 === 600000 && await rejects(unsealCfg("e." + link.slice(3), () => "assez-long-12")));
  const old = await sealWith("e", 200000, cfg, "ancien");
  t("ancien lien (e, 200 000 itérations) toujours lisible", (await unsealCfg(old, () => "ancien")).lib === cfg.lib);
  t("format inconnu : refusé", await rejects(unsealCfg("e3." + link.slice(3), () => "assez-long-12")) && await rejects(unsealCfg(btoa(JSON.stringify(cfg)), () => "x")));
  t("mot de passe absent : refusé", await rejects(unsealCfg(link, () => "")));
  console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
})();
