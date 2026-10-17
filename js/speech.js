/* =========================================================
   BillyVoice – nhận diện giọng nói bằng Web Speech API của trình duyệt (vi-VN)
   - Chrome và Edge thường gửi âm thanh tới máy chủ của Google / Microsoft; Safari dùng dịch vụ của Apple.
     Billy KHÔNG nhận và KHÔNG lưu file ghi âm (nội dung màn S16 nói đúng như vậy).
   - Không có Web Speech (nhiều trình duyệt khác, hoặc iPhone cũ) thì BVSpeech.supported = false và app dùng ô gõ chữ.
   - start() trả về {stop, abort}. onEnd được gọi đúng 1 lần: {text, error, reason}
       error: 'denied' | 'no-speech' | 'no-mic' | 'network' | 'other' | null
       reason: 'silence' | 'manual' | 'max' | 'ended' | 'abort'
   ========================================================= */
const BVSpeech = (() => {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const api = {supported: !!Rec};
  api.start = ({onText, onTick, onEnd}) => {
    const cfg = BV_CONFIG; const r = new Rec(); r.lang = cfg.speechLang; r.interimResults = true; r.continuous = false; r.maxAlternatives = 1;
    const t0 = Date.now(); let finalText = '', interim = '', lastHeard = 0, heard = false, ended = false, error = null, reason = 'ended', iv = null, aborted = false;
    const finish = () => { if (ended) return; ended = true; clearInterval(iv); const text = (finalText + ' ' + interim).replace(/\s+/g, ' ').trim(); onEnd({text: aborted ? '' : text, error: aborted ? null : (error || (text ? null : 'no-speech')), reason: aborted ? 'abort' : reason}); };
    r.onresult = ev => {
      let f = '', i = ''; for (let k = 0; k < ev.results.length; k++) { const res = ev.results[k]; if (res.isFinal) f += res[0].transcript + ' '; else i += res[0].transcript; }
      finalText = f; interim = i; heard = true; lastHeard = Date.now(); onText && onText((f + i).replace(/\s+/g, ' ').trim());
    };
    r.onerror = ev => { const e = ev.error; if (e === 'aborted') return; error = (e === 'not-allowed' || e === 'service-not-allowed') ? 'denied' : e === 'no-speech' ? 'no-speech' : e === 'audio-capture' ? 'no-mic' : e === 'network' ? 'network' : 'other'; };
    r.onend = finish;
    iv = setInterval(() => {
      const el = Date.now() - t0; onTick && onTick(Math.min(59, Math.floor(el / 1000)));
      if (!heard && el >= cfg.noSpeechMs) { reason = 'silence'; try { r.stop(); } catch (e) {} }
      else if (heard && Date.now() - lastHeard >= cfg.silenceMs) { reason = 'silence'; try { r.stop(); } catch (e) {} }
      else if (el >= cfg.maxListenMs) { reason = 'max'; try { r.stop(); } catch (e) {} }
    }, 250);
    try { r.start(); } catch (e) { error = 'other'; finish(); }
    return {stop: () => { reason = 'manual'; try { r.stop(); } catch (e) {} }, abort: () => { aborted = true; try { r.abort(); } catch (e) {} finish(); }};
  };
  /* Trạng thái quyền micro (nếu trình duyệt cho hỏi): 'granted' | 'denied' | 'prompt' | null */
  api.permission = async () => { try { if (navigator.permissions && navigator.permissions.query) return (await navigator.permissions.query({name: 'microphone'})).state; } catch (e) {} return null; };
  return api;
})();
