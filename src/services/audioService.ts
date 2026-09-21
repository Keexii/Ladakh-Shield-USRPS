class AudioService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = false;

  constructor() {
    const saved = localStorage.getItem('ladakh_shield_sound');
    this.soundEnabled = saved === 'true';
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    localStorage.setItem('ladakh_shield_sound', enabled ? 'true' : 'false');
  }

  private initContext() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playCriticalAlert(): void {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      // High-pitched double alarm beep (880Hz / 1200Hz)
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.1); // E6

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio autoplay policy catch
    }
  }

  public playWarningAlert(): void {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Audio policy catch
    }
  }

  public playClick(): void {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // ignore
    }
  }
}

export const soundManager = new AudioService();
