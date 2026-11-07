# Tests

Scenario and unit tests for `index.html`. They never touch a real repository: GitHub calls are replaced by a mock `fetch`, the token is `FAUX`, the library UUID is fake and the books are generated (`data/make-sample-csv.js`). **Do not add real data here: this folder is published with the public repository.**

## Layout

| Folder | Content |
|---|---|
| `unit/` | Node tests that load the page's script without a browser. `ids-and-csv.js` (UUIDv7 generator, CSV read/write/sort, history by id) reports pass/fail; `history.js` prints how change histories are decoded. |
| `scenarios/` | Scripts run inside the page (headless Chrome): columns and form, locations, book ids, offline mode, conditional reads, stale page protection, first sync, network down, footer versions, GitHub request log. |
| `seeds/` | Mock GitHub data sets (`fetch` replacement and initial `localStorage`) used by the scenarios. |
| `data/make-sample-csv.js` | Generates the fictitious library (default 400 books, legacy format without `id`). |
| `lib/mkpage.js` | Builds a copy of the page with the books, the seed and the scenario injected; the result is written in the page `<title>`. |
| `sw/` | Service worker tests: Chrome (`service-worker-chrome.js`) and, optionally, Firefox through geckodriver (`service-worker-firefox.js`). |

## Prerequisites

- Node 22 or later (the service worker tests use the built-in `WebSocket`).
- A headless Chrome: `chrome-headless-shell` (for example the one installed by Playwright, `~/.cache/ms-playwright/chromium_headless_shell-*/…/chrome-headless-shell`, or Chrome for Testing). Set `CHROME` if it is not found there.
- On a minimal machine, the system libraries Chrome needs and a font configuration: set `LIBROOT` (a folder containing `usr/lib/x86_64-linux-gnu`) and `FONTCONFIG_FILE` if required.

## Running

```sh
tests/run-all.sh                       # unit tests, then every scenario
tests/run-all.sh offline-mode locations  # only these scenarios
SW=1 tests/run-all.sh                  # also the service worker test (ports 8766)
tests/run-scenario.sh scenarios/book-ids.js seeds/ids.js   # one scenario, results printed
node tests/unit/ids-and-csv.js
CH=$CHROME node tests/sw/service-worker-chrome.js
FIREFOX=… GECKODRIVER=… LD_LIBRARY_PATH=… node tests/sw/service-worker-firefox.js   # needs Firefox + geckodriver
```

Useful variables: `CHROME`, `APP` (page to test, default `../index.html`), `BOOKS` (sample size, default 400), `BUDGET` (virtual time in ms), `TEST_OUT` (work folder, default `$TMPDIR/livrotheque-tests`).

## What the results mean

- `unit/ids-and-csv.js` fails with a non-zero exit code if a check fails.
- Scenarios **print values to be read** (many are `true`/`false` or counts); they do not assert them. `run-all.sh` only reports a failure when a scenario produces no output (page crashed or stuck) or reports an `erreur`. After a change, read the printed lines and compare with the previous run.
- A sample of about 400 books is enough for every scenario. With all 1 199 books of a real library, headless Chrome can run out of memory on small machines and the page crashes without output.

## Not covered

Firefox for Android (the loading indicator problem could not be reproduced on desktop Firefox or Chrome) and real GitHub calls.
