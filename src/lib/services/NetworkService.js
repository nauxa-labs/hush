import { makeAutoObservable } from 'mobx';

/**
 * NetworkService
 * 
 * Tracks online/offline status and provides reactive state for components.
 * Used to show elegant offline warnings and handle YouTube availability.
 */
class NetworkService {
  isOnline = navigator.onLine;

  constructor() {
    makeAutoObservable(this);

    window.addEventListener('online', () => this.setOnline(true));
    window.addEventListener('offline', () => this.setOnline(false));
  }

  setOnline(status) {
    this.isOnline = status;
  }

  // Check if YouTube would be available
  get isYouTubeAvailable() {
    return this.isOnline;
  }
}

// Singleton instance
export const networkService = new NetworkService();
