// usage: node mkpage.js index.html data.csv out.html script:/chemin/scenario.js [seed.js]
// Génère une copie de la page avec les livres pré-chargés dans localStorage, un script de scénario et le résultat dans <title>.
const fs = require("fs");
const [src, csv, out, mode, seedFile] = process.argv.slice(2);
let h = fs.readFileSync(src, "utf8");
const js = h.split("<script>")[1].split("</script>")[0];
const head = js.split("/* ---------- Affichage")[0].replace(/const \$=.*\n/, "const $=()=>({});\n");
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const parse = new Function(head + "\nreturn parseCsv;")();
const books = parse(fs.readFileSync(csv));
const seed = `<script>localStorage.clear();localStorage.setItem("livrotheque.v1.local",${JSON.stringify(JSON.stringify(books))});</script>` + (seedFile ? "<script>" + fs.readFileSync(seedFile, "utf8") + "</script>" : "");
const act = mode && mode.startsWith("script:") ? fs.readFileSync(mode.slice(7), "utf8") : "";
const measure = `<script>window.addEventListener("load",function(){setTimeout(function(){${act}
 Promise.resolve(window.__pending).then(function(){document.title=window.__result?JSON.stringify(window.__result):"(aucun résultat)"},function(e){document.title=JSON.stringify({erreur:String(e&&e.stack||e).slice(0,400)})});
},800)});</script>`;
h = h.replace("<script>", seed + "<script>").replace("</body>", measure + "</body>");
fs.writeFileSync(out, h);
