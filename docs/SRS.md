# CineList Software Requirements Specification

Student: QE190167 — Dinh Van Loi. Baseline: the supplied MMA301 FALL 2026 practical exam, preserved verbatim in `EXAM_SPEC.txt`. This specification describes required behavior, not evidence of completion.

## Scope and actors
Guests can view Home and register/login. Authenticated people manage only their private movie watchlist. The grader also writes directly to Firestore using the supplied test account. No service-account/admin key is included in the client or submission.

## Required behavior and acceptance criteria
- FR01 Setup: Expo React Native + TypeScript, `npm install` then `npx expo start`; Firebase client settings from environment variables only. Email/Password provider enabled. One existing grader account with at least three movie documents.
- FR02 Home: public Home header CineList, Login and Register; `home-title` text exactly `CineList`; description and at least three feature cards. A restored session opens List directly. Logout returns Home.
- FR03 Authentication: email/password/confirmation registration, real Firebase account and `form-success` text `Registration successful`; real login opens List. No initial validation errors; validate on submit and remove each error as its input becomes valid. Firebase refusal message is visible in `error-auth`.
- FR04 Protected routes: List and Detail wait for initial session resolution; no private content while signed out or loading. List has `list-screen`, user email and Logout.
- FR05 Add: `movie-form`, title/director text, genre/status pickers with empty first choices `Choose genre` / `Choose status`, optional integer rating and notes. Save for current user, realtime update, clear form, `movie-success` text `Movie added`. Failure in `error-movie` and no insertion.
- FR06 List: `movie-item` per movie with title/director/genre/status, persistent favorite star and Detail action. Case-insensitive title sort then director. `movies-empty` text `No movies found` when the visible set is empty.
- FR07 Combined filters: genre All/Action/Comedy/Drama/Horror, status All/Plan to Watch/Watching/Watched, favorites-only switch, trimmed case-insensitive title/director substring search. Every filter is AND-combined and immediate; Clear resets all four. Changes remove nonmatching movies immediately.
- FR08 Summary: `movie-count` and `favorite-count` contain plain integers for visible movies. Nonzero status rows sorted count descending; ties Plan to Watch, Watching, Watched.
- FR09 Detail: full fields, favorite toggle; Edit uses identical validation, Save persists and returns to view mode, Cancel discards edits. Delete requires confirmation, removes from Firestore and returns List.
- FR10 Persistence/isolation: restart preserves records/favorites/session; another account sees only its own records. Realtime listener cleanup on logout and account changes prevents data leakage.
- FR11 Phone usability: consistent reusable inputs/buttons/cards, safe areas, vertical scrolling, no clipped controls or horizontal overflow. Loading, errors, empty state and retry where appropriate.

## Data contract and server enforcement
Only collection `movies` stores app data. Required fields: id (document ID), userId (Auth UID), title (nonblank <=100), director (nonblank <=60), genre (Action/Comedy/Drama/Horror), status (Plan to Watch/Watching/Watched), favorite (boolean default false), createdAt (timestamp). rating is omitted when empty, otherwise integer 0..5. notes defaults to empty string, <=300. Both create and update enforce field types/limits/enums/ownership; unknown fields are refused. Unauthenticated access and unrelated collections are denied.

Uniqueness is enforced by canonical document IDs: UID + `_` + lowercase trimmed title encoded as UTF-8 hex + `_` + lowercase trimmed director encoded as UTF-8 hex. Rules recompute and enforce the ID. Thus arbitrary-ID duplicate inserts fail and two equal normalized movies cannot coexist. A transaction refuses an existing target. Editing title/director atomically moves the document to its new canonical ID, retaining createdAt; the previous document is deleted in the same transaction. Case-only changes update the existing ID. Each user has a separate UID namespace.

## Exact validation messages
Auth: `Email is required`; `Please enter a valid email address`; `Password is required`; `Password must be at least 6 characters` (Register only); `Confirm password is required`; `Passwords do not match`.

Movie: `Title is required`; `Title must be at most 100 characters`; `Director is required`; `Director must be at most 60 characters`; `Please choose a genre`; `Please choose a status`; `Rating must be a whole number from 0 to 5`; `Notes must be at most 300 characters`.

## Verification and evidence
Unit tests cover all validation boundaries, combined filters, sorting and summary. Emulator tests send invalid direct writes on create/update, foreign-owner and anonymous operations, canonical duplicate attempts, per-user duplicates, and title edits. Device tests cover auth, add/edit/delete/favorite/restart/two-account isolation. A passing source test does not replace genuine screenshots.

Report evidence order: Firebase Users, movies with >=3 owned documents, published Rules; Register validation/success; Login; List after login; Add validation/success; each filter/search; Summary with multiple statuses; Detail view/edit validation/after Save; favorite before/after; delete before/after; empty state. Screenshots must be from a real phone/emulator, captioned, and show implemented features only.

## Submission
Ordinary folder `QE190167/` contains `QE190167.docx` and `QE190167.zip`. Word starts with the exact seven-field exam template populated with student identity, public GitHub URL, durable completed Expo build URL, Firebase project ID and existing grader credentials. ZIP root contains package.json, lock file, src/components, firestore.rules and blank .env.example. Exclude node_modules, .expo, .git, real .env and all admin keys. Public GitHub and ZIP source must match. APK must contain final implementation. The full authoritative requirement and screenshot wording remain in `EXAM_SPEC.txt`.

## Presentation enhancement

Offline posters are bundled for the sample-film catalog with a neutral fallback for unknown titles. User rating is shown as stars and can be selected through accessible star controls. These additions do not change the Firestore schema, required field names, validation messages or testIDs.

