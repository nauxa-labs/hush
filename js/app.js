/**
 * Warkop Fokus - Main Application
 * Initializes all components and handles global functionality
 */

// Motivational quotes
const quotes = [
  "Fokus adalah kunci kesuksesan.",
  "Satu langkah kecil setiap hari membawa perubahan besar.",
  "Kesempatan tidak datang dua kali, manfaatkan sekarang.",
  "Produktivitas bukan tentang sibuk, tapi efektif.",
  "Istirahat yang cukup adalah bagian dari produktivitas.",
  "Kamu lebih kuat dari yang kamu kira.",
  "Mulai dari yang kecil, konsisten, dan lihat hasilnya.",
  "Hari ini adalah hari terbaik untuk memulai.",
  "Jangan tunggu mood, ciptakan momentum.",
  "Setiap sesi fokus membawamu lebih dekat ke tujuan.",
  "Kopi dan fokus, kombinasi sempurna! ☕",
  "Gagal itu biasa, menyerah itu pilihan.",
  "Kamu sedang membangun kebiasaan yang hebat!",
  "Break time! Tarik napas, regangkan badan.",
  "Tetap semangat, kamu sudah melakukannya dengan baik!"
];

// App state
const app = {
  deferredPrompt: null,
  isInstalled: false,
  currentSettings: null
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  console.log('☕ Warkop Fokus initialized');

  // Load settings first
  app.currentSettings = Storage.getSettings();

  // Initialize all components
  statsTracker = new StatsTracker();
  taskManager = new TaskManager();
  achievementManager = new AchievementManager();
  audioController = new AudioController();
  pomodoroTimer = new PomodoroTimer();

  // Setup UI
  setupTabs();
  setupSettingsModal();
  setupPWA();

  // Add fade-in animation
  document.querySelector('.main').classList.add('fade-in');

  // Check if app is already installed
  checkInstallState();
}

// Tab switching
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.dataset.tab;

      // Update buttons
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `tab-${targetTab}`) {
          content.classList.add('active');
        }
      });
    });
  });
}

// Settings modal
function setupSettingsModal() {
  const settingsBtn = document.getElementById('settingsBtn');
  const focusSlider = document.getElementById('focusTimeSlider');
  const breakSlider = document.getElementById('breakTimeSlider');
  const goalSlider = document.getElementById('dailyGoalSlider');

  if (settingsBtn) {
    settingsBtn.addEventListener('click', openSettingsModal);
  }

  // Update value displays when sliders change
  if (focusSlider) {
    focusSlider.value = app.currentSettings.focusTime;
    document.getElementById('focusTimeValue').textContent = `${app.currentSettings.focusTime} menit`;
    focusSlider.addEventListener('input', (e) => {
      document.getElementById('focusTimeValue').textContent = `${e.target.value} menit`;
    });
  }

  if (breakSlider) {
    breakSlider.value = app.currentSettings.breakTime;
    document.getElementById('breakTimeValue').textContent = `${app.currentSettings.breakTime} menit`;
    breakSlider.addEventListener('input', (e) => {
      document.getElementById('breakTimeValue').textContent = `${e.target.value} menit`;
    });
  }

  if (goalSlider) {
    const goal = Storage.getDailyGoal();
    goalSlider.value = goal.targetMinutes;
    document.getElementById('dailyGoalValue').textContent = `${goal.targetMinutes} menit`;
    goalSlider.addEventListener('input', (e) => {
      document.getElementById('dailyGoalValue').textContent = `${e.target.value} menit`;
    });
  }
}

function openSettingsModal() {
  document.getElementById('settingsModal').classList.add('show');
}

function closeSettingsModal() {
  document.getElementById('settingsModal').classList.remove('show');
}

function saveSettings() {
  const focusTime = parseInt(document.getElementById('focusTimeSlider').value);
  const breakTime = parseInt(document.getElementById('breakTimeSlider').value);
  const dailyGoal = parseInt(document.getElementById('dailyGoalSlider').value);

  // Save settings
  app.currentSettings = {
    ...app.currentSettings,
    focusTime,
    breakTime
  };
  Storage.saveSettings(app.currentSettings);

  // Update daily goal
  statsTracker.setGoalTarget(dailyGoal);

  // Update timer if not running
  if (pomodoroTimer && !pomodoroTimer.isRunning) {
    pomodoroTimer.updateSettings(focusTime, breakTime);
  }

  closeSettingsModal();
  showToast('✅ Pengaturan disimpan!');
}

function applyPreset(preset) {
  const focusSlider = document.getElementById('focusTimeSlider');
  const breakSlider = document.getElementById('breakTimeSlider');

  const presets = {
    pomodoro: { focus: 25, break: 5 },
    short: { focus: 15, break: 3 },
    long: { focus: 45, break: 10 }
  };

  if (presets[preset]) {
    focusSlider.value = presets[preset].focus;
    breakSlider.value = presets[preset].break;
    document.getElementById('focusTimeValue').textContent = `${presets[preset].focus} menit`;
    document.getElementById('breakTimeValue').textContent = `${presets[preset].break} menit`;
  }
}

function resetAllData() {
  if (confirm('Yakin ingin reset semua data? Statistik, tasks, dan achievements akan dihapus.')) {
    Storage.clearAll();
    location.reload();
  }
}

// Quote functions
function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function showQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  const quoteText = document.getElementById('quoteText');

  if (quoteDisplay && quoteText) {
    quoteText.textContent = `"${getRandomQuote()}"`;
    quoteDisplay.style.display = 'block';
  }
}

function hideQuote() {
  const quoteDisplay = document.getElementById('quoteDisplay');
  if (quoteDisplay) {
    quoteDisplay.style.display = 'none';
  }
}

// Called when a focus session completes
function onSessionComplete(minutes) {
  // Record stats
  const stats = statsTracker.recordSession(minutes);

  // Check for new achievements
  const newAchievements = achievementManager.checkAchievements(stats);

  // Show quote during break
  showQuote();

  return newAchievements;
}

// PWA Setup
function setupPWA() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('✅ Service Worker registered:', registration.scope);
        })
        .catch(error => {
          console.log('❌ Service Worker registration failed:', error);
        });
    });
  }

  // Handle install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    app.deferredPrompt = e;
    showInstallButton();
  });

  // Handle successful installation
  window.addEventListener('appinstalled', () => {
    console.log('✅ App installed successfully');
    app.isInstalled = true;
    hideInstallButton();
    showToast('🎉 Warkop Fokus sudah terinstall!');
  });
}

function checkInstallState() {
  if (window.matchMedia('(display-mode: standalone)').matches) {
    app.isInstalled = true;
    hideInstallButton();
  }
}

function showInstallButton() {
  const btn = document.getElementById('installBtn');
  if (btn && !app.isInstalled) {
    btn.style.display = 'flex';
    btn.addEventListener('click', installApp);
  }
}

function hideInstallButton() {
  const btn = document.getElementById('installBtn');
  if (btn) {
    btn.style.display = 'none';
  }
}

async function installApp() {
  if (!app.deferredPrompt) return;

  app.deferredPrompt.prompt();
  const { outcome } = await app.deferredPrompt.userChoice;
  console.log('Install prompt outcome:', outcome);
  app.deferredPrompt = null;
}

// Toast notification
function showToast(message, duration = 3000) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Space bar to toggle timer
  if (e.code === 'Space' && e.target === document.body) {
    e.preventDefault();
    pomodoroTimer.toggleTimer();
  }

  // R to reset timer
  if (e.code === 'KeyR' && e.target === document.body) {
    e.preventDefault();
    pomodoroTimer.reset();
  }

  // S to skip
  if (e.code === 'KeyS' && e.target === document.body) {
    e.preventDefault();
    pomodoroTimer.skip();
  }

  // Escape to close modal
  if (e.code === 'Escape') {
    closeSettingsModal();
  }
});

// Warn before closing if timer is running
window.addEventListener('beforeunload', (e) => {
  if (pomodoroTimer && pomodoroTimer.isRunning) {
    e.preventDefault();
    e.returnValue = '';
    return '';
  }
});
