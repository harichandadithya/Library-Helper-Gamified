class AudioService {
  private sounds: { [key: string]: HTMLAudioElement } = {};
  private initialized: boolean = false;
  private currentVolume: number = 0.5;

  constructor() {
    // Load saved volume or use default
    const savedVolume = localStorage.getItem('gameVolume');
    if (savedVolume) {
      this.currentVolume = parseFloat(savedVolume);
    }
  }

  private async init() {
    if (this.initialized) return;

    try {
      this.sounds = {
        move: new Audio('/sounds/move.mp3'),
        pickup: new Audio('/sounds/pickup.mp3'),
        place: new Audio('/sounds/place.mp3'),
        complete: new Audio('/sounds/complete.mp3')
      };

      // Pre-load all sounds
      await Promise.all(
        Object.values(this.sounds).map(sound => 
          new Promise((resolve) => {
            sound.addEventListener('canplaythrough', resolve, { once: true });
            sound.addEventListener('error', resolve, { once: true });
            sound.load();
            sound.volume = this.currentVolume;
          })
        )
      );

      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
    }
  }

  async play(soundName: 'move' | 'pickup' | 'place' | 'complete') {
    if (!this.initialized) {
      await this.init();
    }

    const sound = this.sounds[soundName];
    if (sound) {
      try {
        sound.currentTime = 0;
        await sound.play();
      } catch (error) {
        console.warn('Audio playback failed:', error);
      }
    }
  }

  async stop(soundName: 'move' | 'pickup' | 'place' | 'complete') {
    const sound = this.sounds[soundName];
    if (sound) {
      try {
        sound.pause();
        sound.currentTime = 0;
      } catch (error) {
        console.warn('Audio stop failed:', error);
      }
    }
  }

  setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('gameVolume', this.currentVolume.toString());
    Object.values(this.sounds).forEach(sound => {
      sound.volume = this.currentVolume;
    });
  }

  getVolume(): number {
    return this.currentVolume;
  }
}

export const audioService = new AudioService();
