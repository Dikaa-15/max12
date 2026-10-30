/**
 * Tiga Dunia Wajahmu - MAX 12
 * app.js - State Machine Alur & Navigasi Layar (Fase B / T1)
 */

// Mapping ID layar ke nomor langkah (1-4)
const SCREEN_STEP_MAP = {
  'screen-intro': 1,
  'screen-theme': 2,
  'screen-camera': 3,
  'screen-result': 4
};

// State sesi sederhana
const state = {
  currentScreen: 'screen-intro',
  selectedTheme: 'imajinasi'
};

// DOM Elements
const screens = document.querySelectorAll('.screen');
const stepDots = document.querySelectorAll('.step-dot');
const themeCards = document.querySelectorAll('.theme-card');
const themePreviewTitle = document.getElementById('theme-preview-title');
const resultThemeLabel = document.getElementById('result-theme-label');

// Tombol navigasi
const btnStart = document.getElementById('btn-start');
const btnThemeNext = document.getElementById('btn-theme-next');
const btnThemeBack = document.getElementById('btn-theme-back');
const btnCameraCapture = document.getElementById('btn-camera-capture');
const btnCameraBack = document.getElementById('btn-camera-back');
const btnRetake = document.getElementById('btn-retake');
const btnChangeTheme = document.getElementById('btn-change-theme');
const btnDownload = document.getElementById('btn-download');

/**
 * Berpindah ke layar target dan memperbarui indikator langkah
 * @param {string} screenId
 */
export function goToScreen(screenId) {
  const targetScreen = document.getElementById(screenId);
  if (!targetScreen) return;

  // Nonaktifkan semua layar
  screens.forEach((screen) => {
    screen.classList.remove('active');
  });

  // Aktifkan layar tujuan
  targetScreen.classList.add('active');
  state.currentScreen = screenId;

  // Perbarui indikator langkah
  const stepNumber = SCREEN_STEP_MAP[screenId] || 1;
  stepDots.forEach((dot) => {
    const dotStep = parseInt(dot.getAttribute('data-step'), 10);
    if (dotStep === stepNumber) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });

  // Sinkronisasi teks tema di layar hasil
  if (resultThemeLabel) {
    resultThemeLabel.textContent = capitalizeFirstLetter(state.selectedTheme);
  }
}

/**
 * Mengubah tema terpilih
 * @param {string} themeName
 */
function selectTheme(themeName) {
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
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Event Listeners Navigasi
if (btnStart) {
  btnStart.addEventListener('click', () => goToScreen('screen-theme'));
}

if (btnThemeNext) {
  btnThemeNext.addEventListener('click', () => goToScreen('screen-camera'));
}

if (btnThemeBack) {
  btnThemeBack.addEventListener('click', () => goToScreen('screen-intro'));
}

if (btnCameraCapture) {
  btnCameraCapture.addEventListener('click', () => goToScreen('screen-result'));
}

if (btnCameraBack) {
  btnCameraBack.addEventListener('click', () => goToScreen('screen-theme'));
}

if (btnRetake) {
  btnRetake.addEventListener('click', () => goToScreen('screen-camera'));
}

if (btnChangeTheme) {
  btnChangeTheme.addEventListener('click', () => goToScreen('screen-theme'));
}

if (btnDownload) {
  btnDownload.addEventListener('click', () => {
    alert(`Unduh poster "${state.selectedTheme}" (fitur penuh pada T6)`);
  });
}

// Klik pada kartu tema
themeCards.forEach((card) => {
  card.addEventListener('click', () => {
    const theme = card.getAttribute('data-theme');
    if (theme) selectTheme(theme);
  });

  // Aksesibilitas keyboard Enter / Spasi
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const theme = card.getAttribute('data-theme');
      if (theme) selectTheme(theme);
    }
  });
});

// Klik langsung pada indikator langkah (untuk kemudahan pengujian T1)
stepDots.forEach((dot) => {
  dot.style.cursor = 'pointer';
  dot.addEventListener('click', () => {
    const step = parseInt(dot.getAttribute('data-step'), 10);
    const screenEntries = Object.entries(SCREEN_STEP_MAP);
    const target = screenEntries.find(([_, val]) => val === step);
    if (target) goToScreen(target[0]);
  });
});
