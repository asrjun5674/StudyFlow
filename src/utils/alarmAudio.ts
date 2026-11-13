/**
 * Web Audio API synthesized alarm chime & melody
 * Zero external audio file dependencies - 100% reliable in any browser.
 */

class AlarmAudioManager {
  private audioCtx: AudioContext | null = null;
  private isRinging: boolean = false;
  private loopInterval: number | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch (e) {
      console.warn('Web Audio Context not allowed or unsupported:', e);
      return null;
    }
  }

  /**
   * Plays a cheerful marimba/bell chime note
   */
  private playBellTone(freq: number, startTime: number, duration: number, volume: number = 0.25) {
    const ctx = this.getContext();
    if (!ctx) return;

    // Fundamental oscillator (sine for pure bell tone)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Harmonic overtone for natural acoustic sparkle
    const overtone = ctx.createOscillator();
    overtone.type = 'triangle';
    overtone.frequency.setValueAtTime(freq * 2.756, startTime);

    // Gain envelope with percussive attack and exponential decay
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.015);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    const overtoneGain = ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.0001, startTime);
    overtoneGain.gain.linearRampToValueAtTime(volume * 0.35, startTime + 0.01);
    overtoneGain.gain.exponentialRampToValueAtTime(0.001, startTime + (duration * 0.5));

    osc.connect(gainNode);
    overtone.connect(overtoneGain);
    gainNode.connect(ctx.destination);
    overtoneGain.connect(ctx.destination);

    osc.start(startTime);
    overtone.start(startTime);

    osc.stop(startTime + duration);
    overtone.stop(startTime + duration);
  }

  /**
   * Plays a single melodic phrase (approx 1.8 seconds)
   */
  public playMelodicPhrase() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Notes: C5 (523.25), E5 (659.25), G5 (783.99), B5 (987.77), C6 (1046.5)
    const notes = [
      { freq: 523.25, time: 0.00, dur: 0.45 },
      { freq: 659.25, time: 0.18, dur: 0.45 },
      { freq: 783.99, time: 0.36, dur: 0.50 },
      { freq: 1046.5, time: 0.54, dur: 0.85 },
      { freq: 783.99, time: 0.95, dur: 0.40 },
      { freq: 1046.5, time: 1.15, dur: 0.90 },
    ];

    notes.forEach((n) => {
      this.playBellTone(n.freq, now + n.time, n.dur, 0.35);
    });
  }

  public playPreviewChime() {
    this.playMelodicPhrase();
  }

  /**
   * Starts repeating the alarm ringtone until stopped
   */
  public startRinging() {
    if (this.isRinging) return;
    this.isRinging = true;

    // Play immediately
    this.playMelodicPhrase();

    // Loop every 2.4 seconds
    this.loopInterval = window.setInterval(() => {
      if (this.isRinging) {
        this.playMelodicPhrase();
      }
    }, 2400);
  }

  public startRingingLoop() {
    this.startRinging();
  }

  /**
   * Stops the ongoing alarm ringtone
   */
  public stopRinging() {
    this.isRinging = false;
    if (this.loopInterval !== null) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
  }

  public stopRingingLoop() {
    this.stopRinging();
  }

  public getIsRinging(): boolean {
    return this.isRinging;
  }
}

export const AlarmAudio = new AlarmAudioManager();
export const alarmAudio = AlarmAudio;
export default AlarmAudio;
