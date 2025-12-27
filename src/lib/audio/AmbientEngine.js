/**
 * AmbientEngine - Web Audio synthesis for ambient soundscapes
 * 
 * Each atmosphere is a combination of synthesized sounds:
 * - Noise generators (white, pink, brown)
 * - Filtered and modulated for different textures
 * - Smooth transitions between atmospheres
 */

// Atmosphere definitions
export const ATMOSPHERES = {
  silence: {
    id: 'silence',
    name: 'Silence',
    icon: '🔇',
    description: 'Pure focus, no distractions',
    layers: []
  },
  'rainy-study': {
    id: 'rainy-study',
    name: 'Rainy Study',
    icon: '🌧️',
    description: 'Gentle rain on windows',
    layers: [
      { type: 'rain', volume: 0.7 },
      { type: 'thunder', volume: 0.2, interval: 15000 }
    ]
  },
  cafe: {
    id: 'cafe',
    name: 'Café Corner',
    icon: '☕',
    description: 'Cozy coffee shop ambiance',
    layers: [
      { type: 'cafe-murmur', volume: 0.5 },
      { type: 'espresso', volume: 0.15, interval: 8000 }
    ]
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Dawn',
    icon: '🌊',
    description: 'Waves on a peaceful shore',
    layers: [
      { type: 'waves', volume: 0.6 },
      { type: 'seagulls', volume: 0.1, interval: 12000 }
    ]
  },
  forest: {
    id: 'forest',
    name: 'Forest Morning',
    icon: '🌲',
    description: 'Birds and gentle breeze',
    layers: [
      { type: 'wind', volume: 0.3 },
      { type: 'birds', volume: 0.4, interval: 4000 }
    ]
  },
  fireplace: {
    id: 'fireplace',
    name: 'Fireplace',
    icon: '🔥',
    description: 'Crackling fire warmth',
    layers: [
      { type: 'fire-crackle', volume: 0.6 }
    ]
  },
  'night-rain': {
    id: 'night-rain',
    name: 'Night Rain',
    icon: '🌙',
    description: 'Heavy rain and distant thunder',
    layers: [
      { type: 'heavy-rain', volume: 0.8 },
      { type: 'thunder', volume: 0.4, interval: 20000 },
      { type: 'wind', volume: 0.2 }
    ]
  }
};

export class AmbientEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.activeSources = [];
    this.activeIntervals = [];
    this.currentAtmosphere = 'silence';
    this.isInitialized = false;
  }

  // Initialize audio context (must be called after user interaction)
  init() {
    if (this.isInitialized) return;

    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.5;
      this.isInitialized = true;
    } catch (e) {
      console.error('[AmbientEngine] Failed to initialize:', e);
    }
  }

  // Resume context if suspended (browser policy)
  async resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // Set master volume (0-1)
  setVolume(volume) {
    if (!this.masterGain) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.masterGain.gain.linearRampToValueAtTime(
      clampedVolume,
      this.ctx.currentTime + 0.1
    );
  }

  // Switch to a new atmosphere with crossfade
  async play(atmosphereId) {
    this.init();
    await this.resume();

    const atmosphere = ATMOSPHERES[atmosphereId];
    if (!atmosphere) {
      console.warn(`[AmbientEngine] Unknown atmosphere: ${atmosphereId}`);
      return;
    }

    // Stop current sounds with fade out
    await this.stop(true);

    this.currentAtmosphere = atmosphereId;

    // Start new layers
    for (const layer of atmosphere.layers) {
      this.startLayer(layer);
    }
  }

  // Stop all sounds
  async stop(fadeOut = true) {
    // Clear intervals
    this.activeIntervals.forEach(id => clearInterval(id));
    this.activeIntervals = [];

    // Fade out and stop sources
    const fadeTime = fadeOut ? 0.5 : 0;

    for (const source of this.activeSources) {
      if (source.gainNode) {
        source.gainNode.gain.linearRampToValueAtTime(
          0,
          this.ctx.currentTime + fadeTime
        );
      }
      setTimeout(() => {
        try {
          source.node.stop();
        } catch (e) {
          // Already stopped
        }
      }, fadeTime * 1000);
    }

    this.activeSources = [];

    if (fadeOut) {
      await new Promise(resolve => setTimeout(resolve, fadeTime * 1000));
    }
  }

  // Start a single layer
  startLayer(layer) {
    switch (layer.type) {
      case 'rain':
        this.createRainSound(layer.volume);
        break;
      case 'heavy-rain':
        this.createRainSound(layer.volume, true);
        break;
      case 'thunder':
        this.scheduleThunder(layer.volume, layer.interval);
        break;
      case 'cafe-murmur':
        this.createCafeMurmur(layer.volume);
        break;
      case 'espresso':
        this.scheduleEspresso(layer.volume, layer.interval);
        break;
      case 'waves':
        this.createWaves(layer.volume);
        break;
      case 'seagulls':
        this.scheduleSeagulls(layer.volume, layer.interval);
        break;
      case 'wind':
        this.createWind(layer.volume);
        break;
      case 'birds':
        this.scheduleBirds(layer.volume, layer.interval);
        break;
      case 'fire-crackle':
        this.createFireCrackle(layer.volume);
        break;
    }
  }

  // === NOISE GENERATORS ===

  // Create a noise buffer
  createNoiseBuffer(type = 'white') {
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === 'white') {
        data[i] = white;
      } else if (type === 'brown') {
        // Brown noise: integrate white noise
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Boost
      } else if (type === 'pink') {
        // Simplified pink noise approximation
        data[i] = white * 0.5;
      }
    }

    return buffer;
  }

  // Create looping noise source
  createLoopingNoise(type, filterFreq, volume) {
    const buffer = this.createNoiseBuffer(type);
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = 1;

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0;
    gainNode.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.5);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    source.start();
    this.activeSources.push({ node: source, gainNode });

    return { source, gainNode, filter };
  }

  // === ATMOSPHERE SOUNDS ===

  createRainSound(volume, heavy = false) {
    // Brown noise for rain base
    this.createLoopingNoise('brown', heavy ? 800 : 400, volume * 0.8);

    // Add higher frequency "patter" layer
    this.createLoopingNoise('white', heavy ? 3000 : 2000, volume * 0.2);
  }

  scheduleThunder(volume, interval) {
    const playThunder = () => {
      if (!this.ctx || this.currentAtmosphere === 'silence') return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(50, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 2);

      filter.type = 'lowpass';
      filter.frequency.value = 100;

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 3);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 3);
    };

    // Random delay for first thunder
    setTimeout(playThunder, Math.random() * 5000 + 2000);

    // Schedule periodic thunder
    const id = setInterval(() => {
      setTimeout(playThunder, Math.random() * (interval / 2));
    }, interval);

    this.activeIntervals.push(id);
  }

  createCafeMurmur(volume) {
    // Pink noise filtered for "chatter" feel
    this.createLoopingNoise('pink', 600, volume);
  }

  scheduleEspresso(volume, interval) {
    const playEspresso = () => {
      if (!this.ctx) return;

      // Short hiss sound
      const buffer = this.createNoiseBuffer('white');
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 2000;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      source.start();
      source.stop(this.ctx.currentTime + 1.5);
    };

    const id = setInterval(playEspresso, interval + Math.random() * 3000);
    this.activeIntervals.push(id);
  }

  createWaves(volume) {
    // Modulated brown noise for wave effect
    const { source, gainNode, filter } = this.createLoopingNoise('brown', 300, volume * 0.3);

    // LFO for wave motion
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // Very slow wave rhythm
    lfoGain.gain.value = volume * 0.4;

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);

    lfo.start();
    this.activeSources.push({ node: lfo, gainNode: lfoGain });
  }

  scheduleSeagulls(volume, interval) {
    const playSeagull = () => {
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, this.ctx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 0.3, this.ctx.currentTime + 0.05);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.5);
    };

    const id = setInterval(() => {
      if (Math.random() > 0.5) playSeagull();
    }, interval);
    this.activeIntervals.push(id);
  }

  createWind(volume) {
    // Slowly modulated noise for wind
    this.createLoopingNoise('pink', 200, volume);
  }

  scheduleBirds(volume, interval) {
    const playBird = () => {
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 1500 + Math.random() * 1000;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(baseFreq * 1.3, this.ctx.currentTime + 0.1);
      osc.frequency.linearRampToValueAtTime(baseFreq * 0.9, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(volume * 0.2, this.ctx.currentTime + 0.02);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    };

    const id = setInterval(() => {
      if (Math.random() > 0.3) playBird();
    }, interval);
    this.activeIntervals.push(id);
  }

  createFireCrackle(volume) {
    // Base brown noise for fire rumble
    this.createLoopingNoise('brown', 500, volume * 0.4);

    // Random crackle generator
    const playCrackle = () => {
      if (!this.ctx) return;

      const buffer = this.createNoiseBuffer('white');
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2000 + Math.random() * 2000;
      filter.Q.value = 5;

      const gain = this.ctx.createGain();
      const duration = 0.05 + Math.random() * 0.1;
      gain.gain.setValueAtTime(volume * 0.3, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + duration);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      source.start();
      source.stop(this.ctx.currentTime + duration);
    };

    const id = setInterval(() => {
      if (Math.random() > 0.6) playCrackle();
    }, 200);
    this.activeIntervals.push(id);
  }
}

// Singleton instance
export const ambientEngine = new AmbientEngine();
