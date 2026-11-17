/* Saudação falada: tenta iniciar ao abrir, com fallback para a primeira interação.
   A qualidade da voz depende das vozes instaladas no dispositivo. */
(() => {
  if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) return;
  const speech = window.speechSynthesis;
  const message = 'Seja bem-vindo ao Carol Digital Studio! Que bom ter você aqui. Se precisar de ajuda, é só tocar no botão flutuante. A Carol IA está pronta para ajudar você!';
  const key = 'carol-studio-welcome-spoken';
  let attempted = false;
  let completed = false;
  let speaking = false;
  let utterance = null;
  let fallbackReady = false;
  try { if (sessionStorage.getItem(key) === '1') return; } catch (_) {}

  function chooseVoice() {
    const voices = speech.getVoices();
    const pt = voices.filter(v => /^pt(-|_)/i.test(v.lang));
    const br = pt.filter(v => /^pt[-_]BR$/i.test(v.lang));
    const candidates = br.length ? br : pt;
    return candidates.find(v => /female|feminina|francisca|maria|luciana|camila|heloisa|hel[oô]isa/i.test(v.name))
      || candidates.find(v => /natural|neural|premium|enhanced/i.test(v.name))
      || candidates[0] || null;
  }
  function markDone() {
    completed = true;
    speaking = false;
    try { sessionStorage.setItem(key, '1'); } catch (_) {}
    removeFallback();
  }
  function speak() {
    if (completed || speaking || document.hidden) return;
    attempted = true;
    utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.92;
    utterance.pitch = 1.04;
    utterance.volume = 0.72;
    const voice = chooseVoice();
    if (voice) utterance.voice = voice;
    utterance.onstart = () => { speaking = true; removeFallback(); };
    utterance.onend = markDone;
    utterance.onerror = () => { speaking = false; fallbackReady = true; };
    try { speech.speak(utterance); }
    catch (_) { speaking = false; fallbackReady = true; }
  }
  function fallback() {
    if (completed || speaking) return;
    if (speech.speaking || speech.pending) {
      speech.cancel();
    }
    speak();
  }
  function removeFallback() {
    document.removeEventListener('pointerdown', fallback);
    document.removeEventListener('keydown', fallback);
  }
  document.addEventListener('pointerdown', fallback, { once: true });
  document.addEventListener('keydown', fallback, { once: true });
  if (document.readyState === 'complete') setTimeout(speak, 500);
  else window.addEventListener('load', () => setTimeout(speak, 500), { once: true });
  window.addEventListener('pagehide', () => {
    if (!completed && speaking) speech.cancel();
  }, { once: true });
})();
