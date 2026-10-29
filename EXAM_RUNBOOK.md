# Bắt đầu khi có đề PE thật

Sinh viên: QE190167 — Dinh Van Loi
Source: E:\FPTU\Term07\MMA301\pe-mma301
GitHub: https://github.com/DinhLoii/pe-mma301
Firebase: pe-mma301-522a4
Expo: https://expo.dev/accounts/dinhloii/projects/pe-mma301

## Hiện tại

Chỉ chuẩn bị source khung và cấu hình. Chưa chốt nghiệp vụ, model, collection, thông báo hay testID theo đề. Không chạy seed, build hoặc deploy tự động. Bản web trial đăng trước đó đã tắt.

## Khi bạn gửi đề

1. Đọc đề thật; chốt màn hình, entity, fields, validation, testID và các tệp cần nộp.
2. Thêm model/domain, tạo repository cho collection đúng đề. Thay Workspace bằng màn hình yêu cầu. Dùng lại UI và Auth nếu phù hợp.
3. Viết Firestore Rules theo nghiệp vụ; kiểm tra quyền và dữ liệu sai trong emulator.
4. Chạy `npm run check`, `npm run test:rules`; chạy app trên điện thoại/emulator.
5. Chỉ khi bạn yêu cầu, publish rules, build APK và deploy; điền link build hoàn thành vào báo cáo.
6. Chụp ảnh thật, có caption theo đề. Script `scripts/create-report.py` ghép Word từ `screenshots/manifest.json`; manifest ban đầu trống.
7. Commit/push source cuối và chạy `npm run package:submission`. ZIP có package.json ở gốc, không có cấu hình riêng.

## Phân bố source

`src/app/`: route và màn hình.
`src/components/`: UI và Auth form dùng lại.
`src/config/`: Firebase web/native, chỉ đọc biến môi trường.
`src/context/Session.tsx`: phiên đăng nhập và cổng bảo vệ.
`src/api/createRepository.ts`: lớp dữ liệu dùng lại, chưa gắn collection cụ thể.
`src/domain/auth.ts`: validation Auth, sửa nội dung theo đề nếu cần.

## Thông tin nộp bài

`submission.example.json` không có mật khẩu hay link build giả. `submission.local.json` giữ thông tin riêng ở máy. Có thể chạy `python scripts/create-report.py --template` sau khi cài `python-docx` và `Pillow`, rồi mở Word kiểm tra trước khi nộp. Không tạo báo cáo hoàn chỉnh khi chưa có đề và ảnh thật.
