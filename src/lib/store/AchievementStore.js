import { Store } from './Store.js';

export const BADGES = [
  { id: 'first_session', name: 'Pemula', icon: '🌱', description: 'Complete your first focus session', condition: s => s.totalSessions >= 1 },
  { id: 'ten_sessions', name: '10 Sesi', icon: '⭐', description: 'Complete 10 total sessions', condition: s => s.totalSessions >= 10 },
  { id: 'fifty_sessions', name: 'Produktif', icon: '🏆', description: 'Complete 50 total sessions', condition: s => s.totalSessions >= 50 },
  { id: 'hundred_sessions', name: 'Diamond', icon: '💎', description: 'Complete 100 total sessions', condition: s => s.totalSessions >= 100 },
  { id: 'hundred_minutes', name: '100 Menit', icon: '💪', description: 'Focus for 100 total minutes', condition: s => s.totalMinutes >= 100 },
  { id: 'five_hundred_minutes', name: '500 Menit', icon: '🚀', description: 'Focus for 500 total minutes', condition: s => s.totalMinutes >= 500 },
  { id: 'thousand_minutes', name: 'Master', icon: '👑', description: 'Focus for 1000 total minutes', condition: s => s.totalMinutes >= 1000 },
  { id: 'three_day_streak', name: '3 Hari', icon: '🔥', description: 'Maintain a 3-day streak', condition: s => s.currentStreak >= 3 },
  { id: 'week_streak', name: 'Week Warrior', icon: '⚔️', description: 'Maintain a 7-day streak', condition: s => s.currentStreak >= 7 },
  { id: 'month_streak', name: 'Konsisten', icon: '🌟', description: 'Maintain a 30-day streak', condition: s => s.currentStreak >= 30 }
];

export class AchievementStore extends Store {
  constructor(statsStore, adapter) {
    super('hush_achievements_v2', adapter);
    this.statsStore = statsStore;
    if (!this.data) {
      this.data = { unlocked: [] }; // Array of badge IDs
      this._commit();
    }

    // Listen to stats changes
    this.statsStore.on('session:recorded', () => this.checkAchievements());
  }

  checkAchievements() {
    const stats = this.statsStore.getStats();
    const newlyUnlocked = [];

    BADGES.forEach(badge => {
      if (!this.data.unlocked.includes(badge.id) && badge.condition(stats)) {
        this.data.unlocked.push(badge.id);
        newlyUnlocked.push(badge);
      }
    });

    if (newlyUnlocked.length > 0) {
      newlyUnlocked.forEach(badge => this.data.unlocked.push(badge.id)); // Add to data
      this._commit();

      newlyUnlocked.forEach(badge => {
        this.emit('badge:unlocked', badge);
      });
    }

    return newlyUnlocked;
  }

  isUnlocked(badgeId) {
    return this.data.unlocked.includes(badgeId);
  }

  getAllBadges() {
    return BADGES.map(b => ({
      ...b,
      unlocked: this.isUnlocked(b.id)
    }));
  }
}
