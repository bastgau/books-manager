# Books Manager

Single-file web app to manage personal book libraries stored in a private GitHub repository.

Open the page, click **☁ Synchro**, then enter your private data repository, a fine-grained token limited to it, and a library UUID. No data is stored in this public repository.

## Offline mode

The **En ligne / Hors ligne** switch next to the title stops every exchange with the data repository: adding, editing and deleting books keep working and stay on the device. Switching back online sends all pending changes in a single upload. If the repository changed in the meantime, a dialog lists the differences and lets you keep one of the two versions. Online searches (ISBN, title, author) are not affected.

The page itself can be reopened without a network (service worker `sw.js`) and installed on a phone home screen (`manifest.webmanifest`).

## Tests

Scenario and unit tests are in [`tests/`](tests/README.md). They use a mock GitHub and fictitious books only.
