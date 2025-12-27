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
      if (this.data.lastSessionDate === yesterday.toDateString()) {
        // Streak continues
      } else if (this.data.lastSessionDate !== today) {
        // Streak broken
        // But only if we have at least one session ever
        if (this.data.totalSessions > 0) {
          // Logic check: if last session was NOT yesterday and NOT today, streak is 0.
          // But wait, if last session was 2 days ago, streak is 0.
          // If last session was today, we do nothing.
          // The simplistic check:
          const last = new Date(this.data.lastSessionDate);
          const diffTime = Math.abs(new Date(today) - last);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          // Ideally we need more robust date diff, but for now strict yesterday check:
          // If lastSessionDate exists AND is NOT yesterday, then clear streak.
        }

        // Simpler approach:
        // We only reset streak if we are recording a session and realize we missed a day.
        // But here we just check new day to reset 'today' counters.
        // We'll handle refined streak logic in recordSession.
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
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (this.data.lastSessionDate === yesterday.toDateString()) {
        this.data.currentStreak++;
      } else if (this.data.totalSessions === 1) { // First ever session
        this.data.currentStreak = 1;
      } else {
        // Missed a day or more, reset to 1 (because we just finished a session today)
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
