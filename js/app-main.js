/* =========================================================
   BillyVoice – vẽ màn hình, xử lý thao tác, khởi động
   ========================================================= */

/* ---------- Vẽ lại + chuyển động (D32) ----------
   Mỗi lần vẽ lại, so với lần trước để biết bảng nào mới mở / vừa đóng, dòng nào vừa bị gỡ, kỳ nào vừa đổi.
   Mọi hiệu ứng nằm ở motion.css và motion.js; không đổi dữ liệu hay luồng. */
const offOf = () => S.tab === 'today' ? S.todayOff : S.tab === 'week' ? S.weekOff : S.tab === 'month' ? S.monthOff : 0;
let LASTV = null;
function render() {
  const app = $('#app'); const keep = document.activeElement && document.activeElement.id; const sc = app.querySelector('.bv-screen'); const st = sc ? sc.scrollTop : 0;
  const top = S.stack && S.stack[S.stack.length - 1]; let topKey = ''; try { topKey = top ? JSON.stringify(top) : ''; } catch (e) { topKey = top ? top.page : ''; }
  const vk = [S.onb || '', S.tab, topKey, offOf()].join('|');
  const oSheet = S._hadSheet ? app.querySelector('.bv-sheet') : null, oScrim = S._hadSheet ? app.querySelector('.bv-scrim') : null;
  const oSheetHtml = oSheet && oSheet.outerHTML, oScrimHtml = oScrim && oScrim.outerHTML;
  const ob = app.querySelector('.bv-sheet svg.bv-mascot[data-mood]'); const oldBilly = ob && {html: ob.outerHTML, rect: ob.getBoundingClientRect(), mood: ob.dataset.mood};
  const oc = app.querySelector('[data-count]'); const oldCount = oc && {key: oc.dataset.key, v: +oc.dataset.count};
  const oRows = [...app.querySelectorAll('.bv-screen .bv-row[data-id]')]; const oldRows = oRows.map((r, i) => ({id: r.dataset.id, html: r.outerHTML, next: oRows[i + 1] ? oRows[i + 1].dataset.id : null}));

  app.innerHTML = view(); const sc2 = app.querySelector('.bv-screen'); if (sc2 && !S.sheet) sc2.scrollTop = st; if (keep === 'dockInput' && !S.sheet) { const e = $('#dockInput'); if (e) { e.focus(); e.setSelectionRange(e.value.length, e.value.length); } }

  BVM.live(app);                                                                       /* B1: Billy chớp mắt, lá đung đưa */
  const hasSheet = !!app.querySelector('.bv-sheet');
  if (!hasSheet && oSheetHtml) { BVM.ghost(oScrimHtml, app, 'bv-m-scrim-out', 150); BVM.ghost(oSheetHtml, app, 'bv-m-sheet-out', 150); }   /* A2: đóng */
  const nb = app.querySelector('.bv-sheet svg.bv-mascot[data-mood]');
  if (nb && oldBilly && oldBilly.mood !== nb.dataset.mood) BVM.crossfade(oldBilly.html, oldBilly.rect, nb);                                  /* B5: đổi biểu cảm mờ chéo */
  const nc = app.querySelector('[data-count]');
  if (nc && oldCount && oldCount.key === nc.dataset.key && oldCount.v !== +nc.dataset.count) BVM.countTo(nc, oldCount.v, +nc.dataset.count, 400, vnd);   /* A4 */
  const same = LASTV && LASTV.vk === vk;
  if (same && !BVM.reduced()) {                                                         /* A6: dòng bị gỡ thì thu gọn */
    const ids = new Set([...app.querySelectorAll('.bv-screen .bv-row[data-id]')].map(r => r.dataset.id));
    oldRows.filter(r => !ids.has(r.id)).forEach(r => { const a = r.next && app.querySelector(`.bv-row[data-id="${r.next}"]`); if (!a) return; const g = BVM.ghost(`<div class="bv-m-collapse"><div>${r.html}</div></div>`, a.parentNode, '', 260, a); if (g) requestAnimationFrame(() => requestAnimationFrame(() => g.classList.add('is-gone'))); });
  }
  if (LASTV && LASTV.tab === S.tab && LASTV.topKey === topKey && LASTV.off !== offOf() && !S.onb) {   /* A7: chuyển kỳ trượt ngang */
    const dir = offOf() < LASTV.off ? 'bv-m-slide-prev' : 'bv-m-slide-next'; const per = app.querySelector('.bv-period');
    if (per) { for (let n = per.nextElementSibling; n; n = n.nextElementSibling) n.classList.add(dir); const p = per.parentElement; if (p && p.classList.contains('bv-stack')) for (let m = p.nextElementSibling; m; m = m.nextElementSibling) m.classList.add(dir); }
  }
  if (!same) app.querySelectorAll('.bv-bar__fill, .bv-cat__fill').forEach((f, i) => { f.classList.add('bv-m-grow'); f.style.setProperty('--i', i); });   /* A8: biểu đồ mọc khi vào màn */
  app.querySelectorAll('.bv-wave:not(.bv-wave--flat)').forEach(BVM.wave);              /* B6: thanh sóng âm chạy khi đang nghe */
  if (app.querySelector('.bv-m-fresh')) S._freshUid = UID;
  S._hadSheet = hasSheet; LASTV = {vk, tab: S.tab, topKey, off: offOf()};
}

/* ---------- Thao tác ---------- */
const stackPush = p => { S.stack.push(p); render(); };
const focusSoon = sel => setTimeout(() => { const e = $(sel); if (e) e.focus(); }, 30);
function act(a, el) {
  const d = el ? el.dataset : {};
  switch (a) {
    case 'tab': S.tab = d.v; S.stack = []; render(); break;
    case 'mic': micTap(); break;
    case 'stopListen': stopListen(); break;
    case 'typeInstead': abortListen(); S.sheet = null; S.mic = 'idle'; S.tab = 'today'; S.stack = []; render(); focusSoon('#dockInput, #onbInput'); break;
    case 'retry': S.sheet = null; render(); micTap(); break;
    case 'closeSheet': if (S.sheet && ['edit', 'export', 'wipe', 'groupedit', 'groupdel', 'noamount', 'nothing'].includes(S.sheet.type)) { S.sheet = S.sheet.type === 'groupdel' ? Object.assign({type: 'groupedit'}, S.sheet.back) : null; render(); } break;
    case 'send': sendText(); break;
    case 'manual': S.sheet = {type: 'edit', draft: null, id: null, manual: true, f: {amount: 0, name: '', type: 'spend', group: 'food', date: 0}, err: false, say: ''}; render(); break;
    case 'todayPrev': S.todayOff = Math.max(-365, S.todayOff - 1); render(); break;
    case 'todayNext': S.todayOff = Math.min(0, S.todayOff + 1); render(); break;
    case 'weekPrev': S.weekOff = Math.max(-104, S.weekOff - 1); render(); break;
    case 'weekNext': S.weekOff = Math.min(0, S.weekOff + 1); render(); break;
    case 'monthPrev': S.monthOff = Math.max(-24, S.monthOff - 1); render(); break;
    case 'monthNext': S.monthOff = Math.min(0, S.monthOff + 1); render(); break;
    case 'gotoDay': S.tab = 'today'; S.stack = []; S.todayOff = +d.off; render(); break;
    case 'open': stackPush({page: 'detail', id: +d.id}); break;
    case 'openReview': stackPush({page: 'list', review: true}); break;
    case 'openGroup': { let label, range; if (S.tab === 'week') { const st = weekStart(S.weekOff); range = [st, Math.min(st + 6, 0)]; label = dmy(st) + ' – ' + dmy(range[1]); } else { const r = monthRange(S.monthOff); range = [r.start, r.end]; label = 'Tháng ' + r.m + '/' + r.y; } stackPush({page: 'list', g: d.g, range, label}); break; }
    case 'back': S.stack.pop(); render(); break;
    case 'edit': openEdit(+d.id); break;
    case 'del': deleteTx(+d.id); break;
    case 'toastUndo': { const u = S.toast && S.toast.undo; clearTimeout(TOASTT); S.toast = null; if (u) u(); else render(); break; }
    case 'welcomeGo': dismissWelcome(); render(); micTap(); break;
    case 'welcomeType': dismissWelcome(); render(); focusSoon('#dockInput'); break;
    case 'welcomeLater': dismissWelcome(); render(); break;
    case 'ans': ans(+d.i); break;
    case 'askLater': askLater(); break;
    case 'groupConfirm': groupConfirm(false); break;
    case 'groupAll': groupConfirm(true); break;
    case 'undoFlow': undoFlow(); break;
    case 'firstKeep': firstKeep(true); break;
    case 'firstTry': firstKeep(false); break;
    case 'permAllow': S.sheet = null; S.micAsked = true; BVStore.setKv('micAsked', true); render(); startListen(); break;   /* hộp thoại xin quyền của trình duyệt hiện ra ngay sau bước này */
    case 'permLater': S.sheet = null; render(); break;
    case 'onbStart': S.onb = 's2'; render(); break;
    case 'onbSkip': S.onb = null; S.firstDone = true; BVStore.setKv('onboarded', true); BVStore.setKv('firstDone', true); render(); break;
    case 'micOnb': micOnb(); break;
    case 'onbSend': { const e = $('#onbInput'); if (e && e.value.trim()) process(e.value, 'text'); break; }
    case 'set': if (d.v === 'export') { S.sheet = {type: 'export'}; render(); } else if (d.v === 'privacy') stackPush({page: 'privacy'}); else if (d.v === 'groups') stackPush({page: 'groups'}); else if (d.v === 'feedback') { if (BV_CONFIG.feedbackUrl) window.open(BV_CONFIG.feedbackUrl, '_blank', 'noopener'); } else if (d.v === 'mic') toast(S.denied ? T('mic.denied.help') : (S.micGranted ? L('Đã cho phép') : T('s03.point1')), null); break;
    case 'wipe': S.wipeText = ''; S.sheet = {type: 'wipe'}; render(); break;
    case 'wipeExport': toast(T('export.done', {n: exportCsv('all')}), null); break;
    case 'wipeGo': wipeAll(); break;
    case 'expRange': S.exportRange = el.value; break;
    case 'expGo': { const n = exportCsv(S.exportRange); S.sheet = null; toast(T('export.done', {n}), null); break; }
    case 'editDone': editDone(); break;
    case 'edType': S.sheet.f.type = d.v; keepEditInputs(); break;
    case 'edGroup': S.sheet.f.group = d.v; keepEditInputs(); break;
    case 'edDate': S.sheet.f.date = +d.v; keepEditInputs(); break;
    case 'addGroup': S.sheet = {type: 'groupedit', id: null, name: '', icon: 'star', kw: [], kwText: '', err: null, clash: null}; render(); break;
    case 'editGroup': { const g = grp(d.id); S.sheet = {type: 'groupedit', id: g.id, name: g.name, icon: g.icon, kw: [...g.kw], kwText: '', err: null, clash: null}; render(); break; }
    case 'gIcon': keepGroupInputs(); S.sheet.icon = d.v; render(); break;
    case 'kwDel': keepGroupInputs(); S.sheet.kw.splice(+d.i, 1); render(); break;
    case 'kwAdd': kwAdd(); break;
    case 'kwClashYes': { const c = S.sheet.clash; const og = grp(c.from); og.kw = og.kw.filter(k => k !== c.word); S.sheet.kw.push(c.word); S.sheet.clash = null; saveGroups(); render(); break; }
    case 'kwClashNo': S.sheet.clash = null; render(); break;
    case 'kwReset': { const g = grp(S.sheet.id); S.sheet.kw = [...g.defKw]; render(); break; }
    case 'groupSave': groupSave(); break;
    case 'groupDel': { keepGroupInputs(); S.sheet = {type: 'groupdel', id: S.sheet.id, back: {id: S.sheet.id, name: S.sheet.name, icon: S.sheet.icon, kw: S.sheet.kw, kwText: '', err: null, clash: null}}; render(); break; }
    case 'groupDelGo': { const id = S.sheet.id; S.tx.forEach(t => { if (t.group === id) { t.group = 'other'; touchTx(t); } }); S.groups = S.groups.filter(g => g.id !== id); saveGroups(); S.sheet = null; render(); break; }
    case 'storageRetry': location.reload(); break;
    case 'noop': break;
  }
}
function dismissWelcome() { const last = S.tx.length ? Math.max(...S.tx.map(t => t.day)) : 0; S.welcomeFor = last; BVStore.setKv('welcomeFor', last); }
function micOnb() { if (S.denied || !BVSpeech.supported) { render(); return; } if (!S.micAsked && !S.micGranted) { S.sheet = {type: 'perm'}; render(); return; } startListen(); }
function keepEditInputs() { const sh = S.sheet, a = $('#edAmount'), n = $('#edName'); if (a) sh.f.amount = parseInt(a.value.replace(/\D/g, ''), 10) || 0; if (n) sh.f.name = n.value; render(); }
function keepGroupInputs() { const sh = S.sheet, n = $('#gName'), k = $('#gKw'); if (n) sh.name = n.value; if (k) sh.kwText = k.value; }
function kwAdd() { keepGroupInputs(); const sh = S.sheet; const w = (sh.kwText || '').trim().toLowerCase(); if (!w) return; if (sh.kw.includes(w)) { sh.kwText = ''; return render(); } const other = S.groups.find(g => g.id !== sh.id && g.kw.includes(w)); if (other) { sh.clash = {word: w, from: other.id}; sh.kwText = ''; return render(); } sh.kw.push(w); sh.kwText = ''; render(); }
function groupSave() {
  keepGroupInputs(); const sh = S.sheet; const name = sh.name.trim();
  if (!name) { sh.err = 'empty'; return render(); } if (name.length > 20) { sh.err = 'long'; return render(); }
  if (S.groups.some(g => g.id !== sh.id && g.name.toLowerCase() === name.toLowerCase())) { sh.err = 'dup'; return render(); }
  if (sh.id) { const g = grp(sh.id); g.name = name; g.icon = sh.icon; g.kw = sh.kw; }
  else { if (S.groups.length >= BV_MAX_GROUPS) return; S.groups.splice(S.groups.findIndex(g => g.id === 'other'), 0, {id: 'c' + Date.now(), name, icon: sh.icon, kw: sh.kw, custom: true, defKw: [], locked: false}); }
  saveGroups(); S.sheet = null; render();
}
async function wipeAll() {
  try { await BVStore.wipe(); } catch (e) { toast(T('today.error.title'), null); return; }
  abortListen(); clearTimeout(TOASTT); const keep = {offline: S.offline, denied: S.denied};
  S = newState([], {}); Object.assign(S, keep); LASTV = null; render();
}

/* ---------- Sự kiện ---------- */
function bindEvents() {
  const appEl = $('#app');
  appEl.addEventListener('click', e => { const el = e.target.closest('[data-act]'); if (!el || el.disabled) return; if (el.matches('input')) return; act(el.dataset.act, el); });
  appEl.addEventListener('change', e => { if (e.target.matches('input[data-act="expRange"]')) act('expRange', e.target); });
  appEl.addEventListener('input', e => {
    const id = e.target.id;
    if (id === 'dockInput') S.dockText = e.target.value;
    else if (id === 'wipeInput') { S.wipeText = e.target.value; const ok = e.target.value.toUpperCase() === 'XÓA'; const b = $('#wipeGo'); if (b) { b.disabled = !ok; b.classList.toggle('bv-btn--primary', ok); } }
    else if (id === 'shareInput') { const it = S.flow && S.flow.items[S.flow.cur]; if (it) { const v = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0; S.sheet.shareVal = v; const pv = $('#shPrev'); if (pv) pv.innerHTML = T('ask.group.preview_spend', {amount: `<b>${vnd(Math.min(v, it.amount))}</b>`, group: esc(gname(it.group || 'food'))}) + '<br>' + T('ask.group.preview_wait', {amount: `<b>${vnd(Math.max(0, it.amount - v))}</b>`}); } }
  });
  appEl.addEventListener('keydown', e => { if (e.key === 'Enter') { if (e.target.id === 'dockInput') { e.preventDefault(); sendText(); } else if (e.target.id === 'onbInput') { e.preventDefault(); act('onbSend'); } else if (e.target.id === 'gKw') { e.preventDefault(); kwAdd(); } } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && S && S.sheet && ['edit', 'export', 'wipe', 'groupedit', 'noamount', 'nothing'].includes(S.sheet.type)) { S.sheet = null; render(); } });
  appEl.addEventListener('focusin', e => { if (e.target.id === 'shareInput') e.target.value = String(S.sheet.shareVal != null ? S.sheet.shareVal : e.target.value.replace(/\D/g, '')); });
  appEl.addEventListener('focusout', e => { if (e.target.id === 'shareInput') { const v = parseInt(e.target.value.replace(/\D/g, ''), 10) || 0; e.target.value = vnd(v); } });
  window.addEventListener('online', () => { if (S) { S.offline = false; render(); } });
  window.addEventListener('offline', () => { if (S) { S.offline = true; if (S.mic === 'listening') abortListen(); S.mic = 'idle'; if (S.sheet && S.sheet.type === 'listen') S.sheet = null; render(); } });
  const tick = () => { if (S && refreshToday()) { syncOffsets(); render(); } };            /* qua nửa đêm: "Hôm nay" chuyển sang ngày mới */
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); }); setInterval(tick, 60000);
}

/* ---------- Khởi động ---------- */
function newState(tx, kv) {
  tx.forEach(t => { t.date = t.day - TODAY; if (t.uid > UID) UID = t.uid; if (t.id > TID) TID = t.id; });
  const lastUid = tx.reduce((m, t) => Math.max(m, t.uid || 0), 0); UID = Math.max(UID, lastUid);
  return {tab: 'today', stack: [], tx, groups: mkGroups(kv.groups), todayOff: 0, weekOff: 0, monthOff: 0, sheet: null, flow: null, toast: null, mic: 'idle', onb: kv.onboarded ? null : 's1',
    micGranted: false, micAsked: !!kv.micAsked, denied: false, offline: !navigator.onLine, dockText: '', exportRange: 'all', wipeText: '', firstDone: !!kv.firstDone, welcomeFor: kv.welcomeFor || 0};
}
function storageError() {
  $('#app').innerHTML = `<div class="bv-screen">${errBox(T('today.error.title'), T('today.error.desc'), btn(T('common.retry'), 'bv-btn--block bv-btn--primary', 'data-act="storageRetry"'))}</div>`;
}
async function boot() {
  bindEvents();
  BVStore.onError = () => { if (S) toast(T('today.error.title'), null, 5000); };
  let data;
  try { data = await BVStore.init(); } catch (e) { S = {tab: 'today', stack: [], tx: [], groups: mkGroups(), sheet: null, onb: null}; storageError(); return; }
  S = newState(data.tx, data.kv); render();
  BVStore.persist();
  BVSpeech.permission().then(p => { if (!S) return; if (p === 'granted') { S.micGranted = true; S.micAsked = true; } else if (p === 'denied') { S.denied = true; } render(); });
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
}
document.addEventListener('DOMContentLoaded', boot);
