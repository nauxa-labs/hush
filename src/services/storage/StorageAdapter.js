/**
 * @interface StorageAdapter
 * Common interface for all storage backends (Local, Cloud, P2P)
 */
export class StorageAdapter {
  /**
   * Initialize the storage connection
   * @returns {Promise<void>}
   */
  async init() { throw new Error('Not implemented'); }

  /**
   * Get a value by key
   * @param {string} key 
   * @returns {Promise<any>}
   */
  async get(key) { throw new Error('Not implemented'); }

  /**
   * Set a value
   * @param {string} key 
   * @param {any} value 
   * @returns {Promise<void>}
   */
  async set(key, value) { throw new Error('Not implemented'); }

  /**
   * Remove a value
   * @param {string} key 
   * @returns {Promise<void>}
   */
  async remove(key) { throw new Error('Not implemented'); }

  /**
   * Clear all data for this namespace
   * @returns {Promise<void>}
   */
  async clear() { throw new Error('Not implemented'); }
}
