/* =========================================================
   BillyVoice – service worker: cho app chạy khi ngoại tuyến (US-16).
   - Mọi file của app được lưu sẵn lúc cài; lần sau mở không cần mạng.
   - Dữ liệu chi tiêu KHÔNG đi qua đây (nằm trong IndexedDB trên máy).
   - VERSION và ASSETS do tools/build-app.ps1 điền lại mỗi khi build; đổi VERSION thì máy người dùng tự cập nhật bản mới.
   ========================================================= */
const VERSION = 'billyvoice-1e51ec606d';
/*ASSETS:START*/
const ASSETS = ['./', 'css/app.css', 'css/components.css', 'css/fonts.css', 'css/motion.css', 'css/tokens.css', 'fonts/BeVietnamPro-400-latin.woff2', 'fonts/BeVietnamPro-400-vietnamese.woff2', 'fonts/BeVietnamPro-500-latin.woff2', 'fonts/BeVietnamPro-500-vietnamese.woff2', 'fonts/BeVietnamPro-600-latin.woff2', 'fonts/BeVietnamPro-600-vietnamese.woff2', 'fonts/BeVietnamPro-700-latin.woff2', 'fonts/BeVietnamPro-700-vietnamese.woff2', 'fonts/BeVietnamPro-800-latin.woff2', 'fonts/BeVietnamPro-800-vietnamese.woff2', 'img/apple-touch-icon.png', 'img/favicon-32.png', 'img/icon.svg', 'img/icon-192.png', 'img/icon-512.png', 'img/icon-512-maskable.png', 'index.html', 'js/app-core.js', 'js/app-main.js', 'js/app-views.js', 'js/categories.js', 'js/config.js', 'js/lib.js', 'js/microcopy.js', 'js/motion.js', 'js/parser.js', 'js/speech.js', 'js/store.js', 'js/vn-number.js', 'manifest.webmanifest'];
/*ASSETS:END*/

self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => (req.mode === 'navigate' ? caches.match('./index.html') || caches.match('./') : Response.error()))));
});
