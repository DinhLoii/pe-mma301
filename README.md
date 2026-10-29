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
- `npm run test:rules`: rules local trong emulator, cần Java 21+.
- `npm run package:submission`: tạo ZIP source sạch, không deploy.
- `npm run build:apk`: chỉ build APK khi cần.
- `npm run deploy:rules` / `npm run deploy:web`: chỉ dùng khi bạn yêu cầu xuất bản.

`firestore.rules` local là deny-all. Khi có đề thật, viết rules đúng collection và validation trước khi dùng factory CRUD. Không tự publish rules khung này. Các lệnh deploy chỉ là cấu hình sẵn, không chạy tự động.

Đọc `EXAM_RUNBOOK.md` khi nhận đề. Thông tin cục bộ nằm trong `submission.local.json`, không nằm trên GitHub.
