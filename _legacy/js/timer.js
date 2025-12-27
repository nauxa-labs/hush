/**
 * Warkop Fokus - Pomodoro Timer
 * 25 minutes focus, 5 minutes break
 */

class PomodoroTimer {
  constructor() {
    // Load settings from storage
    const settings = Storage.getSettings();

    // Timer settings (in seconds)
    this.FOCUS_TIME = settings.focusTime * 60;
    this.BREAK_TIME = settings.breakTime * 60;
    this.LONG_BREAK_TIME = settings.longBreakTime * 60;

    // State
    this.timeRemaining = this.FOCUS_TIME;
    this.totalTime = this.FOCUS_TIME;
    this.isRunning = false;
    this.isBreak = false;
    this.sessionCount = 1;
    this.intervalId = null;
    this.focusMinutes = settings.focusTime; // Track for stats

    // DOM Elements
    this.timerDisplay = document.getElementById('timerDisplay');
    this.timerLabel = document.getElementById('timerLabel');
    this.timerProgress = document.getElementById('timerProgress');
    this.timerRing = document.querySelector('.timer-ring');
    this.startBtn = document.getElementById('startBtn');
    this.startBtnText = document.getElementById('startBtnText');
    this.resetBtn = document.getElementById('resetBtn');
    this.skipBtn = document.getElementById('skipBtn');
    this.sessionCountEl = document.getElementById('sessionCount');
    this.iconPlay = document.querySelector('.icon-play');
    this.iconPause = document.querySelector('.icon-pause');

    // Circle circumference for progress
    this.circumference = 2 * Math.PI * 90; // radius = 90

    this.init();
  }

  init() {
    // Add SVG gradient definition
    this.addGradientDef();

    // Set initial progress
    this.updateProgress();
    this.updateDisplay();

    // Event listeners
    this.startBtn.addEventListener('click', () => this.toggleTimer());
    this.resetBtn.addEventListener('click', () => this.reset());
    this.skipBtn.addEventListener('click', () => this.skip());

    // Request notification permission
    this.requestNotificationPermission();
  }

  addGradientDef() {
    const svg = document.querySelector('.timer-svg');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#D4A574"/>
        <stop offset="100%" style="stop-color:#E8A849"/>
      </linearGradient>
      <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#4CAF50"/>
        <stop offset="100%" style="stop-color:#8BC34A"/>
      </linearGradient>
    `;
    svg.insertBefore(defs, svg.firstChild);
    this.timerProgress.style.stroke = 'url(#timerGradient)';
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  start() {
    this.isRunning = true;
    this.timerRing.classList.add('running');
    this.updateButtonState();

    this.intervalId = setInterval(() => {
      this.timeRemaining--;
      this.updateDisplay();
      this.updateProgress();

      if (this.timeRemaining <= 0) {
        this.complete();
      }
    }, 1000);
  }

  pause() {
    this.isRunning = false;
    this.timerRing.classList.remove('running');
    this.updateButtonState();

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.pause();
    this.timeRemaining = this.isBreak ? this.getBreakTime() : this.FOCUS_TIME;
    this.totalTime = this.timeRemaining;
    this.updateDisplay();
    this.updateProgress();
  }

  skip() {
    this.pause();
    this.complete();
  }

  complete() {
    this.pause();
    this.playNotification();
    this.showNotification();

    // Toggle between focus and break
    if (this.isBreak) {
      // Coming out of break, increment session
      this.sessionCount++;
      if (this.sessionCount > 4) {
        this.sessionCount = 1;
      }
      this.switchToFocus();
      // Hide quote when starting focus
      if (typeof hideQuote === 'function') hideQuote();
    } else {
      // Record completed focus session to stats
      if (typeof onSessionComplete === 'function') {
        onSessionComplete(this.focusMinutes);
      }
      this.switchToBreak();
    }
  }

  /**
   * Update timer settings (called from settings modal)
   */
  updateSettings(focusMinutes, breakMinutes) {
    this.focusMinutes = focusMinutes;
    this.FOCUS_TIME = focusMinutes * 60;
    this.BREAK_TIME = breakMinutes * 60;

    // Update display if not running
    if (!this.isRunning && !this.isBreak) {
      this.timeRemaining = this.FOCUS_TIME;
      this.totalTime = this.FOCUS_TIME;
      this.updateDisplay();
      this.updateProgress();
    }
  }

  switchToFocus() {
    this.isBreak = false;
    this.timeRemaining = this.FOCUS_TIME;
    this.totalTime = this.FOCUS_TIME;
    this.timerLabel.textContent = 'Fokus';
    this.timerRing.classList.remove('break');
    this.timerProgress.style.stroke = 'url(#timerGradient)';
    this.sessionCountEl.textContent = this.sessionCount;
    this.updateDisplay();
    this.updateProgress();
  }

  switchToBreak() {
    this.isBreak = true;
    const breakTime = this.getBreakTime();
    this.timeRemaining = breakTime;
    this.totalTime = breakTime;
    this.timerLabel.textContent = this.sessionCount === 4 ? 'Istirahat Panjang' : 'Istirahat';
    this.timerRing.classList.add('break');
    this.timerProgress.style.stroke = 'url(#breakGradient)';
    this.updateDisplay();
    this.updateProgress();
  }

  getBreakTime() {
    return this.sessionCount === 4 ? this.LONG_BREAK_TIME : this.BREAK_TIME;
  }

  updateDisplay() {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    this.timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  updateProgress() {
    const progress = this.timeRemaining / this.totalTime;
    const offset = this.circumference * (1 - progress);
    this.timerProgress.style.strokeDasharray = this.circumference;
    this.timerProgress.style.strokeDashoffset = offset;
  }

  updateButtonState() {
    if (this.isRunning) {
      this.startBtnText.textContent = 'Pause';
      if (this.iconPlay) this.iconPlay.style.display = 'none';
      if (this.iconPause) this.iconPause.style.display = 'block';
    } else {
      this.startBtnText.textContent = 'Start';
      if (this.iconPlay) this.iconPlay.style.display = 'block';
      if (this.iconPause) this.iconPause.style.display = 'none';
    }
  }

  playNotification() {
    // Use Web Audio API to generate a pleasant notification sound
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Create a pleasant two-tone chime
      const playTone = (freq, startTime, duration) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.type = 'sine';
        oscillator.frequency.value = freq;

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = audioContext.currentTime;
      playTone(523.25, now, 0.3);       // C5
      playTone(659.25, now + 0.15, 0.3); // E5
      playTone(783.99, now + 0.3, 0.4);  // G5
    } catch (err) {
      console.log('Could not play notification sound:', err);
    }
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  showNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = this.isBreak ? '☕ Waktu Fokus!' : '🎉 Waktu Istirahat!';
      const body = this.isBreak
        ? 'Istirahat selesai. Ayo kembali fokus!'
        : `Sesi fokus ke-${this.sessionCount} selesai. Waktunya istirahat!`;

      new Notification(title, {
        body: body,
        icon: 'assets/icons/icon-192.png',
        badge: 'assets/icons/icon-72.png',
        tag: 'warkop-fokus-timer'
      });
    }
  }
}

// Initialize timer
let pomodoroTimer;
