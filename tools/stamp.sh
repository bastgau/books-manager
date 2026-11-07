#!/bin/bash
# Copies the site into <out> and writes the publication time into APP_BUILD (index.html) and BUILD (sw.js).
# Used by the Pages workflow: the repository files are left untouched, only the published copy is stamped.
# The time is the committer date of HEAD (UTC). It is never older than the last commit of index.html,
# so the page is never taken for stale (the app compares APP_BUILD with that commit, 5 min tolerance).
# Usage: tools/stamp.sh <out>   (run from a git checkout; the history is not needed)
set -euo pipefail
OUT="${1:?usage: tools/stamp.sh <out>}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
T="$(TZ=UTC git -C "$ROOT" log -1 --format=%cd --date=format-local:%Y-%m-%dT%H:%M:%SZ HEAD)"
rm -rf "$OUT" && mkdir -p "$OUT"
# committed files only (as the branch deployment published them), without the CI folder
git -C "$ROOT" archive HEAD | tar -C "$OUT" -xf - && rm -rf "$OUT/.github"
sed -i -E "s/^const APP_BUILD=\"[^\"]*\"/const APP_BUILD=\"$T\"/" "$OUT/index.html"
sed -i -E "s/^const BUILD = \"[^\"]*\"/const BUILD = \"$T\"/" "$OUT/sw.js"
# a missing stamp would make every visitor see a stale page: fail loudly instead
grep -q "^const APP_BUILD=\"$T\"" "$OUT/index.html" && grep -q "^const BUILD = \"$T\"" "$OUT/sw.js" || { echo "stamp not written" >&2; exit 1; }
echo "stamped $T into $OUT"
