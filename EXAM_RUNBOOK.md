# CineList exam runbook

Student: QE190167 — Dinh Van Loi
Project: E:\FPTU\Term07\MMA301\pe-mma301

## Specification

Read docs/SRS.md and the verbatim docs/EXAM_SPEC.txt. The actual app is CineList with the movies collection, not the earlier BookShelf trial. Preserve the exact field names, validation messages and testIDs.

## Current verification

- TypeScript, ESLint and 12 auth/movie unit tests passed.
- Five Firestore emulator tests passed, including invalid direct create/update writes, anonymous/foreign-owner denial, canonical uniqueness and title renames.
- Android JavaScript export passed.
- Firebase Auth emulator integration passed.
- Two real accounts were checked in the final APK: the fresh account sees zero movies; the grader account retains its own records.
- A fresh unzipped source copy completed npm ci and TypeScript checks.
- The final EAS APK was installed and opened on Pixel_6a. Grader login, real Firebase movies and persisted favorites/deletion were checked in the installed APK.
- The grader account was registered through the app. Arrival and Dune were added through the app; authenticated client SDK added further sample data for filters and summary. No admin key is used.
- Published Firebase Rules match firestore.rules. The grader currently has at least three movies; the deleted sample is intentionally absent.

## Delivery

GitHub: https://github.com/DinhLoii/pe-mma301
Firebase: pe-mma301-522a4
Final APK build: https://expo.dev/accounts/dinhloii/projects/pe-mma301/builds/4bd7edd9-eca3-4926-bd17-6924229f1548
Application source commit: bc83bf435bf8a33a25241746c9caa7f61c07f000
Later documentation-only commits do not change the APK application source.

QE190167/ is the submission folder. It contains QE190167.docx and QE190167.zip. Only wrap this folder in another ZIP if the upload system requires one file. Do not submit node_modules or the entire project directory.

Credentials and the completed build URL are stored locally in submission.local.json and printed in the required Word report. They are excluded from Git and the source ZIP. Screenshots are genuine device/emulator and Firebase console captures listed in screenshots/manifest.json.

## Regeneration and checks

Run npm run package:submission after any source/documentation changes, then npm run check:submission. APK must be rebuilt for application changes. Edit the final Word report carefully to preserve the seven required fields and its single APK download QR. The basic create-report.py helper does not preserve the enhanced QR layout.

## Security design

Only the user's own movies are queried. No admin/service-account key is needed. Canonical IDs enforce case-insensitive title/director uniqueness; edits use an atomic transaction to move a document when its canonical ID changes. Empty rating is omitted, not null. Auth restoration gates protected screens; movie subscriptions are isolated by user and disposed on account changes.
