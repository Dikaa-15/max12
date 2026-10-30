/**
 * Tiga Dunia Wajahmu - MAX 12
 * app.js - State Machine Alur, Kontrol Keyboard, dan Kamera (Fase B / T3)
 */

// 1. Definisi 7 State Resmi (TASKS.md T2 & T3)
export const STATES = {
  INTRO: 'intro',
  TEMA: 'tema',
  KAMERA: 'kamera',
  HITUNG_MUNDUR: 'hitungMundur',
  SIAP_GENERATE: 'siapGenerate',
  MEMPROSES: 'memproses',
  HASIL: 'hasil'
};

// Urutan tema yang tersedia
const AVAILABLE_THEMES = ['imajinasi', 'realitas', 'surealis'];

// Mapping State ke Screen ID dan Nomor Langkah (1-4)
const STATE_VIEW_MAP = {
  [STATES.INTRO]:         { screenId: 'screen-intro', step: 1 },
  [STATES.TEMA]:          { screenId: 'screen-theme', step: 2 },
  [STATES.KAMERA]:        { screenId: 'screen-camera', step: 3, subpanelId: 'subpanel-camera' },
  [STATES.HITUNG_MUNDUR]: { screenId: 'screen-camera', step: 3, subpanelId: 'subpanel-camera' },
  [STATES.SIAP_GENERATE]: { screenId: 'screen-camera', step: 3, subpanelId: 'subpanel-confirm' },
  [STATES.MEMPROSES]:     { screenId: 'screen-camera', step: 3, subpanelId: 'subpanel-processing' },
  [STATES.HASIL]:         { screenId: 'screen-result', step: 4 }
};

// State Aplikasi
export const state = {
  status: STATES.INTRO,
  selectedTheme: 'imajinasi',
  countdownIntervalId: null,
  processingTimeoutId: null,
  cameraStream: null,
  cameraError: null,
  uploadedImage: null
};

// DOM Elements: Layar & Navigasi
const screens = document.querySelectorAll('.screen');
const stepDots = document.querySelectorAll('.step-dot');
const themeCards = document.querySelectorAll('.theme-card');
const themePreviewTitle = document.getElementById('theme-preview-title');
const resultThemeLabel = document.getElementById('result-theme-label');
const cameraSubpanels = document.querySelectorAll('.camera-subpanel');

// DOM Elements: Kamera & Error Fallback (T3)
const cameraVideo = document.getElementById('camera-video');
const cameraErrorOverlay = document.getElementById('camera-error-overlay');
const cameraErrorMessage = document.getElementById('camera-error-message');
const btnCameraRetry = document.getElementById('btn-camera-retry');
const btnUploadFallback = document.getElementById('btn-upload-fallback');
const cameraFileInput = document.getElementById('camera-file-input');

// DOM Elements: Overlays (Countdown & Ripple)
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');
const rippleOverlay = document.getElementById('ripple-overlay');

// DOM Elements: Tombol-tombol Aksi
const btnStart = document.getElementById('btn-start');
const btnThemeNext = document.getElementById('btn-theme-next');
const btnThemeBack = document.getElementById('btn-theme-back');
const btnCameraCapture = document.getElementById('btn-camera-capture');
const btnCameraBack = document.getElementById('btn-camera-back');
const btnConfirmGenerate = document.getElementById('btn-confirm-generate');
const btnConfirmRetake = document.getElementById('btn-confirm-retake');
const btnDownload = document.getElementById('btn-download');
const btnRetake = document.getElementById('btn-retake');
const btnChangeTheme = document.getElementById('btn-change-theme');

/**
 * Menghentikan semua timer aktif (countdown dan proses generate)
 */
function clearActiveTimers() {
  if (state.countdownIntervalId) {
    clearInterval(state.countdownIntervalId);
    state.countdownIntervalId = null;
  }
  if (state.processingTimeoutId) {
    clearTimeout(state.processingTimeoutId);
    state.processingTimeoutId = null;
  }
  if (countdownOverlay) countdownOverlay.classList.remove('active');
  if (rippleOverlay) rippleOverlay.classList.remove('active');
}

/**
 * Menyalakan Kamera via getUserMedia (AGENTS.md Aturan 1 & PRD F1)
 */
export async function startCamera() {
  hideCameraError();

  // Matikan stream sebelumnya bila masih berjalan
  stopCamera();

  // Constraints resolusi ideal 1280x960, facingMode 'user'
  const constraints = {
    audio: false,
    video: {
      facingMode: 'user',
      width: { ideal: 1280 },
      height: { ideal: 960 }
    }
  };

  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Kamera tidak didukung di browser ini atau halaman tidak dibuka lewat HTTPS.');
    }

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      // Fallback constraint jika overconstrained
      if (err.name === 'OverconstrainedError') {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: 'user' }
        });
      } else {
        throw err;
      }
    }

    state.cameraStream = stream;
    if (cameraVideo) {
      cameraVideo.srcObject = stream;
      await cameraVideo.play().catch(() => {});
    }

    // Aktifkan tombol capture bila kamera siap
    if (btnCameraCapture) btnCameraCapture.disabled = false;
  } catch (err) {
    console.warn('Gagal membuka kamera:', err);
    state.cameraError = err;
    handleCameraError(err);
  }
}

/**
 * Menghentikan track kamera dan membersihkan video element (AGENTS.md Aturan 2)
 */
export function stopCamera() {
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach((track) => track.stop());
    state.cameraStream = null;
  }
  if (cameraVideo) {
    cameraVideo.srcObject = null;
  }
}

/**
 * Menampilkan pesan error kamera dengan panduan jelas dalam Bahasa Indonesia (PRD F9 & DESIGN.md Sec. 5)
 * @param {Error} error
 */
function handleCameraError(error) {
  let message = 'Kamera tidak bisa dibuka. Izinkan akses kamera lewat ikon gembok di address bar, lalu coba lagi. Atau pilih foto dari perangkat.';

  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    message = 'Akses kamera ditolak. Silakan klik ikon gembok atau setelan di address bar browser Anda, ubah izin kamera menjadi "Izinkan", lalu klik "Coba Lagi". Anda juga bisa memilih foto langsung dari perangkat.';
  } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    message = 'Kamera tidak ditemukan di perangkat Anda. Pastikan kamera terpasang dengan baik atau pilih foto dari perangkat.';
  } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    message = 'Kamera sedang digunakan oleh aplikasi lain (seperti Zoom, Google Meet, atau tab lain). Tutup aplikasi tersebut, lalu klik "Coba Lagi".';
  } else if (error.message && error.message.includes('HTTPS')) {
    message = error.message;
  }

  if (cameraErrorMessage) {
    cameraErrorMessage.textContent = message;
  }
  if (cameraErrorOverlay) {
    cameraErrorOverlay.classList.add('active');
  }
  if (btnCameraCapture) {
    btnCameraCapture.disabled = true;
  }
}

function hideCameraError() {
  if (cameraErrorOverlay) {
    cameraErrorOverlay.classList.remove('active');
  }
  if (btnCameraCapture) {
    btnCameraCapture.disabled = false;
  }
}

/**
 * Transisi State Machine
 * Mengatur tampilan layar, subpanel, overlay, dan aksesibilitas
 * @param {string} nextState
 */
export function transitionTo(nextState) {
  if (!Object.values(STATES).includes(nextState)) {
    console.error(`Invalid state transition: ${nextState}`);
    return;
  }

  // Bersihkan timer jika meninggalkan countdown/processing
  if (state.status === STATES.HITUNG_MUNDUR || state.status === STATES.MEMPROSES) {
    clearActiveTimers();
  }

  // Manajemen lifecycle kamera: matikan jika meninggalkan alur kamera
  if ([STATES.INTRO, STATES.TEMA, STATES.HASIL].includes(nextState)) {
    stopCamera();
    hideCameraError();
  }

  state.status = nextState;

  const viewConfig = STATE_VIEW_MAP[nextState];
  if (!viewConfig) return;

  // 1. Tampilkan layar yang sesuai
  screens.forEach((screen) => {
    if (screen.id === viewConfig.screenId) {
      screen.classList.add('active');
    } else {
      screen.classList.remove('active');
    }
  });

  // 2. Perbarui indikator langkah di header
  stepDots.forEach((dot) => {
    const dotStep = parseInt(dot.getAttribute('data-step'), 10);
    if (dotStep === viewConfig.step) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  // 3. Atur subpanel di Layar Kamera (kamera / siapGenerate / memproses)
  if (viewConfig.subpanelId) {
    cameraSubpanels.forEach((subpanel) => {
      if (subpanel.id === viewConfig.subpanelId) {
        subpanel.classList.add('active');
      } else {
        subpanel.classList.remove('active');
      }
    });
  }

  // 4. Sinkronisasi tampilan teks tema
  if (resultThemeLabel) {
    resultThemeLabel.textContent = capitalizeFirstLetter(state.selectedTheme);
  }

  // 5. Perilaku khusus tiap state
  switch (nextState) {
    case STATES.INTRO:
      break;

    case STATES.KAMERA:
      // Nyalakan kamera saat masuk ke layar kamera
      startCamera();
      if (btnCameraCapture) btnCameraCapture.disabled = false;
      if (btnCameraBack) btnCameraBack.disabled = false;
      break;

    case STATES.HITUNG_MUNDUR:
      startCountdown();
      break;

    case STATES.SIAP_GENERATE:
      // Di T4, di sini kita freeze frame atau tampilkan hasil jepretan
      if (btnConfirmGenerate) btnConfirmGenerate.disabled = false;
      if (btnConfirmRetake) btnConfirmRetake.disabled = false;
      break;

    case STATES.MEMPROSES:
      startProcessing();
      break;

    case STATES.HASIL:
      stopCamera();
      if (btnDownload) btnDownload.disabled = false;
      if (btnRetake) btnRetake.disabled = false;
      if (btnChangeTheme) btnChangeTheme.disabled = false;
      break;
  }
}

/**
 * Menjalankan animasi hitung mundur 3-2-1
 */
function startCountdown() {
  if (btnCameraCapture) btnCameraCapture.disabled = true;
  if (btnCameraBack) btnCameraBack.disabled = true;

  let count = 3;
  if (countdownNumber) countdownNumber.textContent = count;
  if (countdownOverlay) countdownOverlay.classList.add('active');

  state.countdownIntervalId = setInterval(() => {
    count -= 1;
    if (count > 0) {
      if (countdownNumber) countdownNumber.textContent = count;
    } else {
      clearActiveTimers();
      // Hitung mundur selesai -> transisi ke konfirmasi siapGenerate (di T4 kamera dimatikan di sini)
      transitionTo(STATES.SIAP_GENERATE);
    }
  }, 1000);
}

/**
 * Menjalankan proses generate dengan animasi riak air 1.5 detik
 */
function startProcessing() {
  if (rippleOverlay) rippleOverlay.classList.add('active');

  state.processingTimeoutId = setTimeout(() => {
    clearActiveTimers();
    transitionTo(STATES.HASIL);
  }, 1500);
}

/**
 * Mengubah tema terpilih
 * @param {string} themeName
 */
export function selectTheme(themeName) {
  if (!AVAILABLE_THEMES.includes(themeName)) return;
  state.selectedTheme = themeName;

  themeCards.forEach((card) => {
    const isSelected = card.getAttribute('data-theme') === themeName;
    if (isSelected) {
      card.classList.add('selected');
      card.setAttribute('aria-checked', 'true');
    } else {
      card.classList.remove('selected');
      card.setAttribute('aria-checked', 'false');
    }
  });

  if (themePreviewTitle) {
    themePreviewTitle.textContent = capitalizeFirstLetter(themeName);
  }
  if (resultThemeLabel) {
    resultThemeLabel.textContent = capitalizeFirstLetter(themeName);
  }
}

function cycleTheme(direction) {
  const currentIndex = AVAILABLE_THEMES.indexOf(state.selectedTheme);
  let nextIndex = currentIndex + direction;
  if (nextIndex < 0) nextIndex = AVAILABLE_THEMES.length - 1;
  if (nextIndex >= AVAILABLE_THEMES.length) nextIndex = 0;
  selectTheme(AVAILABLE_THEMES[nextIndex]);
}

function capitalizeFirstLetter(string) {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// ==========================================================================
// Event Listeners: Mouse / Touch
// ==========================================================================

// Layar 1: Intro
if (btnStart) {
  btnStart.addEventListener('click', () => transitionTo(STATES.TEMA));
}

// Layar 2: Tema
if (btnThemeNext) {
  btnThemeNext.addEventListener('click', () => transitionTo(STATES.KAMERA));
}
if (btnThemeBack) {
  btnThemeBack.addEventListener('click', () => transitionTo(STATES.INTRO));
}

themeCards.forEach((card) => {
  card.addEventListener('click', () => {
    const theme = card.getAttribute('data-theme');
    if (theme) selectTheme(theme);
  });
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const theme = card.getAttribute('data-theme');
      if (theme) selectTheme(theme);
    }
  });
});

// Layar 3: Kamera
if (btnCameraCapture) {
  btnCameraCapture.addEventListener('click', () => transitionTo(STATES.HITUNG_MUNDUR));
}
if (btnCameraBack) {
  btnCameraBack.addEventListener('click', () => transitionTo(STATES.TEMA));
}

// Error & Fallback Tombol (T3 / F9)
if (btnCameraRetry) {
  btnCameraRetry.addEventListener('click', () => startCamera());
}
if (btnUploadFallback && cameraFileInput) {
  btnUploadFallback.addEventListener('click', () => cameraFileInput.click());
}

if (cameraFileInput) {
  cameraFileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        state.uploadedImage = img;
        hideCameraError();
        // Langsung lanjut ke konfirmasi foto
        transitionTo(STATES.SIAP_GENERATE);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// Layar 3 (Sub: Siap Generate)
if (btnConfirmGenerate) {
  btnConfirmGenerate.addEventListener('click', () => transitionTo(STATES.MEMPROSES));
}
if (btnConfirmRetake) {
  btnConfirmRetake.addEventListener('click', () => transitionTo(STATES.KAMERA));
}

// Layar 4: Hasil
if (btnDownload) {
  btnDownload.addEventListener('click', () => {
    alert(`Unduh poster "${state.selectedTheme}" (fitur implementasi penuh pada T6)`);
  });
}
if (btnRetake) {
  btnRetake.addEventListener('click', () => transitionTo(STATES.KAMERA));
}
if (btnChangeTheme) {
  btnChangeTheme.addEventListener('click', () => transitionTo(STATES.TEMA));
}

// Klik pada Step Dots
stepDots.forEach((dot) => {
  dot.style.cursor = 'pointer';
  dot.addEventListener('click', () => {
    const step = parseInt(dot.getAttribute('data-step'), 10);
    switch (step) {
      case 1: transitionTo(STATES.INTRO); break;
      case 2: transitionTo(STATES.TEMA); break;
      case 3: transitionTo(STATES.KAMERA); break;
      case 4: transitionTo(STATES.HASIL); break;
    }
  });
});

// ==========================================================================
// Kontrol Keyboard (PRD F6 & AGENTS.md Aturan 7)
// ==========================================================================
window.addEventListener('keydown', (e) => {
  // 1. Tombol ESC: Selalu reset ke Intro dari mana saja
  if (e.key === 'Escape') {
    e.preventDefault();
    clearActiveTimers();
    stopCamera();
    transitionTo(STATES.INTRO);
    return;
  }

  // 2. Tombol SPASI: Aksi utama layar aktif
  if (e.key === ' ' || e.code === 'Space') {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

    e.preventDefault();

    switch (state.status) {
      case STATES.INTRO:
        transitionTo(STATES.TEMA);
        break;

      case STATES.TEMA:
        transitionTo(STATES.KAMERA);
        break;

      case STATES.KAMERA:
        // Hanya bisa ambil foto bila kamera aktif / tidak ada error
        if (btnCameraCapture && !btnCameraCapture.disabled) {
          transitionTo(STATES.HITUNG_MUNDUR);
        }
        break;

      case STATES.SIAP_GENERATE:
        transitionTo(STATES.MEMPROSES);
        break;

      case STATES.HASIL:
        if (btnDownload && !btnDownload.disabled) {
          btnDownload.click();
        }
        break;

      case STATES.HITUNG_MUNDUR:
      case STATES.MEMPROSES:
        break;
    }
    return;
  }

  // 3. Tombol Panah pada Layar Tema
  if (state.status === STATES.TEMA) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      cycleTheme(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      cycleTheme(-1);
    }
  }
});
