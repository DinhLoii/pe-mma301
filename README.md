# CineList

Private movie watchlist for MMA301 — QE190167, Dinh Van Loi.

## Run

Use Node 22.13+. Run `npm install`, copy `.env.example` to `.env`, fill in your own Firebase client config, then `npx expo start`. On this machine `.env` is already configured. Email/Password Authentication must be enabled. No admin key is used.

## Implemented

Public Home; Firebase registration/login/logout and persistent session; protected List and Detail; realtime movie CRUD; persistent favorites; combined genre/status/favorites/search filters; visible-set summary; inline validation and delete confirmation. Open Add Movie and Filters and search from the List toolbar. Listeners are scoped to the current Auth UID.

## Specification and data

`docs/SRS.md` maps the required behavior. `docs/EXAM_SPEC.txt` preserves the supplied exam verbatim. The single app collection is `movies` with the exact field names from the exam. Empty rating is omitted. Rules enforce ownership, values and canonical document IDs. The client uses a transaction to reject duplicates and atomically rename documents on title/director edits. IDs encode normalized title/director as UTF-8 hex in the user's UID namespace. ASCII and Vietnamese case folding are covered by rules tests.

Publish the included `firestore.rules` to the configured Firebase project before using the app. Existing unrelated collections remain denied. No backend service or composite index is needed: query by userId, filter/sort the private result in memory.

## Verification

- `npm run check`: TypeScript, lint, auth and movie unit tests.
- `npm run test:auth`: local Firebase Auth emulator integration.
- `npm run test:rules`: local Firestore rules tests; Java 21 required.
- `npm run build:apk`: EAS preview APK build.
- `npm run package:submission`: regenerate QE190167/QE190167.zip.
- `npm run check:submission`: validate the final report and source archive.

The grader account, completed build URL and screenshot manifest are local in `submission.local.json` and `screenshots/manifest.json`; never commit credentials or genuine screenshot data. Capture screenshots on a real phone/emulator, with captions, in the exam's order. Refresh Word and ZIP after final verification; the old starter APK is not the final CineList app.

## Commit conventions

Use `<type>(<optional scope>): <description>`, lowercase English imperative descriptions without a trailing period, and one logical change per commit. Types: feat, fix, docs, style, refactor, perf, test, build, ops, chore. Breaking changes use `!` or a `BREAKING CHANGE:` footer. See `.cursor/rules/conventional-commits.mdc`.

## License

MIT. See LICENSE, including the retained Expo attribution. Dependencies retain their own licenses.

## Movie presentation

The sample-film catalog has bundled posters that work offline; unknown titles show a neutral film placeholder. Rating stars represent the signed-in user's own 0–5 rating. The form supports star selection, zero and clearing a rating, while keeping the numeric field and exact validation messages. Artwork sources are listed in assets/posters/CREDITS.md.

