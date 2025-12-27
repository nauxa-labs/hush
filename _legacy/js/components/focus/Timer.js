// File: js/components/focus/Timer.js
export class Timer {
  constructor(container, { timerService, settingsStore }) {
    this.container = container;
    this.timer = timerService;
    this.settings = settingsStore;
    this.editingField = null; // 'minutes' | 'seconds' | null

    this.timer.on('tick', () => this.updateDisplay());
    this.timer.on('timer:reset', () => this.render());
    this.timer.on('timer:complete', () => this.render());
    this.timer.on('timer:start', () => this.render()); // Re-render to show Pause button
    this.timer.on('timer:pause', () => this.render()); // Re-render to show Play button

    this.render();
  }

  render() {
    const { timeRemaining, isRunning, mode } = this.timer.data;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    this.container.className = `timer timer--${mode} ${isRunning ? 'timer--running' : ''}`;

    this.container.innerHTML = `
      <div class="timer__display">
        <span class="timer__minutes" data-field="minutes">${String(minutes).padStart(2, '0')}</span>
        <span class="timer__separator">:</span>
        <span class="timer__seconds" data-field="seconds">${String(seconds).padStart(2, '0')}</span>
      </div>
      
      <div class="timer__controls">
        <button class="timer__btn timer__btn--secondary" data-action="reset" title="Reset">↺</button>
        <button class="timer__btn timer__btn--primary" data-action="toggle">
          ${isRunning ? '⏸' : '▶'}
        </button>
        <button class="timer__btn timer__btn--secondary" data-action="skip" title="Skip">⏭</button>
      </div>
      
      <div class="timer__mode">
        ${mode === 'focus' ? '🎯 Focus' : '☕ Break'}
      </div>
      
      <div class="timer__quick-adjust">
        <button class="timer__adjust" data-adjust="-300">-5m</button>
        <button class="timer__adjust" data-adjust="-60">-1m</button>
        <button class="timer__adjust" data-adjust="+60">+1m</button>
        <button class="timer__adjust" data-adjust="+300">+5m</button>
      </div>
    `;

    this._attachEventListeners();
  }

  updateDisplay() {
    const { timeRemaining } = this.timer.data;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    const minEl = this.container.querySelector('.timer__minutes');
    const secEl = this.container.querySelector('.timer__seconds');

    if (minEl && !minEl.querySelector('input')) minEl.textContent = String(minutes).padStart(2, '0');
    if (secEl && !secEl.querySelector('input')) secEl.textContent = String(seconds).padStart(2, '0');
  }

  _attachEventListeners() {
    // Time display click - enter edit mode
    this.container.querySelectorAll('[data-field]').forEach(el => {
      el.addEventListener('click', () => {
        if (!this.timer.data.isRunning) {
          this._enterEditMode(el.dataset.field);
        }
      });
    });

    // Control buttons
    this.container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        switch (action) {
          case 'toggle':
            this.timer.data.isRunning ? this.timer.pause() : this.timer.start();
            break;
          case 'reset':
            this.timer.reset();
            break;
          case 'skip':
            this.timer.complete();
            break;
        }
      });
    });

    // Quick adjust buttons
    this.container.querySelectorAll('[data-adjust]').forEach(btn => {
      btn.addEventListener('click', () => {
        const delta = parseInt(btn.dataset.adjust);
        this.timer.adjustTime(delta);
      });
    });
  }

  _enterEditMode(field) {
    const el = this.container.querySelector(`[data-field="${field}"]`);
    const currentValue = parseInt(el.textContent);

    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'timer__input';
    input.value = currentValue;
    input.min = 0;
    input.max = field === 'minutes' ? 120 : 59;

    el.replaceWith(input);
    input.focus();
    input.select();

    const save = () => {
      let newMinutes = Math.floor(this.timer.data.timeRemaining / 60);
      let newSeconds = this.timer.data.timeRemaining % 60;

      const val = parseInt(input.value) || 0;

      if (field === 'minutes') {
        newMinutes = Math.max(0, Math.min(120, val));
      } else {
        newSeconds = Math.max(0, Math.min(59, val));
      }

      const newTime = newMinutes * 60 + newSeconds;
      this.timer.data.timeRemaining = newTime;
      this.timer.data.totalDuration = newTime; // Editing updates total duration concept
      this.timer._commit();
      this.render();
    };

    input.addEventListener('blur', save);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        save();
        input.blur(); // Trigger blur to save
      }
      if (e.key === 'Escape') this.render();
    });
  }
}
