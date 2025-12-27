// File: js/components/panels/AudioMixer.js
import { Icons } from '../../utils/Icons.js';

export class AudioMixer {
  constructor(container, { settingsStore, onClose }) {
    this.container = container;
    this.store = settingsStore;
    this.onClose = onClose;

    this.container.parentElement.classList.add('audio-drawer');
    this.render();
  }

  render() {
    const audio = this.store.data.audio;

    this.container.innerHTML = `
        <div class="panel__header">
            <div class="panel__title">
            ${Icons.Music} SOUNDSCAPES
            </div>
            <button class="panel__close">${Icons.Close}</button>
        </div>

        <div class="panel__content">
            <div class="setting-item" style="margin-bottom:40px;">
                <span class="setting-label">MASTER</span>
                <input type="range" min="0" max="100" value="${audio.masterVolume * 100}" id="master-volume" class="slider">
            </div>

            <div class="mixer-grid">
                ${Object.entries(audio.tracks).map(([key, track]) => `
                    <div class="mixer-track ${track.enabled ? 'active' : ''}" data-track="${key}">
                        <div class="mixer-track__icon">
                            ${this._getIcon(key)}
                        </div>
                        <span class="mixer-track__name">${key}</span>
                        <input type="range" min="0" max="100" value="${track.volume * 100}" class="track-volume slider" data-track="${key}" onclick="event.stopPropagation()">
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    this._attachEventListeners();
  }

  _getIcon(key) {
    // Maps to emojis currently, but should ideally be SVGs. 
    // Using generic SVG for now or specific ones if added to Icons.js
    // Let's stick to emojis for specific tracks OR generic music icon?
    // Spec said "NO EMOJIS". 
    // I'll stick to a generic waveform or play icon for now as specific SVG assets weren't added.
    // Or I can add them to Icons.js quickly? 
    // Detailed plan didn't specify adding Rain/Fire icons to Icons.js.
    // I'll use the Music note or Play icon for all tracks for consistency with "Minimal".
    return Icons.Play;
  }

  _attachEventListeners() {
    this.container.querySelector('.panel__close').addEventListener('click', () => {
      this.container.parentElement.classList.remove('audio-drawer');
      this.onClose();
    });

    this.container.querySelector('#master-volume').addEventListener('input', (e) => {
      const val = e.target.value / 100;
      this.store.set('audio.masterVolume', val);
    });

    this.container.querySelectorAll('.mixer-track').forEach(el => {
      el.addEventListener('click', () => {
        const trackKey = el.dataset.track;
        const isEnabled = !this.store.data.audio.tracks[trackKey].enabled;
        this.store.set(`audio.tracks.${trackKey}.enabled`, isEnabled);

        if (isEnabled) el.classList.add('active');
        else el.classList.remove('active');
      });
    });

    this.container.querySelectorAll('.track-volume').forEach(range => {
      range.addEventListener('input', (e) => {
        const trackKey = range.dataset.track;
        const val = e.target.value / 100;
        this.store.set(`audio.tracks.${trackKey}.volume`, val);

        if (!this.store.data.audio.tracks[trackKey].enabled) {
          this.store.set(`audio.tracks.${trackKey}.enabled`, true);
          this.container.querySelector(`.mixer-track[data-track="${trackKey}"]`).classList.add('active');
        }
      });

      range.addEventListener('click', e => e.stopPropagation());
    });
  }
}
