/**
 * Browser Notification Service for HUSH
 * 
 * Handles browser notification permissions and sending notifications
 * when timer sessions complete.
 */
export class NotificationService {
  constructor(settingsStore, timerService) {
    this.settingsStore = settingsStore;
    this.timerService = timerService;
    this.permissionGranted = false;

    // Check initial permission status
    this.checkPermission();

    // Listen for timer completion
    this.timerService.on('timer:complete', () => this.onTimerComplete());
  }

  /**
   * Check current notification permission status
   */
  checkPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    this.permissionGranted = Notification.permission === 'granted';
    return this.permissionGranted;
  }

  /**
   * Request notification permission from user
   * Returns true if granted, false otherwise
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    if (Notification.permission === 'granted') {
      this.permissionGranted = true;
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    // Request permission
    const result = await Notification.requestPermission();
    this.permissionGranted = result === 'granted';
    return this.permissionGranted;
  }

  /**
   * Get current permission status
   */
  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission; // 'default', 'granted', 'denied'
  }

  /**
   * Handle timer completion - show notification if enabled
   */
  onTimerComplete() {
    const notificationsEnabled = this.settingsStore?.data?.notifications?.browser ?? true;

    if (!notificationsEnabled || !this.permissionGranted) {
      return;
    }

    const mode = this.timerService?.data?.mode;

    // Different messages based on what just completed
    let title, body, icon;

    if (mode === 'short-break' || mode === 'long-break') {
      // Just switched TO break (meaning focus just ended)
      title = '🎉 Focus Session Complete!';
      body = `Great work! Take a ${mode === 'long-break' ? 'long' : 'short'} break.`;
      icon = '/icons/icon-192x192.png';
    } else {
      // Just switched TO focus (meaning break just ended)
      title = '⏰ Break Over!';
      body = 'Time to get back to focus mode.';
      icon = '/icons/icon-192x192.png';
    }

    this.showNotification(title, body, icon);
  }

  /**
   * Show a browser notification
   */
  showNotification(title, body, icon = '/icons/icon-192x192.png') {
    if (!this.permissionGranted) {
      return;
    }

    try {
      const notification = new Notification(title, {
        body,
        icon,
        badge: '/icons/icon-72x72.png',
        tag: 'hush-timer', // Replace previous notification
        requireInteraction: false,
        silent: false
      });

      // Auto-close after 5 seconds
      setTimeout(() => notification.close(), 5000);

      // Focus window on click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }
}
