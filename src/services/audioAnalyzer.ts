// src/services/audioAnalyzer.ts
/**
 * Shared Audio Analyzer Service
 * Provides a singleton Web Audio API analyzer for RMS calculations
 * to avoid multiple analyzers and improve performance
 */

class AudioAnalyzerService {
  private static instance: AudioAnalyzerService;
  private audioContext: AudioContext | null = null;
  private analyzerNode: AnalyserNode | null = null;
  private dataArray: Float32Array | null = null;
  private subscribers: Set<(rms: number) => void> = new Set();
  private animationFrameId: number | null = null;
  private lastUpdateTime: number = 0;
  private readonly UPDATE_INTERVAL_MS = 30; // Match CHUNK_DURATION_MS from sepiaRecorder

  private constructor() {}

  static getInstance(): AudioAnalyzerService {
    if (!AudioAnalyzerService.instance) {
      AudioAnalyzerService.instance = new AudioAnalyzerService();
    }
    return AudioAnalyzerService.instance;
  }

  /**
   * Initialize the audio analyzer with the given audio context
   */
  initialize(audioContext: AudioContext): AnalyserNode {
    if (this.audioContext && this.audioContext !== audioContext) {
      console.warn('[AudioAnalyzer] Replacing existing audio context');
      this.cleanup();
    }

    this.audioContext = audioContext;
    this.analyzerNode = audioContext.createAnalyser();
    
    // Configure analyzer for voice frequencies
    this.analyzerNode.fftSize = 2048;
    this.analyzerNode.smoothingTimeConstant = 0.8;
    
    // Create data array for time domain data
    this.dataArray = new Float32Array(this.analyzerNode.frequencyBinCount);
    
    console.log('[AudioAnalyzer] Initialized with fftSize:', this.analyzerNode.fftSize);
    
    return this.analyzerNode;
  }

  /**
   * Get the analyzer node, creating it if necessary
   */
  getAnalyzerNode(): AnalyserNode | null {
    return this.analyzerNode;
  }

  /**
   * Subscribe to RMS updates
   */
  subscribe(callback: (rms: number) => void): () => void {
    this.subscribers.add(callback);
    
    // Start animation loop if this is the first subscriber
    if (this.subscribers.size === 1) {
      this.startAnalysis();
    }
    
    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
      
      // Stop animation loop if no more subscribers
      if (this.subscribers.size === 0) {
        this.stopAnalysis();
      }
    };
  }

  /**
   * Calculate RMS from time domain data
   */
  private calculateRMS(): number {
    if (!this.analyzerNode || !this.dataArray) return 0;
    
    // Get time domain data
    this.analyzerNode.getFloatTimeDomainData(this.dataArray);
    
    // Calculate RMS
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i] * this.dataArray[i];
    }
    
    return Math.sqrt(sum / this.dataArray.length);
  }

  /**
   * Start the analysis loop
   */
  private startAnalysis(): void {
    const analyze = () => {
      const now = performance.now();
      
      // Throttle updates to match our target interval
      if (now - this.lastUpdateTime >= this.UPDATE_INTERVAL_MS) {
        const rms = this.calculateRMS();
        
        // Notify all subscribers
        this.subscribers.forEach(callback => {
          try {
            callback(rms);
          } catch (error) {
            console.error('[AudioAnalyzer] Subscriber error:', error);
          }
        });
        
        this.lastUpdateTime = now;
      }
      
      this.animationFrameId = requestAnimationFrame(analyze);
    };
    
    analyze();
  }

  /**
   * Stop the analysis loop
   */
  private stopAnalysis(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopAnalysis();
    this.subscribers.clear();
    this.analyzerNode = null;
    this.audioContext = null;
    this.dataArray = null;
  }
}

export const audioAnalyzer = AudioAnalyzerService.getInstance();