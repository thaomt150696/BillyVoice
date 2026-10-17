/* =========================================================
   BillyVoice – tiện ích dùng chung: chữ (microcopy), định dạng tiền, ngày thật, biểu tượng
   Cần microcopy.js (tạo từ 06_UI/microcopy.md) nạp trước.
   ========================================================= */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = (s, v) => { const cnt = {}; s = String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); return s.replace(/\{([^}]+)\}/g, (m, n) => { if (!(n in v)) return m; const x = v[n]; if (Array.isArray(x)) { cnt[n] = cnt[n] || 0; return x[Math.min(cnt[n]++, x.length - 1)]; } return x; }); };
const T = (k, v = {}) => { const s = MC[k]; if (s === undefined) { console.warn('Thiếu chữ:', k); return '[' + k + ']'; } return fmt(s, v); };
const L = (s, v = {}) => fmt(s, v);                              /* chữ viết thẳng trong mã (chưa có khóa trong microcopy.md) */
const attr = s => String(s).replace(/<[^>]+>/g, '').replace(/"/g, '&quot;');
const vnd = n => (n < 0 ? '−' : '') + String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
const sum = a => a.reduce((s, x) => s + x, 0);
const pctOf = (v, t) => t ? Math.round(v / t * 100) : 0;
const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const ic = (id, c = '') => `<svg class="bv-icon ${c}" aria-hidden="true" focusable="false"><use href="#bv-i-${id}"/></svg>`;
const mascot = (mood, c = '') => `<svg class="bv-mascot ${c}" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><use href="#bv-billy${mood && mood !== 'happy' ? '-' + mood : ''}"/></svg>`;
const ill = (id, c = '') => `<svg class="bv-ill ${c}" aria-hidden="true" focusable="false"><use href="#bv-ill-${id}"/></svg>`;

/* ---------- Ngày thật. Mỗi khoản lưu "ngày" là số nguyên (số ngày từ 1/1/1970 theo giờ địa phương); trên giao diện dùng độ lệch so với hôm nay (0, -1, …) ---------- */
const DOW = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const dayNum = d => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
const dateOfDay = n => { const u = new Date(n * 86400000); return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate()); };
let TODAY = dayNum(new Date());
const refreshToday = () => { const n = dayNum(new Date()); const changed = n !== TODAY; TODAY = n; return changed; };
const dayInfo = off => { const d = dateOfDay(TODAY + off), dow = d.getDay(); return {d: d.getDate(), m: d.getMonth() + 1, y: d.getFullYear(), dow, name: DOW[dow], lower: dow === 0 ? 'chủ nhật' : 'thứ ' + DOW[dow].split(' ')[1]}; };
const dmy = off => { const i = dayInfo(off); return i.d + '/' + i.m; };
const weekStart = w => { const dow = dateOfDay(TODAY).getDay(); return -((dow + 6) % 7) + 7 * w; };   /* thứ Hai của tuần w (0 = tuần này) */
function monthRange(mo) {
  const t = dateOfDay(TODAY); const first = new Date(t.getFullYear(), t.getMonth() + mo, 1), last = new Date(t.getFullYear(), t.getMonth() + mo + 1, 0);
  return {start: dayNum(first) - TODAY, end: mo === 0 ? 0 : dayNum(last) - TODAY, m: first.getMonth() + 1, y: first.getFullYear()};
}
const clock = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
