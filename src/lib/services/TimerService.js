import { Store } from '../store/Store.js';

export class TimerService extends Store {
  constructor(statsStore, workspaceStore, settingsStore) {
    super('hush_timer_v2');
    this.statsStore = statsStore;
    this.workspaceStore = workspaceStore;
    this.settingsStore = settingsStore;

    if (!this.data) {
      this.data = {
        remaining: 25 * 60,
        total: 25 * 60,
        isRunning: false,
        mode: 'focus', // focus, short-break, long-break
        completedPomodoros: 0,
        sessionCount: 0, // Count within current cycle (for long break detection)
        activeCardId: null
      };
    }
    this.intervalId = null;

    if (this.data.isRunning) {
      this.data.isRunning = false;
      this._commit();
    }

    // Fix: Initialize sessionCount for existing users to prevent NaN
    if (typeof this.data.sessionCount !== 'number') {
      this.data.sessionCount = 0;
      this._commit();
    }
  }

  setActiveCard(cardId) {
    this.data.activeCardId = cardId;
    this._commit();
  }

  start() {
    if (this.data.isRunning) return;
    this.data.isRunning = true;
    this._commit();

    this.intervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  pause() {
    if (!this.data.isRunning) return;
    this.data.isRunning = false;
    this._commit();
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    this.pause();
    this.data.remaining = this.data.total;
    this.data.isRunning = false;
    this._commit();
    this.emit('change', this.data);
  }

  setDuration(minutes) {
    this.pause();
    this.data.total = minutes * 60;
    this.data.remaining = minutes * 60;
    this._commit();
  }

  // Set mode and duration based on mode type
  setMode(mode) {
    this.pause();
    const settings = this.settingsStore?.data?.timer || {};

    let duration;
    switch (mode) {
      case 'short-break':
        duration = settings.shortBreakDuration || 5;
        break;
      case 'long-break':
        duration = settings.longBreakDuration || 15;
        break;
      case 'focus':
      default:
        duration = settings.focusDuration || 25;
        mode = 'focus';
    }

    this.data.mode = mode;
    this.data.total = duration * 60;
    this.data.remaining = duration * 60;
    this._commit();
    this.emit('change', this.data);
  }

  tick() {
    if (this.data.remaining > 0) {
      this.data.remaining--;
      this.emit('tick', this.data.remaining);
      if (this.data.remaining === 0) {
        this.complete();
      }
    } else {
      this.complete();
    }
    this.emit('change', this.data);
  }

  complete() {
    this.pause();
    this.emit('timer:complete');

    const settings = this.settingsStore?.data?.timer || {};
    const longBreakInterval = settings.longBreakInterval || 4;
    const autoStartBreaks = settings.autoStartBreaks || false;
    const autoStartPomodoros = settings.autoStartPomodoros || false;

    // Record stats if completing a focus session
    if (this.data.mode === 'focus' && this.statsStore) {
      const minutes = Math.floor(this.data.total / 60);
      const wsId = this.workspaceStore?.data?.activeId || 'default';
      this.statsStore.recordSession(wsId, minutes);

      this.data.completedPomodoros++;
      this.data.sessionCount++;
    }

    // Determine next mode
    let nextMode;
    if (this.data.mode === 'focus') {
      // After focus: switch to break
      if (this.data.sessionCount >= longBreakInterval) {
        nextMode = 'long-break';
        this.data.sessionCount = 0; // Reset session count after long break
      } else {
        nextMode = 'short-break';
      }
    } else {
      // After break: switch to focus
      nextMode = 'focus';
    }

    // Set the next mode
    this.setMode(nextMode);

    // Auto-start if enabled
    if (nextMode === 'focus' && autoStartPomodoros) {
      setTimeout(() => this.start(), 500); // Small delay for UX
    } else if ((nextMode === 'short-break' || nextMode === 'long-break') && autoStartBreaks) {
      setTimeout(() => this.start(), 500);
    }

    this._commit();
  }

  // Skip to next mode manually
  skip() {
    this.complete();
  }
}

