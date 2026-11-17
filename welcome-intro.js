/* Abertura com vídeo real da Carol: som quando permitido, opção de pular. */
(() => {
  const overlay = document.getElementById('welcome-intro');
  const video = document.getElementById('welcome-video');
  const skip = document.getElementById('welcome-skip');
  const sound = document.getElementById('welcome-sound');
  if (!overlay || !video || !skip || !sound) return;
  const key = 'carol-welcome-video-seen-v1';
  let closed = false;
  let fallback;
  try { if (sessionStorage.getItem(key) === '1') { overlay.remove(); return; } } catch (_) {}
  function close() {
    if (closed) return;
    closed = true;
    clearTimeout(fallback);
    video.pause();
    video.removeAttribute('src');
    video.load();
    overlay.classList.add('welcome-exit');
    overlay.setAttribute('aria-hidden', 'true');
    try { sessionStorage.setItem(key, '1'); } catch (_) {}
    setTimeout(() => overlay.remove(), 550);
  }
  async function playWithSound() {
    if (closed) return;
    video.muted = false;
    try {
      await video.play();
      sound.hidden = true;
    } catch (_) {
      video.muted = true;
      sound.hidden = false;
      video.play().catch(() => {});
    }
  }
  async function start() {
    try {
      video.muted = false;
      await video.play();
      sound.hidden = true;
    } catch (_) {
      video.muted = true;
      try { await video.play(); } catch (_) {}
      sound.hidden = false;
    }
  }
  skip.addEventListener('click', close);
  sound.addEventListener('click', playWithSound);
  video.addEventListener('ended', close);
  video.addEventListener('error', () => {
    sound.hidden = true;
    sound.textContent = 'Vídeo indisponível';
    fallback = setTimeout(close, 2200);
  });
  overlay.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  // Evita bloquear a entrada se a rede estiver lenta ou o vídeo não carregar.
  fallback = setTimeout(close, 20000);
  start();
})();
