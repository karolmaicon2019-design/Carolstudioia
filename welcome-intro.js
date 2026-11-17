/* Abertura cinematográfica com voz de boas-vindas; pode ser pulada. */
(() => {
  const overlay = document.getElementById('welcome-intro');
  const skip = document.getElementById('welcome-skip');
  const sound = document.getElementById('welcome-sound');
  if (!overlay || !skip || !sound) return;
  const synth = window.speechSynthesis;
  const Speech = window.SpeechSynthesisUtterance;
  const key = 'carol-intro-viewed-v1';
  let closed = false, spoken = false, utterance, timeout;
  try {
    if (sessionStorage.getItem(key) === '1') { overlay.remove(); return; }
  } catch (_) {}
  const voices = () => {
    if (!synth) return null;
    const list = synth.getVoices().filter(v => /^pt[-_]BR$/i.test(v.lang));
    return list.find(v => /female|feminina|francisca|maria|camila|luciana|helo/i.test(v.name)) ||
      list.find(v => /natural|neural|premium/i.test(v.name)) || list[0] || null;
  };
  function speak() {
    if (closed || spoken || !synth || !Speech) return;
    spoken = true;
    utterance = new Speech('Seja bem-vindo ao Carol Digital Studio! Aqui suas ideias ganham vida. Precisa de ajuda? É só tocar no botão flutuante. A Carol IA está à sua disposição!');
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    utterance.volume = 0.78;
    const voice = voices();
    if (voice) utterance.voice = voice;
    utterance.onerror = () => { if (!closed) sound.hidden = false; };
    try { synth.speak(utterance); } catch (_) { sound.hidden = false; }
  }
  function close() {
    if (closed) return;
    closed = true;
    clearTimeout(timeout);
    if (synth) synth.cancel();
    overlay.classList.add('welcome-exit');
    overlay.setAttribute('aria-hidden', 'true');
    try { sessionStorage.setItem(key, '1'); } catch (_) {}
    setTimeout(() => overlay.remove(), 550);
  }
  skip.addEventListener('click', close);
  sound.addEventListener('click', () => {
    if (synth) synth.cancel();
    spoken = false;
    speak();
    sound.hidden = true;
  });
  overlay.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  // Tenta voz automática. Se o navegador bloquear, permite ouvir com um toque.
  if (synth && Speech) {
    sound.hidden = false;
    setTimeout(speak, 700);
  } else sound.hidden = true;
  timeout = setTimeout(close, 13000);
})();
