export class Store {
  constructor(storageKey, adapter = null) {
    this.storageKey = storageKey;
    this.adapter = adapter;
    this.listeners = new Map(); // event -> Set<callback>
    this.data = null; // Data is now loaded async or initialized empty, but we'll try sync load for local

    // Legacy support: If adapter provided, use it. Else define a safe fallback or throw.
    // For this refactor, we assume adapter is provided or we maintain dual support temporarily.
    if (!this.adapter) {
      console.warn(`[Store] No adapter provided for ${storageKey}, falling back to direct localStorage`);
    }

    // Initial load attempt (Sync if possible, else async)
    this._loadInitial();
  }

  // --- Event System ---
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback); // Return unsubscribe function
  }

  off(event, callback) {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event, payload) {
    this.listeners.get(event)?.forEach(cb => cb(payload));
    this.listeners.get('*')?.forEach(cb => cb({ event, payload })); // Wildcard
  }

  // --- Persistence ---
  async _loadInitial() {
    if (this.adapter) {
      const loaded = await this.adapter.get(this.storageKey);
      if (loaded) {
        this.data = loaded;
        this.emit('change', this.data);
      } else {
        // Try legacy localstorage if adapter empty (Migration path)
        const raw = localStorage.getItem(this.storageKey);
        if (raw) {
          this.data = JSON.parse(raw);
          this.emit('change', this.data);
          // Save to new adapter
          this._save();
        }
      }
    } else {
      // Legacy fallback
      const raw = localStorage.getItem(this.storageKey);
      this.data = raw ? JSON.parse(raw) : null;
    }
  }

  // Backward compatibility synchronous getter (might return stale/null initially if async)
  get currentData() {
    return this.data;
  }

  _load() {
    // Deprecated synchronous load
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error(`[Store] Failed to load ${this.storageKey}:`, e);
      return null;
    }
  }

  async _save() {
    try {
      if (this.adapter) {
        await this.adapter.set(this.storageKey, this.data);
      } else {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      }
    } catch (e) {
      console.error(`[Store] Failed to save ${this.storageKey}:`, e);
    }
  }

  // Call after any mutation
  _commit() {
    this._save();
    this.emit('change', this.data);
  }
}
