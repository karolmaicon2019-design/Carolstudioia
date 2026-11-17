/* Trilha ambiente original e relaxante: acordes macios, notas espaçadas e volume discreto. */
(() => {
  const button = document.getElementById('ambient-toggle');
  if (!button) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) { button.hidden = true; return; }

  let ctx, master, filter, interval, playing = false, step = 0;
  const pattern = [
    [130.81, 196.00, 261.63], [164.81, 196.00],
    [146.83, 220.00, 293.66], [174.61, 220.00],
    [110.00, 164.81, 220.00], [146.83, 196.00],
    [130.81, 196.00, 246.94], [164.81, 220.00]
  ];

  function updateButton() {
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Desligar música ambiente' : 'Ligar música ambiente');
    button.textContent = playing ? '♫ Música: ligada' : '♫ Ativar música';
  }
  function initialize() {
    ctx = new AudioCtx();
    master = ctx.createGain();
    master.gain.value = 0.18;
    filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 520;
    filter.Q.value = 0.2;
    filter.connect(master);
    master.connect(ctx.destination);
  }
  function softTone(frequency, time, length, peak) {
    const osc = ctx.createOscillator();
    const envelope = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, time);
    envelope.gain.setValueAtTime(0.0001, time);
    envelope.gain.linearRampToValueAtTime(peak, time + 0.65);
    envelope.gain.exponentialRampToValueAtTime(0.0001, time + length);
    osc.connect(envelope);
    envelope.connect(filter);
    osc.start(time);
    osc.stop(time + length + 0.05);
    osc.onended = () => { osc.disconnect(); envelope.disconnect(); };
  }
  function nextPhrase() {
    if (!playing || !ctx || ctx.state !== 'running') return;
    const notes = pattern[step++ % pattern.length];
    const time = ctx.currentTime + 0.05;
    notes.forEach((frequency, i) => softTone(frequency, time + i * 0.85, 4.3, i === 0 ? 0.095 : 0.055));
  }
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      if (playing) {
        playing = false;
        clearInterval(interval);
        interval = undefined;
        if (ctx && ctx.state === 'running') await ctx.suspend();
      } else {
        if (!ctx) initialize();
        await ctx.resume();
        playing = true;
        nextPhrase();
        interval = setInterval(nextPhrase, 6300);
      }
    } catch (error) {
      playing = false;
      clearInterval(interval);
      interval = undefined;
      console.warn('Música ambiente indisponível:', error);
    } finally {
      updateButton();
      button.disabled = false;
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!ctx || !playing) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  });
  window.addEventListener('pagehide', () => {
    playing = false;
    clearInterval(interval);
    if (ctx) ctx.close().catch(() => {});
  }, {once:true});
  updateButton();
})();
