// File: js/components/panels/SettingsPanel.js
import { Icons } from '../../utils/Icons.js';

export class SettingsPanel {
  constructor(container, { settingsStore, onClose }) {
    this.container = container;
    this.store = settingsStore;
    this.onClose = onClose;

    this.render();
  }

  render() {
    const s = this.store.data;

    this.container.innerHTML = `
      <div class="panel__header">
        <div class="panel__title">
           ${Icons.Settings} SETTINGS
        </div>
        <button class="panel__close">${Icons.Close}</button>
      </div>
      
      <div class="panel__content">
        <div class="settings-group">
            <div class="settings-group__title">TIMER CONFIGURATION</div>
            
            <div class="setting-item">
                <span class="setting-label">Focus Duration (min)</span>
                <input type="number" class="setting-input" data-path="timer.focusDuration" value="${s.timer.focusDuration}" min="1" max="120">
            </div>
             <div class="setting-item">
                <span class="setting-label">Short Break (min)</span>
                <input type="number" class="setting-input" data-path="timer.shortBreakDuration" value="${s.timer.shortBreakDuration}" min="1" max="30">
            </div>
             <div class="setting-item">
                <span class="setting-label">Long Break (min)</span>
                <input type="number" class="setting-input" data-path="timer.longBreakDuration" value="${s.timer.longBreakDuration}" min="1" max="60">
            </div>
             <div class="setting-item">
                <span class="setting-label">Tick Sound</span>
                 <input type="checkbox" class="setting-toggle" data-path="timer.tickSound" ${s.timer.tickSound ? 'checked' : ''}>
            </div>
        </div>

        <div class="settings-group">
            <div class="settings-group__title">VISUALS</div>
             <div class="setting-item">
                <span class="setting-label">Theme</span>
                <select class="setting-select" data-path="theme">
                    <option value="dark" ${s.theme === 'dark' ? 'selected' : ''}>Obsidian</option>
                    <option value="oled" ${s.theme === 'oled' ? 'selected' : ''}>True Black</option>
                </select>
            </div>
        </div>
        
        <div class="settings-group">
            <div class="settings-group__title">DATA MANAGEMENT</div>
            <button id="reset-data-btn" class="btn-danger-outline">Reset All Data</button>
        </div>
      </div>
    `;

    this._attachEventListeners();
  }

  _attachEventListeners() {
    this.container.querySelector('.panel__close').addEventListener('click', this.onClose);

    this.container.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('change', (e) => {
        const path = el.dataset.path;
        let val = el.type === 'checkbox' ? el.checked : el.value;
        if (el.type === 'number') val = parseInt(val);

        this.store.set(path, val);
        if (path === 'theme') {
          document.documentElement.setAttribute('data-theme', val);
        }
      });
    });

    // Reset Data
    const resetBtn = this.container.querySelector('#reset-data-btn');
    resetBtn.addEventListener('click', () => {
      if (resetBtn.dataset.confirm === 'true') {
        localStorage.clear();
        location.reload();
      } else {
        resetBtn.dataset.confirm = 'true';
        resetBtn.textContent = 'Confirm Wipe?';
        resetBtn.classList.add('confirming');

        setTimeout(() => {
          resetBtn.dataset.confirm = 'false';
          resetBtn.textContent = 'Reset All Data';
          resetBtn.classList.remove('confirming');
        }, 3000);
      }
    });
  }
}
