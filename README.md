# MMA301 PE Starter

Source khung cho **QE190167 — Dinh Van Loi**. Chưa triển khai nghiệp vụ của đề thi. Chưa chốt collection, model hay màn hình CRUD theo một đề cụ thể.

## Chạy local

Node 22.13+; chạy `npm install` rồi `npx expo start`. File `.env` trên máy đã có Firebase config. Khi clone mới, copy `.env.example` thành `.env` và điền config cá nhân. Không đưa `.env` lên Git hoặc vào ZIP.

## Đã chuẩn bị

- Expo SDK 57, TypeScript, Expo Router.
- Firebase Auth/Firestore, lưu phiên đăng nhập trên Android và web.
- React Context cho phiên đăng nhập, bảo vệ màn hình riêng.
- Home, Login, Register và Workspace trống để thay bằng màn hình của đề thật.
- Button, Field, Select, Page và loading dùng lại.
- Factory Firestore CRUD trong `src/api/createRepository.ts`, chưa được gọi bởi app.
- Cấu hình GitHub CI, EAS APK, Firebase Hosting, công cụ đóng gói ZIP và ghép Word.

Firebase project: `pe-mma301-522a4`. Expo project: `@dinhloii/pe-mma301`. **Chỉ build/deploy khi có đề thật và bạn yêu cầu**.

## Lệnh có sẵn

- `npm run check`: TypeScript, lint, kiểm tra validation Auth.
- `npm run test:auth`: kiểm tra Firebase Auth SDK với emulator cục bộ, không tạo tài khoản trên project thật.
- `npm run test:rules`: rules local trong emulator, cần Java 21+.
- `npm run package:submission`: tạo ZIP source mới trong QE190167/, không deploy.
- `npm run check:submission -- -Template`: kiểm tra source ZIP khớp source hiện tại và cấu trúc bộ mẫu.
- `npm run check:submission`: chặn nộp Word còn placeholder, thiếu ảnh hoặc link build.
- `npm run build:apk`: chỉ build APK khi cần.
- `npm run deploy:rules` / `npm run deploy:web`: chỉ dùng khi bạn yêu cầu xuất bản.

`firestore.rules` local là deny-all. Khi có đề thật, viết rules đúng collection và validation trước khi dùng factory CRUD. Không tự publish rules khung này. Các lệnh deploy chỉ là cấu hình sẵn, không chạy tự động.

Đọc `EXAM_RUNBOOK.md` khi nhận đề. Thông tin cục bộ nằm trong `submission.local.json`, không nằm trên GitHub.

## License

MIT License. See LICENSE for the full terms and copyright notices, including the Expo starter attribution. Third-party dependencies retain their own licenses.

## Authentication scaffold

Login/Register use Firebase Email/Password, validate on submit, show field errors,
support show/hide password, and prevent duplicate requests. Registration keeps a
success screen until Continue. Already signed-in users go to Workspace. Logout
clears the Firebase session; Android restores sessions via AsyncStorage.

Before the exam, verify on the target phone/emulator:
1. Submit empty/invalid registration, then register a new test account.
2. Continue to Workspace and confirm the displayed email.
3. Close/reopen the app and confirm the session is restored.
4. Logout; opening Workspace must redirect to Home.
5. Try wrong credentials, then login correctly. Try registering an existing email.
6. Disconnect the network and confirm an error appears and retry works.

The exam may require different text, password rules, routes or testIDs; adjust
them against the actual specification. Existing APK/QR refers to the earlier
starter build and does not include subsequent source changes until rebuilt.

## Commit conventions

All new commits follow `<type>(<optional scope>): <description>`, for example
`feat(auth): add password visibility controls`. Keep each commit focused on one
logical change. Use lowercase English imperative descriptions without a trailing
period. Use `!` or a `BREAKING CHANGE:` footer for breaking changes.

Supported types: feat, fix, docs, style, refactor, perf, test, build, ops, chore.
See `.cursor/rules/conventional-commits.mdc` for the full project rule.
