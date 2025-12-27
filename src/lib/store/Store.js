export class Store {
  constructor(storageKey) {
    this.storageKey = storageKey;
    this.listeners = new Map(); // event -> Set<callback>
    this.data = this._load();
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
  _load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error(`[Store] Failed to load ${this.storageKey}:`, e);
      return null;
    }
  }

  _save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
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
