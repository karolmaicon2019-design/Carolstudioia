/* Carol Digital Studio: trilha original, suave e sem osciladores contínuos. */
(() => {
  const button = document.getElementById('ambient-toggle');
  if (!button) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) { button.hidden = true; return; }

  let ctx = null, master = null, timer = null, active = false, index = 0, generation = 0;
  // Pequena progressão harmônica original: notas curtas, graves e macias.
  const sequence = [
    [196, 261.63], [246.94], [293.66], [261.63],
    [174.61, 220], [261.63], [293.66], [220],
    [164.81, 196], [246.94], [261.63], [196],
    [174.61, 261.63], [220], [196], [146.83]
  ];

  function label() {
    button.setAttribute('aria-pressed', String(active));
    button.setAttribute('aria-label', active ? 'Desligar música ambiente' : 'Ligar música ambiente');
    button.textContent = active ? '♫ Música: ligada' : '♫ Ativar música';
  }
  function setup() {
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = 0.32;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;
    filter.Q.value = 0.25;
    filter.connect(master);
    master.connect(ctx.destination);
    return filter;
  }
  let filter;
  function note(freq, when, duration, strength) {
    if (!ctx) return;
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, when);
    envelope.gain.setValueAtTime(0.0001, when);
    envelope.gain.exponentialRampToValueAtTime(strength, when + 0.12);
    envelope.gain.exponentialRampToValueAtTime(0.0001, when + duration);
    oscillator.connect(envelope);
    envelope.connect(filter);
    oscillator.start(when);
    oscillator.stop(when + duration + 0.03);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }
  function playStep() {
    if (!active || !ctx || ctx.state !== 'running') return;
    const now = ctx.currentTime + 0.025;
    const pitches = sequence[index % sequence.length];
    pitches.forEach((freq, i) => note(freq, now + i * 0.22, 1.65, i === 0 ? 0.075 : 0.035));
    index += 1;
  }
  async function toggle() {
    button.disabled = true;
    const request = ++generation;
    try {
      if (active) {
        active = false;
        clearInterval(timer);
        timer = null;
        if (ctx && ctx.state === 'running') await ctx.suspend();
      } else {
        if (!ctx) filter = setup();
        await ctx.resume(); // Inicia apenas após toque do visitante.
        if (request !== generation) return;
        active = true;
        playStep();
        timer = setInterval(playStep, 2000);
      }
    } catch (e) {
      active = false;
      clearInterval(timer);
      timer = null;
      console.warn('Música ambiente indisponível:', e);
    } finally { label(); button.disabled = false; }
  }
  button.addEventListener('click', toggle);
  document.addEventListener('visibilitychange', () => {
    if (!ctx || !active) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  });
  window.addEventListener('pagehide', () => {
    active = false;
    clearInterval(timer);
    if (ctx) ctx.close().catch(() => {});
  }, {once:true});
  label();
})();
