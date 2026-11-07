#!/bin/bash
# Joue un scénario dans Chrome sans écran, avec un jeu de données simulées (aucun accès réseau réel), et affiche son résultat.
# Usage : tests/run-scenario.sh scenarios/<nom>.js seeds/<jeu>.js [largeur] [hauteur]
# Variables : CHROME (chemin de chrome-headless-shell), APP (index.html à tester), CSV (livres de départ), TEST_OUT (dossier de travail),
#             LIBROOT (dossier de bibliothèques système à ajouter à LD_LIBRARY_PATH), BUDGET (temps virtuel en ms, 30000 par défaut), BOOKS (taille de l'échantillon)
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
SC="$1"; SEED="${2:-}"; W="${3:-1400}"; HT="${4:-900}"
[ -f "$SC" ] || SC="$HERE/$SC"; [ -z "$SEED" ] || [ -f "$SEED" ] || SEED="$HERE/$SEED"
APP="${APP:-$HERE/../index.html}"
OUT="${TEST_OUT:-${TMPDIR:-/tmp}/livrotheque-tests}"; mkdir -p "$OUT"
CHROME="${CHROME:-$(ls ~/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux64/chrome-headless-shell 2>/dev/null | tail -1)}"
[ -n "$CHROME" ] && [ -x "$CHROME" ] || { echo "CHROME introuvable : indiquez le chemin de chrome-headless-shell (voir tests/README.md)" >&2; exit 2; }
[ -z "${LIBROOT:-}" ] || export LD_LIBRARY_PATH="$LIBROOT/usr/lib/x86_64-linux-gnu:$LIBROOT/lib/x86_64-linux-gnu:${LD_LIBRARY_PATH:-}"
CSV="${CSV:-$OUT/sample.csv}"; [ -f "$CSV" ] || node "$HERE/data/make-sample-csv.js" "$CSV" "${BOOKS:-400}" >/dev/null
node "$HERE/lib/mkpage.js" "$APP" "$CSV" "$OUT/run.html" "script:$SC" ${SEED:+"$SEED"} || exit 1
timeout "${TIMEOUT:-110}" "$CHROME" --no-sandbox --disable-gpu --disable-dev-shm-usage --window-size=$W,$HT \
  --host-resolver-rules="MAP covers.openlibrary.org 127.0.0.1, MAP books.google.com 127.0.0.1, MAP archive.org 127.0.0.1, MAP openlibrary.org 127.0.0.1, MAP www.googleapis.com 127.0.0.1, MAP api.github.com 127.0.0.1, MAP raw.githubusercontent.com 127.0.0.1, MAP www.sudoc.fr 127.0.0.1" \
  --virtual-time-budget="${BUDGET:-30000}" --dump-dom "file://$OUT/run.html" 2>/dev/null | grep -o '<title>[^<]*' | sed 's/&quot;/"/g;s/&amp;/\&/g;s/<title>//' | node -e '
let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
  if(!s.trim()){console.log("(aucune sortie : la page a planté ou est restée bloquée)");process.exit(3)}
  try{const j=JSON.parse(s);const p=(o,i="")=>{for(const [k,v] of Object.entries(o)){if(v&&typeof v==="object"&&!Array.isArray(v)){console.log(i+k+" :");p(v,i+"   ")}else console.log(i+k+" : "+(Array.isArray(v)?JSON.stringify(v):v))}};p(j);if(j.erreur)process.exit(4)}catch(e){console.log(s);console.log("(pas de résultat : le scénario n\x27est pas allé au bout, budget de temps BUDGET dépassé ?)");process.exit(5)}})'
