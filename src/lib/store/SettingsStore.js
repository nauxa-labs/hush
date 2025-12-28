import { Store } from './Store.js';

const DEFAULT_SETTINGS = {
  // Theme
  theme: 'glass_dark', // 'glass_dark' | 'glass_light' | 'oled'
  wallpaper: null,     // null = gradient, or URL string

  // Timer
  timer: {
    focusDuration: 25,      // minutes (1-120)
    shortBreakDuration: 5,  // minutes (1-30)
    longBreakDuration: 15,  // minutes (1-60)
    longBreakInterval: 4,   // sessions before long break
    autoStartBreaks: false,
    autoStartPomodoros: false,
    tickSound: true,
    completionSound: true,
    presets: [15, 25, 45, 60]  // Quick select timer presets (user-customizable)
  },

  // Audio
  audio: {
    masterVolume: 0.5,      // 0.0 - 1.0
    tracks: {
      rain: { enabled: false, volume: 0.5 },
      cafe: { enabled: false, volume: 0.5 },
      fire: { enabled: false, volume: 0.5 },
      lofi: { enabled: false, volume: 0.5 }
    }
  },

  // Display
  display: {
    showDailyGoal: true,
    dailyGoalMinutes: 120,
    showQuotes: true,
    clockFormat: '24h' // '12h' | '24h'
  },

  // Notifications
  notifications: {
    browser: true,
    sound: true
  }
};

export class SettingsStore extends Store {
  constructor() {
    super('hush_settings_v2');
    if (!this.data) {
      this.data = structuredClone(DEFAULT_SETTINGS);
      this._commit();
    }
  }

  // Get nested value with dot notation: get('timer.focusDuration')
  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.data);
  }

  // Set nested value with dot notation: set('timer.focusDuration', 30)
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => obj[key], this.data);

    // Type safety/validation could go here
    target[lastKey] = value;

    this._commit();
  }

  // Reset a section or all
  reset(section = null) {
    if (section && DEFAULT_SETTINGS[section]) {
      this.data[section] = structuredClone(DEFAULT_SETTINGS[section]);
    } else {
      this.data = structuredClone(DEFAULT_SETTINGS);
    }
    this._commit();
  }
}
