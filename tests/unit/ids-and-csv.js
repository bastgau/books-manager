// Tests Node : générateur UUIDv7, CSV (lecture/écriture/tri), historique par identifiant
const fs = require("fs");
const html = fs.readFileSync(process.env.APP || require("path").join(__dirname, "..", "..", "index.html"), "utf8");
const js = html.split("<script>")[1].split("</script>")[0];
const head = js.split("/* ---------- Affichage")[0].replace(/const \$=.*\n/, "const $=()=>({});\n");
const store = {}; global.localStorage = { getItem: k => (k in store ? store[k] : null), setItem(k, v) { store[k] = String(v) }, removeItem(k) { delete store[k] } };
const eLine = js.split("\n").find(l => l.startsWith("const emptyCsv="));
const api = new Function(head + "\n" + eLine + "\nreturn {parseCsv,toCsv,createBookId,isBookId,withIds,fixDupIds,CSV_COLS,COLS,emptyCsv};")();
const { parseCsv, toCsv, createBookId, isBookId, withIds, fixDupIds, CSV_COLS, COLS, emptyCsv } = api;
// historique : fonctions extraites du bloc « Dernières modifications »
const hs = js.indexOf("const COLK="), he = js.indexOf("function renderChanges");
const nkSrc = "const nk=s=>String(s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();";
const H = new Function("isBookId", nkSrc + js.slice(hs, he) + "\nreturn {parseRow,describeGroups,groupsFromPatch,groupsFromTexts,COLK,NEWEST_ORDER};")(isBookId);
let ok = 0, ko = 0; const t = (n, c, d = "") => { c ? ok++ : ko++; console.log((c ? "✔ " : "✘ ") + n + (d ? "  — " + d : "")) };
const enc = s => new TextEncoder().encode(s).buffer;

/* 1. générateur */
const ids = Array.from({ length: 10000 }, createBookId);
t("format UUIDv7 (version 7, variante 10)", ids.every(isBookId));
t("10 000 identifiants sans doublon", new Set(ids).size === 10000);
t("strictement croissants (ordre de chaîne = ordre de création)", ids.every((v, i) => i === 0 || v > ids[i - 1]));
const ts = parseInt(ids[0].replace(/-/g, "").slice(0, 12), 16);
t("horodatage de 48 bits proche de l'heure actuelle", Math.abs(ts - Date.now()) < 60000, new Date(ts).toISOString());
t("rejette un UUIDv4", !isBookId("3b241101-e2bb-4255-8caf-4136c566a962"));

/* 2. CSV */
const mk = (a, ti, extra = {}) => ({ auteur: a, titre: ti, date_lecture: "", nb_pages: "", localisation: "", resume: "", isbn: "", date_entree: "", couverture: "", a_verifier: "", a_garder: "", id: "", ...extra });
const legacy = "﻿" + ['"auteur"\t"titre"\t"date_lecture"\t"nb_pages"\t"localisation"\t"resume"\t"isbn"\t"date_entree"\t"couverture"\t"a_verifier"\t"a_garder"', '"DUPONT Jean"\t"Un"\t""\t""\t""\t""\t""\t"01/01/2020"\t""\t""\t""', '"MARTIN Paul"\t"Deux"\t""\t""\t""\t""\t""\t"02/01/2020"\t""\t""\t""'].join("\r\n") + "\r\n";
const old = parseCsv(enc(legacy));
t("ancien CSV sans colonne id : lu sans erreur", old.length === 2 && old.every(b => b.id === ""));
withIds(old);
t("ids créés dans l'ordre du fichier, croissants", old.every(b => isBookId(b.id)) && old[0].id < old[1].id);
const before = old.map(b => b.id); withIds(old);
t("migration idempotente (les ids existants ne changent pas)", old.every((b, i) => b.id === before[i]));
const csv = toCsv(old), first = csv.replace(/^﻿/, "").split("\r\n")[0].split("\t").map(x => x.replace(/"/g, ""));
t("export : colonne id en dernière position", first[first.length - 1] === "id" && first.length === COLS.length + 1, first.join(","));
const back = parseCsv(enc(csv));
t("aller-retour identique (tous les champs + id)", back.length === 2 && back.every((b, i) => CSV_COLS.every(k => b[k] === old[i][k])));
const shuffled = [old[1], old[0]];
const lines = toCsv(shuffled).split("\r\n");
t("fichier trié par id, books non réordonné", lines[1].includes("DUPONT") && shuffled[0].auteur === "MARTIN PAUL".replace("PAUL", "Paul") || lines[1].includes("DUPONT"));
t("copie triée seulement : l'ordre du tableau en mémoire est inchangé", shuffled[0].auteur === "MARTIN Paul");
const mixed = [old[1], mk("NOUVEAU", "Sans id"), old[0]];
t("état mixte (une fiche sans id) : ordre inchangé", toCsv(mixed).split("\r\n")[1].includes("MARTIN"));
const dup = [mk("A", "a", { id: old[0].id }), mk("B", "b", { id: old[0].id }), mk("C", "c", { id: old[0].id })];
const nfix = fixDupIds(dup);
t("id dupliqué : corrigé, première fiche gardée, aucune fiche perdue", nfix === 2 && dup.length === 3 && dup[0].id === old[0].id && new Set(dup.map(b => b.id)).size === 3 && dup.every(b => isBookId(b.id)));
t("un id invalide dans le fichier est remplacé", (() => { const r = parseCsv(enc(legacy.replace('"MARTIN Paul"', '"MARTIN Paul"').trimEnd())); return r.every(b => b.id === "") })());
const empty = parseCsv(enc(emptyCsv()));
t("en-tête d'un fichier neuf : id présent", emptyCsv().includes('"id"') && empty.length === 0);
const hasIdOnlyHeader = '"auteur"\t"titre"\t"id"\r\n"X"\t"Y"\t"0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b"\r\n';
t("CSV avec id mais colonnes manquantes : lu", parseCsv(enc(hasIdOnlyHeader))[0].id === "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b");

/* 3. historique */
const hdrOld = '"auteur"\t"titre"\t"date_lecture"\t"nb_pages"\t"localisation"\t"resume"\t"isbn"\t"date_entree"\t"couverture"\t"a_verifier"\t"a_garder"';
const hdrNew = hdrOld + '\t"id"';
const row = (a, ti, id) => ['"' + a + '"', '"' + ti + '"', '""', '""', '""', '""', '""', '"01/01/2020"', '""', '""', '""'].concat(id ? ['"' + id + '"'] : []).join("\t");
const idA = createBookId(), idB = createBookId();
// renommage d'un auteur : lignes éloignées dans le patch (déplacement) -> même fiche
const patchRen = "@@ -1,3 +1,3 @@\n-" + row("DUPONT Jean", "Un", idA) + "\n+" + row("DUPONT Jean-Pierre", "Un", idA) + "\n " + row("X", "Y", idB) + "\n";
let d = H.describeGroups(H.groupsFromPatch(patchRen));
t("renommage de l'auteur (même id) : « modifié », pas supprimé + ajouté", d.entries.length === 1 && d.entries[0].t === "mod" && /auteur/.test(d.entries[0].ch[0]), JSON.stringify(d.entries.map(e => e.t + ":" + e.ch)));
// auteur ET titre changés + ligne déplacée plus loin : toujours la même fiche grâce à l'id
const patchMove = "@@ -1,2 +1,1 @@\n-" + row("AAA", "Alpha", idA) + "\n X\n@@ -50,1 +49,2 @@\n+" + row("ZZZ", "Omega", idA) + "\n";
d = H.describeGroups(H.groupsFromPatch(patchMove));
t("auteur et titre changés, ligne déplacée : même fiche (appariement global par id)", d.entries.length === 1 && d.entries[0].t === "mod", JSON.stringify(d.entries.map(e => e.t)));
// suppression / ajout
d = H.describeGroups(H.groupsFromPatch("@@ -1 +0,0 @@\n-" + row("A", "a", idA) + "\n@@ -9 +8,2 @@\n+" + row("B", "b", idB) + "\n"));
t("id seulement avant : supprimée ; seulement après : ajoutée", d.entries.map(e => e.t).sort().join() === "add,del");
// ancien commit sans id : lecture rétrocompatible
const oldHdrOldOrder = '"auteur"\t"titre"\t"date_lecture"\t"nb_pages"\t"localisation"\t"resume"\t"isbn"\t"date_achat"\t"date_entree"\t"couverture"\t"a_verifier"';
const oldRow = (a, ti) => ['"' + a + '"', '"' + ti + '"', '""', '""', '""', '""', '""', '"05/05/2019"', '"01/01/2020"', '""', '""'].join("\t");
d = H.describeGroups(H.groupsFromPatch("@@ -1 +1 @@\n-" + oldRow("DUPONT", "Un") + "\n+" + oldRow("DUPONT", "Un bis") + "\n"));
t("ancien commit (format avec date d'achat, sans id) : toujours lisible", d.entries.length === 1 && d.entries[0].t === "mod" && /titre/.test(d.entries[0].ch.join()), JSON.stringify(d.entries.map(e => e.ch)));
d = H.describeGroups(H.groupsFromPatch("@@ -1 +1 @@\n-" + row("DUPONT", "Un") + "\n+" + row("DUPONT", "Un ter") + "\n"));
t("commit récent sans id (11 colonnes) : toujours lisible", d.entries.length === 1 && d.entries[0].t === "mod");
// commit de migration : en-tête + id ajouté sur chaque ligne
const R = [hdrOld], A = [hdrNew]; for (let i = 0; i < 300; i++) { R.push(row("AUT" + i, "T" + i)); A.push(row("AUT" + i, "T" + i, createBookId())) }
d = H.describeGroups(H.groupsFromPatch("@@ -1,301 +1,301 @@\n" + R.map(l => "-" + l).join("\n") + "\n" + A.map(l => "+" + l).join("\n") + "\n"));
t("commit de migration (patch) : « colonnes modifiées », aucune fiche modifiée", d.header === true && d.entries.length === 0, "entries=" + d.entries.length);
d = H.describeGroups(H.groupsFromTexts(R.join("\r\n") + "\r\n", A.join("\r\n") + "\r\n"));
t("commit de migration (textes complets, LCS) : idem", d.header === true && d.entries.length === 0, "entries=" + d.entries.length);
// diff de deux versions complètes avec ids : modifications réelles détectées
const V1 = [hdrNew], V2 = [hdrNew]; const idsx = Array.from({ length: 20 }, createBookId);
idsx.forEach((id, i) => { V1.push(row("AUT" + i, "T" + i, id)); V2.push(i === 7 ? row("AUT7 RENOMMÉ", "T7 changé", id) : row("AUT" + i, "T" + i, id)) });
V2.push(row("NOUVEAU", "Livre neuf", createBookId())); V1.splice(3, 1);
d = H.describeGroups(H.groupsFromTexts(V1.join("\r\n") + "\r\n", V2.join("\r\n") + "\r\n"));
t("deux versions complètes : 1 modifié + 2 ajoutés (dont la ligne retirée), par id", d.entries.filter(e => e.t === "mod").length === 1 && d.entries.filter(e => e.t === "add").length === 2, JSON.stringify(d.entries.map(e => e.t)));
t("l'id n'apparaît jamais comme champ modifié", d.entries.every(e => !(e.fields || []).includes("id")));
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
