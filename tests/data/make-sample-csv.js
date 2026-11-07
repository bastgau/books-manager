#!/usr/bin/env node
// Génère un CSV d'exemple (livres fictifs, aucune donnée réelle) au format historique : sans colonne `id`, comme une bibliothèque pas encore migrée.
// Usage : node make-sample-csv.js [fichier.csv] [nombre de livres]      (défauts : sample.csv, 400)
const fs = require("fs"), path = require("path"), os = require("os");
const out = process.argv[2] || path.join(process.env.TEST_OUT || path.join(os.tmpdir(), "livrotheque-tests"), "sample.csv");
const N = +(process.argv[3] || process.env.BOOKS || 400);
const COLS = ["auteur", "titre", "date_lecture", "nb_pages", "localisation", "resume", "isbn", "date_entree", "couverture", "a_verifier", "a_garder"];
const syl = ["BA", "DE", "FI", "GO", "HU", "JA", "KO", "LU", "MA", "NE", "PI", "RO", "SU", "TA", "VI", "ZE"];
const firstNames = ["Alice", "Bruno", "Chloé", "David", "Émilie", "Félix", "Gaëlle", "Hugo"];
const isbn13 = n => { const d = "978" + String(100000000 + n).slice(0, 9); let s = 0; for (let i = 0; i < 12; i++) s += (i % 2 ? 3 : 1) * +d[i]; return d + ((10 - (s % 10)) % 10) };
// répartition des localisations (fictives) : 51 / 14 / 48 livres + 1 chacune pour trois autres, intercalées dans le fichier
const locs = [["Chalet", 51], ["Prêté Léa", 14], ["Bureau", 48], ["Caisse A", 1], ["Garage", 1], ["Étagère 1", 1]];
const loc = new Array(N).fill("");
let k = 0; for (const [name, n] of locs) for (let j = 0; j < n && k < N; j++, k++) loc[(k * 7) % N === 0 && k ? (k * 11) % N : (k * 7) % N] = loc[(k * 7) % N] ? loc[(k * 7) % N] : name;
const rows = [];
for (let i = 0; i < N; i++) {
  const a = i % 26, nm = String.fromCharCode(65 + a) + syl[(i * 5) % 16].toLowerCase() + syl[(i * 3) % 16].toLowerCase();   // lettres A à Z représentées
  const hasIsbn = i % 3 !== 0, read = i % 20 === 7;
  rows.push({ auteur: nm.toUpperCase() + " " + firstNames[i % 8], titre: "Livre d'exemple " + (i + 1), date_lecture: read ? "15/0" + (1 + i % 9) + "/2024" : "", nb_pages: hasIsbn ? String(120 + (i * 13) % 500) : "",
    localisation: loc[i], resume: i % 5 === 0 ? "Résumé fictif du livre " + (i + 1) + "." : "", isbn: hasIsbn ? isbn13(i) : "", date_entree: "03/10/2019", couverture: "", a_verifier: "", a_garder: "" });
}
const f = v => '"' + String(v ?? "").replace(/[\t\r\n]+/g, " ") + '"';
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, "﻿" + [COLS.map(f).join("\t"), ...rows.map(r => COLS.map(c => f(r[c])).join("\t"))].join("\r\n") + "\r\n");
const count = n => rows.filter(r => r.localisation === n).length;
console.log(`${out} : ${rows.length} livres fictifs ; ` + locs.map(([n]) => n + "=" + count(n)).join(", "));
