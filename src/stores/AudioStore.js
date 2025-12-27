import { makeAutoObservable, runInAction } from 'mobx';

const STORAGE_KEY = 'hush_audio_playlist';

// Parse YouTube URL to extract video ID
function extractVideoId(input) {
  if (!input) return null;

  // Already a video ID (11 chars, alphanumeric with - and _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) {
    return input.trim();
  }

  // Full URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/.*[?&]v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export class AudioStore {
  // Playback state
  isPlaying = false;
  currentIndex = 0;

  // Playlist
  playlist = [];

  // Auto-rotate
  autoRotate = true;

  // Mini player visibility (session-based dismiss)
  showMiniPlayer = true;

  // Atmosphere state
  activeAtmosphere = 'silence';
  atmosphereVolume = 0.5;

  // Music (YouTube) volume
  musicVolume = 0.7;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  // === Computed ===
  get currentVideo() {
    return this.playlist[this.currentIndex] || null;
  }

  get currentVideoId() {
    return this.currentVideo?.id || null;
  }

  get currentVideoTitle() {
    return this.currentVideo?.title || 'No video';
  }

  get hasPlaylist() {
    return this.playlist.length > 0;
  }

  // === Actions ===
  play(index = null) {
    if (index !== null && index >= 0 && index < this.playlist.length) {
      this.currentIndex = index;
    }
    if (this.hasPlaylist) {
      this.isPlaying = true;
    }
  }

  pause() {
    this.isPlaying = false;
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  stop() {
    this.isPlaying = false;
  }

  next() {
    if (!this.hasPlaylist) return;
    this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
    // Keep playing if was playing
  }

  previous() {
    if (!this.hasPlaylist) return;
    this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
  }

  dismissMiniPlayer() {
    this.showMiniPlayer = false;
  }

  showMiniPlayerWidget() {
    this.showMiniPlayer = true;
  }

  setAutoRotate(value) {
    this.autoRotate = value;
    this.saveToStorage();
  }

  // === Atmosphere Control ===
  setAtmosphere(atmosphereId) {
    this.activeAtmosphere = atmosphereId;
    this.saveToStorage();
  }

  setAtmosphereVolume(volume) {
    this.atmosphereVolume = Math.max(0, Math.min(1, volume));
    this.saveToStorage();
  }

  get isAtmosphereActive() {
    return this.activeAtmosphere !== 'silence';
  }

  // === Music Volume Control ===
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.saveToStorage();
  }

  // === Playlist Management ===
  async addToPlaylist(urlOrId) {
    const videoId = extractVideoId(urlOrId);
    if (!videoId) return false;

    // Check if already in playlist
    if (this.playlist.some(item => item.id === videoId)) {
      return false;
    }

    // Add with placeholder title immediately
    const placeholderTitle = `Loading...`;
    runInAction(() => {
      this.playlist.push({ id: videoId, title: placeholderTitle });
    });
    this.saveToStorage();

    // Fetch real title from YouTube oEmbed API (no API key needed)
    try {
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (response.ok) {
        const data = await response.json();
        runInAction(() => {
          const item = this.playlist.find(item => item.id === videoId);
          if (item) {
            item.title = data.title || `Video ${videoId.substring(0, 6)}...`;
            this.saveToStorage();
          }
        });
      }
    } catch (e) {
      // Fallback to video ID if fetch fails
      runInAction(() => {
        const item = this.playlist.find(item => item.id === videoId);
        if (item && item.title === placeholderTitle) {
          item.title = `Video ${videoId.substring(0, 6)}...`;
          this.saveToStorage();
        }
      });
    }

    return true;
  }

  removeFromPlaylist(videoId) {
    const index = this.playlist.findIndex(item => item.id === videoId);
    if (index === -1) return;

    this.playlist.splice(index, 1);

    // Adjust currentIndex if needed
    if (this.currentIndex >= this.playlist.length) {
      this.currentIndex = Math.max(0, this.playlist.length - 1);
    }

    this.saveToStorage();
  }

  updateVideoTitle(videoId, title) {
    const item = this.playlist.find(item => item.id === videoId);
    if (item) {
      item.title = title;
      this.saveToStorage();
    }
  }

  reorderPlaylist(fromIndex, toIndex) {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= this.playlist.length || toIndex >= this.playlist.length) return;

    const [item] = this.playlist.splice(fromIndex, 1);
    this.playlist.splice(toIndex, 0, item);

    // Update currentIndex if it was affected
    if (this.currentIndex === fromIndex) {
      this.currentIndex = toIndex;
    } else if (fromIndex < this.currentIndex && toIndex >= this.currentIndex) {
      this.currentIndex--;
    } else if (fromIndex > this.currentIndex && toIndex <= this.currentIndex) {
      this.currentIndex++;
    }

    this.saveToStorage();
  }

  shufflePlaylist() {
    if (this.playlist.length <= 1) return;

    // Fisher-Yates shuffle
    const currentVideoId = this.currentVideoId;
    for (let i = this.playlist.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.playlist[i], this.playlist[j]] = [this.playlist[j], this.playlist[i]];
    }

    // Restore currentIndex to point to same video
    if (currentVideoId) {
      const newIndex = this.playlist.findIndex(item => item.id === currentVideoId);
      if (newIndex !== -1) {
        this.currentIndex = newIndex;
      }
    }

    this.saveToStorage();
  }

  // === Storage ===
  loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        runInAction(() => {
          this.playlist = data.playlist || [];
          this.autoRotate = data.autoRotate ?? true;
          this.activeAtmosphere = data.activeAtmosphere || 'silence';
          this.atmosphereVolume = data.atmosphereVolume ?? 0.5;
          this.musicVolume = data.musicVolume ?? 0.7;
        });
      } else {
        // Default playlist
        runInAction(() => {
          this.playlist = [
            { id: 'jfKfPfyJRdk', title: 'Lofi Girl Radio' },
            { id: 'P9yy79Hbv60', title: 'Chill Beats' },
          ];
        });
      }
    } catch (e) {
      console.error('Failed to load audio playlist:', e);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        playlist: this.playlist,
        autoRotate: this.autoRotate,
        activeAtmosphere: this.activeAtmosphere,
        atmosphereVolume: this.atmosphereVolume,
        musicVolume: this.musicVolume,
      }));
    } catch (e) {
      console.error('Failed to save audio playlist:', e);
    }
  }
}
