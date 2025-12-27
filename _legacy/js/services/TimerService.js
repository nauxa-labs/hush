// File: js/services/TimerService.js
import { Store } from '../store/Store.js';

export class TimerService extends Store {
  constructor(settingsStore, statsStore) {
    super('hush_timer_service_v2'); // We don't really persist much here, mostly state
    this.settings = settingsStore;
    this.stats = statsStore;

    // Initial State (Transient)
    this.data = {
      isRunning: false,
      mode: 'focus', // 'focus' | 'shortBreak' | 'longBreak'
      timeRemaining: this.settings.get('timer.focusDuration') * 60,
      totalDuration: this.settings.get('timer.focusDuration') * 60,
      sessionsCompleted: 0,
      activeCardId: null
    };

    this.intervalId = null;

    // Listen for setting changes
    this.settings.on('change', () => this._syncSettings());
  }

  start() {
    if (this.data.isRunning) return;

    this.data.isRunning = true;
    this._commit();
    this.emit('timer:start');

    this.intervalId = setInterval(() => {
      this._tick();
    }, 1000);
  }

  pause() {
    if (!this.data.isRunning) return;

    this.data.isRunning = false;
    clearInterval(this.intervalId);
    this._commit();
    this.emit('timer:pause');
  }

  reset() {
    this.pause();
    this._setDurationForMode(this.data.mode);
    this.emit('timer:reset');
  }

  complete() {
    this.pause();
    this.data.isRunning = false;
    this.data.timeRemaining = 0;

    // Play sound
    if (this.settings.get('timer.completionSound')) {
      this._playSound('complete');
    }

    // Record stats if Focus mode
    if (this.data.mode === 'focus') {
      const minutes = this.data.totalDuration / 60;
      // Logic: if we completed early (via skip), do we credit full duration?
      // Spec says "timeRemaining reaches 0". So if skip, maybe minimal credit or full?
      // Let's assume complete() is manual skip or natural finish.
      // For accurate stats, maybe only credit elapsed time?
      // Spec says "minutes" in recordSession arguments. 
      // Let's credit full duration for now as "session completed".

      this.stats.recordSession(
        this.data.activeCardId ? 'current' : 'default', // Workspace ID is needed? 
        // Ideally we need workspaceID. But TimerService doesn't know workspace easily unless passed.
        // Let's assume statsStore handles default workspace or we pass raw ID.
        // We'll pass 'activeCardId' as context if possible or just use a placeholder
        minutes
      );

      this.data.sessionsCompleted++;
    }

    // Switch Mode
    this._switchMode();
    this.emit('timer:complete');
  }

  setActiveCard(cardId) {
    this.data.activeCardId = cardId;
    this._commit();
  }

  adjustTime(deltaSeconds) {
    // Only if paused (or maybe allowed while running?)
    const newTime = Math.max(60, this.data.timeRemaining + deltaSeconds);
    this.data.timeRemaining = newTime;
    // Don't change totalDuration unless we are explicitly editing duration setting
    // But here "Quick Adjust" conceptually extends the current session.
    this.data.totalDuration = Math.max(this.data.totalDuration, newTime);
    this._commit();
    this.emit('tick');
  }

  // --- Internals ---

  _tick() {
    if (this.data.timeRemaining > 0) {
      this.data.timeRemaining--;
      this.emit('tick');
      this._commit(); // Maybe too frequent IO? Optimisation: only save on pause/stop?
      // For now, save every tick for recovery on reload
    } else {
      this.complete();
    }
  }

  _switchMode() {
    const { sessionsCompleted } = this.data;
    const longInterval = this.settings.get('timer.longBreakInterval');

    if (this.data.mode === 'focus') {
      if (sessionsCompleted > 0 && sessionsCompleted % longInterval === 0) {
        this.data.mode = 'longBreak';
      } else {
        this.data.mode = 'shortBreak';
      }
    } else {
      this.data.mode = 'focus';
    }

    this._setDurationForMode(this.data.mode);

    // Auto-start check
    const autoStartPomo = this.settings.get('timer.autoStartPomodoros');
    const autoStartBreak = this.settings.get('timer.autoStartBreaks');

    if (this.data.mode === 'focus' && autoStartPomo) {
      this.start();
    } else if (this.data.mode !== 'focus' && autoStartBreak) {
      this.start();
    }
  }

  _setDurationForMode(mode) {
    let minutes = 25;
    if (mode === 'focus') minutes = this.settings.get('timer.focusDuration');
    if (mode === 'shortBreak') minutes = this.settings.get('timer.shortBreakDuration');
    if (mode === 'longBreak') minutes = this.settings.get('timer.longBreakDuration');

    this.data.timeRemaining = minutes * 60;
    this.data.totalDuration = minutes * 60;
    this._commit();
  }

  _syncSettings() {
    // If timer is NOT running, update current duration to match new settings
    if (!this.data.isRunning) {
      this._setDurationForMode(this.data.mode);
    }
  }

  _playSound(type) {
    // Placeholder for AudioService integration or simple Audio object
    // For now, minimal beep
    // In Phase 8 we might link AudioService properly
  }
}
