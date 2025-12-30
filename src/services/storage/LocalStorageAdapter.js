import { StorageAdapter } from './StorageAdapter';

export class LocalStorageAdapter extends StorageAdapter {
  constructor(namespace = 'hush_v2') {
    super();
    this.prefix = `${namespace}_`;
  }

  async init() {
    // LocalStorage needs no init, but async allows for future IndexedDB swap
    return Promise.resolve();
  }

  _k(key) {
    return `${this.prefix}${key}`;
  }

  async get(key) {
    try {
      const item = localStorage.getItem(this._k(key));
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('LocalStorage Get Error:', e);
      return null;
    }
  }

  async set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(this._k(key), serialized);
    } catch (e) {
      console.error('LocalStorage Set Error:', e);
    }
  }

  async remove(key) {
    localStorage.removeItem(this._k(key));
  }

  async clear() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}
