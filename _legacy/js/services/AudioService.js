// File: js/services/AudioService.js
export class AudioService {
  constructor(settingsStore) {
    this.store = settingsStore;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.tracks = {}; // name -> { element, node, gain }
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);

    // Initialize
    this._initTracks();
    this._syncSettings();

    // Listen for changes
    this.store.on('change', () => this._syncSettings());

    // Resume context on user interaction (handled globally or here)
    document.addEventListener('click', () => {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
    }, { once: true });
  }

  _initTracks() {
    const trackNames = ['rain', 'cafe', 'fire', 'lofi'];
    trackNames.forEach(name => {
      const audio = new Audio(`assets/audio/${name}.mp3`);
      audio.loop = true;
      audio.crossOrigin = 'anonymous';

      const source = this.audioContext.createMediaElementSource(audio);
      const gain = this.audioContext.createGain();

      source.connect(gain);
      gain.connect(this.masterGain);

      this.tracks[name] = {
        element: audio,
        gainNode: gain
      };
    });
  }

  _syncSettings() {
    const { audio } = this.store.data;

    // Master Volume
    this.masterGain.gain.setTargetAtTime(audio.masterVolume, this.audioContext.currentTime, 0.1);

    // Tracks
    Object.entries(audio.tracks).forEach(([name, trackSettings]) => {
      const track = this.tracks[name];
      if (!track) return;

      // Volume
      track.gainNode.gain.setTargetAtTime(trackSettings.volume, this.audioContext.currentTime, 0.1);

      // Play/Pause state
      if (trackSettings.enabled) {
        if (track.element.paused) track.element.play().catch(e => console.warn('Audio play failed:', e));
      } else {
        if (!track.element.paused) track.element.pause();
      }
    });
  }
}
