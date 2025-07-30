// src/lib/sepiaRecorderEnhanced.ts
import { createRecorder, RecorderHandle, CreateRecorderOptions } from './sepiaRecorder';
import { audioAnalyzer } from '../services/audioAnalyzer';

export interface EnhancedRecorderHandle extends RecorderHandle {
  getAudioContext(): AudioContext | null;
}

export interface CreateEnhancedRecorderOptions extends CreateRecorderOptions {
  onAudioContextReady?: (context: AudioContext) => void;
}

// Global audio context reference
let globalAudioContext: AudioContext | null = null;

export async function createEnhancedRecorder(options: CreateEnhancedRecorderOptions): Promise<EnhancedRecorderHandle> {
  // Create base recorder
  const baseRecorder = await createRecorder(options);
  
  // Wrap the recorder to add audio context integration
  const enhancedRecorder: EnhancedRecorderHandle = {
    ...baseRecorder,
    
    start: async (onChunk) => {
      // Start the base recorder
      await baseRecorder.start(onChunk);
      
      // Try to get audio context from SEPIA after starting
      // This is a bit hacky but SEPIA doesn't expose the audio context directly
      setTimeout(() => {
        try {
          // Try to access Web Audio API context through window
          // SEPIA might store it globally
          const audioContexts = [
            (window as any).SepiaFW?.webAudio?.context,
            (window as any).audioContext,
            (window as any).webkitAudioContext
          ].filter(Boolean);
          
          if (audioContexts.length > 0) {
            globalAudioContext = audioContexts[0];
            console.log('[EnhancedRecorder] Found audio context:', globalAudioContext);
            
            // Initialize audio analyzer
            if (globalAudioContext) {
              audioAnalyzer.initialize(globalAudioContext);
              
              // Notify callback if provided
              if (options.onAudioContextReady) {
                options.onAudioContextReady(globalAudioContext);
              }
            }
          }
        } catch (error) {
          console.warn('[EnhancedRecorder] Could not access audio context:', error);
        }
      }, 100); // Small delay to ensure SEPIA has initialized
    },
    
    stop: async () => {
      await baseRecorder.stop();
    },
    
    close: () => {
      baseRecorder.close();
      globalAudioContext = null;
    },
    
    getAudioContext: () => globalAudioContext
  };
  
  return enhancedRecorder;
}