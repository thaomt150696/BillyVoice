/* =========================================================
   BillyVoice – chuyển động dùng chung cho hi-fi và prototype (D31, D32)
   Nguồn quyết định: decision-log D31, D32; mô tả ở 06_UI/motion.md.
   Đi cùng motion.css. Khi build app thật, các hàm này thành module riêng.
   Quy tắc: không đổi dữ liệu, không che số tiền; mọi hàm tự thu lại khi bật Giảm chuyển động.
   ========================================================= */
const BVM = (() => {
  const root = document.documentElement, NS = 'http://www.w3.org/2000/svg';
  const reduced = () => root.dataset.motion === 'reduce' || (root.dataset.motion !== 'full' && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const sym = id => { const s = document.getElementById(id); return s ? s.innerHTML : ''; };
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* Bật hiệu ứng nhấn nút (A1) */
  const init = () => document.body.classList.add('bv-motion');

  /* Nâng hình minh họa thành Billy "sống" (B1): nhân bản nội dung symbol để lá, mắt, tay chuyển động riêng.
     - svg.bv-mascot (một Billy), svg.bv-ill (cảnh có Billy bên trong). Gọi lại nhiều lần an toàn. */
  const live = (scope = document) => scope.querySelectorAll('svg.bv-ill:not([data-live]), svg.bv-mascot:not([data-live])').forEach(svg => {
    const u = svg.querySelector(':scope > use'); if (!u) return;
    const id = (u.getAttribute('href') || '').slice(1);
    if (id.indexOf('bv-billy') === 0) {
      svg.innerHTML = sym(id); svg.classList.add('bv-m-billy'); svg.dataset.mood = id.replace('bv-billy', '').replace(/^-/, '') || 'happy';
    } else if (id.indexOf('bv-ill-') === 0) {
      svg.innerHTML = sym(id); svg.setAttribute('viewBox', '0 0 160 120');
      svg.querySelectorAll('use').forEach(bu => {
        const bid = (bu.getAttribute('href') || '').slice(1);
        if (bid.indexOf('bv-billy') !== 0 || bid === 'bv-billy-base' || bid === 'bv-billy-leaves') return;
        const n = document.createElementNS(NS, 'svg');
        ['x', 'y', 'width', 'height'].forEach(a => n.setAttribute(a, bu.getAttribute(a)));
        n.setAttribute('viewBox', '0 0 100 100'); n.setAttribute('class', 'bv-m-billy is-breathing'); n.innerHTML = sym(bid); bu.replaceWith(n);
      });
    } else return;
    svg.dataset.live = '1';
  });

  /* Số đếm lên (A4). fmt: hàm định dạng số tiền của app. Giảm chuyển động: hiện luôn giá trị cuối. */
  const countTo = (el, from, to, ms, fmt) => {
    if (reduced() || ms <= 0 || from === to) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), ease = t => 1 - Math.pow(1 - t, 3);
    (function tick(now) { const p = Math.min(1, (now - t0) / ms); el.textContent = fmt(Math.round(from + (to - from) * ease(p))); if (p < 1 && el.isConnected) requestAnimationFrame(tick); else el.textContent = fmt(to); })(t0);
  };

  /* Thanh sóng âm chạy khi đang nghe (B6). Là thông tin "đang nghe" nên vẫn chạy khi giảm chuyển động. */
  const wave = el => {
    if (el.dataset.waving) return; el.dataset.waving = '1';
    const bars = [...el.querySelectorAll('i')]; bars.forEach(b => { b.style.transition = 'transform 90ms linear'; });
    let lvl = 0;
    (function loop(t) {
      if (!el.isConnected) return;
      const target = .25 + .75 * Math.abs(Math.sin(t / 260) * Math.sin(t / 710 + 1)); lvl += (target - lvl) * .35;
      bars.forEach((b, i) => { const k = .35 + .65 * Math.abs(Math.sin(t / 180 + i * .9)); b.style.transform = 'scaleY(' + Math.max(.2, Math.min(1, lvl * k + .2)) + ')'; });
      requestAnimationFrame(loop);
    })(performance.now());
  };

  /* Bản "ma" của phần tử vừa bị gỡ, để chạy hiệu ứng ra (đóng bảng trượt, thu gọn dòng) */
  const ghost = (html, parent, cls, ms, before) => {
    const d = document.createElement('div'); d.innerHTML = html; const el = d.firstElementChild; if (!el) return null;
    el.className = el.className.replace(/bv-m-(sheet|scrim)-in/g, '').trim() + ' ' + cls; el.style.pointerEvents = 'none'; el.removeAttribute('data-act');
    parent.insertBefore(el, before || null); setTimeout(() => el.remove(), ms); return el;
  };

  /* Mờ chéo hai Billy (B5): bản cũ mờ đi tại chỗ cũ, bản mới hiện lên */
  const crossfade = (oldHtml, oldRect, newEl) => {
    const d = document.createElement('div'); d.innerHTML = oldHtml; const o = d.firstElementChild; if (!o) return;
    Object.assign(o.style, {position: 'fixed', left: oldRect.left + 'px', top: oldRect.top + 'px', width: oldRect.width + 'px', height: oldRect.height + 'px', margin: 0, pointerEvents: 'none', transition: 'opacity var(--bv-dur) var(--bv-ease)', zIndex: 60});
    document.body.appendChild(o); newEl.style.opacity = '0'; newEl.style.transition = 'opacity var(--bv-dur) var(--bv-ease)';
    requestAnimationFrame(() => requestAnimationFrame(() => { o.style.opacity = '0'; newEl.style.opacity = '1'; }));
    setTimeout(() => o.remove(), 260);
  };

  /* Chạy khi phần tử lần đầu lọt vào màn hình (hi-fi: các khung xếp dọc) */
  const onView = (selector, fn, scope = document) => {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); fn(e.target); } }), {threshold: .35});
    scope.querySelectorAll(selector).forEach(el => io.observe(el));
  };

  return {reduced, restart, init, live, countTo, wave, ghost, crossfade, onView};
})();
if (document.body) BVM.init();
