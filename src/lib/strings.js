/**
 * HUSH UI Strings - Centralized for future i18n support
 * 
 * Usage: import { STRINGS } from '../lib/strings';
 * Then:  STRINGS.KEYBOARD.PRESS_TO_SELECT(1)
 */

export const STRINGS = {
  // App
  APP: {
    NAME: 'HUSH',
    TAGLINE: 'Focus Mode Activated',
    OFFLINE: 'Offline',
    LOADING: 'Loading...',
  },

  // Keyboard Shortcuts
  KEYBOARD: {
    PRESS_TO_SELECT: (num) => `Press ${num} for quick select`,
    SHORTCUTS: {
      SPACE: 'Start/Pause timer',
      R: 'Reset timer',
      ESC: 'Close/Exit',
      F: 'Toggle Focus Mode',
      NUMBERS: 'Quick select preset',
    },
  },

  // Timer
  TIMER: {
    FOCUS_MODE: 'Focus Mode',
    CURRENT_FOCUS: 'Current Focus',
    END_SESSION: 'End Session',
    QUICK_PRESETS: 'Quick Timer Presets',
    RESET_DEFAULTS: 'Reset to defaults',
  },

  // Settings
  SETTINGS: {
    TITLE: 'Settings',
    APPEARANCE: 'Appearance',
    TIMER_DURATIONS: 'Timer Durations (min)',
    GLASS_DARK: 'Glass Dark',
    GLASS_DARK_DESC: 'Deep focus, premium feel',
    GLASS_LIGHT: 'Glass Light',
    GLASS_LIGHT_DESC: 'Airy, clean aesthetics',
    FOCUS_DURATION: 'Focus Duration',
    SHORT_BREAK: 'Short Break',
    LONG_BREAK: 'Long Break',
    AUTO_START_BREAKS: 'Auto-start Breaks',
    AUTO_START_DESC: 'Start break immediately after focus',
    PRESET_HINT: 'Customize the quick select buttons (1-4 keys)',
    RESET_ALL: 'Reset All Settings',
  },

  // Stats
  STATS: {
    TITLE: 'Productivity Stats',
    SESSIONS: 'Sessions',
    TOTAL_TIME: 'Total Time',
    CURRENT_STREAK: 'Current Streak',
    BEST_STREAK: 'Best',
    WEEKLY_MINUTES: 'Weekly Minutes',
    LAST_7_DAYS: 'Last 7 Days',
    TOP_WORKSPACES: 'Top Workspaces',
    DAYS: 'Days',
  },

  // Kanban
  KANBAN: {
    ADD_TASK: 'Add Task',
    ADD_COLUMN: 'Add Column',
    NEW_TASK: 'New Task',
    NEW_COLUMN: 'New Column',
    DROP_HERE: 'Drop here',
    DELETE_COLUMN: 'Delete Column?',
    DELETE_COLUMN_MSG: 'Are you sure? All tasks in this column will be permanently deleted.',
    DELETE_TASK: 'Delete Task?',
    DELETE_TASK_MSG: 'Are you sure you want to delete this task? This cannot be undone.',
  },

  // Workspace
  WORKSPACE: {
    SELECT: 'Select a workspace',
    TASKS: 'Tasks',
    NO_TASKS: 'No tasks',
  },

  // Common
  COMMON: {
    CONFIRM: 'Confirm',
    CANCEL: 'Cancel',
    SAVE: 'Save',
    DELETE: 'Delete',
    EDIT: 'Edit',
    CLOSE: 'Close',
  },

  // Audio
  AUDIO: {
    TITLE: 'Audio',
    TICKING_SOUND: 'Ticking Sound',
    TICKING_DESC: 'Play soft ticking during focus',
    SHOW_MINI_PLAYER: 'Show Mini Player',
    MINI_PLAYER_DESC: 'Show floating player when panel closed',
  },
};

export default STRINGS;
