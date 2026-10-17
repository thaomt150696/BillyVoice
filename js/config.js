/* =========================================================
   BillyVoice – cấu hình. Chế sửa được file này, không cần đụng vào mã khác.
   ========================================================= */
const BV_CONFIG = {
  version: '1.0.0',            /* hiện ở Cài đặt → Phiên bản */
  speechLang: 'vi-VN',         /* ngôn ngữ nhận diện giọng nói của trình duyệt */
  feedbackUrl: '',             /* đường dẫn biểu mẫu góp ý (ví dụ Microsoft Forms). Để trống thì ẩn dòng "Góp ý cho Billy" */
  silenceMs: 2000,             /* im lặng bao lâu thì Billy tự dừng nghe */
  noSpeechMs: 5000,            /* không nghe thấy gì sau bao lâu thì báo "Billy chưa nghe thấy gì" */
  maxListenMs: 60000           /* nghe tối đa 1 phút mỗi lần (listen.too_long) */
};
