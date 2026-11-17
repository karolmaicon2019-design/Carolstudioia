/* Carol Digital Studio — ambiente acolhedor original, estilo lounge calmo.
   Áudio gerado localmente com Web Audio; sem gravações de terceiros. */
(() => {
  const button = document.getElementById('ambient-toggle');
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!button || !AudioCtx) return;

  let context, output, toneBus, interval = null, playing = false, step = 0;
  const chords = [
    [130.81, 164.81, 196.00, 261.63], // Cmaj7
    [110.00, 130.81, 164.81, 220.00], // Am7
    [87.31, 130.81, 174.61, 220.00], // Fmaj7
    [98.00, 146.83, 196.00, 246.94]  // Gmaj7
  ];
  const melodies = [
    [392.00, 329.63, 293.66, 261.63],
    [329.63, 261.63, 246.94, 220.00],
    [349.23, 329.63, 261.63, 220.00],
    [293.66, 246.94, 293.66, 261.63]
  ];
  function display() {
    button.textContent = playing ? '♫ Música: ligada' : '♫ Ativar música';
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing ? 'Desligar música ambiente' : 'Ligar música ambiente');
  }
  function initialize() {
    context = new AudioCtx();
    output = context.createGain();
    output.gain.value = 0.0001;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.15;
    toneBus = filter;
    filter.connect(output);
    output.connect(context.destination);
  }
  function voice(frequency, start, length, volume, instrument = 'pad') {
    const osc = context.createOscillator();
    const gain = context.createGain();
    const overtone = context.createOscillator();
    const overtoneGain = context.createGain();
    osc.type = 'sine';
    overtone.type = 'sine';
    osc.frequency.setValueAtTime(frequency, start);
    overtone.frequency.setValueAtTime(frequency * 2, start);
    overtoneGain.gain.value = instrument === 'pad' ? 0.10 : 0.17;
    const attack = instrument === 'pad' ? 1.8 : 0.12;
    const peak = volume;
    gain.gain.setValueAtTime(0.00001, start);
    gain.gain.linearRampToValueAtTime(peak, start + attack);
    gain.gain.setTargetAtTime(0.00001, start + length * 0.65, length * 0.14);
    gain.gain.setValueAtTime(0.00001, start + length);
    osc.connect(gain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(gain);
    gain.connect(toneBus);
    osc.start(start);
    overtone.start(start);
    osc.stop(start + length + 0.05);
    overtone.stop(start + length + 0.05);
    osc.onended = () => {
      osc.disconnect(); overtone.disconnect(); overtoneGain.disconnect(); gain.disconnect();
    };
  }
  function phrase() {
    if (!playing || !context || context.state !== 'running') return;
    const chordIndex = Math.floor(step / 2) % chords.length;
    const start = context.currentTime + 0.05;
    if (step % 2 === 0) {
      chords[chordIndex].forEach((frequency, i) => voice(frequency, start + i * 0.09, 11.8, i === 0 ? 0.055 : 0.033));
    }
    // Algumas notas espaçadas, como um piano elétrico suave.
    const melody = melodies[chordIndex];
    const noteIndex = step % 2 === 0 ? 0 : 2;
    voice(melody[noteIndex], start + 1.0, 3.3, 0.018, 'bell');
    voice(melody[noteIndex + 1], start + 4.0, 3.2, 0.014, 'bell');
    step++;
  }
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      if (playing) {
        playing = false;
        clearInterval(interval);
        interval = null;
        if (context) {
          output.gain.cancelScheduledValues(context.currentTime);
          output.gain.setTargetAtTime(0.0001, context.currentTime, 0.4);
          const current = context;
          setTimeout(() => { if (!playing && context === current) current.suspend().catch(() => {}); }, 1600);
        }
      } else {
        if (!context) initialize();
        await context.resume();
        playing = true;
        output.gain.cancelScheduledValues(context.currentTime);
        output.gain.setTargetAtTime(0.26, context.currentTime, 1.2);
        phrase();
        interval = setInterval(phrase, 6200);
      }
    } catch (error) {
      playing = false;
      clearInterval(interval);
      interval = null;
      console.warn('Áudio ambiente indisponível:', error);
    } finally {
      display();
      button.disabled = false;
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (!context || !playing) return;
    if (document.hidden) context.suspend().catch(() => {});
    else context.resume().catch(() => {});
  });
  window.addEventListener('pagehide', () => {
    playing = false;
    clearInterval(interval);
    if (context) context.close().catch(() => {});
  }, { once: true });
  display();
})();
