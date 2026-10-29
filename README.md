# MMA301 practical exam starter

Prepared for **QE190167 — Dinh Van Loi**, using the BookShelf trial as a working reference. This is an Expo SDK 57 / React Native mobile app with Expo Router, React Context, Firebase Email/Password and Firestore. It does not use mock login or an offline demo database.

## Run

Use Node 22.13 or newer. Run `npm install`, copy `.env.example` to `.env`, enter your Firebase client config, then run `npx expo start`. The local preparation already has `.env`; the GitHub repository and submission ZIP intentionally do not. Enable Email/Password in Firebase Authentication and create the default Firestore database, then publish `firestore.rules`.

`npm run check` checks TypeScript, lint and domain behavior. `npm run test:rules` checks the actual Firestore rules in an emulator (Java 21+). `npm run web` opens a convenient browser preview; the exam screenshots still need a real device or emulator.

## Deployment

`npx --yes eas-cli@27.1.0 login`, `npx --yes eas-cli@27.1.0 init`, then `npm run setup:eas-env` syncs local public client settings to the EAS preview environment. `npm run build:apk` makes a durable Android APK build. Use its exact completed build URL in the report. If the exam changes, make a new build after the final changes; an old APK will not include them.

`npx firebase login` and `npm run deploy:rules` publishes the database rules. `npm run deploy:web` is an optional durable web preview on Firebase Hosting. A web URL or Expo project homepage does not replace the required APK/build link.

## Where to adapt the real exam

- `src/domain/`: fields, messages, filters, sorting and summary.
- `src/api/books.ts`: Firestore subscription and transactions.
- `src/context/Session.tsx`: authentication gate and per-user shared state.
- `src/components/`: reusable fields, buttons and forms.
- `src/app/`: Home, Login, Register, List and Detail routes.
- `firestore.rules`: backend ownership and validation. Change these with any schema change.

No Firebase Analytics is initialized in the mobile app. Only Auth and Firestore are required.

## Unique title and author

The only collection is `books`. Document IDs are `uid_hex(lower(trim(title)))_hex(lower(trim(author)))`. Firestore rules recompute the ID themselves, so a direct client write to a random second ID cannot bypass uniqueness. Case-only changes retain the same ID. Changing title/author moves the document atomically in one transaction. Read the canonical key test before changing this scheme. A grader or external script must use this documented ID convention for valid direct writes; invalid arbitrary IDs are rejected.

## Submission

Read `EXAM_RUNBOOK.md`. `npm run package:submission` creates `submission/QE190167.zip` with `package.json` at its root and an allowlist excluding private configuration. Copy `submission.example.json` to the ignored `submission.local.json` for local test-account and report data. Never commit that local file.

Client Firebase configuration is public runtime configuration but is kept outside source as required by the trial. Never add service-account credentials. Screenshots and account passwords remain local, outside Git and the source ZIP.

Reference docs: https://docs.expo.dev/versions/v57.0.0/ and https://firebase.google.com/docs/firestore/security/rules-conditions
