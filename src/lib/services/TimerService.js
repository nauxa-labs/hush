import { Store } from '../store/Store.js';

export class TimerService extends Store {
  constructor(statsStore, workspaceStore) {
    super('hush_timer_v2');
    this.statsStore = statsStore;
    this.workspaceStore = workspaceStore;
    if (!this.data) {
      this.data = {
        remaining: 25 * 60,
        total: 25 * 60,
        isRunning: false,
        mode: 'focus', // focus, short-break, long-break
        completedPomodoros: 0,
        activeCardId: null
      };
    }
    this.intervalId = null;

    if (this.data.isRunning) {
      this.data.isRunning = false;
      this._commit();
    }
  }

  // ... (start, pause, reset methods unchanged, skipping for brevity in this replace if possible, but I must replace contiguous)
  // Actually I should just replace the constructor and complete method sections if possible, or whole file logic.
  // Converting to specific replacements.

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
    this.pause(); // Ensure interval is cleared
    this.data.remaining = this.data.total;
    this.data.isRunning = false; // Double check
    this._commit();
    this.emit('change', this.data); // Force UI update immediately
  }

  setDuration(minutes) {
    this.pause();
    this.data.total = minutes * 60;
    this.data.remaining = minutes * 60;
    this._commit();
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
    // Optimization: Emit change for UI update, but skip _commit caused disk IO
    this.emit('change', this.data);
  }

  complete() {
    this.pause();
    this.data.completedPomodoros++;
    this.emit('timer:complete');

    // Record Stats if in Focus Mode
    if (this.data.mode === 'focus' && this.statsStore) {
      const minutes = Math.floor(this.data.total / 60);
      const wsId = this.workspaceStore?.data?.activeId || 'default';
      this.statsStore.recordSession(wsId, minutes);
    }

    this._commit();
  }
}
