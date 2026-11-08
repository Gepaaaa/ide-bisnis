/**
 * Robust Singleton Audio Manager for "A Letter for Her"
 * 
 * - Manages HTML5 Audio playback of /assets/audio/her.mp3
 * - Provides graceful fallback to Web Audio romantic acoustic chords if mp3 is not yet placed
 * - Avoids duplicate audio instances
 * - Smooth volume transitions
 * - Exposes real currentTime, duration, isPlaying, isMuted, and error status
 */

type AudioListener = () => void;

class AudioManager {
  private static instance: AudioManager | null = null;
  private audio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private synthInterval: number | null = null;
  private isUsingSynth = false;

  private listeners: Set<AudioListener> = new Set();

  public isPlaying = false;
  public isMuted = false;
  public volume = 0.85;
  public currentTime = 0;
  public duration = 0;
  public hasError = false;
  public isLoaded = false;
  public audioSrc = "/assets/audio/her.mp3";

  private constructor() {
    // Singleton
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public init(src: string) {
    if (this.audio) return;
    this.audioSrc = src;
    this.audio = new Audio();
    this.audio.preload = "auto";
    this.audio.src = src;
    this.audio.volume = this.volume;
    this.audio.loop = true;

    this.audio.addEventListener("loadedmetadata", () => {
      if (this.audio) {
        this.duration = this.audio.duration || 0;
        this.isLoaded = true;
        this.hasError = false;
        this.notify();
      }
    });

    this.audio.addEventListener("timeupdate", () => {
      if (this.audio && !this.isUsingSynth) {
        this.currentTime = this.audio.currentTime;
        this.duration = this.audio.duration || 0;
        this.notify();
      }
    });

    this.audio.addEventListener("play", () => {
      this.isPlaying = true;
      this.notify();
    });

    this.audio.addEventListener("pause", () => {
      this.isPlaying = false;
      this.notify();
    });

    this.audio.addEventListener("ended", () => {
      this.isPlaying = false;
      this.notify();
    });

    this.audio.addEventListener("error", () => {
      // Audio file not found or unsupported format
      this.hasError = true;
      this.isLoaded = false;
      if (this.isPlaying) {
        this.startSynthFallback();
      }
      this.notify();
    });
  }

  public subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  public async play(): Promise<void> {
    if (this.hasError) {
      this.startSynthFallback();
      return;
    }

    if (this.audio) {
      try {
        await this.audio.play();
        this.isPlaying = true;
        this.notify();
      } catch (err) {
        // Autoplay policy or 404
        console.warn("Audio play blocked or file not found, starting soft synthesizer fallback:", err);
        this.startSynthFallback();
      }
    } else {
      this.startSynthFallback();
    }
  }

  public pause(): void {
    if (this.isUsingSynth) {
      this.stopSynthFallback();
      this.isPlaying = false;
      this.notify();
      return;
    }

    if (this.audio) {
      this.audio.pause();
      this.isPlaying = false;
      this.notify();
    }
  }

  public togglePlay(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    if (this.audio) {
      this.audio.muted = this.isMuted;
    }
    this.notify();
  }

  public seek(time: number): void {
    if (this.audio && !this.isUsingSynth && this.duration > 0) {
      this.audio.currentTime = Math.max(0, Math.min(time, this.duration));
      this.currentTime = this.audio.currentTime;
      this.notify();
    }
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.audio) {
      this.audio.volume = this.volume;
    }
    this.notify();
  }

  /**
   * Realtime Romantic Acoustic Piano Chords Synthesizer (Fallback)
   * Plays soft harmonic chords (Cmaj7 - Am7 - Fmaj7 - G) with warm lowpass filter
   * ensuring emotional sound even before the user puts their her.mp3 file!
   */
  private startSynthFallback() {
    this.isUsingSynth = true;
    this.isPlaying = true;
    this.notify();

    try {
      if (!this.audioCtx) {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioCtxClass();
      }

      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      if (this.synthInterval) return;

      // Chord frequencies: Cmaj7, Am9, Fmaj7, G6
      const chordProgressions = [
        [261.63, 329.63, 392.00, 493.88], // C, E, G, B
        [220.00, 261.63, 329.63, 392.00], // A, C, E, G
        [174.61, 220.00, 261.63, 329.63], // F, A, C, E
        [196.00, 246.94, 293.66, 392.00], // G, B, D, G
      ];

      let chordIdx = 0;
      let step = 0;

      const playChordNote = () => {
        if (!this.isPlaying || this.isMuted || !this.audioCtx) return;

        const chord = chordProgressions[chordIdx];
        const freq = chord[step % chord.length];

        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();

        // Warm electric piano / Rhodes tone
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, this.audioCtx.currentTime);

        const now = this.audioCtx.currentTime;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08 * this.volume, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now);
        osc.stop(now + 2.5);

        step++;
        this.currentTime += 0.8;
        if (step % chord.length === 0) {
          chordIdx = (chordIdx + 1) % chordProgressions.length;
        }
        this.notify();
      };

      playChordNote();
      this.synthInterval = window.setInterval(playChordNote, 800);
    } catch (e) {
      console.warn("Synth fallback unavailable:", e);
    }
  }

  private stopSynthFallback() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    this.isUsingSynth = false;
  }

  public reset(): void {
    this.pause();
    this.stopSynthFallback();
    if (this.audio) {
      this.audio.currentTime = 0;
    }
    this.currentTime = 0;
    this.isPlaying = false;
    this.notify();
  }
}

export const audioManager = AudioManager.getInstance();
