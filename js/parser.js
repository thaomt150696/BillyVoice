/* =========================================================
   BillyVoice – bộ phân tích câu (lớp 1, chạy trên máy, không cần mạng)
   Câu nói → danh sách khoản: số tiền, ngày, loại, nhóm, và câu cần hỏi lại.
   Quy tắc: 04_Flows/sitemap.md §4, 03_Features/auto-categorization.md, 01_Research/corpus-guide.md.
   Hàm thuần, kiểm bằng tests/index.html (bộ câu corpus.csv). Cần vn-number.js và categories.js nạp trước.
   Kết quả: {kind: 'nothing' | 'noAmount' | 'ok', items: [...]}.
   Mỗi khoản: {name, amount, date (số ngày so với hôm nay: 0, -1, …), type, group, conf, place, ask, status, dateUnsure}
     type: spend | income | loan | repaid | transfer | refund | group
     ask:  {kind: family | loan | repaid | transfer | refund | group | category | date, …}  → Billy hỏi 1 câu trước khi lưu
   ========================================================= */
const BVParse = (() => {
  const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const DAY = 86400000;
  const midnight = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const WEEKDAY = {'hai': 1, 'ba': 2, 'tư': 3, 'năm': 4, 'sáu': 5, 'bảy': 6, 'chủ nhật': 0};

  /* ---------- Ngày ---------- */
  function dateExprs(low, today) {
    const out = [], t0 = midnight(today), dow = t0.getDay();
    const push = (m, off) => out.push({index: m.index, length: m[0].length, off});
    let m, re;
    re = /hôm kia/g; while ((m = re.exec(low))) push(m, -2);
    re = /hôm qua|bữa qua/g; while ((m = re.exec(low))) push(m, -1);
    re = /hôm nay|bữa nay/g; while ((m = re.exec(low))) push(m, 0);
    re = /hôm trước|bữa trước|lần trước|tuần trước/g; while ((m = re.exec(low))) push(m, '?');
    re = /thứ (hai|ba|tư|năm|sáu|bảy)|chủ nhật/g;
    while ((m = re.exec(low))) { const target = m[1] ? WEEKDAY[m[1]] : 0; let off = 0; while ((((dow + off) % 7) + 7) % 7 !== target) off--; push(m, off); }
    re = /ngày (\d{1,2})(?:\s*tháng\s*(\d{1,2}))?/g;
    while ((m = re.exec(low))) { const o = offsetOfDM(+m[1], m[2] ? +m[2] : null, t0); push(m, o); }
    re = /(?<![\d.,/])(\d{1,2})\/(\d{1,2})(?![\d/])/g;
    while ((m = re.exec(low))) { const o = offsetOfDM(+m[1], +m[2], t0); push(m, o); }
    return out.sort((a, b) => a.index - b.index);
  }
  function offsetOfDM(d, mo, t0) {
    if (d < 1 || d > 31 || (mo != null && (mo < 1 || mo > 12))) return '?';
    let y = t0.getFullYear(), m = mo != null ? mo - 1 : t0.getMonth(), dt = new Date(y, m, d);
    if (dt > t0) dt = mo != null ? new Date(y - 1, m, d) : new Date(y, m - 1, d);
    const off = Math.round((dt - t0) / DAY);
    return off < -400 || off > 0 ? '?' : off;
  }
  const maskDates = (s, ex) => { let r = s; ex.forEach(e => { r = r.slice(0, e.index) + ' '.repeat(e.length) + r.slice(e.index + e.length); }); return r; };

  /* ---------- Tách đoạn ---------- */
  const splitPunct = s => s.split(/(?:(?<![\p{N}])[.,;:]|[.,;:](?![\p{N}])|[\n!?])+/u).map(x => x.trim()).filter(Boolean);
  const FILL = new Set(['mình', 'tôi', 'em', 'anh', 'chị', 'ghi', 'chi', 'tiêu', 'hôm', 'qua', 'nay', 'kia', 'sáng', 'trưa', 'chiều', 'tối', 'hết', 'là', 'đã', 'vừa', 'thứ', 'hai', 'ba', 'tư', 'năm', 'sáu', 'bảy', 'chủ', 'nhật']);
  const amountsIn = (s, today) => BVNum.findAmounts(maskDates(s, dateExprs(s.toLowerCase(), today)));
  function splitByAmounts(seg, today) {
    const am = amountsIn(seg, today); if (am.length < 2) return [seg];
    const before = BVNum.tokenize(seg.slice(0, am[0].start).toLowerCase()).filter(x => !FILL.has(x.t));
    const prefix = before.length > 0;
    const between = seg.slice(am[0].end, am[1].start); let conn = null, c; const cre = /(?:^|\s)(và|rồi|sau đó|với|còn|cộng|\+)(?=\s|$)/gi;
    while ((c = cre.exec(between))) conn = c;
    let left, right;
    if (conn) { const at = am[0].end + conn.index; left = seg.slice(0, at); right = seg.slice(at + conn[0].length); }
    else if (prefix) { left = seg.slice(0, am[0].end); right = seg.slice(am[0].end); }
    else { left = seg.slice(0, am[1].start); right = seg.slice(am[1].start); }
    return [left.trim(), ...splitByAmounts(right.trim(), today)].filter(Boolean);
  }

  /* ---------- Nhóm ---------- */
  function tokensOf(s) { return BVNum.tokenize(s.toLowerCase()).map(x => x.t); }
  function hasPhrase(toks, phrase) {
    const p = phrase.toLowerCase().split(/\s+/); if (!p[0]) return false;
    for (let i = 0; i + p.length <= toks.length; i++) { let ok = true; for (let k = 0; k < p.length; k++) if (toks[i + k] !== p[k]) { ok = false; break; } if (ok) return true; }
    return false;
  }
  function groupOf(text, groups) {
    const toks = tokensOf(text); let best = null;
    groups.forEach(g => {
      if (g.id === 'other' || g.id === 'uncat') return;
      (g.kw || []).forEach(ph => {
        if (!ph || !hasPhrase(toks, ph)) return;
        const own = !(g.defKw || []).includes(ph);                                        /* từ khóa do người dùng tự thêm được ưu tiên (D12) */
        const score = ph.split(/\s+/).length * 100 + ph.length + (own ? 1000 : 0);
        if (!best || score > best.score) best = {g: g.id, phrase: ph, score, conf: 'high'};
      });
    });
    Object.keys(BV_AMBIGUOUS).forEach(ph => { if (hasPhrase(toks, ph)) { const score = ph.split(/\s+/).length * 100 + ph.length; if (!best || score > best.score) best = {ambig: BV_AMBIGUOUS[ph], phrase: ph, score, conf: 'mid'}; } });
    if (best) return best;
    const low = ' ' + text.toLowerCase() + ' ';
    for (const [re, g, conf] of BV_VERB_HINTS) if (re.test(low)) return {g, phrase: g, score: 1, conf};
    if (/(^|\s)mua(\s|$)/.test(low)) return {g: BV_BUY_FALLBACK, phrase: 'mua', score: 1, conf: 'mid'};
    return null;
  }

  /* ---------- Loại giao dịch ---------- */
  const RE = {
    repaid: /trả lại|trả mình|trả cho mình|chuyển trả|thu hồi|trả tiền mượn/,
    refund: /(^|\s)hoàn(\s|$)/,
    loan: /cho\s+(.+?)\s+mượn|cho vay/,
    transfer: /(từ|sang|qua|vào)\s+(tài khoản|ví|ngân hàng|thẻ)|chuyển nội bộ|giữa các ví/,
    family: /(chuyển|gửi|biếu)\s+(về\s+)?(cho\s+)?(bố mẹ|ba mẹ|mẹ|bố|ba(?!\s*(triệu|nghìn|ngàn|trăm|mươi|chục|k\b|tr\b|lăm))|má|gia đình|nhà)(?=\s|$)/,
    income: /(^|\s)(lương|thưởng|thu nhập|nhận tiền|tiền lãi)(\s|$)/,
    groupCue: /trả trước|ứng (tiền|trước)|mọi người (sẽ )?(chuyển|gửi|trả)|(người khác|họ) (sẽ )?(chuyển|gửi) lại|(chuyển|gửi) lại phần|trả hết rồi/,
    explicit: {loan: /khoản phải thu|ghi là (cho vay|cho mượn)/, repaid: /thu hồi|đánh dấu/, transfer: /chuyển nội bộ/, family: /hỗ trợ gia đình/, refund: /khoản hoàn|liên kết/}
  };

  /* ---------- Phân tích ---------- */
  function parse(text, ctx = {}) {
    const groups = ctx.groups || BV_DEFAULT_GROUPS.map(g => ({id: g[0], name: g[1], icon: g[2], kw: g[3], defKw: g[3]}));
    const today = ctx.today || new Date();
    const raw = String(text || '').normalize('NFC').replace(/\s+/g, ' ').trim(); if (!raw) return {kind: 'nothing'};
    const segs = splitPunct(raw);

    /* ngày nói ở đầu câu hoặc ở đoạn riêng không có số tiền ("Hôm qua: …") áp cho mọi khoản */
    let base = null; { const s0 = segs[0], ex = dateExprs(s0.toLowerCase(), today);
      if (ex.length && typeof ex[0].off === 'number') { if (!amountsIn(s0, today).length || BVNum.tokenize(s0.slice(0, ex[0].index)).length <= 3) base = ex[0].off; } }

    const items = [];
    segs.forEach(seg => {
      splitByAmounts(seg, today).forEach(piece => {
        const ex = dateExprs(piece.toLowerCase(), today), am = BVNum.findAmounts(maskDates(piece, ex));
        if (!am.length) { if (items.length) items[items.length - 1].tail += ' ' + piece.toLowerCase(); return; }
        const a = am[am.length - 1];
        items.push({piece, a, ex, tail: ''});
      });
    });
    if (!items.length) return {kind: 'noAmount'};

    const out = [];
    items.forEach((p, idx) => {
      const low = p.piece.toLowerCase(), cx = (low + ' ' + p.tail).trim();
      let date = base != null ? base : 0, dateUnsure = false;
      const own = p.ex[0];                                                                  /* ngày nói ngay trong khoản đó thắng ngày chung của cả câu */
      if (own) {
        if (own.off === '?') { if (!/mượn$/.test(low.slice(0, own.index).trim())) dateUnsure = true; }   /* "tiền mượn hôm trước": hôm trước chỉ lúc cho mượn, không phải ngày trả */
        else date = own.off;
      }
      const lowM = maskDates(low, p.ex), cxM = (lowM + ' ' + p.tail).trim();               /* kiểm tra loại trên bản đã che chữ chỉ ngày ("hôm qua") */
      let name = cutName(p.piece, p.a, p.ex);
      const it = {name: cap(name) || 'Khoản chi', amount: p.a.value, date, type: 'spend', group: null, conf: 'high', place: null, ask: null, status: 'saved', dateUnsure};
      let m;
      const ex = RE.explicit;
      if (RE.repaid.test(lowM)) { it.type = 'repaid'; it.name = 'Bạn trả lại tiền mượn'; it.ask = ex.repaid.test(cxM) ? null : {kind: 'repaid'}; }
      else if (RE.refund.test(lowM)) {
        it.type = 'refund'; it.name = 'Được hoàn tiền';
        const prev = out[out.length - 1]; const shop = /(^|\s)shop(\s|$)/.test(lowM) ? 'Shop' : /cửa hàng/.test(lowM) ? 'Cửa hàng' : 'Cửa hàng';
        it.group = prev && prev.type === 'spend' ? prev.group : ((groupOf(lowM, groups) || {}).g || 'other');
        it.ask = ex.refund.test(cxM) ? null : {kind: 'refund', shop, desc: prev ? prev.name : ''};
      }
      else if ((m = lowM.match(RE.loan))) { const who = ((m[1] || 'bạn').replace(/^(mình|tôi)\s+/, '') || 'bạn'); it.type = 'loan'; it.name = 'Cho ' + who + ' mượn'; it.ask = ex.loan.test(cxM) ? null : {kind: 'loan', who}; }
      else if (RE.transfer.test(lowM)) { it.type = 'transfer'; it.name = 'Chuyển giữa ví của mình'; it.ask = ex.transfer.test(cxM) ? null : {kind: 'transfer'}; }
      else if (RE.groupCue.test(cxM)) {
        const n = (cxM.match(/(\d+)\s*người/) || [])[1] || wordCount(cxM);
        it.type = 'group'; it.name = /ăn|bữa/.test(lowM) ? 'Trả trước bữa ăn' : 'Trả trước cho nhóm';
        it.group = (groupOf(lowM, groups) || {}).g || 'other'; if (it.group === 'uncat') it.group = 'other'; it.ask = {kind: 'group', n: n ? +n : null};
      }
      else if ((m = lowM.match(RE.family))) { const who = m && m[4] ? m[4] : 'nhà'; it.type = 'spend'; it.group = 'family'; it.name = cap(m ? m[1] : 'chuyển') + ' ' + who; it.ask = ex.family.test(cxM) ? null : {kind: 'family', who}; }
      else if (RE.income.test(lowM)) { it.type = 'income'; it.name = /lương/.test(lowM) ? 'Nhận lương' : 'Tiền kiếm được'; }
      else {
        const g = groupOf(lowM, groups);
        if (g && g.ambig) { it.ask = {kind: 'category', cand: g.ambig, place: g.phrase}; it.group = g.ambig[0]; it.conf = 'mid'; }
        else if (g) { it.group = g.g; it.place = g.phrase; it.conf = g.conf; if (g.conf === 'mid') it.status = 'review'; }
        else { it.group = 'uncat'; it.status = 'review'; it.conf = 'low'; }
      }
      if (dateUnsure && !it.ask) it.ask = {kind: 'date'};
      if (dateUnsure && it.ask && it.ask.kind !== 'date') it.status = 'review';          /* mỗi khoản chỉ hỏi 1 câu: điểm chưa chắc còn lại gắn "Xem lại" (US-06) */
      out.push(it);
    });
    return {kind: 'ok', items: out};
  }

  function wordCount(cx) { const m = cx.match(/(một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười)\s+người/); return m ? ({'một': 1, 'hai': 2, 'ba': 3, 'bốn': 4, 'năm': 5, 'sáu': 6, 'bảy': 7, 'tám': 8, 'chín': 9, 'mười': 10})[m[1]] : null; }

  /* Mô tả: bỏ số tiền, bỏ ngày, bỏ từ đệm ở đầu/cuối */
  function cutName(piece, a, ex) {
    let n = maskOut(piece, a, ex);
    n = n.replace(/\s+/g, ' ').trim();
    let prev;
    do { prev = n; n = n.replace(/^(mình|tôi|em|ghi chi|ghi|chi|sáng|trưa|chiều|tối|mua|uống|nhé|tiêu|hết|là|và|rồi|sau đó|với|đã|vừa)\s+/i, ''); } while (prev !== n);
    n = n.replace(/\s+(hết|là|nhé|với|và)$/i, '').replace(/^(hết|là)\s+/i, '').trim();
    return n;
  }
  function maskOut(piece, a, ex) {
    const cuts = [{index: a.start, length: a.end - a.start}, ...ex].sort((x, y) => y.index - x.index);
    let r = piece; cuts.forEach(c => { r = r.slice(0, c.index) + ' ' + r.slice(c.index + c.length); });
    return r;
  }

  return {parse, groupOf, dateExprs};
})();
