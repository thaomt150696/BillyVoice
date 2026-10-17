/* =========================================================
   BillyVoice – giao diện: các màn và bảng trượt (chuyển từ prototype-v1 đã duyệt, dùng component trong components.css)
   Mọi chữ lấy từ microcopy.js (tạo từ 06_UI/microcopy.md). Không viết mã màu trực tiếp (D17, D18).
   ========================================================= */
const topbar = (t, backAct = 'back') => `<div class="bv-top"><button class="bv-top__back" type="button" data-act="${backAct}" aria-label="${attr(T('common.back'))}">‹</button><span>${t}</span></div>`;
const btn = (t, c = '', x = '') => `<button class="bv-btn ${c}" type="button" ${x}>${t}</button>`;
const gtitle = t => `<div class="bv-group-title">${t}</div>`;
const period = (label, sub, prev, next, act, nextOff) => `<div class="bv-period"><button class="bv-period__btn" type="button" data-act="${act}Prev" aria-label="${attr(prev)}">‹</button><span class="bv-period__label"><b>${label}</b><span>${sub}</span></span><button class="bv-period__btn" type="button" data-act="${act}Next" aria-label="${attr(next)}" ${nextOff ? 'disabled' : ''}>›</button></div>`;
const empty = (t, d, eg, art) => `<div class="bv-empty">${art ? ill(art) : '<div class="bv-empty__ring"></div>'}<div class="bv-head">${t}</div><div class="bv-body bv-muted" style="margin-top:8px">${d}</div>${eg ? `<div class="bv-empty__example">${eg}</div>` : ''}</div>`;
const answerBox = (lead, big, after, cnt) => `<div class="bv-answer"><div class="bv-answer__lead">${lead}</div><div class="bv-answer__big bv-display" ${cnt != null ? `data-count="${cnt}" data-key="today${S.todayOff}"` : ''}>${big}</div><div class="bv-answer__after">${after}</div></div>`;
const quote = t => t ? `<div class="bv-quote">"${esc(t)}"</div>` : '';
const sentence = h => `<div class="bv-sentence">${h}</div>`;
const infoCard = (t, d, dashed = true) => `<div class="bv-card ${dashed ? 'bv-card--review' : ''}"><div><div class="bv-card__title">${t}</div>${d ? `<div class="bv-card__desc">${d}</div>` : ''}</div></div>`;
const fld = (k, v) => `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:52px;border-bottom:1px solid var(--bv-line)"><span class="bv-call bv-muted">${k}</span><span class="bv-strong" style="text-align:right">${v}</span></div>`;
const setRow = (t, r, act, v) => `<button class="bv-setrow" type="button" data-act="${act}" ${v ? `data-v="${v}"` : ''}><span>${t}</span><span class="bv-setrow__r" ${r === '›' ? 'aria-hidden="true"' : ''}>${r}</span></button>`;
const wv = () => `<div class="bv-wave" aria-hidden="true">${[18, 38, 56, 30, 48, 22, 60, 34, 16, 42, 26].map(h => `<i style="height:${h}px"></i>`).join('')}</div>`;
const skel = (h, r = '') => `<div class="bv-skeleton" style="height:${h}px;${r}" aria-hidden="true"></div>`;
const errBox = (t, d, btns) => `<div class="bv-error"><div class="bv-error__mark" aria-hidden="true">!</div><div class="bv-head">${t}</div><div class="bv-body bv-muted" style="margin:8px 0 24px">${d}</div>${btns}</div>`;
const sheetHead = (title, cancelAct = 'closeSheet') => `<div style="display:flex;justify-content:space-between;align-items:center;min-height:48px"><span class="bv-head">${title}</span>${btn(T('common.cancel'), 'bv-btn--text bv-btn--sm', `data-act="${cancelAct}"`)}</div>`;
const markRow = (mk, it, info, amt) => `<div class="bv-row"><span class="bv-mark ${mk === '?' ? 'bv-mark--pending' : ''}" aria-label="${attr(mk === '?' ? T('review.mark.pending') : T('review.mark.saved'))}">${mk}</span><div class="bv-row__body"><div class="bv-row__name">${esc(it.name)}</div><div class="bv-row__info">${info}</div></div><span class="bv-row__amount">${amt}</span></div>`;
function itemInfo(it) { const sp = it.type === 'spend'; return (sp && it.group ? `<span class="bv-chip">${esc(gname(it.group))}</span>` : '') + dayLabel(it.date); }

function txRow(t) {
  const sp = t.type === 'spend' || t.type === 'refund'; const rv = t.status === 'review';
  const icon = sp ? ic(gicon(t.group)) : ic(TYPE_ICON[t.type]);
  const chip = rv ? `<span class="bv-chip bv-chip--review">? ${T('common.review')}</span>` : sp ? `<span class="bv-chip">${esc(gname(t.group))}</span>` : `<span class="bv-chip">${typeLabel(t.type)}</span>`;
  const justNow = S.flow == null && S.toast && t.uid && t.uid === UID;
  const meta = justNow ? T('common.just_now') : t.time;
  const fresh = justNow && S._freshUid !== t.uid;   /* chỉ lần vẽ đầu có nền nhấn nhẹ + chuyển động vào (A3) */
  return `<button type="button" class="bv-row bv-row--link ${fresh ? 'bv-row--new bv-m-fresh' : ''}${rv ? 'bv-row--review' : ''}" data-act="open" data-id="${t.id}"><span class="bv-row__icon">${icon}</span><div class="bv-row__body"><div class="bv-row__name">${esc(t.name)}</div><div class="bv-row__info">${chip}${meta}</div></div><span class="bv-row__amount ${sp ? '' : 'bv-row__amount--muted'}">${t.type === 'refund' ? '−' : ''}${vnd(t.amount)}</span></button>`;
}
const bar = (g, v, total, muted) => `<button type="button" class="bv-bar ${muted ? 'bv-bar--muted' : ''}" data-act="openGroup" data-g="${g}" style="display:block;width:100%;min-height:44px;box-sizing:border-box;background:none;border:0;padding:4px 0;text-align:left;color:inherit;font:inherit;cursor:pointer"><div class="bv-bar__top"><span class="bv-bar__name">${ic(gicon(g))}${esc(gname(g))}</span><b>${vnd(v)}</b></div><div class="bv-bar__track"><div class="bv-bar__fill" style="width:${pctOf(v, total)}%"></div></div></button>`;
const catRow = (g, v, total) => `<button type="button" class="bv-cat" data-act="openGroup" data-g="${g}" style="width:100%;background:none;border:0;border-bottom:1px solid var(--bv-line);text-align:left;color:inherit;font:inherit;cursor:pointer"><span class="bv-cat__name">${ic(gicon(g))}${g === 'uncat' ? T('month.uncat') + ` <span class="bv-chip bv-chip--review">? ${T('common.review')}</span>` : esc(gname(g))}</span><span class="bv-cat__amount">${vnd(v)} <span class="bv-cat__pct">${pctOf(v, total)}%</span></span><div class="bv-cat__track"><div class="bv-cat__fill" style="width:${pctOf(v, total)}%"></div></div></button>`;

function homeView() {
  const off = S.todayOff, di = dayInfo(off), list = S.tx.filter(t => t.date === off).sort((a, b) => b.time.localeCompare(a.time) || b.id - a.id);
  const total = sum(list.map(spendOf));
  const label = off === 0 ? T('today.period.label') : off === -1 ? T('today.period.yesterday') : di.name;
  const lead = off === 0 ? T('today.answer.lead') : off === -1 ? T('today.answer.lead_yesterday') : T('today.answer.lead_past', {d: di.d, m: di.m});
  const rev = S.tx.filter(t => t.status === 'review'); const rdays = [...new Set(rev.map(t => t.date))].sort((a, b) => a - b);
  const rdesc = rdays.length === 1 ? T('today.review.desc_one', {'thứ': dayInfo(rdays[0]).lower}) : rdays.length === 2 ? T('today.review.desc', {'thứ': [dayInfo(rdays[0]).lower, dayInfo(rdays[1]).lower]}) : T('today.review.desc_many', {n: rdays.length});
  const lastTx = S.tx.length ? Math.max(...S.tx.map(t => t.day)) : null;                /* F9: quay lại sau ≥ 3 ngày, chào một lần cho mỗi đợt gián đoạn, không nhắc số ngày */
  const welcome = off === 0 && lastTx !== null && lastTx <= TODAY - 3 && S.welcomeFor !== lastTx;
  let body = `<div class="bv-stack">${period(label, T('today.period.date', {'thứ': di.name, d: di.d, m: di.m}), T('today.period.prev'), T('today.period.next'), 'today', off === 0)}`;
  if (welcome) body += `<div class="bv-welcome"><div class="bv-strong">${T('today.welcome.title')}</div><div class="bv-call" style="margin-top:4px">${T('today.welcome.desc')}</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">${btn(T('today.welcome.go'), 'bv-btn--sm bv-btn--primary', 'data-act="welcomeGo"')}${btn(T('today.welcome.type'), 'bv-btn--sm', 'data-act="welcomeType"')}${btn(T('today.welcome.later'), 'bv-btn--sm bv-btn--text', 'data-act="welcomeLater"')}</div></div>`;
  if (list.length) body += answerBox(lead, vnd(total), T('today.answer.after', {n: list.length}), total);
  if (rev.length) body += `<button class="bv-card bv-card--review" type="button" data-act="openReview"><span><span class="bv-card__title" style="display:block">${T('today.review.title', {n: rev.length})}</span><span class="bv-card__desc" style="display:block">${rdesc}</span></span><span class="bv-card__chev" aria-hidden="true">›</span></button>`;
  body += '</div>';
  if (list.length) body += gtitle(off === 0 ? T('today.list.title') : label) + list.map(txRow).join('');
  else body += empty(off === 0 ? T('today.empty.title') : T('today.empty.past.title'), T('today.empty.desc'), off === 0 ? T('today.empty.example') : '', 'empty-today');
  return body;
}
function weekView() {
  const w = S.weekOff, st = weekStart(w), en = st + 6, list = inRange(st, Math.min(en, 0));
  const g = byGroup(list); const entries = Object.entries(g).filter(e => e[0] !== 'uncat' && e[1] > 0).sort((a, b) => b[1] - a[1]); const total = sum(Object.values(g)); const uncat = g['uncat'] || 0;
  const label = w === 0 ? T('week.period.label') : w === -1 ? T('week.period.prev') : 'Tuần ' + dmy(st);
  const e2 = Math.min(en, 0); let body = `<div class="bv-stack">${period(label, T('week.period.range', {d: [dayInfo(st).d, dayInfo(e2).d], m: [dayInfo(st).m, dayInfo(e2).m]}), T('week.period.prev'), T('week.period.next'), 'week', w === 0)}`;
  if (!list.length) return body + '</div>' + empty(T('week.empty.title'), T('week.empty.desc'), '', 'empty-week');
  const top = entries[0];
  if (!top) return body + sentence(T('week.summary', {total: vnd(total), 'nhóm': '—', pct: 0})) + '</div>';
  const tie = entries[1] && entries[1][1] === top[1];
  const sk = w === 0 ? 'week.summary' : 'week.summary.past';
  body += sentence(tie ? T('week.summary.tie', {total: vnd(total), 'nhóm': [esc(gname(top[0])), esc(gname(entries[1][0]))]}) : T(sk, {total: vnd(total), 'nhóm': esc(gname(top[0])), pct: pctOf(top[1], total)}));
  const sumExUncat = sum(entries.map(e => e[1]));
  body += `<div>${entries.slice(0, 3).map((e, i) => bar(e[0], e[1], sumExUncat, i > 0)).join('')}${entries.length > 3 ? `<div class="bv-call bv-muted">${T('week.more', {n: entries.length - 3, amount: vnd(sum(entries.slice(3).map(e => e[1])))})}</div>` : ''}</div>`;
  const lw = inRange(st - 7, st - 1); const lwDays = new Set(lw.map(t => t.date)).size;
  if (w === 0 || w === -1) {
    if (lwDays >= 3) {                                                                  /* so sánh tuần trước: chỉ khi tuần trước có ≥ 3 ngày, chênh ≥ 10% và ≥ 50.000 đ (microcopy §10) */
      const lg = byGroup(lw); const keys = new Set([...Object.keys(g), ...Object.keys(lg)]); keys.delete('uncat'); let best = null;
      keys.forEach(k => { const d = (g[k] || 0) - (lg[k] || 0); if (!best || Math.abs(d) > Math.abs(best.d)) best = {k, d}; });
      const lastSum = best ? (lg[best.k] || 0) : 0; const p = lastSum ? Math.round(Math.abs(best.d) / lastSum * 100) : 0;
      if (best && lastSum && p >= 10 && Math.abs(best.d) >= 50000) body += `<div class="bv-compare"><span class="bv-compare__sym" aria-hidden="true">${best.d > 0 ? '↑' : '↓'}</span><span>${T(best.d > 0 ? 'week.compare.up' : 'week.compare.down', {'nhóm': esc(gname(best.k)), pct: p})}</span></div>`;
      else body += `<div class="bv-compare"><span class="bv-compare__sym" aria-hidden="true">=</span><span>${T('week.compare.same')}</span></div>`;
    } else body += infoCard(T('week.compare.wait.title'), T('week.compare.wait.desc'));
  }
  if (uncat) body += `<div style="display:flex;align-items:center;gap:8px"><div class="bv-note" style="flex:1">${T('week.uncat', {n: list.filter(t => t.group === 'uncat').length, amount: vnd(uncat)})}</div>${btn(T('week.uncat.link'), 'bv-btn--sm', 'data-act="openReview"')}</div>`;
  body += '</div>' + gtitle(T('week.days.title'));
  const days = []; for (let o = e2; o >= st; o--) { const l = S.tx.filter(t => t.date === o); if (l.length) days.push({o, n: l.length, a: sum(l.map(spendOf))}); }
  body += days.map(d => { const di = dayInfo(d.o); return `<button class="bv-row bv-row--link bv-setrow" type="button" style="min-height:56px" data-act="gotoDay" data-off="${d.o}" aria-label="${attr(T('a11y.row.expand', {'thứ': di.lower, d: di.d, m: di.m}))}"><span class="bv-row__body"><span class="bv-row__name" style="display:block">${di.name}, ${di.d}/${di.m}</span><span class="bv-row__info">${T('common.items', {n: d.n})}</span></span><span class="bv-row__amount">${vnd(d.a)}</span><span class="bv-row__chev" aria-hidden="true">▸</span></button>`; }).join('');
  return body;
}
function monthView() {
  const mo = S.monthOff, r = monthRange(mo), list = inRange(r.start, r.end);
  const mlabel = T('month.period.label', {m: r.m, yyyy: r.y}); const di1 = dayInfo(r.start), di2 = dayInfo(r.end);
  let body = `<div class="bv-stack">${period(mlabel, T('month.period.range', {d: [di1.d, di2.d], m: [di1.m, di2.m]}), T('month.period.prev'), T('month.period.next'), 'month', mo === 0)}`;
  if (!list.length) return body + '</div>' + empty(T('month.empty.title'), T('month.empty.desc'), '', 'empty-month');
  const income = sum(list.filter(t => t.type === 'income').map(t => t.amount)), spend = sum(list.map(spendOf)), rest = income - spend;
  const sk = !income ? T('month.summary.spend_only', {m: r.m, spend: vnd(spend)}) : rest >= 0 ? T('month.summary', {m: r.m, income: vnd(income), spend: vnd(spend), rest: vnd(rest)}) : T('month.summary.over', {m: r.m, income: vnd(income), spend: vnd(spend), diff: vnd(-rest)});
  body += sentence(sk);
  if (income) body += `<div class="bv-tiles">${[['month.tile.income', income], ['month.tile.spend', spend], ['month.tile.rest', rest]].map(x => `<div class="bv-tile"><div class="bv-tile__k">${T(x[0])}</div><div class="bv-tile__v">${vnd(x[1]).replace(' đ', '')}</div></div>`).join('')}</div>`;
  else body += infoCard(T('month.add_income.title'), T('month.add_income.desc'));
  body += '</div>' + gtitle(T('month.groups.title'));
  const g = byGroup(list); body += Object.entries(g).filter(e => e[1] > 0).sort((a, b) => (a[0] === 'uncat') - (b[0] === 'uncat') || b[1] - a[1]).map(e => catRow(e[0], e[1], spend)).join('');
  const loan = sum(list.filter(t => t.type === 'loan').map(t => t.amount)) - sum(list.filter(t => t.type === 'repaid').map(t => t.amount)), tr = sum(list.filter(t => t.type === 'transfer').map(t => t.amount)), gw = sum(list.filter(t => t.type === 'group').map(t => t.amount));
  const rowsNs = [['month.notspend.loan', loan], ['month.notspend.transfer', tr], ['month.notspend.group', gw]].filter(x => x[1] > 0);
  if (rowsNs.length) body += `<div style="margin-top:24px"><div class="bv-notspend"><div class="bv-strong">${T('month.notspend.title')}</div><div class="bv-cap bv-muted" style="font-weight:400;margin-bottom:8px">${T('month.notspend.desc')}</div>${rowsNs.map(x => `<div class="bv-notspend__row"><span>${T(x[0])}</span><span class="bv-row__amount bv-row__amount--muted">${vnd(x[1])}</span></div>`).join('')}</div></div>`;
  return body;
}
function settingsView() {
  const micVal = S.denied ? 'Chưa cho phép' : (S.micGranted ? L('Đã cho phép') : (BVSpeech.supported ? 'Chưa hỏi' : 'Không hỗ trợ'));
  return `${topbar(T('set.title'), 'noop').replace('data-act="noop"', 'style="visibility:hidden" tabindex="-1" aria-hidden="true"')}${gtitle(T('set.group.data'))}${setRow(T('set.export'), '›', 'set', 'export')}${setRow(T('set.privacy'), '›', 'set', 'privacy')}${gtitle(T('set.group.log'))}${setRow(T('set.groups'), S.groups.length + ' nhóm ›', 'set', 'groups')}${setRow(T('set.mic'), micVal + ' ›', 'set', 'mic')}${gtitle(T('set.group.about'))}${BV_CONFIG.feedbackUrl ? setRow(T('set.feedback'), '›', 'set', 'feedback') : ''}${setRow(T('set.version'), BV_CONFIG.version, 'noop')}`;
}
function privacyView() {
  return `${topbar(T('privacy.title'))}${ill('privacy', 'bv-ill--sm')}${gtitle(T('privacy.where.title'))}<p class="bv-body" style="margin:0">${T('privacy.where.body')}</p>${gtitle(T('privacy.voice.title'))}<p class="bv-body" style="margin:0">${T('privacy.voice.body')}</p><div class="bv-note" style="margin-top:16px">${T('privacy.warn')}</div><div style="margin-top:24px"><button class="bv-danger" type="button" data-act="wipe">${T('privacy.wipe')}</button></div>`;
}
function groupsView() {
  const full = S.groups.length >= BV_MAX_GROUPS;
  return `${topbar(T('groups.title'))}${full ? infoCard(T('groups.full.title'), T('groups.full.desc')) + '<div style="height:8px"></div>' : `<p class="bv-call bv-muted" style="margin:0 0 8px">${T('groups.intro')}</p>`}${S.groups.map(g => { const desc = g.id === 'other' ? T('groups.other.desc') : g.id === 'family' ? T('groups.family.desc') : g.id === 'uncat' ? '' : esc(g.kw.slice(0, 5).join(', ') + (g.kw.length > 5 ? '…' : '')); if (g.id === 'uncat') return ''; const inner = `<span class="bv-row__icon">${ic(g.icon)}</span><span class="bv-row__body" style="margin-left:12px"><span class="bv-row__name" style="display:block">${esc(g.name)}${g.custom ? ` <span class="bv-chip">${T('groups.mine')}</span>` : ''}</span><span class="bv-row__info">${desc}</span></span>`; return g.locked ? `<div class="bv-row" style="min-height:64px">${inner.replace('margin-left:12px', 'margin-left:0')}</div>` : `<button class="bv-row bv-row--link bv-setrow" type="button" style="min-height:64px" data-act="editGroup" data-id="${g.id}">${inner}<span class="bv-row__chev" aria-hidden="true">›</span></button>`; }).join('')}<div style="margin-top:16px">${btn(T('groups.add'), 'bv-btn--block', 'data-act="addGroup" ' + (full ? 'disabled' : ''))}</div>`;
}
function detailView(t) {
  if (!t) return topbar(T('detail.title'));
  const sp = t.type === 'spend' || t.type === 'refund'; const di = dayInfo(t.date);
  return `${topbar(T('detail.title'))}<div class="bv-center" style="padding:16px 0 8px"><div class="bv-display bv-num">${vnd(t.amount)}</div><div class="bv-strong" style="margin-top:4px">${esc(t.name)}</div></div>${fld(T('edit.field.type'), typeLabel(t.type))}${sp ? fld(T('edit.field.group'), esc(gname(t.group))) : ''}${fld(T('edit.field.date'), di.name + ' ' + di.d + '/' + di.m + ', ' + t.time)}${fld(T('detail.source'), T('detail.source.' + (t.src === 'voice' ? 'voice' : t.src === 'manual' ? 'manual' : 'text')))}${t.say ? gtitle(T('detail.original')) + quote(t.say) : ''}${t.status === 'review' ? `<div style="margin-top:16px">${infoCard('? ' + T('common.review'), '')}</div>` : ''}<div class="bv-btn-row" style="margin-top:24px">${btn(T('detail.edit'), 'bv-btn--primary', `data-act="edit" data-id="${t.id}"`)}${btn(T('detail.delete'), '', `data-act="del" data-id="${t.id}"`)}</div>`;
}
function listView(p) {
  let list, title;
  if (p.review) { list = S.tx.filter(t => t.status === 'review'); title = T('common.review'); }
  else { const r = p.range; list = inRange(r[0], r[1]).filter(t => (t.group || 'other') === p.g && spendOf(t) !== 0); title = T('list.title', {'nhóm': esc(gname(p.g)), 'kỳ': esc(p.label)}); }
  list.sort((a, b) => b.date - a.date || b.time.localeCompare(a.time));
  let html = `${topbar(title)}<div class="bv-answer" style="padding:16px"><div class="bv-answer__after">${T('list.count', {n: list.length})}</div><div class="bv-title bv-num" style="font-size:32px;line-height:40px">${vnd(sum(list.map(spendOf)) || sum(list.map(t => t.amount)))}</div></div>`;
  let last = null; list.forEach(t => { if (t.date !== last) { html += gtitle(dayLabel(t.date)); last = t.date; } html += txRow(t); });
  return html;
}

/* ---------- Khung app ---------- */
const micState = () => (S.offline || S.denied || !BVSpeech.supported) ? 'off' : S.mic;
function tabbar(active) {
  const t = (k, i, l) => `<button class="bv-tab" type="button" data-act="tab" data-v="${k}" ${active === k ? 'aria-current="page"' : ''}>${ic(i)}${l}</button>`;
  const ms = micState(); const lab = ms === 'off' ? T('a11y.mic.off') : ms === 'listening' ? T('a11y.mic.listening') : ms === 'busy' ? T('a11y.mic.busy') : T('a11y.mic.idle');
  return `<nav class="bv-tabbar" aria-label="${attr(T('a11y.nav'))}">${t('today', 'nav-today', T('nav.today'))}${t('week', 'nav-week', T('nav.week'))}<div class="bv-tabbar__mic"><button class="bv-mic ${ms !== 'idle' ? 'bv-mic--' + ms : ''}" type="button" data-act="mic" aria-label="${attr(lab)}" ${ms === 'off' || ms === 'busy' ? 'aria-disabled="true"' : ''}>${ic(ms === 'off' ? 'mic-off' : ms === 'busy' ? 'dots' : 'mic')}</button></div>${t('month', 'nav-month', T('nav.month'))}${t('settings', 'nav-settings', T('nav.settings'))}</nav>`;
}
const inputbar = () => `<div class="bv-inputbar"><div class="bv-inputbar__box"><input class="bv-inputbar__input" id="dockInput" type="text" autocomplete="off" enterkeyhint="send" placeholder="${attr(T('input.placeholder'))}" aria-label="${attr(T('a11y.input'))}" value="${esc(S.dockText)}"><button class="bv-inputbar__send" type="button" data-act="send" aria-label="${attr(T('a11y.send'))}">${ic('send')}</button></div><button class="bv-inputbar__link" type="button" data-act="manual">${T('input.manual')}</button></div>`;

function onboardingView() {
  let body;
  if (S.onb === 's1') body = `<div class="bv-stack" style="margin-top:8px">${ill('welcome')}<h1 class="bv-title" style="margin:0">${T('s01.title').replace(', ', ',<br>')}</h1></div><div style="margin:32px 0 24px"><div style="text-align:right"><span class="bv-bubble">Trà sữa 45k</span></div><div class="bv-center bv-muted" style="margin:8px 0" aria-hidden="true">↓</div><div style="border:1px solid var(--bv-line);border-radius:var(--bv-radius-md);background:var(--bv-surface);padding:0 var(--bv-space-3)"><div class="bv-row"><span class="bv-row__icon">${ic('food')}</span><div class="bv-row__body"><div class="bv-row__name">Trà sữa</div><div class="bv-row__info"><span class="bv-chip">${esc(gname('food'))}</span>${T('common.just_now')}</div></div><span class="bv-row__amount">${vnd(45000)}</span></div></div></div>${infoCard(T('s01.privacy.title'), T('s01.privacy.desc'), false)}<div style="margin-top:auto;padding-top:24px"><div class="bv-center" style="margin-bottom:16px;display:flex;gap:6px;justify-content:center" aria-hidden="true"><span style="width:20px;height:8px;border-radius:4px;background:var(--bv-text)"></span><span style="width:8px;height:8px;border-radius:50%;background:var(--bv-line)"></span></div>${btn(T('s01.cta'), 'bv-btn--block bv-btn--primary', 'data-act="onbStart"')}</div>`;
  else if (S.denied || !BVSpeech.supported) body = `<div class="bv-center" style="margin-top:48px"><div class="bv-title">${T('s02.title')}</div></div><div style="margin:24px 0">${infoCard(T(BVSpeech.supported ? 's02.denied.title' : 's02.denied.title'), BVSpeech.supported ? T('s02.denied.desc') : T('mic.unsupported'))}</div><div class="bv-center"><button class="bv-mic bv-mic--xl bv-mic--off" type="button" aria-label="${attr(T('a11y.mic.off'))}" aria-disabled="true">${ic('mic-off')}</button></div><label class="bv-field__label" for="onbInput" style="margin-top:32px">${T('s02.denied.label')}</label><input class="bv-input" id="onbInput" value="" autocomplete="off" enterkeyhint="send"><div style="margin-top:16px">${btn(T('s02.denied.send'), 'bv-btn--block bv-btn--primary', 'data-act="onbSend"')}</div>`;
  else body = `<div class="bv-center" style="margin-top:48px"><div class="bv-title">${T('s02.title')}</div></div><div class="bv-card" style="justify-content:center;text-align:center;margin:24px 0">${T('s02.hint')}</div><div class="bv-center"><button class="bv-mic bv-mic--xl" type="button" data-act="micOnb" aria-label="${attr(T('a11y.mic.idle'))}">${ic('mic')}</button><p class="bv-call bv-muted" style="margin:16px 0 24px">${T('s02.mic_help')}</p></div><div class="bv-call bv-muted bv-center">${T('s02.or_type')}</div><div style="display:flex;gap:8px;margin-top:8px"><input class="bv-input" id="onbInput" aria-label="${attr(T('s02.denied.label'))}" autocomplete="off" enterkeyhint="send" style="flex:1"><button class="bv-btn bv-btn--primary" type="button" data-act="onbSend">${T('s02.denied.send')}</button></div>`;
  const skip = S.onb === 's2' ? `<button class="bv-skip bv-btn bv-btn--text bv-btn--sm" type="button" data-act="onbSkip">${T('s02.skip')}</button>` : '';
  return skip + `<div class="bv-screen ${S.onb === 's1' ? 'bv-screen--center' : ''}">${body}</div>` + toastHtml() + sheetHtml();
}
function toastHtml() {
  if (!S.toast) return ''; const fresh = !S.toast.shown; S.toast.shown = true;
  return `<div class="bv-toast ${fresh ? 'bv-m-toast-in' : ''} ${S.toast.undo ? 'bv-m-countdown' : ''}" role="status" aria-live="polite" style="${S.tab === 'today' && !S.stack.length && !S.onb ? '' : '--bv-toast-bottom:calc(92px + env(safe-area-inset-bottom));'}--bv-dur-toast:${Math.round(S.toast.ms)}ms">${S.toast.mood ? mascot(S.toast.mood, 'bv-mascot--badge' + (fresh && S.toast.mood === 'cheer' ? ' bv-m-bounce' : '')) : ''}<span style="flex:1">${S.toast.html}</span>${S.toast.undo ? `<button class="bv-toast__action" type="button" data-act="toastUndo">${T('common.undo')}</button>` : ''}</div>`;
}
function view() {
  if (S.onb) return onboardingView();
  const top = S.stack[S.stack.length - 1]; let main;
  if (top) main = top.page === 'detail' ? detailView(S.tx.find(t => t.id === top.id)) : top.page === 'list' ? listView(top) : top.page === 'privacy' ? privacyView() : groupsView();
  else main = S.tab === 'today' ? homeView() : S.tab === 'week' ? weekView() : S.tab === 'month' ? monthView() : settingsView();
  const input = S.tab === 'today' && !top;
  return `<div class="bv-screen">${S.offline ? `<div class="bv-banner" role="status">${mascot('sleepy', 'bv-mascot--badge')}<span>${T('offline.banner')}</span></div>` : ''}${main}</div><div class="bv-dock">${input ? inputbar() : ''}${tabbar(S.tab)}</div>` + toastHtml() + sheetHtml();
}

/* ---------- Bảng trượt ---------- */
function sheetHtml() {
  const sh = S.sheet; if (!sh) return '';
  const enter = !S._hadSheet;   /* vào bằng trượt chỉ khi trước đó chưa có bảng (A2); đổi bước giữa chừng không trượt lại */
  const wrap = (inner, label, scrimClose) => `<div class="bv-scrim ${enter ? 'bv-m-scrim-in' : ''}" ${scrimClose ? 'data-act="closeSheet"' : ''}></div><div class="bv-sheet ${enter ? 'bv-m-sheet-in' : ''}" role="dialog" aria-modal="true" aria-label="${attr(label || '')}"><div class="bv-sheet__grab"></div>${inner}</div>`;
  const fl = S.flow;
  switch (sh.type) {
    case 'listen': return wrap(`<div style="display:flex;align-items:center;justify-content:center;gap:var(--bv-space-2)">${mascot('listen')}<span class="bv-head">${T('listen.title')}</span></div>${wv()}<div class="bv-head" id="tr" style="font-weight:500;min-height:84px" aria-live="polite">${esc(sh.shown)}</div><div class="bv-call bv-muted bv-center" id="tm">${T('listen.timer', {m: 0, ss: String(sh.secs || 0).padStart(2, '0')})}</div><div style="display:flex;justify-content:center"><span class="bv-m-micwrap is-on"><button class="bv-stop" type="button" data-act="stopListen" aria-label="${attr(T('listen.stop_label'))}" style="position:relative;z-index:1"><span></span></button><span class="bv-m-ring"></span><span class="bv-m-ring"></span></span></div><div class="bv-call bv-muted bv-center">${T('listen.stop_help')}</div><div class="bv-center" style="margin-top:8px">${btn(T('listen.type_instead'), 'bv-btn--text', 'data-act="typeInstead"')}</div>`, T('listen.title'));
    case 'process': return wrap(`${quote(sh.say)}<div style="padding:8px 0 8px"><div role="status" aria-label="${attr(T('a11y.mic.busy'))}">${mascot('think', 'bv-mascot--lg')}</div><div class="bv-body bv-center">${T('process.title')}</div></div>${skel(56, 'margin:12px 0 8px')}${skel(56, 'margin-bottom:8px')}${skel(56)}`, T('process.title'));
    case 'nothing': return wrap(errBox(T('listen.nothing.title'), T('listen.nothing.desc'), `<div class="bv-wave bv-wave--flat" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="bv-btn-row">${btn(T('listen.nothing.retry'), 'bv-btn--primary', 'data-act="retry"')}${btn(T('listen.nothing.type'), '', 'data-act="typeInstead"')}</div>`), T('listen.nothing.title'));
    case 'noamount': return wrap(`${quote(sh.say)}${errBox(T('listen.no_amount.title'), T(sh.src === 'text' ? 'listen.no_amount.desc_text' : 'listen.no_amount.desc'), `<div class="bv-btn-row">${btn(T('listen.nothing.retry'), 'bv-btn--primary', 'data-act="retry"')}${btn(T('listen.nothing.type'), '', 'data-act="typeInstead"')}</div>`)}`, T('listen.no_amount.title'));
    case 'perm': return wrap(`${ill('mic-permission', 'bv-ill--sm')}<div class="bv-head" style="margin-bottom:16px">${T('s03.title')}</div>${['s03.point1', 's03.point2', 's03.point3'].map(k => `<div class="bv-row" style="min-height:48px"><span class="bv-mark" aria-hidden="true">✓</span><div class="bv-row__body bv-body">${T(k)}</div></div>`).join('')}<div class="bv-stack" style="margin-top:24px">${btn(T('s03.allow'), 'bv-btn--block bv-btn--primary', 'data-act="permAllow"')}${btn(T('s03.later'), 'bv-btn--block bv-btn--text', 'data-act="permLater"')}</div>`, T('s03.title'));
    case 'first': { const it = fl.items[0]; return wrap(`${quote(fl.say)}<div class="bv-sheet__title">${T('s02.first_card.title')}</div><div style="margin:8px 0 16px"><div class="bv-row"><span class="bv-row__icon">${ic(['spend', 'refund'].includes(it.type) ? gicon(it.group) : TYPE_ICON[it.type])}</span><div class="bv-row__body"><div class="bv-row__name">${esc(it.name)}</div><div class="bv-row__info"><span class="bv-chip">${esc(['spend', 'refund'].includes(it.type) ? gname(it.group) : typeLabel(it.type))}</span>${dayLabel(it.date)}</div></div><span class="bv-row__amount">${vnd(it.amount)}</span></div></div><div class="bv-btn-row">${btn(T('s02.first_card.keep'), 'bv-btn--primary', 'data-act="firstKeep"')}${btn(T('s02.first_card.try'), '', 'data-act="firstTry"')}</div>`, T('s02.first_card.title')); }
    case 'ask': return wrap(askSheet(sh), '');
    case 'edit': return wrap(editSheet(sh), T('edit.title'), true);
    case 'export': { const n = S.tx.length; const cnt = r => r === 'all' ? n : inRange(...(r === 'this' ? [monthRange(0).start, 0] : [monthRange(-1).start, monthRange(-1).end])).length; return wrap(`<div class="bv-head" style="margin-bottom:8px">${T('export.title')}</div><div role="radiogroup" aria-label="${attr(T('export.title'))}">${n ? [['all', 'export.all'], ['this', 'export.this_month'], ['last', 'export.last_month']].map(x => `<label class="bv-radio"><input type="radio" name="xr" value="${x[0]}" data-act="expRange" ${S.exportRange === x[0] ? 'checked' : ''}>${T(x[1])}<span class="bv-radio__meta">${T('common.items', {n: cnt(x[0])})}</span></label>`).join('') : `<label class="bv-radio"><input type="radio" name="xr" checked>${T('export.all')}<span class="bv-radio__meta">${T('common.items', {n: 0})}</span></label>`}</div><div class="bv-note" style="margin:16px 0">${n ? T('export.note') : T('export.none')}</div>${btn(T('export.go'), 'bv-btn--block ' + (n ? 'bv-btn--primary' : ''), 'data-act="expGo" ' + (n ? '' : 'disabled'))}`, T('export.title'), true); }
    case 'wipe': return wrap(`<div class="bv-head" style="margin-bottom:4px">${T('wipe.title')}</div><div class="bv-body bv-muted" style="margin-bottom:16px">${T('wipe.body', {n: S.tx.length})}</div><input class="bv-input" id="wipeInput" aria-label="XÓA" autocomplete="off" value="${esc(S.wipeText)}"><div class="bv-stack" style="margin-top:16px"><button class="bv-btn bv-btn--block ${S.wipeText.toUpperCase() === 'XÓA' ? 'bv-btn--primary' : ''}" id="wipeGo" type="button" data-act="wipeGo" ${S.wipeText.toUpperCase() === 'XÓA' ? '' : 'disabled'}>${T('wipe.confirm')}</button>${btn(T('wipe.export_first'), 'bv-btn--block', 'data-act="wipeExport"')}</div><div style="margin-top:8px">${btn(T('common.cancel'), 'bv-btn--block bv-btn--text', 'data-act="closeSheet"')}</div>`, T('wipe.title'));
    case 'groupedit': return wrap(groupSheet(sh), sh.id ? T('group.edit.title') : T('group.add.title'), true);
    case 'groupdel': { const g = grp(sh.id); const n = S.tx.filter(t => t.group === sh.id).length; return wrap(`<div class="bv-head" style="margin-bottom:4px">${T('group.delete.title', {'nhóm': esc(g.name)})}</div><div class="bv-body bv-muted" style="margin-bottom:24px">${T('group.delete.body', {n})}</div><div class="bv-stack">${btn(T('group.delete.confirm'), 'bv-btn--block bv-btn--primary', 'data-act="groupDelGo"')}${btn(T('common.cancel'), 'bv-btn--block', 'data-act="closeSheet"')}</div>`, T('group.delete.confirm')); }
  }
  return '';
}
function askSheet(sh) {
  const fl = S.flow, it = fl.items[fl.cur], multi = fl.items.length > 1;
  if (it.ask.kind === 'group') {
    const n = it.ask.n; const sug = n ? Math.round(it.amount / n / 1000) * 1000 : it.amount; const shareVal = sh.shareVal != null ? sh.shareVal : sug;
    const sv = isNaN(parseInt(String(shareVal).replace(/\D/g, ''), 10)) ? sug : parseInt(String(shareVal).replace(/\D/g, ''), 10);
    return `${quote(fl.say)}<div class="bv-sheet__title">${T('ask.group.q', {amount: vnd(it.amount)})}</div><input class="bv-input is-focus bv-head bv-num" id="shareInput" style="height:56px;margin-top:8px" value="${vnd(sv)}" inputmode="numeric" aria-label="${attr(T('edit.field.amount'))}" ${sh.err ? 'aria-invalid="true" aria-describedby="shErr"' : ''}>${sh.err ? `<div class="bv-field__error" id="shErr"><i aria-hidden="true">!</i>${T('ask.group.max', {amount: vnd(it.amount)})}</div>` : (n ? `<div class="bv-field__hint">${T('ask.group.hint', {n})}</div>` : '')}<div class="bv-note" style="margin-top:16px" id="shPrev">${T('ask.group.preview_spend', {amount: `<b>${vnd(sv)}</b>`, group: esc(gname(it.group || 'food'))})}<br>${T('ask.group.preview_wait', {amount: `<b>${vnd(it.amount - sv)}</b>`})}</div><div class="bv-stack" style="margin-top:16px">${btn(T('ask.group.confirm'), 'bv-btn--block bv-btn--primary', 'data-act="groupConfirm"')}${btn(L('Cả bữa là phần của mình'), 'bv-btn--block', 'data-act="groupAll"')}</div><div style="margin-top:8px">${btn(T('common.later'), 'bv-btn--block bv-btn--text', 'data-act="askLater"')}</div>`;
  }
  const d = askDef(it);
  const optsHtml = d.opts ? d.opts.map((o, i) => `<button class="bv-btn bv-btn--option ${o.primary ? 'bv-btn--primary' : ''}" type="button" data-act="ans" data-i="${i}">${o.t}</button>`).join('') : '';
  const chipsHtml = d.chips ? `<div class="bv-chips">${d.chips.map((c, i) => `<button class="bv-chip bv-chip--lg" type="button" data-act="ans" data-i="${i}">${c.icon ? ic(c.icon) : ''}${c.t}</button>`).join('')}</div>` : '';
  if (!multi && d.mood) return `${quote(fl.say)}<div class="bv-sheet__row">${mascot(d.mood)}<div><div class="bv-sheet__title">${d.q}</div>${d.sub ? `<div class="bv-sheet__sub">${d.sub}</div>` : ''}</div></div><div class="bv-stack" style="margin-top:16px">${optsHtml}${chipsHtml}</div><div style="margin-top:8px">${btn(T('common.later'), 'bv-btn--block bv-btn--text', 'data-act="askLater"')}</div>`;
  if (!multi) return `${quote(fl.say)}<div class="bv-sheet__title">${d.q}</div>${d.sub ? `<div class="bv-sheet__sub" style="margin-bottom:16px">${d.sub}</div>` : ''}<div class="bv-stack" style="margin-top:16px">${optsHtml}${chipsHtml}</div><div style="margin-top:8px">${btn(T('common.later'), 'bv-btn--block bv-btn--text', 'data-act="askLater"')}</div>`;
  const done = fl.items.filter(x => x.st === 'done' && !x.skipped), pend = fl.items.filter(x => x.st === 'pending');
  const spendTotal = sum(done.filter(x => x.type === 'spend').map(x => x.amount));
  return `${quote(fl.say)}<div class="bv-sheet__title">${T('review.saved.title', {n: done.length})}</div><div class="bv-sheet__sub">${T('review.saved.pending', {n: pend.length})}</div><div style="margin-top:8px">${fl.items.map(x => x.st === 'done' ? markRow('✓', x, itemInfo(x), vnd(x.amount)) : markRow('?', x, dayLabel(x.date), vnd(x.amount))).join('')}</div><div class="bv-ask" style="margin:0 0 8px 36px"><div>${d.q}</div>${d.sub ? `<div class="bv-call bv-muted" style="margin-top:4px">${d.sub}</div>` : ''}${optsHtml}${chipsHtml}</div><div class="bv-sheet__foot"><span>${T('review.total', {amount: `<b class="bv-num">${vnd(spendTotal)}</b>`})}</span><span style="display:flex;gap:4px">${btn(T('common.later'), 'bv-btn--sm bv-btn--text', 'data-act="askLater"')}${btn(T('common.undo'), 'bv-btn--sm', 'data-act="undoFlow"')}</span></div>`;
}
function editSheet(sh) {
  const f = sh.f, sp = f.type === 'spend' || f.type === 'refund';
  return `<div style="display:flex;justify-content:space-between;align-items:center;min-height:48px"><span class="bv-head">${T('edit.title')}</span>${btn(T('common.done'), 'bv-btn--sm bv-btn--primary', 'data-act="editDone"')}</div>${quote(sh.say)}
  <label class="bv-field__label" for="edAmount" style="margin-top:12px">${T('edit.field.amount')}</label><input class="bv-input" id="edAmount" inputmode="numeric" autocomplete="off" value="${f.amount || ''}" ${sh.err ? 'aria-invalid="true" aria-describedby="edErr"' : ''}>${sh.err ? `<div class="bv-field__error" id="edErr"><i aria-hidden="true">!</i>${T('edit.amount_error')}</div>` : ''}
  <label class="bv-field__label" for="edName" style="margin-top:12px">${T('edit.field.desc')}</label><input class="bv-input" id="edName" autocomplete="off" value="${esc(f.name)}">
  <div class="bv-field__label" style="margin-top:12px">${T('edit.field.type')}</div><div class="bv-chips">${TYPES.map(k => `<button class="bv-chip bv-chip--lg" type="button" data-act="edType" data-v="${k}" aria-pressed="${f.type === k}">${typeLabel(k)}</button>`).join('')}</div>
  ${sp ? `<div class="bv-field__label" style="margin-top:12px">${T('edit.field.group')}</div><div class="bv-chips">${S.groups.filter(g => g.id !== 'uncat').map(g => `<button class="bv-chip bv-chip--lg" type="button" data-act="edGroup" data-v="${g.id}" aria-pressed="${f.group === g.id}">${ic(g.icon)}${esc(g.name)}</button>`).join('')}</div>` : ''}
  <div class="bv-field__label" style="margin-top:12px">${T('edit.field.date')}</div><div class="bv-chips">${[0, -1, -2, -3, -4, -5, -6].map(o => `<button class="bv-chip bv-chip--lg" type="button" data-act="edDate" data-v="${o}" aria-pressed="${f.date === o}">${o === 0 ? T('today.period.label') : o === -1 ? T('today.period.yesterday') : dayInfo(o).name}</button>`).join('')}</div>
  <div style="margin-top:24px"><button class="bv-danger" type="button" data-act="${sh.id ? 'del' : 'closeSheet'}" ${sh.id ? `data-id="${sh.id}"` : ''}>${T('edit.delete')}</button></div>`;
}
function groupSheet(sh) {
  const isNew = !sh.id, g = sh.id ? grp(sh.id) : null;
  const kwChips = sh.kw.map((k, i) => `<button class="bv-chip bv-chip--lg" type="button" data-act="kwDel" data-i="${i}" aria-label="${attr(T('group.keywords.remove', {'từ': esc(k)}))}">${esc(k)} ✕</button>`).join('');
  const example = sh.kw[0] ? `<div class="bv-note" style="margin-top:16px">${T('group.keywords.example')}</div>` : '';
  return `${sheetHead(isNew ? T('group.add.title') : T('group.edit.title'))}<label class="bv-field__label" for="gName" style="margin-top:4px">${T('group.name')}</label><input class="bv-input ${sh.err ? '' : 'is-focus'}" id="gName" autocomplete="off" value="${esc(sh.name)}" maxlength="40" placeholder="${attr(T('group.name.placeholder'))}" ${sh.err ? 'aria-invalid="true" aria-describedby="gErr"' : ''}>${sh.err ? `<div class="bv-field__error" id="gErr"><i aria-hidden="true">!</i>${sh.err === 'dup' ? T('group.name.dup') : sh.err === 'empty' ? T('group.name.empty') : T('group.name.long')}</div>` : ''}
  <div class="bv-field__label" style="margin:16px 0 8px">${T('group.icon')}</div><div class="bv-iconpick" role="group" aria-label="${attr(T('group.icon'))}">${BV_PICK_ICONS.map(id => `<button class="bv-iconpick__btn" type="button" data-act="gIcon" data-v="${id}" aria-pressed="${sh.icon === id}" aria-label="${attr(ICON_NAME(id))}">${ic(id)}</button>`).join('')}</div><div class="bv-call bv-muted" style="margin-top:8px">${T('group.icon.chosen', {'tên biểu tượng': ICON_NAME(sh.icon)})}</div>
  <div class="bv-field__label" style="margin:16px 0 8px">${T('group.keywords')}</div><div class="bv-chips">${kwChips}</div>
  <div style="display:flex;gap:8px;margin-top:8px"><input class="bv-input" id="gKw" style="flex:1" autocomplete="off" aria-label="${attr(T('group.keywords.add'))}" placeholder="${attr(T('group.keywords.add').replace('+ ', ''))}" value="${esc(sh.kwText || '')}">${btn(T('group.keywords.add'), 'bv-btn--sm', 'data-act="kwAdd"')}</div>
  ${sh.clash ? `<div class="bv-card bv-card--review" style="margin-top:8px"><div><div class="bv-card__desc" style="color:var(--bv-text)">${T('group.keywords.clash', {'từ': '<b>' + esc(sh.clash.word) + '</b>', 'nhóm': esc(gname(sh.clash.from)), 'nhóm mới': esc(sh.name || '…')})}</div><div style="display:flex;gap:8px;margin-top:8px">${btn('Chuyển', 'bv-btn--sm bv-btn--primary', 'data-act="kwClashYes"')}${btn('Giữ nguyên', 'bv-btn--sm', 'data-act="kwClashNo"')}</div></div></div>` : ''}
  ${!isNew && g.defKw.length ? `<div style="margin-top:4px">${btn(T('group.keywords.reset'), 'bv-btn--text bv-btn--sm', 'data-act="kwReset"')}</div>` : ''}${example}
  <div style="margin-top:16px">${btn(T('group.save'), 'bv-btn--block bv-btn--primary', 'data-act="groupSave"')}</div>${!isNew && g.custom ? `<div style="margin-top:8px">${btn(T('group.delete.link'), 'bv-btn--block bv-btn--text', 'data-act="groupDel"')}</div>` : ''}`;
}
