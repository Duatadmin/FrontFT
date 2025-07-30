// src/services/voicePrewarm.ts
/**
 * Service to pre-warm voice recognition components for faster initialization
 */

import { ASRServiceV3 } from './ASRServiceV3';
import { createRecorder } from '../lib/sepiaRecorder';
import { getASRAudioConstraints } from '../lib/audioConstraints';

class VoicePrewarmService {
  private asrService: ASRServiceV3 | null = null;
  private isPrewarmed = false;
  private prewarmPromise: Promise<void> | null = null;
  
  /**
   * Pre-warm the voice recognition system by:
   * 1. Establishing WebSocket connection early
   * 2. Loading SEPIA modules
   * 3. Requesting microphone permission
   */
  async prewarm(): Promise<void> {
    // Return existing promise if already prewarming
    if (this.prewarmPromise) {
      return this.prewarmPromise;
    }
    
    if (this.isPrewarmed) {
      return Promise.resolve();
    }
    
    this.prewarmPromise = this._doPrewarm();
    return this.prewarmPromise;
  }
  
  private async _doPrewarm(): Promise<void> {
    const startTime = performance.now();
    console.log('[VoicePrewarm] Starting pre-warm sequence...');
    
    try {
      // Step 1: Pre-connect WebSocket (but don't keep it open)
      const wsUrl = import.meta.env.VITE_WALKIE_HOOK_WS_URL || 'ws://localhost:8080/ws';
      const wsHost = wsUrl.replace(/^wss?:\/\//, '').replace(/\/.*$/, '');
      
      this.asrService = new ASRServiceV3({
        host: wsHost,
        mode: 'walkie',
        onTranscript: () => {}, // No-op
        onError: (error) => console.warn('[VoicePrewarm] ASR error during prewarm:', error),
      });
      
      // Connect and immediately disconnect to pre-warm the connection
      await this.asrService.connect();
      await this.asrService.disconnect();
      
      console.log('[VoicePrewarm] WebSocket pre-warmed');
      
      // Step 2: Pre-load SEPIA modules by creating a recorder
      const audioConstraints = getASRAudioConstraints({
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 16000
      });
      
      const recorder = await createRecorder({
        targetSampleRate: 16000,
        mono: true,
        audioConstraints: audioConstraints.audio as MediaTrackConstraints,
        sepiaModulesPath: '/sepia/modules/',
        onError: (err) => console.warn('[VoicePrewarm] Recorder error during prewarm:', err),
      });
      
      // Close the recorder immediately
      recorder.close();
      
      console.log('[VoicePrewarm] SEPIA modules pre-loaded');
      
      // Step 3: Pre-request microphone permission (optional - only if user has used voice before)
      const hasUsedVoice = localStorage.getItem('has-used-voice') === 'true';
      if (hasUsedVoice) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          console.log('[VoicePrewarm] Microphone permission cached');
        } catch (err) {
          console.warn('[VoicePrewarm] Could not pre-request microphone permission:', err);
        }
      }
      
      const elapsedTime = performance.now() - startTime;
      console.log(`[VoicePrewarm] Pre-warm completed in ${elapsedTime.toFixed(2)}ms`);
      
      this.isPrewarmed = true;
    } catch (error) {
      console.error('[VoicePrewarm] Pre-warm failed:', error);
      // Don't throw - pre-warm failure shouldn't break the app
    } finally {
      this.prewarmPromise = null;
    }
  }
  
  /**
   * Mark that the user has used voice (for permission pre-warming)
   */
  markVoiceUsed(): void {
    localStorage.setItem('has-used-voice', 'true');
  }
  
  /**
   * Reset pre-warm state (useful for testing)
   */
  reset(): void {
    this.isPrewarmed = false;
    this.prewarmPromise = null;
    if (this.asrService) {
      this.asrService.disconnect().catch(() => {});
      this.asrService = null;
    }
  }
}

// Export singleton instance
export const voicePrewarmService = new VoicePrewarmService();