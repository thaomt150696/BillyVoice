# Nhật ký thay đổi – BillyVoice (app thật)

## 1.0.0 – 2026-10-18 (bản dùng thật đầu tiên, D33)

Chuyển từ prototype-v1 và hi-fi-v1 đã duyệt thành app dùng được. Giao diện, chữ, màu, biểu tượng, Billy và chuyển động giữ nguyên (D17–D32).

**Có:** ghi bằng giọng nói tiếng Việt (Web Speech vi-VN), gõ chữ, nhập tay · tách nhiều khoản trong một câu · hiểu tiền và ngày kiểu Việt ("45k", "ba lăm nghìn", "hai triệu rưỡi", "hôm qua", "thứ Ba") · tự xếp nhóm (từ điển sửa được, nhóm riêng tối đa 20) · thẻ xác nhận theo độ tin cậy, câu hỏi làm rõ (gia đình, cho mượn, nhận lại, chuyển ví, hoàn tiền, trả trước cho nhóm, ngày mơ hồ, số tiền bất thường, khoản trùng) · sửa, xóa, hoàn tác · Hôm nay / Tuần / Tháng với insight bằng lời · xuất CSV · màn quyền riêng tư · xóa toàn bộ dữ liệu · nhập môn 3 màn · chào lúc quay lại · ngoại tuyến (PWA) · sáng / tối · giảm chuyển động.

**Khác prototype:** ngày thật (không còn cố định 17/10/2026), dữ liệu lưu trên máy (IndexedDB), giọng nói thật, bộ phân tích câu thật; bỏ bảng điều phối, câu kịch bản và dữ liệu mẫu. Màn "Đang xử lý" chỉ hiện khi việc hiểu câu mất hơn 350 ms (lớp 1 chạy tức thì nên thường không thấy).

**Chữ đã sửa trong microcopy.md:** nội dung màn Quyền riêng tư nói đúng hành vi thật của giọng nói (Chrome/Edge có thể gửi âm thanh tới Google/Microsoft); bỏ mục "Câu nói khó gửi sang dịch vụ AI" vì chưa có lớp AI; thêm câu hỏi ngày chung `ask.date.q_generic`.

**Kiểm thử:** 62/62 câu corpus và 28/28 câu thêm khớp (xem README về cách đọc kết quả này). Đã chạy thật trong trình duyệt: nhập môn, gõ câu, nhiều khoản, hỏi lại, sửa, xóa, hoàn tác, xuất CSV, nhóm riêng, ngoại tuyến, xóa dữ liệu, tải lại giữ dữ liệu, service worker.

**Chưa kiểm:** giọng nói thật, điện thoại thật (Android / iPhone), cài lên màn hình chính, người dùng thật.

**Giấy phép:** thêm LICENSE (MIT) cho mã và hình Billy; font giữ OFL (D35).
