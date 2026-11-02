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

## Quy trình chốt bộ nộp bài

- `npm run package:submission` ghi ZIP mới trực tiếp vào `QE190167/QE190167.zip`.
- `npm run check:submission -- -Template` kiểm tra bộ mẫu, so từng file trong ZIP với source hiện tại.
- `npm run check:submission` kiểm tra trước khi nộp thật. Lệnh từ chối Word còn placeholder, thiếu ảnh hoặc chỉ có link trang project thay vì build APK.
- `python scripts/create-report.py` tạo báo cáo cuối trực tiếp trong thư mục `QE190167/`; cần cài python-docx và Pillow. Chế độ `--template` tiếp tục xuất bản nháp ở `submission/` để không ghi đè Word đang hoàn thiện.
- Folder `QE190167/` là folder nộp; `submission/` chỉ là dữ liệu chuẩn bị cũ/nháp. Không nộp bản ZIP cũ ở đó.

## Đối chiếu đề tương tự trial khi nhận đề thật

Ưu tiên đủ chức năng bắt buộc trước khi thêm tiện ích: Home đúng nội dung; Auth và thông báo đúng từng ký tự; bảo vệ route; CRUD cập nhật tức thì và tồn tại sau khởi động; dữ liệu riêng của mỗi user; sắp xếp, bộ lọc, tìm kiếm và thống kê kết hợp; Detail, sửa, favorite và xóa có xác nhận; empty/loading/error state; màn hình điện thoại không bị cắt.

Firestore phải kiểm tra cả create và update, quyền sở hữu, kiểu/giới hạn trường và chống trùng tại database theo yêu cầu cụ thể. Không thể thay việc này bằng validation của form hoặc rules chỉ kiểm tra đăng nhập. Khi chưa có schema thật, rules khung vẫn đóng.

Giữ nguyên tên collection, fields, visible text và testID đúng đề thật. Chạy thử hai tài khoản, dữ liệu sai gửi trực tiếp, duplicate và persistence trước khi chốt. Chỉ chụp ảnh chức năng thật từ điện thoại/emulator; kiểm tra captions, link build và tài khoản chấm bài trước khi nộp.

Component `src/components/ConfirmDialog.tsx` đã có sẵn để tái sử dụng cho bước xác nhận xóa; chưa gắn với nghiệp vụ nào.

## Kiểm chứng Android trước thi

APK khung 00eebffc-e51c-4508-b224-94b73eac7940 đã cài và mở thành công trên emulator Pixel_6a. Đây là kiểm tra Home/khởi động, chưa chứng minh các luồng nghiệp vụ của đề thật. Bản build này dùng commit 303b3c2; helper nộp bài bổ sung sau đó cần có trong source cuối, và khi sửa chức năng phải build lại APK.

Build khung đo được khoảng 22 phút riêng thời gian build, chưa tính các tình huống chờ hàng đợi hay sửa lỗi. Với bài thi 80 phút, cần triển khai các luồng bắt buộc và bắt đầu build sớm khi bản cần nộp đã ổn, đồng thời chuẩn bị ảnh/báo cáo trong lúc chờ. Không hứa thời gian hoàn thành hoặc điểm số tuyệt đối.
