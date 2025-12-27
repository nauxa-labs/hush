// File: js/components/ui/Toast.js
export class Toast {
  static container = null;

  static init() {
    if (!this.container) {
      this.container = document.getElementById('toast-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
      }
    }
  }

  static show(message, type = 'info', duration = 3000) {
    this.init();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    toast.innerHTML = `
      <span class="toast__icon">${icons[type] || ''}</span>
      <span class="toast__content">${message}</span>
    `;

    this.container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
      toast.classList.add('hiding');
      toast.addEventListener('animationend', () => {
        toast.remove();
      });
    }, duration);
  }
}
