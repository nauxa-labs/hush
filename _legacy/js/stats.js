/**
 * Warkop Fokus - Statistics Tracker
 * Tracks sessions, minutes, streaks, and daily progress
 */

class StatsTracker {
  constructor() {
    this.stats = Storage.getStats();
    this.dailyGoal = Storage.getDailyGoal();

    // Check if it's a new day
    this.checkNewDay();

    // DOM elements
    this.elements = {
      todaySessions: document.getElementById('todaySessions'),
      todayMinutes: document.getElementById('todayMinutes'),
      totalSessions: document.getElementById('totalSessions'),
      totalMinutes: document.getElementById('totalMinutes'),
      currentStreak: document.getElementById('currentStreak'),
      goalProgress: document.getElementById('goalProgress'),
      goalProgressBar: document.getElementById('goalProgressBar'),
      goalText: document.getElementById('goalText')
    };

    this.render();
  }

  /**
   * Check if it's a new day and reset daily stats
   */
  checkNewDay() {
    const today = new Date().toDateString();
    const lastActive = this.stats.lastActiveDate;

    if (lastActive !== today) {
      // Check streak
      if (lastActive) {
        const lastDate = new Date(lastActive);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Consecutive day - continue streak
          this.stats.currentStreak++;
          if (this.stats.currentStreak > this.stats.longestStreak) {
            this.stats.longestStreak = this.stats.currentStreak;
          }
        } else if (diffDays > 1) {
          // Streak broken
          this.stats.currentStreak = 1;
        }
      } else {
        // First time using app
        this.stats.currentStreak = 1;
      }

      // Reset daily stats
      this.stats.todaySessions = 0;
      this.stats.todayMinutes = 0;
      this.stats.lastActiveDate = today;

      // Reset daily goal
      this.dailyGoal.currentMinutes = 0;
      this.dailyGoal.lastResetDate = today;

      this.save();
    }
  }

  /**
   * Record a completed session
   */
  recordSession(minutes) {
    this.stats.totalSessions++;
    this.stats.totalMinutes += minutes;
    this.stats.todaySessions++;
    this.stats.todayMinutes += minutes;
    this.stats.lastActiveDate = new Date().toDateString();

    // Update daily goal
    this.dailyGoal.currentMinutes += minutes;

    this.save();
    this.render();

    // Check for goal completion
    if (this.dailyGoal.currentMinutes >= this.dailyGoal.targetMinutes) {
      this.celebrateGoal();
    }

    // Return stats for achievement checking
    return {
      totalSessions: this.stats.totalSessions,
      totalMinutes: this.stats.totalMinutes,
      currentStreak: this.stats.currentStreak
    };
  }

  /**
   * Set daily goal target
   */
  setGoalTarget(minutes) {
    this.dailyGoal.targetMinutes = minutes;
    Storage.saveDailyGoal(this.dailyGoal);
    this.render();
  }

  /**
   * Save stats to storage
   */
  save() {
    Storage.saveStats(this.stats);
    Storage.saveDailyGoal(this.dailyGoal);
  }

  /**
   * Render stats to DOM
   */
  render() {
    if (this.elements.todaySessions) {
      this.elements.todaySessions.textContent = this.stats.todaySessions;
    }
    if (this.elements.todayMinutes) {
      this.elements.todayMinutes.textContent = this.stats.todayMinutes;
    }
    if (this.elements.totalSessions) {
      this.elements.totalSessions.textContent = this.stats.totalSessions;
    }
    if (this.elements.totalMinutes) {
      this.elements.totalMinutes.textContent = this.stats.totalMinutes;
    }
    if (this.elements.currentStreak) {
      this.elements.currentStreak.textContent = this.stats.currentStreak;
    }

    // Update goal progress
    this.renderGoalProgress();
  }

  renderGoalProgress() {
    const progress = Math.min((this.dailyGoal.currentMinutes / this.dailyGoal.targetMinutes) * 100, 100);

    if (this.elements.goalProgressBar) {
      this.elements.goalProgressBar.style.width = `${progress}%`;
    }
    if (this.elements.goalProgress) {
      this.elements.goalProgress.textContent = `${Math.round(progress)}%`;
    }
    if (this.elements.goalText) {
      this.elements.goalText.textContent = `${this.dailyGoal.currentMinutes}/${this.dailyGoal.targetMinutes} menit`;
    }
  }

  /**
   * Celebrate goal completion
   */
  celebrateGoal() {
    showToast('🎉 Target harian tercapai! Hebat!');
    // Could add confetti animation here
  }

  /**
   * Get current stats
   */
  getStats() {
    return { ...this.stats };
  }

  getDailyGoal() {
    return { ...this.dailyGoal };
  }
}

let statsTracker;
