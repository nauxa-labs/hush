/**
 * Warkop Fokus - Audio Controller
 * Uses Web Audio API to generate ambient sounds programmatically
 * This ensures the app works offline without needing external audio files
 */

class AudioController {
  constructor() {
    this.audioContext = null;
    this.sounds = [
      {
        id: 'rain',
        name: 'Hujan',
        icon: '🌧️',
        isPlaying: false,
        volume: 0.5,
        nodes: null
      },
      {
        id: 'cafe',
        name: 'Café',
        icon: '☕',
        isPlaying: false,
        volume: 0.5,
        nodes: null
      },
      {
        id: 'fire',
        name: 'Perapian',
        icon: '🔥',
        isPlaying: false,
        volume: 0.5,
        nodes: null
      },
      {
        id: 'nature',
        name: 'Alam',
        icon: '🌲',
        isPlaying: false,
        volume: 0.5,
        nodes: null
      },
      {
        id: 'ocean',
        name: 'Ombak',
        icon: '🌊',
        isPlaying: false,
        volume: 0.5,
        nodes: null
      },
      {
        id: 'typing',
        name: 'Ngetik',
        icon: '⌨️',
        isPlaying: false,
        volume: 0.5,
        nodes: null
      }
    ];

    this.grid = document.getElementById('soundGrid');

    this.init();
  }

  init() {
    this.renderSoundCards();
  }

  initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }

  renderSoundCards() {
    this.grid.innerHTML = this.sounds.map(sound => `
      <div class="sound-card" data-sound-id="${sound.id}" onclick="audioController.toggleSound('${sound.id}')">
        <span class="sound-icon">${sound.icon}</span>
        <span class="sound-name">${sound.name}</span>
        <div class="volume-control" onclick="event.stopPropagation()">
          <span class="volume-icon">🔊</span>
          <input 
            type="range" 
            class="volume-slider" 
            min="0" 
            max="100" 
            value="${sound.volume * 100}"
            oninput="audioController.setVolume('${sound.id}', this.value)"
          >
        </div>
      </div>
    `).join('');
  }

  toggleSound(soundId) {
    const sound = this.sounds.find(s => s.id === soundId);
    if (!sound) return;

    const card = document.querySelector(`[data-sound-id="${soundId}"]`);

    if (sound.isPlaying) {
      this.stopSound(sound);
      card.classList.remove('active');
    } else {
      this.initAudioContext();
      this.playSound(sound);
      card.classList.add('active');
    }
  }

  playSound(sound) {
    const ctx = this.audioContext;
    const gainNode = ctx.createGain();
    gainNode.gain.value = sound.volume;
    gainNode.connect(ctx.destination);

    let nodes = { gainNode };

    // Generate different sounds based on type
    switch (sound.id) {
      case 'rain':
        nodes = this.createRainSound(gainNode);
        break;
      case 'cafe':
        nodes = this.createCafeSound(gainNode);
        break;
      case 'fire':
        nodes = this.createFireSound(gainNode);
        break;
      case 'nature':
        nodes = this.createNatureSound(gainNode);
        break;
      case 'ocean':
        nodes = this.createOceanSound(gainNode);
        break;
      case 'typing':
        nodes = this.createTypingSound(gainNode);
        break;
    }

    nodes.gainNode = gainNode;
    sound.nodes = nodes;
    sound.isPlaying = true;
  }

  stopSound(sound) {
    if (sound.nodes) {
      // Stop all oscillators and sources
      Object.values(sound.nodes).forEach(node => {
        if (node && typeof node.stop === 'function') {
          try { node.stop(); } catch (e) { }
        }
        if (node && typeof node.disconnect === 'function') {
          try { node.disconnect(); } catch (e) { }
        }
      });
      sound.nodes = null;
    }
    sound.isPlaying = false;
  }

  // Brown noise for rain sound
  createRainSound(gainNode) {
    const ctx = this.audioContext;
    const bufferSize = 4096;

    // Create brown noise using ScriptProcessor (or AudioWorklet for modern browsers)
    const noiseNode = ctx.createScriptProcessor(bufferSize, 1, 1);
    let lastOut = 0.0;

    noiseNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain
      }
    };

    // Add some filtering for rain-like texture
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 400;

    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 100;

    noiseNode.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(gainNode);

    return { noiseNode, lowpass, highpass, gainNode };
  }

  // Cafe ambient - layered noise for realistic coffee shop vibe
  createCafeSound(gainNode) {
    const ctx = this.audioContext;
    const bufferSize = 4096;

    // Main ambient noise (crowd murmur simulation)
    const noiseNode = ctx.createScriptProcessor(bufferSize, 1, 1);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let murmurPhase = 0;
    let machinePhase = 0;

    noiseNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;

        // Pink noise base (crowd ambient)
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        let pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;

        // Gentle volume modulation (simulates conversation waves)
        murmurPhase += 0.00003;
        const murmurMod = 0.7 + 0.3 * Math.sin(murmurPhase * Math.PI * 2);

        // Occasional coffee machine hum simulation
        machinePhase += 0.00001;
        const machineHum = Math.sin(machinePhase * 150) * 0.02 * (Math.sin(machinePhase * 0.5) > 0.8 ? 1 : 0);

        output[i] = (pink * 0.15 * murmurMod) + machineHum;
      }
    };

    // Bandpass filter for voice-like frequencies
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 600;
    bandpass.Q.value = 0.8;

    // Low shelf for warmth
    const lowShelf = ctx.createBiquadFilter();
    lowShelf.type = 'lowshelf';
    lowShelf.frequency.value = 200;
    lowShelf.gain.value = 4;

    // High cut to soften
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 2000;

    noiseNode.connect(bandpass);
    bandpass.connect(lowShelf);
    lowShelf.connect(lowpass);
    lowpass.connect(gainNode);

    return { noiseNode, bandpass, lowShelf, lowpass, gainNode };
  }

  // Fire crackling sound
  createFireSound(gainNode) {
    const ctx = this.audioContext;
    const bufferSize = 4096;

    const noiseNode = ctx.createScriptProcessor(bufferSize, 1, 1);
    let crackleTimer = 0;
    let crackleIntensity = 0;

    noiseNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // Base crackle
        const noise = (Math.random() * 2 - 1) * 0.3;

        // Random pops and crackles
        crackleTimer++;
        if (crackleTimer > Math.random() * 1000 + 200) {
          crackleIntensity = Math.random() * 0.8;
          crackleTimer = 0;
        }
        crackleIntensity *= 0.995;

        output[i] = noise * (0.2 + crackleIntensity);
      }
    };

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 500;
    bandpass.Q.value = 0.5;

    noiseNode.connect(bandpass);
    bandpass.connect(gainNode);

    return { noiseNode, bandpass, gainNode };
  }

  // Nature/forest sounds - wind and subtle tones
  createNatureSound(gainNode) {
    const ctx = this.audioContext;
    const bufferSize = 4096;

    // Wind-like noise
    const noiseNode = ctx.createScriptProcessor(bufferSize, 1, 1);
    let windPhase = 0;

    noiseNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Modulate with slow sine wave for wind gusts
        windPhase += 0.00001;
        const windMod = 0.5 + 0.5 * Math.sin(windPhase * Math.PI * 2);
        output[i] = white * windMod * 0.4;
      }
    };

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 600;

    // Add subtle bird-like chirps with oscillator
    const birdOsc = ctx.createOscillator();
    birdOsc.type = 'sine';
    birdOsc.frequency.value = 2000;

    const birdGain = ctx.createGain();
    birdGain.gain.value = 0;

    // Modulate bird sounds
    const birdLFO = ctx.createOscillator();
    birdLFO.frequency.value = 0.1;
    const birdLFOGain = ctx.createGain();
    birdLFOGain.gain.value = 0.02;

    birdLFO.connect(birdLFOGain);
    birdLFOGain.connect(birdGain.gain);

    birdOsc.connect(birdGain);
    birdGain.connect(gainNode);
    birdOsc.start();
    birdLFO.start();

    noiseNode.connect(lowpass);
    lowpass.connect(gainNode);

    return { noiseNode, lowpass, birdOsc, birdGain, birdLFO, birdLFOGain, gainNode };
  }

  // Ocean waves
  createOceanSound(gainNode) {
    const ctx = this.audioContext;
    const bufferSize = 4096;

    const noiseNode = ctx.createScriptProcessor(bufferSize, 1, 1);
    let autoWave = 0;
    let lastOut = 0;

    noiseNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown-ish noise approximation
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];

        // Slow wave modulation
        autoWave += 0.00005;
        const wave = Math.sin(autoWave);
        output[i] *= 2 + wave;
      }
    };

    // Lowpass filter that moves with the waves
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 400;

    // LFO to modulate filter frequency (simulating wave crashing/receding)
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15; // Slow waves

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 300; // Filter range

    lfo.connect(lfoGain);
    lfoGain.connect(lowpass.frequency);
    lfo.start();

    noiseNode.connect(lowpass);
    lowpass.connect(gainNode);

    return { noiseNode, lowpass, lfo, lfoGain, gainNode };
  }

  // Mechanical Keyboard Typing (ASMR)
  createTypingSound(gainNode) {
    const ctx = this.audioContext;
    const bufferSize = 4096;
    const noiseNode = ctx.createScriptProcessor(bufferSize, 1, 1);

    let nextKeyTime = 0;

    noiseNode.onaudioprocess = (e) => {
      const output = e.outputBuffer.getChannelData(0);
      const currentTime = ctx.currentTime;

      // Using noise node just for timing logic to keep it consistent
      // But actual sound is better triggered as oscillator bursts
      for (let i = 0; i < bufferSize; i++) {
        output[i] = 0; // Silent buffer
      }

      // Trigger random key presses
      if (currentTime > nextKeyTime) {
        this.triggerKeyClick(ctx, gainNode);
        // Random interval between typing (fast bursts and pauses)
        const isPause = Math.random() > 0.8;
        const interval = isPause ? Math.random() * 1.5 : 0.1 + Math.random() * 0.2;
        nextKeyTime = currentTime + interval;
      }
    };

    noiseNode.connect(gainNode);
    return { noiseNode, gainNode };
  }

  // Helper for typing sound
  triggerKeyClick(ctx, dest) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'square'; // Clicky
    // Randomize pitch slightly
    osc.frequency.value = 200 + Math.random() * 50;

    filter.type = 'lowpass';
    filter.frequency.value = 800;

    // Short burst envelope
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  setVolume(soundId, value) {
    const sound = this.sounds.find(s => s.id === soundId);
    if (!sound) return;

    const volume = value / 100;
    sound.volume = volume;

    // Update gain node if sound is playing
    if (sound.nodes && sound.nodes.gainNode) {
      sound.nodes.gainNode.gain.value = volume;
    }

    // Update volume icon
    const card = document.querySelector(`[data-sound-id="${soundId}"]`);
    const icon = card.querySelector('.volume-icon');
    if (volume === 0) {
      icon.textContent = '🔇';
    } else if (volume < 0.5) {
      icon.textContent = '🔉';
    } else {
      icon.textContent = '🔊';
    }
  }

  stopAll() {
    this.sounds.forEach(sound => {
      if (sound.isPlaying) {
        this.stopSound(sound);
        const card = document.querySelector(`[data-sound-id="${sound.id}"]`);
        if (card) card.classList.remove('active');
      }
    });
  }
}

// Initialize audio controller
let audioController;
