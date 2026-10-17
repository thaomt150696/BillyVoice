# BillyVoice

**Nói một câu để ghi tiền. Mở app để hiểu tiền.**

BillyVoice là app ghi chi tiêu cá nhân bằng giọng nói tiếng Việt, chạy ngay trên trình duyệt điện thoại (PWA), **không cần tài khoản, không có máy chủ**. Mọi khoản chi nằm trên máy của bạn.

> Bản **1.0.0**: đủ tính năng MVP (P0) của dự án, dựng bằng HTML + CSS + JavaScript thuần (không cần cài Node, không cần bước build). **Chưa qua test với người dùng thật**: xem mục "Giới hạn đã biết".

## Dùng thế nào

1. Mở đường dẫn của app trên điện thoại (xem mục "Đưa lên GitHub Pages").
2. **Thêm vào màn hình chính** để dùng như app và dùng được khi không có mạng:
   - Android (Chrome): menu ⋮ → *Cài đặt ứng dụng* hoặc *Thêm vào màn hình chính*.
   - iPhone (Safari): nút Chia sẻ → *Thêm vào Màn hình chính*.
3. Bấm **MIC** ở giữa thanh dưới, nói ví dụ *"Uống trà sữa 45k"* hoặc *"Sáng cà phê 35 nghìn, trưa ăn cơm 45 nghìn, tối chuyển mẹ 2 triệu"*. Không tiện nói thì gõ vào ô bên dưới (Billy hiểu như nhau) hoặc bấm *Nhập tay*.
4. Khoản rõ ràng Billy tự lưu và cho **Hoàn tác** 5 giây; khoản chưa chắc Billy hỏi lại **một câu**. Khoản đầu tiên luôn hiện thẻ để bạn xem Billy hiểu thế nào.
5. Xem **Hôm nay / Tuần / Tháng**, xuất **CSV** (mở được bằng Excel) ở *Cài đặt*.

## Trình duyệt

| Trình duyệt | Giọng nói | Ghi chú |
|---|---|---|
| Chrome, Edge (Android, Windows, macOS) | Có | Tốt nhất. Cần có mạng khi nói |
| Safari (iPhone, iPad, Mac) | Có thể không ổn định | Nếu không dùng được, gõ chữ |
| Firefox, trình duyệt khác | Không | App tự chuyển sang gõ chữ; mọi tính năng khác vẫn dùng được |

## Quyền riêng tư

- Khoản chi, nhóm, cài đặt lưu **trên máy** (IndexedDB). Không gửi đi đâu, không có tài khoản.
- Khi bạn nói, **trình duyệt** chuyển giọng nói thành chữ. Chrome/Edge thường gửi âm thanh tới máy chủ của Google/Microsoft để làm việc này, Safari dùng dịch vụ của Apple. **Billy không nhận và không lưu file ghi âm.** Gõ chữ thì không gửi gì đi.
- Xóa dữ liệu trình duyệt hoặc gỡ app có thể làm **mất dữ liệu**: hãy xuất CSV định kỳ. Màn *Cài đặt → Quyền riêng tư* nói đúng như vậy.

## Đưa lên GitHub Pages (không cần cài Git)

1. Tạo tài khoản GitHub, bấm **New repository**, đặt tên (ví dụ `billyvoice`), chọn **Public** (gói miễn phí chỉ bật Pages cho kho công khai), bấm *Create repository*.
2. Trong kho mới bấm **Add file → Upload files**, rồi **kéo toàn bộ nội dung bên trong thư mục này** (không kéo cả thư mục cha) vào. Phải thấy `index.html` ở ngay mức ngoài cùng của kho. Bấm *Commit changes*.
   - Nếu GitHub chưa nhận thư mục con, tải lên từng thư mục `css`, `fonts`, `img`, `js`, `tests` một lần.
3. Vào **Settings → Pages**. Ở *Build and deployment* chọn **Deploy from a branch**, nhánh `main`, thư mục `/ (root)`, bấm *Save*.
4. Chờ 1–2 phút, trang hiện đường dẫn dạng `https://<tên-tài-khoản>.github.io/billyvoice/`. Mở trên điện thoại.
5. Cập nhật bản mới: tải đè các file đã đổi lên kho (Add file → Upload files), commit. Máy người dùng tự lấy bản mới lần mở sau (nhờ số phiên bản trong `sw.js`).

App cần chạy qua `https://` (GitHub Pages có sẵn) thì giọng nói và chế độ ngoại tuyến mới hoạt động. Không nên mở thẳng file `index.html` từ ổ đĩa: giọng nói và chế độ ngoại tuyến **không hoạt động**, và một số trình duyệt chặn lưu dữ liệu ở chế độ này (chưa kiểm).

## Chạy thử trên máy tính

```bash
python -m http.server 8765
```

rồi mở `http://localhost:8765/` (localhost được tính là an toàn nên giọng nói vẫn hoạt động). Bộ kiểm thử: `http://localhost:8765/tests/`.

## Chỉnh không cần viết mã

| Muốn đổi | Sửa file |
|---|---|
| Từ điển nhóm, từ khóa, biểu tượng nhóm mặc định | `js/categories.js` |
| Phiên bản, đường dẫn biểu mẫu góp ý, thời gian im lặng thì dừng nghe | `js/config.js` |
| Tên hiển thị, màu | (trong dự án đầy đủ) `06_UI/tokens.css`, `06_UI/microcopy.md` rồi chạy `tools/build-app.ps1` |

Dòng **Góp ý cho Billy** ở Cài đặt chỉ hiện khi bạn điền `feedbackUrl` trong `js/config.js`.

## Cấu trúc

```
index.html            vỏ app (biểu tượng + hình Billy được chèn sẵn bên trong)
manifest.webmanifest  để cài lên màn hình chính
sw.js                 chạy khi ngoại tuyến (tự cập nhật theo số phiên bản)
css/                  tokens (màu, chữ), components, motion (chuyển động), fonts, app
fonts/                Be Vietnam Pro (giấy phép SIL OFL, xem fonts/OFL.txt)
img/                  biểu tượng app
js/
  config.js           cấu hình
  microcopy.js        mọi chữ trên giao diện (tạo từ microcopy.md)
  lib.js              chữ, tiền, ngày thật
  vn-number.js        đọc số tiền tiếng Việt: 45k, ba lăm nghìn, hai triệu rưỡi…
  categories.js       nhóm mặc định và từ điển
  parser.js           câu nói → khoản (số tiền, ngày, loại, nhóm, câu hỏi lại)
  store.js            lưu trên máy (IndexedDB, dự phòng localStorage)
  speech.js           giọng nói của trình duyệt (vi-VN)
  motion.js           hiệu ứng dùng chung
  app-core.js         luồng ghi âm, câu hỏi làm rõ, sửa / xóa / hoàn tác, xuất CSV
  app-views.js        các màn và bảng trượt
  app-main.js         vẽ lại, thao tác, khởi động
tests/                kiểm thử bộ phân tích câu với bộ câu corpus
```

## Kiểm thử

Mở `tests/index.html` (qua `http://localhost` hoặc GitHub Pages). Trang chạy bộ phân tích trên **62 câu của `corpus.csv`** và **28 câu thêm ngoài corpus**, so với đáp án.

Kết quả bản 1.0.0 (ngày 17–18/10/2026): số tiền 100%, ngày 100%, loại giao dịch 100%, nhóm 100%, hỏi lại đúng 100% trên 62 câu; 28/28 câu thêm. Ngưỡng mục tiêu của dự án: số tiền, ngày, loại ≥ 95%; nhóm ≥ 90%.

**Đọc kết quả này cho đúng:** luật được viết **sau khi đã đọc bộ câu này**, nên 100% chưa phản ánh chuyện app hiểu đúng lời nói của người thật. 62 câu gồm 48 câu giả định do AI viết (`GD*`, không phải bằng chứng người dùng) và 14 câu kiểm thử (`TK*`); 28 câu thêm cũng do nhóm dự án viết. Cần thêm câu nói thật (qua phỏng vấn, test) để đo lại.

## Giới hạn đã biết

- **Chưa thử với người dùng thật, chưa thử giọng nói thật trên điện thoại.** Việc kiểm tra đã làm trên máy tính, bằng thao tác tự động và giọng giả lập. Web Speech API đặc biệt có thể khác nhau giữa các máy và trình duyệt.
- Bộ phân tích chỉ có **lớp 1** (luật viết tay chạy trên máy). Câu phức tạp có thể hiểu chưa đúng; Billy hỏi lại hoặc gắn "Xem lại". **Chưa có lớp 2** (AI) vì cần máy chủ giấu khóa API (xem `decision-log.md`).
- Dữ liệu **không đồng bộ** giữa các máy và **không sao lưu tự động**: dùng xuất CSV. Chưa có nhập lại CSV.
- Chưa có: đăng nhập, liên kết ngân hàng, ngân sách, dự báo (ngoài phạm vi MVP).
- Giọng nói cần có mạng (dịch vụ của trình duyệt); ngoại tuyến vẫn gõ chữ và xem dữ liệu được.

## Giấy phép

- Mã nguồn của app và hình minh họa linh vật Billy: **MIT** (file `LICENSE`, quyền tác giả ghi "Thảo (BillyVoice)"; đổi tên cho đúng chủ sở hữu nếu cần).
- Font **Be Vietnam Pro**: SIL Open Font License 1.1 (`fonts/OFL.txt`), giấy phép riêng, không thuộc MIT.