/* =========================================================
   BillyVoice – lưu dữ liệu TRÊN MÁY người dùng (D02): IndexedDB, dự phòng localStorage.
   Không có máy chủ, không đăng nhập. Hai kho:
     tx  – các khoản (id, day, time, name, amount, type, group, status, say, src, uid, createdAt)
     kv  – cài đặt: nhóm chi tiêu của người dùng, đã xem nhập môn chưa, quyền micro…
   Mọi hàm ghi trả về Promise; lỗi được báo qua BVStore.onError để giao diện nói cho người dùng biết.
   ========================================================= */
const BVStore = (() => {
  const DB = 'billyvoice', VER = 1, LSKEY = 'billyvoice.v1';
  let db = null, mode = 'idb', LS = null;
  const api = {mode: () => mode, onError: null};
  const fail = e => { if (api.onError) api.onError(e); return Promise.reject(e); };
  const reqP = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
  const open = () => new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error('Trình duyệt không có IndexedDB'));
    let r; try { r = indexedDB.open(DB, VER); } catch (e) { return rej(e); }
    r.onupgradeneeded = () => { const d = r.result; if (!d.objectStoreNames.contains('tx')) d.createObjectStore('tx', {keyPath: 'id'}); if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv', {keyPath: 'k'}); };
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); r.onblocked = () => rej(new Error('IndexedDB bị chặn'));
  });
  const store = (name, m) => db.transaction(name, m).objectStore(name);
  const done = t => new Promise((res, rej) => { t.oncomplete = () => res(); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('Giao dịch bị hủy')); });
  const lsWrite = () => { localStorage.setItem(LSKEY, JSON.stringify(LS)); };

  /* Đọc toàn bộ dữ liệu khi mở app. Ném lỗi nếu không đọc được (giao diện hiện màn "chưa đọc được dữ liệu"). */
  api.init = async () => {
    try {
      db = await open(); mode = 'idb';
      const tx = await reqP(store('tx', 'readonly').getAll()), kv = await reqP(store('kv', 'readonly').getAll());
      return {tx, kv: Object.fromEntries(kv.map(x => [x.k, x.v]))};
    } catch (e) {
      try {                                                           /* dự phòng: localStorage */
        const raw = localStorage.getItem(LSKEY); LS = raw ? JSON.parse(raw) : {tx: [], kv: {}}; mode = 'ls';
        return {tx: LS.tx, kv: LS.kv};
      } catch (e2) { throw e; }
    }
  };
  api.putTx = t => { try { if (mode === 'ls') { const i = LS.tx.findIndex(x => x.id === t.id); if (i < 0) LS.tx.push(t); else LS.tx[i] = t; lsWrite(); return Promise.resolve(); } const tr = db.transaction('tx', 'readwrite'); tr.objectStore('tx').put(t); return done(tr).catch(fail); } catch (e) { return fail(e); } };
  api.delTx = id => { try { if (mode === 'ls') { LS.tx = LS.tx.filter(x => x.id !== id); lsWrite(); return Promise.resolve(); } const tr = db.transaction('tx', 'readwrite'); tr.objectStore('tx').delete(id); return done(tr).catch(fail); } catch (e) { return fail(e); } };
  api.setKv = (k, v) => { try { if (mode === 'ls') { LS.kv[k] = v; lsWrite(); return Promise.resolve(); } const tr = db.transaction('kv', 'readwrite'); tr.objectStore('kv').put({k, v}); return done(tr).catch(fail); } catch (e) { return fail(e); } };
  api.wipe = () => { try { if (mode === 'ls') { LS = {tx: [], kv: {}}; localStorage.removeItem(LSKEY); return Promise.resolve(); } const tr = db.transaction(['tx', 'kv'], 'readwrite'); tr.objectStore('tx').clear(); tr.objectStore('kv').clear(); return done(tr).catch(fail); } catch (e) { return fail(e); } };
  /* Xin trình duyệt giữ dữ liệu, không tự xóa khi thiếu chỗ (không bắt buộc) */
  api.persist = () => { try { if (navigator.storage && navigator.storage.persist) return navigator.storage.persist(); } catch (e) {} return Promise.resolve(false); };
  return api;
})();
