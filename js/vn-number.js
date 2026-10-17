/* =========================================================
   BillyVoice – đọc số tiền tiếng Việt (lớp 1, chạy trên máy)
   Hiểu: 45k · 45 nghìn · 2,5 triệu · 1tr2 · 1.200.000 · ba lăm nghìn · bốn lăm ca ·
         năm mươi lăm (không đơn vị → nghìn) · một triệu hai · hai triệu rưỡi · ba trăm rưỡi
   Quy tắc đã chốt: 01_Research/corpus-guide.md §4. Hàm thuần, không đụng giao diện, kiểm bằng tests/index.html.
   ========================================================= */
const BVNum = (() => {
  const DIG = {'không': 0, 'một': 1, 'mốt': 1, 'hai': 2, 'ba': 3, 'bốn': 4, 'tư': 4, 'năm': 5, 'lăm': 5, 'nhăm': 5, 'sáu': 6, 'bảy': 7, 'bẩy': 7, 'tám': 8, 'chín': 9};
  const D2OK = new Set(['lăm', 'nhăm', 'một', 'mốt', 'hai', 'ba', 'bốn', 'sáu', 'bảy', 'tám', 'chín']);   /* chữ số thứ hai khi nói gọn: "ba lăm", "bốn hai" */
  const SCALE = {'nghìn': 1e3, 'ngàn': 1e3, 'triệu': 1e6, 'củ': 1e6, 'tỷ': 1e9, 'tỉ': 1e9};
  const UNIT = {'k': 1e3, 'ca': 1e3, 'nghìn': 1e3, 'ngàn': 1e3, 'triệu': 1e6, 'tr': 1e6, 'củ': 1e6, 'lít': 1e5, 'đồng': 1, 'vnd': 1, 'vnđ': 1, 'đ': 1, 'm': 1e6};
  const NOT_AMT_NEXT = new Set(['người', 'ngày', 'giờ', 'phút', 'giây', 'tuần', 'tháng', 'lần', 'cái', 'chiếc', 'bạn', 'phần', 'bữa', 'món', 'chai', 'ly', 'cốc', 'tuổi', '%', 'h']);
  const NOT_AMT_PREV = new Set(['tháng', 'ngày', 'lúc', 'số', 'mã']);                  /* trước số: "tháng 10", "ngày 12"… không phải tiền */
  const NOT_AMT_PREV_DIGIT = new Set(['tầng', 'phòng', 'lớp']);                        /* chỉ với chữ số: "phòng 101" (còn "cơm văn phòng năm mươi lăm" là tiền) */

  const tokenize = s => { const out = [], re = /[\p{L}\p{N}]+(?:[.,][\p{N}]+)*/gu; let m; while ((m = re.exec(s))) out.push({t: m[0].toLowerCase(), i: m.index, e: m.index + m[0].length}); return out; };

  /* Số viết bằng chữ số: "45", "2,5", "1.200.000", "45k", "2tr", "1tr2" */
  function parseDigits(t) {
    let m;
    if ((m = t.match(/^(\d+)(tr|triệu|củ|m)(\d)$/))) return {v: (+m[1] + (+m[3]) / 10) * 1e6, unit: true};
    if ((m = t.match(/^(\d+(?:[.,]\d+)*)(k|tr|triệu|nghìn|ngàn|củ|lít|đ|đồng|vnd|vnđ|m)$/))) { const n = num(m[1]); return n == null ? null : {v: n * UNIT[m[2]], unit: true, scale: UNIT[m[2]]}; }
    if ((m = t.match(/^\d+(?:[.,]\d+)*$/))) { const n = num(t); return n == null ? null : {v: n, unit: false, plain: true, thousands: /^\d{1,3}([.,]\d{3})+$/.test(t)}; }
    return null;
  }
  function num(s) { if (/^\d{1,3}([.,]\d{3})+$/.test(s)) return parseInt(s.replace(/[.,]/g, ''), 10); const x = parseFloat(s.replace(',', '.')); return isNaN(x) ? null : x; }

  /* Đọc một nhóm dưới 1000 bằng chữ. Trả {v, j, n} (j: token kế tiếp, n: số token đã đọc) hoặc null. */
  function readGroup(tk, i) {
    const n = tk.length, t = k => (k < n ? tk[k].t : '');
    const isDig = k => k < n && t(k) in DIG && !(t(k) === 'ba' && t(k + 1) === 'mẹ');   /* "ba mẹ" là bố mẹ, không phải số 3 */
    let j = i, v = 0, used = 0;
    const take = (len = 1) => { j += len; used += len; };
    const done = () => ({v, j, n: used});
    if (t(j) === 'mười') { v = 10; take(); if (isDig(j) && D2OK.has(t(j))) { v += DIG[t(j)]; take(); } return done(); }
    if (!isDig(j)) return null;
    const d1 = DIG[t(j)];
    if (t(j + 1) === 'trăm') {
      v = d1 * 100; take(2);
      if (t(j) === 'rưỡi') { v += 50; take(); return done(); }                                   /* ba trăm rưỡi = 350 */
      if (t(j) === 'lẻ' || t(j) === 'linh') { take(); if (isDig(j)) { v += DIG[t(j)]; take(); } return done(); }
      if (t(j) === 'mười') { v += 10; take(); if (isDig(j) && D2OK.has(t(j))) { v += DIG[t(j)]; take(); } return done(); }
      if (isDig(j) && t(j + 1) === 'mươi') { v += DIG[t(j)] * 10; take(2); if (isDig(j) && (D2OK.has(t(j)) || t(j) === 'tư' || t(j) === 'năm')) { v += DIG[t(j)]; take(); } return done(); }
      if (isDig(j) && D2OK.has(t(j))) { v += DIG[t(j)] * 10; take(); }                          /* "một trăm hai" nói gọn = 120 */
      return done();
    }
    if (t(j + 1) === 'mươi') { v = d1 * 10; take(2); if (isDig(j) && (D2OK.has(t(j)) || t(j) === 'tư' || t(j) === 'năm')) { v += DIG[t(j)]; take(); } return done(); }
    v = d1; take();
    if (d1 >= 2 && isDig(j) && D2OK.has(t(j)) && t(j + 1) !== 'trăm' && t(j + 1) !== 'mươi') { v = d1 * 10 + DIG[t(j)]; take(); }   /* "ba lăm" = 35 */
    return done();
  }
  /* Đọc cả số bằng chữ có thể kèm nghìn/triệu/rưỡi. Trả {value, j, tokens, scaled} hoặc null. */
  function readWords(tk, i) {
    const n = tk.length; let pos = i, total = 0, last = 0, any = false, tokens = 0, scaled = false;
    while (pos < n) {
      const g = readGroup(tk, pos);
      if (g) {
        const nx = pos + g.n < n ? tk[pos + g.n].t : '';
        if (nx in SCALE) {
          total += g.v * SCALE[nx]; last = SCALE[nx]; scaled = true; any = true; pos = g.j + 1; tokens += g.n + 1; continue;
        }
        if (any && last) { const r = g.v < 10 ? g.v * last / 10 : g.v < 100 ? g.v * last / 100 : g.v * last / 1000; total += r; pos = g.j; tokens += g.n; break; }
        total = g.v; pos = g.j; tokens += g.n; any = true; break;
      }
      if (tk[pos].t === 'rưỡi' && any && last) { total += last / 2; pos++; tokens++; break; }
      break;
    }
    if (!any) return null;
    return {value: total, j: pos, tokens, scaled};
  }

  /* Tìm mọi số tiền trong một đoạn. Trả mảng {value, start, end, text, explicit}. */
  function findAmounts(text) {
    const tk = tokenize(text), out = [];
    for (let i = 0; i < tk.length;) {
      const cur = tk[i], nextTok = tk[i + 1], prevTok = tk[i - 1];
      const d = parseDigits(cur.t);
      if (d) {
        if (prevTok && (NOT_AMT_PREV.has(prevTok.t) || NOT_AMT_PREV_DIGIT.has(prevTok.t)) && !d.unit && !(nextTok && nextTok.t in UNIT)) { i++; continue; }
        let value = d.v, end = cur.e, j = i + 1, hasUnit = d.unit, scale = d.scale || 0;
        if (!d.unit && nextTok && nextTok.t in UNIT) { scale = UNIT[nextTok.t]; value = d.v * scale; end = nextTok.e; j = i + 2; hasUnit = true; }
        if (hasUnit && scale >= 1e3) {
          const a = tk[j];
          if (a && a.t === 'rưỡi') { value += scale / 2; end = a.e; j++; }
          else if (a && /^\d{1,3}$/.test(a.t) && !(tk[j + 1] && tk[j + 1].t in UNIT) && !(tk[j + 1] && NOT_AMT_NEXT.has(tk[j + 1].t))) { const r = +a.t; value += r < 10 ? r * scale / 10 : r < 100 ? r * scale / 100 : r * scale / 1000; end = a.e; j++; }
        }
        if (!hasUnit) {
          if (nextTok && NOT_AMT_NEXT.has(nextTok.t)) { i++; continue; }
          if (/^\d{1,2}\/\d{1,2}/.test(text.slice(cur.i)) || /^\d{1,2}[hg]\d{0,2}/.test(text.slice(cur.i))) { i++; continue; }
          if (!d.thousands && value < 1000) value *= 1000;
        }
        out.push({value: Math.round(value), start: cur.i, end, text: text.slice(cur.i, end), explicit: hasUnit}); i = j; continue;
      }
      if (cur.t in DIG || cur.t === 'mười') {
        const w = readWords(tk, i);
        if (w) {
          let value = w.value, j = w.j, end = tk[j - 1].e, explicit = w.scaled;
          const u = tk[j];
          if (!explicit && u && (u.t === 'k' || u.t === 'ca' || u.t === 'nghìn' || u.t === 'ngàn')) { value *= 1e3; end = u.e; j++; explicit = true; }
          else if (!explicit && u && (u.t === 'triệu' || u.t === 'tr' || u.t === 'củ')) { value *= 1e6; end = u.e; j++; explicit = true; }
          else if (!explicit && u && u.t === 'lít') { value *= 1e5; end = u.e; j++; explicit = true; }
          else if (!explicit && u && (u.t === 'đồng' || u.t === 'đ' || u.t === 'vnd')) { end = u.e; j++; explicit = true; }
          const nx = tk[j];
          if (!explicit) {
            if (w.tokens < 2) { i++; continue; }                                  /* một chữ số đơn lẻ không đơn vị ("năm nay") không phải tiền */
            if (nx && NOT_AMT_NEXT.has(nx.t)) { i = j; continue; }
            if (prevTok && NOT_AMT_PREV.has(prevTok.t)) { i = j; continue; }
            if (value < 1000) value *= 1000;
          } else if (nx && NOT_AMT_NEXT.has(nx.t) && value < 1000) { i = j; continue; }
          out.push({value: Math.round(value), start: cur.i, end, text: text.slice(cur.i, end), explicit}); i = j; continue;
        }
      }
      i++;
    }
    return out;
  }

  return {findAmounts, tokenize};
})();
