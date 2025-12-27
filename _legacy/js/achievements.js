/**
 * Warkop Fokus - Achievement System
 * Gamification with badges and milestones
 */

class AchievementManager {
  constructor() {
    this.unlockedAchievements = Storage.getAchievements();
    this.container = document.getElementById('achievementList');

    // Define all achievements
    this.achievements = [
      {
        id: 'first_session',
        icon: '🌱',
        name: 'Pemula',
        description: 'Selesaikan sesi fokus pertama',
        condition: (stats) => stats.totalSessions >= 1
      },
      {
        id: 'sessions_10',
        icon: '⭐',
        name: '10 Sesi',
        description: 'Selesaikan 10 sesi fokus',
        condition: (stats) => stats.totalSessions >= 10
      },
      {
        id: 'sessions_50',
        icon: '🏆',
        name: 'Produktif',
        description: 'Selesaikan 50 sesi fokus',
        condition: (stats) => stats.totalSessions >= 50
      },
      {
        id: 'sessions_100',
        icon: '💎',
        name: 'Diamond',
        description: 'Selesaikan 100 sesi fokus',
        condition: (stats) => stats.totalSessions >= 100
      },
      {
        id: 'minutes_100',
        icon: '💪',
        name: '100 Menit',
        description: 'Akumulasi 100 menit fokus',
        condition: (stats) => stats.totalMinutes >= 100
      },
      {
        id: 'minutes_500',
        icon: '🚀',
        name: '500 Menit',
        description: 'Akumulasi 500 menit fokus',
        condition: (stats) => stats.totalMinutes >= 500
      },
      {
        id: 'minutes_1000',
        icon: '👑',
        name: 'Master',
        description: 'Akumulasi 1000 menit fokus',
        condition: (stats) => stats.totalMinutes >= 1000
      },
      {
        id: 'streak_3',
        icon: '🔥',
        name: '3 Hari Streak',
        description: 'Gunakan app 3 hari berturut-turut',
        condition: (stats) => stats.currentStreak >= 3
      },
      {
        id: 'streak_7',
        icon: '🔥',
        name: 'Week Warrior',
        description: 'Gunakan app 7 hari berturut-turut',
        condition: (stats) => stats.currentStreak >= 7
      },
      {
        id: 'streak_30',
        icon: '🌟',
        name: 'Konsisten',
        description: 'Gunakan app 30 hari berturut-turut',
        condition: (stats) => stats.currentStreak >= 30
      }
    ];

    this.render();
  }

  /**
   * Check for new achievements after session completion
   */
  checkAchievements(stats) {
    const newAchievements = [];

    this.achievements.forEach(achievement => {
      // Skip if already unlocked
      if (this.isUnlocked(achievement.id)) return;

      // Check if condition is met
      if (achievement.condition(stats)) {
        this.unlock(achievement);
        newAchievements.push(achievement);
      }
    });

    if (newAchievements.length > 0) {
      this.render();
    }

    return newAchievements;
  }

  /**
   * Check if achievement is unlocked
   */
  isUnlocked(id) {
    return this.unlockedAchievements.some(a => a.id === id);
  }

  /**
   * Unlock an achievement
   */
  unlock(achievement) {
    this.unlockedAchievements.push({
      id: achievement.id,
      unlockedAt: new Date().toISOString()
    });
    Storage.saveAchievements(this.unlockedAchievements);

    // Show notification
    this.showUnlockNotification(achievement);
  }

  /**
   * Show unlock notification
   */
  showUnlockNotification(achievement) {
    showToast(`${achievement.icon} Achievement Unlocked: ${achievement.name}!`);
  }

  /**
   * Render achievements grid
   */
  render() {
    if (!this.container) return;

    this.container.innerHTML = this.achievements.map(achievement => {
      const isUnlocked = this.isUnlocked(achievement.id);
      return `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <span class="achievement-icon">${achievement.icon}</span>
          <span class="achievement-name">${achievement.name}</span>
          <span class="achievement-desc">${achievement.description}</span>
          ${isUnlocked ? '<span class="achievement-check">✓</span>' : ''}
        </div>
      `;
    }).join('');
  }

  /**
   * Get progress stats
   */
  getProgress() {
    return {
      unlocked: this.unlockedAchievements.length,
      total: this.achievements.length
    };
  }
}

let achievementManager;
