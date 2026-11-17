/* Trilha ambiente original sintetizada no navegador; nenhuma faixa externa. */
(() => {
  const button = document.getElementById('ambient-toggle');
  if (!button) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) { button.hidden = true; return; }
  let ctx, master, voices = [], timer, playing = false, step = 0;
  const chords = [[130.81,164.81,196],[146.83,174.61,220],[110,146.83,174.61],[130.81,164.81,220]];
  function setLabel() {
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Desligar música ambiente' : 'Ligar música ambiente');
    button.textContent = playing ? '♫ Música: ligada' : '♫ Ativar música';
  }
  function initialize() {
    ctx = new AudioContextClass();
    master = ctx.createGain();
    master.gain.value = 0;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass'; lowpass.frequency.value = 650; lowpass.Q.value = 0.4;
    lowpass.connect(master); master.connect(ctx.destination);
    voices = chords[0].map((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = index === 1 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      gain.gain.value = index === 0 ? 0.25 : 0.14;
      osc.connect(gain); gain.connect(lowpass); osc.start();
      return osc;
    });
  }
  function evolve() {
    if (!ctx || !playing) return;
    step = (step + 1) % chords.length;
    const now = ctx.currentTime;
    voices.forEach((osc, i) => osc.frequency.setTargetAtTime(chords[step][i], now, 2.8));
  }
  async function toggle() {
    button.disabled = true;
    try {
      if (!ctx) initialize();
      if (playing) {
        playing = false;
        clearInterval(timer);
        master.gain.setTargetAtTime(0, ctx.currentTime, 0.25);
        // Suspend only after the fade-out; toggling on cancels the pending suspend.
        const current = ctx;
        window.setTimeout(() => { if (!playing && ctx === current) current.suspend().catch(() => {}); }, 1200);
      } else {
        await ctx.resume();
        playing = true;
        master.gain.setTargetAtTime(0.035, ctx.currentTime, 1.3);
        clearInterval(timer);
        timer = window.setInterval(evolve, 9000);
      }
    } catch (error) {
      playing = false;
      clearInterval(timer);
      console.warn('Áudio ambiente indisponível:', error);
    } finally { setLabel(); button.disabled = false; }
  }
  button.addEventListener('click', toggle);
  document.addEventListener('visibilitychange', () => {
    if (!ctx || !playing) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  });
  window.addEventListener('pagehide', () => { clearInterval(timer); if (ctx) ctx.close().catch(() => {}); }, {once:true});
  setLabel();
})();
