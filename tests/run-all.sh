#!/bin/bash
# Lance les tests unitaires (réussite / échec) puis tous les scénarios dans Chrome sans écran ; affiche les résultats.
# Un scénario est en échec s'il ne rend aucune sortie (page plantée) ou signale une erreur ; ses valeurs sont à lire : voir tests/README.md.
# Usage : tests/run-all.sh [nom-de-scénario ...]   (sans argument : tous)     Variables : voir run-scenario.sh ; SW=1 ajoute le test du service worker (CHROME requis)
ONLY=("$@"); HERE="$(cd "$(dirname "$0")" && pwd)"; OUT="${TEST_OUT:-${TMPDIR:-/tmp}/livrotheque-tests}"; mkdir -p "$OUT"; FAIL=0
SCENARIOS=("columns-and-form gh" "locations gh" "book-ids ids" "github-log ids" "offline-mode offm" "update-link offm" "conditional-read etag" "stale-page stale" "first-sync first" "network-down off" "footer-versions ver" "edit-during-sync editsync" "push-race editsync" "large-file large")
echo "##### Tests unitaires"
node "$HERE/unit/ids-and-csv.js" | tail -4 || FAIL=1
node "$HERE/unit/share-link.js" | tail -3 || FAIL=1
node "$HERE/unit/history.js" > "$OUT/history.txt" 2>&1 && echo "history.js : $(grep -c '→' "$OUT/history.txt") cas lus, sans erreur" || { echo "history.js : ÉCHEC"; tail -5 "$OUT/history.txt"; FAIL=1; }
for entry in "${SCENARIOS[@]}"; do
  set -- $entry; name=$1; seed=$2
  if [ ${#ONLY[@]} -gt 0 ] && [[ " ${ONLY[*]} " != *" $name "* ]]; then continue; fi
  echo; echo "##### Scénario $name (données simulées : $seed)"
  "$HERE/run-scenario.sh" "scenarios/$name.js" "seeds/$seed.js" | tee "$OUT/$name.txt"; rc=${PIPESTATUS[0]}
  [ $rc -eq 0 ] || { echo ">>> ÉCHEC du scénario $name (code $rc)"; FAIL=1; }
done
if [ "${SW:-0}" = "1" ]; then echo; echo "##### Service worker (Chrome)"; CH="${CHROME:-$CH}" node "$HERE/sw/service-worker-chrome.js" || FAIL=1; fi
echo; [ $FAIL -eq 0 ] && echo "TOUT S'EST EXÉCUTÉ SANS ERREUR" || echo "AU MOINS UN ÉCHEC"; exit $FAIL
