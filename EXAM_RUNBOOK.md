# Quy trình PE cho QE190167 Dinh Van Loi

## Trước buổi thi

1. Chạy `npm install` và `npm run check` trong thư mục này. Mở app trên điện thoại bằng `npx expo start`.
2. Firebase: bật Authentication → Email/Password; tạo Firestore database mặc định. Chạy `npx firebase login`, rồi `npm run deploy:rules`. Không chọn test mode mở toàn bộ dữ liệu.
3. Expo: kiểm tra `npx --yes eas-cli@27.1.0 whoami`; project riêng phải là `pe-mma301`, không dùng project assignment cũ. Chạy `npm run setup:eas-env`, rồi `npm run build:apk`.
4. Đăng ký tài khoản chấm bài trong app, điền email/password vào `submission.local.json` (copy từ `submission.example.json`). Chạy `npm run seed` để tạo 5 sách mẫu bằng chính quyền của tài khoản này. Đăng nhập lại bằng tài khoản đó trên app.
5. Kiểm tra repo GitHub public và cài được APK trên điện thoại. Link EAS phải có build đã hoàn thành.

## Khi nhận đề thật

Gửi đề mới kèm đường dẫn project này. Đọc lại toàn bộ đề trước khi sửa: entity, trường, thông báo, testID, collection và cách nộp có thể khác trial. Sửa domain → API/rules → form/screens → test. Không giữ testID hoặc collection cũ nếu đề yêu cầu khác.

Chạy `npm run check` và `npm run test:rules`. Publish rules mới bằng `npm run deploy:rules`. Tạo APK mới bằng `npm run build:apk` sớm để có thời gian chờ. Cập nhật link build hoàn thành trong báo cáo. Commit/push code cuối, tạo ZIP sau thay đổi cuối cùng.

## Ảnh báo cáo trial

Chỉ dùng ảnh thật từ điện thoại/emulator. Web preview không thay thế ảnh mobile theo đề. Chụp console Firebase thật cho 3 mục console. Mỗi ảnh có caption và theo đúng thứ tự dưới đây; không dùng lại ảnh mockup hoặc ghi tính năng chưa chạy.

01 Firebase console — Authentication test account
02 Firebase console — Firestore books at least 3 documents
03 Firebase console — Published Security Rules
04 Register screen — validation
05 Register screen — success
06 Login screen — empty form
07 List screen — after login
08 Add Book form — validation
09 Add Book form — success
10 Genre filter
11 Status filter
12 Favorites only
13 Search
14 Summary
15 Detail screen — view mode
16 Detail screen — edit validation
17 Detail screen — after Save
18 Favorite toggle — before
19 Favorite toggle — after
20 Delete — before
21 Delete — after
22 Empty state — second fresh account

Lưu ảnh trong `screenshots/`. Copy `scripts/screenshots.manifest.example.json` thành `screenshots/manifest.json`, giữ lại đúng các ảnh thật đã chụp. Cài thư viện bằng `python -m pip install python-docx Pillow`, rồi chạy `python scripts/create-report.py` để tự ghép báo cáo có caption. `python scripts/create-report.py --template` tạo bản mẫu để điền dần. Mở Word kiểm tra trang, ảnh và URL trước khi nộp. Không đưa tài khoản/mật khẩu chấm bài vào GitHub public.

## Nộp bài

Mẫu đầu Word phải theo đề, URL là chữ thường nhìn thấy với `https://`:

Student Code: QE190167
Full Name: Dinh Van Loi
GitHub Repository URL: https://github.com/DinhLoii/pe-mma301
Expo Project Link: [link build EAS thực tế đã hoàn thành]
Firebase Project ID: pe-mma301-522a4
Test account email: [email tài khoản đã đăng nhập và có dữ liệu]
Test account password: [mật khẩu tài khoản chấm bài]

Chạy `npm run package:submission`. Thư mục `submission/` cuối cùng cần `QE190167.docx` và `QE190167.zip`. Mở thử ZIP mới trong thư mục khác, thêm Firebase config, chạy `npm install` và `npx expo start`. Kiểm tra logout, cách ly hai user, lỗi form, duplicate, filters, summary, edit, favorite, delete và tồn tại dữ liệu sau restart.
