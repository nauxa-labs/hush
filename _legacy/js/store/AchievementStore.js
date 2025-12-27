import { Store } from './Store.js';

const BADGES = [
  { id: 'first_session', name: 'Pemula', icon: '🌱', condition: s => s.totalSessions >= 1 },
  { id: 'ten_sessions', name: '10 Sesi', icon: '⭐', condition: s => s.totalSessions >= 10 },
  { id: 'fifty_sessions', name: 'Produktif', icon: '🏆', condition: s => s.totalSessions >= 50 },
  { id: 'hundred_sessions', name: 'Diamond', icon: '💎', condition: s => s.totalSessions >= 100 },
  { id: 'hundred_minutes', name: '100 Menit', icon: '💪', condition: s => s.totalMinutes >= 100 },
  { id: 'five_hundred_minutes', name: '500 Menit', icon: '🚀', condition: s => s.totalMinutes >= 500 },
  { id: 'thousand_minutes', name: 'Master', icon: '👑', condition: s => s.totalMinutes >= 1000 },
  { id: 'three_day_streak', name: '3 Hari', icon: '🔥', condition: s => s.currentStreak >= 3 },
  { id: 'week_streak', name: 'Week Warrior', icon: '🔥', condition: s => s.currentStreak >= 7 },
  { id: 'month_streak', name: 'Konsisten', icon: '🌟', condition: s => s.currentStreak >= 30 }
];

export class AchievementStore extends Store {
  constructor(statsStore) {
    super('hush_achievements_v2');
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
