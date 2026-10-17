/* =========================================================
   BillyVoice – lõi app: trạng thái, dữ liệu thật, luồng ghi âm / gõ chữ, câu hỏi làm rõ, sửa / xóa / hoàn tác
   Chuyển từ prototype-v1 đã duyệt (D23, D24); khác ở chỗ dùng ngày thật, dữ liệu lưu trên máy (BVStore),
   giọng nói thật (BVSpeech) và bộ phân tích câu thật (BVParse). Luồng và chữ giữ nguyên.
   Thứ tự nạp: config, microcopy, lib, vn-number, categories, parser, store, speech, motion, app-core, app-views, app-main.
   ========================================================= */
let S = null, UID = 0, TID = 0, TOASTT = null, LISTEN = null, LISTEN_ID = 0;
const TYPES = ['spend', 'income', 'loan', 'repaid', 'transfer', 'refund', 'group'];
const TYPE_KEY = {spend: 'type.spend', income: 'type.income', loan: 'type.loan', repaid: 'type.repaid', transfer: 'type.transfer', refund: 'type.refund', group: 'type.group'};
const TYPE_ICON = {income: 't-income', loan: 't-loan', repaid: 't-repaid', transfer: 't-transfer', refund: 't-refund', group: 't-group'};
const ICON_NAME = id => T('icon.name.' + id);
const typeLabel = t => T(TYPE_KEY[t]);

/* ---------- Nhóm chi tiêu (mặc định + do người dùng chỉnh, lưu trên máy) ---------- */
function mkGroups(saved) {
  const defs = BV_DEFAULT_GROUPS.map(g => ({id: g[0], name: g[1], icon: g[2], kw: [...g[3]], custom: false, defKw: [...g[3]], locked: g[0] === 'other' || g[0] === 'uncat'}));
  if (!Array.isArray(saved)) return defs;
  const byId = Object.fromEntries(defs.map(d => [d.id, d])), out = [];
  saved.forEach(s => {
    const d = byId[s.id];
    if (d) { if (!d.locked) { d.name = s.name || d.name; d.icon = s.icon || d.icon; if (Array.isArray(s.kw)) d.kw = s.kw; } out.push(d); delete byId[s.id]; }
    else if (s.custom && out.length < BV_MAX_GROUPS) out.push({id: s.id, name: s.name, icon: s.icon || 'star', kw: s.kw || [], custom: true, defKw: [], locked: false});
  });
  Object.values(byId).forEach(d => { const i = out.findIndex(g => g.id === 'other'); out.splice(i < 0 ? out.length : i, 0, d); });
  return out;
}
const saveGroups = () => BVStore.setKv('groups', S.groups.map(g => ({id: g.id, name: g.name, icon: g.icon, kw: g.kw, custom: g.custom})));
const grp = id => S.groups.find(g => g.id === id);
const gname = id => (grp(id) || {name: 'Chưa phân loại'}).name;
const gicon = id => (grp(id) || {icon: 'unknown'}).icon;

/* ---------- Khoản chi: lưu "ngày" (số nguyên); trên giao diện dùng "date" = độ lệch so với hôm nay ---------- */
const recOf = t => { const r = Object.assign({}, t); delete r.date; return r; };
const syncOffsets = () => S.tx.forEach(t => { t.date = t.day - TODAY; });
function addTx(o) {
  const t = Object.assign({id: ++TID, time: clock(), say: '', src: 'voice', status: 'saved', uid: 0, group: null, createdAt: Date.now()}, o);
  t.day = TODAY + (t.date || 0); t.date = t.day - TODAY; S.tx.push(t); BVStore.putTx(recOf(t)); return t;
}
const touchTx = t => { t.day = TODAY + t.date; BVStore.putTx(recOf(t)); };
const removeUid = uid => { S.tx.filter(t => t.uid === uid).forEach(t => BVStore.delTx(t.id)); S.tx = S.tx.filter(t => t.uid !== uid); };

function saveItem(it, uid, say, src) {
  const base = {name: it.name, date: it.date, say, src, uid, status: it.status || 'saved'};
  if (it.type === 'group') {
    const share = it.share != null ? it.share : it.amount;
    if (share > 0) addTx(Object.assign({}, base, {type: 'spend', group: it.group || 'food', amount: share, name: it.name.replace('Trả trước', 'Phần của mình ·')}));
    if (it.amount - share > 0) addTx(Object.assign({}, base, {type: 'group', group: null, amount: it.amount - share}));
  } else addTx(Object.assign({}, base, {type: it.type, group: ['spend', 'refund'].includes(it.type) ? (it.group || 'other') : null, amount: it.amount}));
}

/* ---------- Toast ---------- */
function toast(html, undo, ms = 3500, mood = '') { clearTimeout(TOASTT); S.toast = {html, undo, mood, ms}; render(); TOASTT = setTimeout(() => { S.toast = null; render(); }, ms); }
const dayLabel = off => off === 0 ? T('today.period.label') : off === -1 ? T('today.period.yesterday') : dayInfo(off).name + ', ' + dmy(off);

/* ---------- Ghi âm ---------- */
function micTap() {
  if (S.mic === 'busy') return;
  if (S.mic === 'listening') return stopListen();
  if (S.denied) { toast(T('mic.denied.help'), null); return; }
  if (!BVSpeech.supported) { toast(T('mic.unsupported'), null); return; }
  if (S.offline) { toast(T('mic.off.desc'), null); return; }
  if (!S.micAsked && !S.micGranted) { S.sheet = {type: 'perm'}; render(); return; }
  startListen();
}
function startListen() {
  const id = ++LISTEN_ID; S.mic = 'listening'; S.sheet = {type: 'listen', shown: '', secs: 0}; render();
  LISTEN = BVSpeech.start({
    onText: txt => { if (id !== LISTEN_ID || !S.sheet) return; S.sheet.shown = txt; const el = $('#tr'); if (el) el.textContent = txt; },
    onTick: secs => { if (id !== LISTEN_ID || !S.sheet) return; S.sheet.secs = secs; const tm = $('#tm'); if (tm) tm.innerHTML = T('listen.timer', {m: 0, ss: String(secs).padStart(2, '0')}); },
    onEnd: r => { if (id !== LISTEN_ID) return; LISTEN = null; onListenEnd(r); }
  });
}
function stopListen() { if (LISTEN) LISTEN.stop(); }
function abortListen() { LISTEN_ID++; if (LISTEN) { try { LISTEN.abort(); } catch (e) {} LISTEN = null; } }
function onListenEnd(r) {
  S.mic = 'idle';
  if (r.error === 'denied') { S.denied = true; S.micAsked = true; BVStore.setKv('micAsked', true); S.sheet = null; render(); toast(T('mic.denied.help'), null); return; }
  S.micAsked = true; S.micGranted = true; BVStore.setKv('micAsked', true);
  if (r.error === 'no-mic') { S.sheet = null; render(); toast(T('mic.off.desc'), null); return; }
  if (r.error === 'network') { S.sheet = null; if (r.text) S.dockText = r.text; S.tab = 'today'; S.stack = []; render(); toast(T('listen.lost_net'), null, 6000); return; }
  if (r.error || !r.text) { S.sheet = {type: 'nothing'}; render(); return; }
  if (r.reason === 'max') toast(T('listen.too_long'), null, 4000);
  process(r.text, 'voice');
}

/* ---------- Hiểu câu (lớp 1 chạy ngay trên máy). Sheet "đang xử lý" chỉ hiện nếu mất hơn 350 ms (khi có lớp 2 sau này). ---------- */
async function process(say, src) {
  let shown = false; const t = setTimeout(() => { shown = true; S.mic = 'busy'; S.sheet = {type: 'process', say}; render(); }, 350);
  const p = await Promise.resolve(BVParse.parse(say, {groups: S.groups, today: new Date()}));
  clearTimeout(t); S.mic = 'idle';
  if (p.kind !== 'ok') { S.sheet = {type: p.kind === 'noAmount' ? 'noamount' : 'nothing', say, src}; render(); return; }
  runFlow(say, p.items, src);
}
function needsAsk(it) {
  if (it.ask) return true;
  if (it.type === 'spend' && ((['food', 'transport'].includes(it.group) && it.amount >= 5e6) || it.amount >= 5e7)) { it.ask = {kind: 'unusual'}; return true; }
  const now = Date.now(); if (S.tx.some(t => t.createdAt && now - t.createdAt < 6e5 && t.name.toLowerCase() === it.name.toLowerCase() && t.amount === it.amount && t.day === TODAY + it.date)) { it.ask = {kind: 'dup'}; return true; }
  return false;
}
function runFlow(say, items, src) {
  const uid = ++UID; const fl = {uid, say, src, items: items.map(i => Object.assign({}, i, {st: 'new'}))};
  S.flow = fl;
  if (!S.firstDone) { S.sheet = {type: 'first'}; render(); return; }                  /* khoản đầu tiên luôn hiện thẻ, không tự lưu (D09) */
  fl.items.forEach(it => { if (needsAsk(it)) it.st = 'pending'; else { saveItem(it, uid, say, src); it.st = 'done'; } });
  advance();
}
function advance() {
  const fl = S.flow; if (!fl) return;
  const i = fl.items.findIndex(x => x.st === 'pending');
  if (i === -1) return finish();
  fl.cur = i; S.sheet = {type: 'ask'}; render();
}
function finish() {
  const fl = S.flow; S.sheet = null; S.mic = 'idle'; if (!fl) return render();
  const saved = S.tx.filter(t => t.uid === fl.uid); S.flow = null;
  if (!saved.length) return render();
  const spendTotal = sum(saved.filter(t => t.type === 'spend').map(t => t.amount));
  const first = saved[0]; let html;
  if (saved.length === 1) {
    const hasG = ['spend', 'refund'].includes(first.type);
    const vars = {desc: '<b>' + esc(first.name) + '</b>', amount: '<b>' + vnd(first.amount) + '</b>', group: esc(hasG ? gname(first.group) : ''), 'ngày': dayLabel(first.date)};
    html = first.date === 0 ? T(hasG ? 'toast.saved' : 'toast.saved.nogroup', vars) : T(hasG ? 'toast.saved.past' : 'toast.saved.nogroup.past', vars);
  } else html = T('toast.saved.multi', {n: saved.length, total: vnd(spendTotal)});
  const dates = [...new Set(saved.map(t => t.date))]; if (S.tab === 'today' && !S.stack.length && dates.length === 1) S.todayOff = dates[0];
  toast(html, () => { removeUid(fl.uid); toast(T('toast.undone'), null); }, 5000, 'cheer');
}

/* ---------- Câu hỏi làm rõ (mỗi khoản tối đa 1 câu, D09) ---------- */
function askDef(it) {
  const k = it.ask.kind, amt = vnd(it.amount), fl = S.flow;
  const set = patch => () => { Object.assign(it, patch); if ('date' in patch) it.dateUnsure = false; if (!it.ask.keep) { it.st = 'ready'; saveItem(it, fl.uid, fl.say, fl.src); it.st = 'done'; } advance(); };
  if (k === 'family') { const w = it.ask.who; return {q: T('ask.family.q', {amount: amt, 'người': esc(w)}), opts: [
    {t: L('Tiền gửi gia đình'), f: set({type: 'spend', group: 'family'})},
    {t: L('Cho {người} mượn, {người} sẽ trả lại', {'người': esc(w)}), f: set({type: 'loan', group: null, name: 'Cho ' + w + ' mượn'})},
    {t: T('common.other'), f: () => openEdit(it)}]}; }
  if (k === 'loan') { const w = it.ask.who; return {q: T('ask.loan.q', {amount: amt, 'người': [esc(w), w === 'bạn' ? 'bạn ấy' : esc(w)]}), sub: dayLabel(it.date) + (it.date ? ' · ' + dayInfo(it.date).name + ' ' + dmy(it.date) : ''), opts: [
    {t: L('Đúng, sẽ được trả lại'), primary: true, f: set({type: 'loan'})},
    {t: L('Không, đây là tiền tiêu'), f: set({type: 'spend', group: 'other', name: 'Khoản chi'})}]}; }
  if (k === 'repaid') return {q: T('ask.repaid.q', {amount: amt}), opts: [
    {t: L('Đúng'), primary: true, f: set({type: 'repaid'})}, {t: L('Không, đây là tiền kiếm được'), f: set({type: 'income', name: 'Tiền kiếm được'})}]};
  if (k === 'transfer') return {q: T('ask.transfer.q', {amount: amt}), opts: [
    {t: L('Đúng, chỉ đổi chỗ'), primary: true, f: set({type: 'transfer'})}, {t: L('Không, đây là tiền tiêu'), f: set({type: 'spend', group: 'other', name: 'Khoản chi'})}]};
  if (k === 'refund') return {q: T('ask.refund.q', {'Cửa hàng': esc(it.ask.shop), amount: amt, 'mô tả': esc((it.ask.desc || 'trước đó').toLowerCase())}), opts: [
    {t: L('Đúng'), primary: true, f: set({type: 'refund'})}, {t: L('Không'), f: set({type: 'income', group: null, name: 'Tiền kiếm được'})}]};
  if (k === 'category') { const [a, b] = it.ask.cand; return {q: T('ask.category.q', {amount: amt, 'nơi': esc(it.ask.place)}), chips: [a, b, 'other'].map(id => ({t: esc(gname(id)), icon: gicon(id), f: set({group: id, type: 'spend'})}))}; }
  if (k === 'date') return {q: it.type === 'repaid' ? T('ask.date.q', {amount: amt}) : T('ask.date.q_generic', {amount: amt}), sub: T('ask.date.note'), chips: [
    {t: T('today.period.label'), f: set({date: 0})}, {t: T('today.period.yesterday'), f: set({date: -1})}, {t: dayInfo(-2).name, f: set({date: -2})}, {t: L('Chọn ngày…'), f: () => openEdit(it)}]};
  if (k === 'unusual') return {q: T('confirm.unusual.title', {desc: esc(it.name), amount: '<span class="bv-num">' + amt + '</span>'}), sub: T('confirm.unusual.desc'), mood: 'wow', opts: [
    {t: T('confirm.unusual.yes'), primary: true, f: set({ask: {kind: 'done', keep: false}})}, {t: T('confirm.unusual.edit'), f: () => openEdit(it)}]};
  if (k === 'dup') { const prev = S.tx.slice().reverse().find(t => t.name.toLowerCase() === it.name.toLowerCase() && t.amount === it.amount); return {q: T('confirm.dup.title'), sub: T('confirm.dup.desc', {desc: esc(it.name), amount: amt, time: prev ? prev.time : clock()}), opts: [
    {t: T('confirm.dup.yes'), primary: true, f: set({ask: {kind: 'done'}})}, {t: T('confirm.dup.no'), f: () => { it.st = 'done'; it.skipped = true; advance(); }}]}; }
  return {q: '', opts: []};
}
function ans(i) { const fl = S.flow; if (!fl) return; const it = fl.items[fl.cur]; const d = askDef(it); const o = (d.opts || d.chips)[i]; if (o) o.f(); }
function askLater() { const fl = S.flow; const it = fl.items[fl.cur]; it.status = 'review'; if (!it.group && it.type === 'spend') it.group = 'uncat'; saveItem(it, fl.uid, fl.say, fl.src); it.st = 'done'; advance(); }
function groupConfirm(all) { const fl = S.flow; const it = fl.items[fl.cur]; const el = $('#shareInput'); let share = all ? it.amount : parseInt(((el && el.value) || '').replace(/\D/g, ''), 10); if (isNaN(share)) share = it.amount; if (share > it.amount) { S.sheet.err = true; return render(); } it.share = share; it.ask = {kind: 'done'}; saveItem(it, fl.uid, fl.say, fl.src); it.st = 'done'; advance(); }
function firstKeep(keep) {
  const fl = S.flow;
  if (keep) { fl.items.forEach(it => { saveItem(it, fl.uid, fl.say, fl.src); it.st = 'done'; }); }
  else { S.flow = null; S.sheet = null; render(); return; }
  S.firstDone = true; S.onb = null; BVStore.setKv('firstDone', true); BVStore.setKv('onboarded', true);
  finish(); setTimeout(() => toast(T('s04.first_tip'), null, 8000), 5200);
}
function undoFlow() { const fl = S.flow; if (fl) removeUid(fl.uid); S.flow = null; S.sheet = null; S.mic = 'idle'; toast(T('toast.undone'), null); }

/* ---------- Gõ chữ ---------- */
function sendText() { const el = $('#dockInput'); const text = (el ? el.value : S.dockText).trim(); if (!text) return; S.dockText = ''; if (el) el.value = ''; process(text, 'text'); }

/* ---------- Sửa, nhập tay, xóa ---------- */
function openEdit(target) {
  const isDraft = typeof target === 'object' && !('id' in target); const src = isDraft ? target : S.tx.find(t => t.id === (typeof target === 'object' ? target.id : target));
  S.sheet = {type: 'edit', draft: isDraft ? target : null, id: isDraft ? null : src.id, f: {amount: src.amount, name: src.name, type: src.type, group: src.group || 'other', date: src.date}, err: false, say: src.say || (S.flow && S.flow.say) || ''};
  render();
}
function editDone() {
  const sh = S.sheet; const amtEl = $('#edAmount'), nameEl = $('#edName'); if (amtEl) sh.f.amount = parseInt(amtEl.value.replace(/\D/g, ''), 10) || 0; if (nameEl) sh.f.name = nameEl.value;
  if (!(sh.f.amount > 0)) { sh.err = true; return render(); }
  if (sh.draft) { const fl = S.flow; const it = sh.draft; Object.assign(it, {amount: sh.f.amount, name: sh.f.name || it.name, type: sh.f.type, group: ['spend', 'refund'].includes(sh.f.type) ? sh.f.group : null, date: sh.f.date, dateUnsure: false, ask: {kind: 'done'}}); saveItem(it, fl.uid, fl.say, fl.src); it.st = 'done'; S.sheet = null; advance(); return; }
  if (sh.manual) { const uid = ++UID; saveItem({name: sh.f.name.trim() || 'Khoản chi', amount: sh.f.amount, date: sh.f.date, type: sh.f.type, group: ['spend', 'refund'].includes(sh.f.type) ? sh.f.group : null}, uid, '', 'manual'); S.flow = {uid, items: []}; S.sheet = null; return finish(); }
  const t = S.tx.find(x => x.id === sh.id); Object.assign(t, {amount: sh.f.amount, name: sh.f.name || t.name, type: sh.f.type, group: ['spend', 'refund'].includes(sh.f.type) ? sh.f.group : null, date: sh.f.date, status: t.status === 'review' ? 'saved' : t.status}); touchTx(t); S.sheet = null; render();
}
function deleteTx(id) {
  const t = S.tx.find(x => x.id === id); if (!t) return; S.tx = S.tx.filter(x => x.id !== id); BVStore.delTx(id); S.stack = S.stack.filter(p => p.id !== id); S.sheet = null;
  toast(T('toast.deleted'), () => { S.tx.push(t); BVStore.putTx(recOf(t)); toast(T('toast.undone'), null); }, 5000);
}

/* ---------- Tính toán ---------- */
const spendOf = t => t.type === 'spend' ? t.amount : t.type === 'refund' ? -t.amount : 0;
const inRange = (a, b) => S.tx.filter(t => t.date >= a && t.date <= b);
function byGroup(list) { const m = {}; list.forEach(t => { if (spendOf(t) !== 0) m[t.group || 'other'] = (m[t.group || 'other'] || 0) + spendOf(t); }); return m; }

/* ---------- Xuất CSV (mở được bằng Excel, tiếng Việt không lỗi phông nhờ BOM) ---------- */
function exportCsv(range) {
  const rows = range === 'all' ? S.tx : inRange(...(range === 'this' ? [monthRange(0).start, 0] : [monthRange(-1).start, monthRange(-1).end]));
  const q = s => '"' + String(s).replace(/"/g, '""') + '"';
  const csv = '﻿' + ['ngay,mo_ta,so_tien,loai,nhom,cau_noi_goc,gio_ghi'].concat(rows.slice().sort((a, b) => a.day - b.day || a.id - b.id).map(t => { const i = dayInfo(t.date); return [i.d + '/' + i.m + '/' + i.y, q(t.name), t.amount, q(typeLabel(t.type)), q(t.group ? gname(t.group) : ''), q(t.say), t.time].join(','); })).join('\r\n');
  try { const d = new Date(); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'})); a.download = 'billyvoice-' + d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') + '.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); } catch (e) {}
  return rows.length;
}
