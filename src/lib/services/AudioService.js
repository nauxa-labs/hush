export class AudioService {
  constructor(settingsStore, timerService) {
    this.settingsStore = settingsStore;
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);

    // Subscriptions
    this.initSubscriptions(timerService);

    // Resume context on first user interaction (browser policy)
    window.addEventListener('click', () => {
      if (this.ctx.state === 'suspended') this.ctx.resume();
    }, { once: true });
  }

  initSubscriptions(timerService) {
    // Tick Sound
    timerService.on('tick', () => {
      const settings = this.settingsStore.get('timer');
      if (settings.tickSound) {
        this.playTick();
      }
    });

    // Alarm Sound
    timerService.on('timer:complete', () => {
      const settings = this.settingsStore.get('timer');
      if (settings.completionSound) {
        this.playAlarm();
      }
    });

    // Volume updates
    this.settingsStore.on('change', () => {
      this.updateVolume();
    });
  }

  updateVolume() {
    const volume = this.settingsStore.get('audio.masterVolume') ?? 0.5;
    this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1);
  }

  // Synthesize a satisfying "mechanical" tick
  playTick() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05); // Chirp up

    gain.gain.setValueAtTime(0.05, t); // Quiet
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // Synthesize a bell/chime
  playAlarm() {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Bell-ish harmonics
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t); // A4

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2); // Long decay

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 2.5);
  }

  // For Soundscapes (Rain, Cafe etc) - Placeholder for now until file assets exist
  // Or we could synth noise, but that's complex.
  playTrack(trackName) {
    console.log(`[AudioService] Playing track: ${trackName} (Mock)`);
  }

  // --- YouTube Lofi Player ---
  loadYoutube(videoId) {
    if (this.player) {
      this.player.loadVideoById(videoId);
      return;
    }

    // Initialize API if not present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        this.createPlayer(videoId);
      };
    } else {
      this.createPlayer(videoId);
    }
  }

  createPlayer(videoId) {
    this.player = new window.YT.Player('youtube-audio-player', {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        'autoplay': 1,
        'controls': 0,
        'disablekb': 1,
        'fs': 0
      },
      events: {
        'onReady': (event) => {
          event.target.setVolume(this.settingsStore.get('audio.masterVolume') * 100);
          event.target.playVideo();
        }
      }
    });
  }

  stopYoutube() {
    if (this.player && this.player.stopVideo) {
      this.player.stopVideo();
    }
  }
}
