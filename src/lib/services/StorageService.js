/**
 * StorageService
 * 
 * Abstraction layer for persistent storage.
 * Currently uses localStorage, but can be extended to:
 * - IndexedDB for larger data
 * - Remote backend sync
 * 
 * Features:
 * - Sync queue for future backend integration
 * - Automatic serialization/deserialization
 * - Migration support
 */

const SYNC_QUEUE_KEY = 'hush_sync_queue';
const STORAGE_VERSION_KEY = 'hush_storage_version';
const CURRENT_VERSION = 1;

class StorageService {
  pendingChanges = [];

  constructor() {
    this.loadPendingChanges();
    this.checkVersion();
  }

  // === Basic Storage Operations ===

  /**
   * Get a value from storage
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (e) {
      console.error(`[StorageService] Failed to get "${key}":`, e);
      return defaultValue;
    }
  }

  /**
   * Set a value in storage
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[StorageService] Failed to set "${key}":`, e);
      return false;
    }
  }

  /**
   * Remove a value from storage
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`[StorageService] Failed to remove "${key}":`, e);
      return false;
    }
  }

  /**
   * Clear all storage (use with caution)
   */
  clear() {
    try {
      localStorage.clear();
      this.pendingChanges = [];
      return true;
    } catch (e) {
      console.error('[StorageService] Failed to clear storage:', e);
      return false;
    }
  }

  // === Sync Queue for Future Backend ===

  /**
   * Queue a change for future sync to backend
   * Call this when data changes that should eventually sync
   */
  queueForSync(storeKey, data, operation = 'update') {
    const change = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      storeKey,
      data,
      operation, // 'create', 'update', 'delete'
      timestamp: Date.now(),
      synced: false
    };

    this.pendingChanges.push(change);
    this.savePendingChanges();

    return change.id;
  }

  /**
   * Get all pending changes that need to sync
   */
  getPendingChanges() {
    return this.pendingChanges.filter(c => !c.synced);
  }

  /**
   * Mark changes as synced (call after successful backend sync)
   */
  markSynced(changeIds) {
    changeIds.forEach(id => {
      const change = this.pendingChanges.find(c => c.id === id);
      if (change) change.synced = true;
    });

    // Clean up synced changes older than 24 hours
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    this.pendingChanges = this.pendingChanges.filter(
      c => !c.synced || c.timestamp > oneDayAgo
    );

    this.savePendingChanges();
  }

  /**
   * Clear all pending changes (e.g., after full sync)
   */
  clearSyncQueue() {
    this.pendingChanges = [];
    this.savePendingChanges();
  }

  // === Internal Methods ===

  loadPendingChanges() {
    try {
      const saved = localStorage.getItem(SYNC_QUEUE_KEY);
      if (saved) {
        this.pendingChanges = JSON.parse(saved);
      }
    } catch (e) {
      console.error('[StorageService] Failed to load sync queue:', e);
      this.pendingChanges = [];
    }
  }

  savePendingChanges() {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.pendingChanges));
    } catch (e) {
      console.error('[StorageService] Failed to save sync queue:', e);
    }
  }

  checkVersion() {
    const version = this.get(STORAGE_VERSION_KEY, 0);
    if (version < CURRENT_VERSION) {
      this.migrate(version, CURRENT_VERSION);
      this.set(STORAGE_VERSION_KEY, CURRENT_VERSION);
    }
  }

  /**
   * Handle data migrations between versions
   */
  migrate(fromVersion, toVersion) {
    console.log(`[StorageService] Migrating from v${fromVersion} to v${toVersion}`);

    // Add migration logic here as needed
    // Example:
    // if (fromVersion < 1) {
    //   // Migrate old data structure
    // }
  }

  // === Future Backend Integration ===

  /**
   * Sync pending changes to backend (implement when backend is ready)
   * Returns: { success: boolean, syncedCount: number, errors: [] }
   */
  async syncToBackend(apiClient) {
    const pending = this.getPendingChanges();
    if (pending.length === 0) {
      return { success: true, syncedCount: 0, errors: [] };
    }

    const errors = [];
    const synced = [];

    for (const change of pending) {
      try {
        // TODO: Implement actual API call when backend exists
        // await apiClient.sync(change);
        synced.push(change.id);
      } catch (e) {
        errors.push({ id: change.id, error: e.message });
      }
    }

    if (synced.length > 0) {
      this.markSynced(synced);
    }

    return {
      success: errors.length === 0,
      syncedCount: synced.length,
      errors
    };
  }
  // === Data Export / Import ===

  /**
   * Export all HUSH data to a JSON file
   */
  exportData() {
    const keys = [
      'hush_workspaces_v2',
      'hush_kanban_v2',
      'hush_settings_v2',
      'hush_stats_v2',
      'hush_achievements_v2',
      'hush_audio_playlist',
      'hush_timer_v2'
    ];

    const backup = {
      version: 1,
      timestamp: Date.now(),
      stores: {}
    };

    keys.forEach(key => {
      const data = this.get(key);
      if (data) {
        backup.stores[key] = data;
      }
    });

    // Create and download file
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hush-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return true;
  }

  /**
   * Import data from a JSON object
   * Returns: { success: boolean, message: string }
   */
  async importData(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target.result);

          // Basic validation
          if (!backup.stores || typeof backup.stores !== 'object') {
            resolve({ success: false, message: 'Invalid backup file format' });
            return;
          }

          // Restore each key
          Object.keys(backup.stores).forEach(key => {
            // We use this.set which handles stringification
            this.set(key, backup.stores[key]);
          });

          resolve({ success: true, message: 'Import successful' });
        } catch (error) {
          console.error('[StorageService] Import failed:', error);
          resolve({ success: false, message: 'Failed to parse backup file' });
        }
      };

      reader.onerror = () => {
        resolve({ success: false, message: 'Failed to read file' });
      };

      reader.readAsText(file);
    });
  }
}

// Singleton instance
export const storageService = new StorageService();
