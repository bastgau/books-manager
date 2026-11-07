# Books Manager

Single-file web app to manage personal book libraries stored in a private GitHub repository.

Open the page, click **☁ Synchro**, then enter your private data repository, a fine-grained token limited to it, and a library UUID. No data is stored in this public repository.

## Search

Text typed in the search box is looked for in the author, title, summary, ISBN, location, dates and pages (accents and case ignored). A prefix limits a term to one field: `auteur:`, `titre:`, `isbn:` (dashes ignored), `resume:` and `localisation:`. The value runs until the next prefix and every term must match, e.g. `auteur:de rosnay titre:sarah`.

## Offline mode

The **En ligne / Hors ligne** switch next to the title stops every exchange with the data repository: adding, editing and deleting books keep working and stay on the device. Switching back online sends all pending changes in a single upload. If the repository changed in the meantime, a dialog lists the differences and lets you keep one of the two versions. Online searches (ISBN, title, author) are not affected.

The page itself can be reopened without a network (service worker `sw.js`) and installed on a phone home screen (`manifest.webmanifest`).

## Tests

Scenario and unit tests are in [`tests/`](tests/README.md). They use a mock GitHub and fictitious books only.

## Publication

The workflow `.github/workflows/pages.yml` runs the tests (`tests/run-all.sh`) on every push. On `main`, when they pass, it publishes the site on GitHub Pages and writes the publication time into `APP_BUILD` (`index.html`) and `BUILD` (`sw.js`) of the published copy (`tools/stamp.sh`): there is no need to update them by hand. It requires **Settings → Pages → Source: GitHub Actions**.
