import { Store } from './Store.js';

const DEFAULT_STATS = {
  totalSessions: 0,
  totalMinutes: 0,
  todaySessions: 0,
  todayMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastSessionDate: null, // ISO string
  byWorkspace: {}        // workspaceId -> { sessions, minutes }
};

export class StatsStore extends Store {
  constructor() {
    super('hush_stats_v2');
    if (!this.data) {
      this.data = structuredClone(DEFAULT_STATS);
      this._commit();
    }
    this._checkNewDay();
  }

  _checkNewDay() {
    const today = new Date().toDateString();
    if (this.data.lastSessionDate !== today) {
      // Check streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // If last session was NOT yesterday and NOT today, streak is broken
      // (Unless it's the very first time, handled by null check if needed, but logic holds: null != yesterday)
      if (this.data.lastSessionDate && this.data.lastSessionDate !== yesterday.toDateString() && this.data.lastSessionDate !== today) {
        this.data.currentStreak = 0;
      }

      // Reset daily counters
      this.data.todaySessions = 0;
      this.data.todayMinutes = 0;
      this._commit();
    }
  }

  recordSession(workspaceId, minutes) {
    const today = new Date().toDateString();

    // Global stats
    this.data.totalSessions++;
    this.data.totalMinutes += minutes;
    this.data.todaySessions++;
    this.data.todayMinutes += minutes;

    // Streak logic
    if (this.data.lastSessionDate !== today) {
      // It's a new day of activity
      // Check if it extends a streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (this.data.lastSessionDate === yesterday.toDateString()) {
        // Consecutive day
        this.data.currentStreak++;
      } else {
        // Break or first day
        this.data.currentStreak = 1;
      }

      if (this.data.currentStreak > this.data.longestStreak) {
        this.data.longestStreak = this.data.currentStreak;
      }
    }

    this.data.lastSessionDate = today;

    // Per-workspace stats
    if (!this.data.byWorkspace[workspaceId]) {
      this.data.byWorkspace[workspaceId] = { sessions: 0, minutes: 0 };
    }
    this.data.byWorkspace[workspaceId].sessions++;
    this.data.byWorkspace[workspaceId].minutes += minutes;

    this._commit();
    this.emit('session:recorded', { workspaceId, minutes, stats: this.data });
    return this.data;
  }

  getStats() {
    this._checkNewDay();
    return this.data;
  }
}
