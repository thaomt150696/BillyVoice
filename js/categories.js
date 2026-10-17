/* =========================================================
   BillyVoice – nhóm chi tiêu mặc định và từ điển từ khóa
   CHẾ SỬA ĐƯỢC FILE NÀY mà không cần đụng vào mã khác (03_Features/auto-categorization.md §3).
   - Mỗi nhóm: [mã nhóm, tên hiển thị, mã biểu tượng (06_UI/icons.md), danh sách từ khóa / cụm từ].
   - Viết thường. Cụm càng dài càng được ưu tiên ("tiền nước" thắng "nước").
   - Người dùng sửa nhóm trong app (S17) thì dữ liệu của họ lưu riêng trên máy và đè lên từ điển này.
   - Nhóm lưu theo MÃ nhóm, không theo tên (D12). 'other' và 'uncat' là nhóm cố định.
   ========================================================= */
const BV_DEFAULT_GROUPS = [
  ['food', 'Ăn uống', 'food', ['trà sữa', 'trà đá', 'trà chanh', 'cà phê', 'cafe', 'cf', 'nước ngọt', 'nước mía', 'nước ép', 'sinh tố', 'bia', 'mua nước', 'ăn sáng', 'ăn trưa', 'ăn tối', 'cơm', 'phở', 'bún', 'bánh mì', 'xôi', 'đồ ăn', 'đặt đồ ăn', 'ăn vặt', 'đi chợ', 'rau', 'thịt', 'cá', 'trái cây', 'hoa quả', 'lẩu', 'nhậu']],
  ['transport', 'Đi lại', 'scooter', ['xăng', 'đổ xăng', 'gửi xe', 'vé xe', 'xe buýt', 'xe ôm', 'taxi', 'gọi xe', 'xe công nghệ', 'grab', 'sửa xe', 'rửa xe', 'vé máy bay']],
  ['shopping', 'Mua sắm', 'bag', ['áo', 'quần', 'giày', 'dép', 'túi', 'đồ gia dụng', 'đơn hàng', 'shopee', 'lazada', 'tiki', 'tiktok shop', 'tai nghe', 'quà']],
  ['selfcare', 'Chăm sóc cá nhân', 'sparkle', ['skincare', 'mỹ phẩm', 'son', 'cắt tóc', 'gội đầu', 'làm nail', 'spa']],
  ['health', 'Sức khỏe', 'health', ['thuốc', 'nhà thuốc', 'khám bệnh', 'nha khoa', 'xét nghiệm', 'gym']],
  ['family', 'Gia đình', 'family', ['bố mẹ', 'gửi mẹ', 'chuyển mẹ', 'gửi bố', 'chuyển về nhà', 'gửi về nhà', 'gia đình']],
  ['bills', 'Hóa đơn & nhà ở', 'home', ['tiền nhà', 'tiền trọ', 'tiền điện', 'tiền nước', 'hóa đơn nước', 'internet', 'wifi', 'nạp điện thoại', '4g']],
  ['education', 'Giáo dục', 'book', ['sách', 'khóa học', 'học phí', 'học tiếng anh']],
  ['work', 'Công việc', 'briefcase', ['quà khách hàng', 'tiếp khách', 'in ấn']],
  ['fun', 'Giải trí', 'ticket', ['xem phim', 'vé phim', 'karaoke', 'game', 'netflix', 'spotify', 'du lịch']],
  ['other', 'Khác', 'dots', []],
  ['uncat', 'Chưa phân loại', 'unknown', []]
];

/* Từ có thể thuộc hai nhóm: Billy hỏi lại một câu (độ tin cậy trung bình) */
const BV_AMBIGUOUS = {'siêu thị': ['food', 'shopping'], 'chợ': ['food', 'shopping']};

/* Động từ gợi ý nhóm khi không có từ khóa (độ tin cậy cao với ăn/uống) */
const BV_VERB_HINTS = [[/(^|\s)(ăn|uống|nhậu)(\s|$)/, 'food', 'high'], [/(^|\s)(khám)(\s|$)/, 'health', 'high'], [/(^|\s)(học)(\s|$)/, 'education', 'high']];
/* "mua …" mà không khớp nhóm nào: gợi ý Mua sắm nhưng gắn "Xem lại" (độ tin cậy trung bình) */
const BV_BUY_FALLBACK = 'shopping';

/* Biểu tượng cho người dùng chọn khi tạo nhóm riêng (06_UI/icons.md §2) */
const BV_PICK_ICONS = ['star', 'paw', 'gift', 'plane', 'coffee', 'phone', 'heart', 'leaf', 'dumbbell', 'camera', 'food', 'scooter', 'bag', 'sparkle', 'health', 'family', 'home', 'book', 'briefcase', 'ticket'];
const BV_MAX_GROUPS = 20;
