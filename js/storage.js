/**
 * Warkop Fokus - Storage Manager
 * Centralized localStorage management with fallback
 */

const Storage = {
  KEYS: {
    SETTINGS: 'warkop_settings',
    STATS: 'warkop_stats',
    TASKS: 'warkop_tasks',
    ACHIEVEMENTS: 'warkop_achievements',
    DAILY_GOAL: 'warkop_daily_goal'
  },

  // Default values
  DEFAULTS: {
    settings: {
      focusTime: 25,
      breakTime: 5,
      longBreakTime: 15,
      sessionsUntilLongBreak: 4,
      soundEnabled: true
    },
    stats: {
      totalSessions: 0,
      totalMinutes: 0,
      todaySessions: 0,
      todayMinutes: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null
    },
    tasks: [],
    achievements: [],
    dailyGoal: {
      targetMinutes: 120,
      currentMinutes: 0,
      lastResetDate: null
    }
  },

  /**
   * Save data to localStorage
   */
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Storage save error:', e);
      return false;
    }
  },

  /**
   * Load data from localStorage with fallback to default
   */
  load(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      if (data === null) {
        return defaultValue;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Storage load error:', e);
      return defaultValue;
    }
  },

  /**
   * Remove specific key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error('Storage remove error:', e);
      return false;
    }
  },

  /**
   * Clear all app data
   */
  clearAll() {
    Object.values(this.KEYS).forEach(key => {
      this.remove(key);
    });
  },

  // Convenience methods
  getSettings() {
    return this.load(this.KEYS.SETTINGS, this.DEFAULTS.settings);
  },

  saveSettings(settings) {
    return this.save(this.KEYS.SETTINGS, { ...this.DEFAULTS.settings, ...settings });
  },

  getStats() {
    return this.load(this.KEYS.STATS, this.DEFAULTS.stats);
  },

  saveStats(stats) {
    return this.save(this.KEYS.STATS, stats);
  },

  getTasks() {
    return this.load(this.KEYS.TASKS, this.DEFAULTS.tasks);
  },

  saveTasks(tasks) {
    return this.save(this.KEYS.TASKS, tasks);
  },

  getAchievements() {
    return this.load(this.KEYS.ACHIEVEMENTS, this.DEFAULTS.achievements);
  },

  saveAchievements(achievements) {
    return this.save(this.KEYS.ACHIEVEMENTS, achievements);
  },

  getDailyGoal() {
    return this.load(this.KEYS.DAILY_GOAL, this.DEFAULTS.dailyGoal);
  },

  saveDailyGoal(goal) {
    return this.save(this.KEYS.DAILY_GOAL, goal);
  }
};
