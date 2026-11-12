/**
 * Interacciones de la invitación.
 * Sin dependencias de JS externas, sin acceso a servicios ni recopilación de datos.
 */
const gate = document.getElementById('invitationGate') as HTMLElement | null;
const openButton = document.getElementById('openInvitation') as HTMLButtonElement | null;
const musicButton = document.getElementById('musicControl') as HTMLButtonElement | null;
const audio = document.getElementById('weddingAudio') as HTMLAudioElement | null;
const toast = document.getElementById('weddingToast') as HTMLElement | null;
const shareButton = document.getElementById('shareInvitation') as HTMLButtonElement | null;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let fadeFrame: number | undefined;
let toastTimeout: number | undefined;
const targetVolume = 0.36;

function showToast(message: string) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('toast--visible');
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toast.classList.remove('toast--visible'), 3800);
}

function syncMusicButton() {
  if (!musicButton || !audio) return;
  const playing = !audio.paused && !audio.ended;
  musicButton.classList.toggle('music-control--playing', playing);
  musicButton.setAttribute('aria-pressed', String(playing));
  musicButton.setAttribute('aria-label', playing ? 'Pausar música' : 'Activar música');
  musicButton.title = playing ? 'Pausar música' : 'Activar música';
}

function cancelFade() {
  if (fadeFrame !== undefined) window.cancelAnimationFrame(fadeFrame);
  fadeFrame = undefined;
}

async function playMusic() {
  if (!audio) return;
  cancelFade();
  audio.volume = prefersReducedMotion ? targetVolume : 0;
  try {
    // Se invoca desde un gesto del usuario, de modo que el navegador permite reproducir.
    await audio.play();
    syncMusicButton();
    if (!prefersReducedMotion) {
      const start = performance.now();
      const duration = 1800;
      const fade = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        // Curva suave de entrada.
        audio.volume = Math.min(1, targetVolume * (t * t * (3 - 2 * t)));
        if (t < 1 && !audio.paused) fadeFrame = window.requestAnimationFrame(fade);
        else fadeFrame = undefined;
      };
      fadeFrame = window.requestAnimationFrame(fade);
    }
  } catch {
    syncMusicButton();
    showToast('Si deseas, puedes activar la música desde el botón inferior.');
  }
}

function pauseMusic() {
  if (!audio) return;
  cancelFade();
  audio.pause();
  syncMusicButton();
}

// La portada se oculta solamente cuando JavaScript está operativo.
if (gate && openButton) {
  document.body.classList.add('gate-active');
  openButton.addEventListener('click', () => {
    void playMusic();
    gate.classList.add('gate--leaving');
    document.body.classList.remove('gate-active');
    window.setTimeout(() => {
      gate.hidden = true;
      gate.setAttribute('aria-hidden', 'true');
      musicButton?.classList.add('music-control--visible');
    }, prefersReducedMotion ? 0 : 850);
  }, { once: true });
}

musicButton?.addEventListener('click', () => {
  if (!audio) return;
  if (audio.paused) void playMusic();
  else pauseMusic();
});
audio?.addEventListener('playing', syncMusicButton);
audio?.addEventListener('pause', syncMusicButton);
audio?.addEventListener('ended', syncMusicButton);
audio?.addEventListener('error', () => {
  syncMusicButton();
  showToast('No se pudo reproducir la música en este navegador.');
});

// El conteo utiliza la hora absoluta local de Michoacán (UTC−06:00).
// Nunca se calcula con la zona horaria del visitante.
const weddingTimestamp = Date.parse('2027-01-30T17:30:00-06:00');
const counterNodes = {
  days: document.getElementById('days'),
  hours: document.getElementById('hours'),
  minutes: document.getElementById('minutes'),
  seconds: document.getElementById('seconds'),
};
const countContainer = document.getElementById('countdown');
const countEnded = document.getElementById('countdownEnded');

function updateCountdown() {
  const diff = weddingTimestamp - Date.now();
  if (diff <= 0) {
    if (countContainer) countContainer.hidden = true;
    if (countEnded) {
      countEnded.hidden = false;
      // Una vez terminada la fecha, el texto evita afirmar que hoy es la boda.
      countEnded.textContent = new Date().getTime() < weddingTimestamp + 86400000
        ? '¡Llegó nuestro gran día!'
        : 'Gracias por haber sido parte de nuestra historia.';
    }
    return false;
  }
  const secondsTotal = Math.floor(diff / 1000);
  const values = {
    days: Math.floor(secondsTotal / 86400),
    hours: Math.floor((secondsTotal % 86400) / 3600),
    minutes: Math.floor((secondsTotal % 3600) / 60),
    seconds: secondsTotal % 60,
  };
  for (const [key, value] of Object.entries(values)) {
    const node = counterNodes[key as keyof typeof counterNodes];
    if (node) node.textContent = String(value).padStart(2, '0');
  }
  return true;
}

updateCountdown();
const countdownInterval = window.setInterval(() => {
  if (!updateCountdown()) window.clearInterval(countdownInterval);
}, 1000);

// Efectos de entrada progresivos, desactivados cuando el usuario prefiere menos movimiento.
const revealItems = document.querySelectorAll<HTMLElement>('[data-reveal]');
if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('has-motion');
  const observer = new IntersectionObserver((entries, currentObserver) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      currentObserver.unobserve(entry.target);
    }
  }, { threshold: 0.09, rootMargin: '0px 0px -25px 0px' });
  revealItems.forEach((item) => observer.observe(item));
}

// API nativa para compartir en móviles; copiar URL como respaldo.
shareButton?.addEventListener('click', async () => {
  const shareData = {
    title: 'Aranza & Bladimir · Nuestra boda',
    text: '¡Nos casamos! Te esperamos el sábado 30 de enero de 2027 en Jardín Los Olivos.',
    url: 'https://neotecmx.com/AyJ-Boda',
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') return;
    }
  }
  try {
    await navigator.clipboard.writeText(shareData.url);
    showToast('¡Enlace copiado! Ya puedes compartirlo.');
  } catch {
    showToast('Comparte este enlace: neotecmx.com/AyJ-Boda');
  }
});


// --- Mesa de regalos y RSVP ---
const copyClabeButton = document.getElementById('copyClabe') as HTMLButtonElement | null;

/** Copia desde HTTPS y ofrece respaldo para navegadores con permisos limitados. */
async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Continuamos con el método tradicional, útil en algunos navegadores integrados.
  }

  const helper = document.createElement('textarea');
  helper.value = value;
  helper.setAttribute('readonly', '');
  helper.style.position = 'fixed';
  helper.style.opacity = '0';
  helper.style.left = '-9999px';
  document.body.appendChild(helper);
  helper.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  } finally {
    helper.remove();
  }
  return copied;
}

copyClabeButton?.addEventListener('click', async () => {
  const clabe = copyClabeButton.dataset.clabe;
  if (!clabe) return;
  const copied = await copyToClipboard(clabe);
  showToast(copied ? 'CLABE de BBVA copiada correctamente.' : 'Selecciona la CLABE para copiarla manualmente.');
});

// Como no se proporcionó un contacto para RSVP, NO se simula un envío.
// Estos botones únicamente copian el mensaje, y así lo indican explícitamente.
const rsvpMessages: Record<string, string> = {
  yes: 'Hola, Aranza y Bladimir. ¡Confirmo con mucho gusto mi asistencia a su boda del 30 de enero de 2027! Mi nombre es: ',
  no: 'Hola, Aranza y Bladimir. Muchas gracias por invitarme. Lamentablemente no podré acompañarlos en su boda. Mi nombre es: ',
};

document.querySelectorAll<HTMLButtonElement>('[data-rsvp]').forEach((button) => {
  button.addEventListener('click', async () => {
    const message = rsvpMessages[button.dataset.rsvp ?? ''];
    if (!message) return;
    const copied = await copyToClipboard(message);
    showToast(copied
      ? 'Mensaje copiado. Envíalo a los novios y agrega tu nombre.'
      : 'No se pudo copiar el mensaje. Inténtalo de nuevo.');
  });
});
