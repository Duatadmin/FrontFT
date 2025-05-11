/**
 * PCM Processor for voice audio streaming
 * 
 * This AudioWorkletProcessor converts audio samples from floating point 
 * (-1.0 to 1.0) to 16-bit PCM integers (-32768 to 32767) for Deepgram streaming.
 * 
 * It processes audio in real-time and sends chunks of Int16Array data.
 */
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // For buffering silence detection
    this.silenceCounter = 0;
    this.lastAudioLevel = 0;
    this.isSilent = false;
  }

  /**
   * Process audio data in chunks
   * @param {Float32Array[][]} inputs - Input audio data (channels)
   * @returns {boolean} - Return true to keep the processor running
   */
  process(inputs) {
    // Get the first channel of the first input
    const input = inputs[0]?.[0];
    
    // Skip if we don't have input data
    if (!input || input.length === 0) return true;
    
    // Create an Int16Array to hold the PCM data
    const int16Array = new Int16Array(input.length);
    let sumSquared = 0;
    
    // Convert float samples (-1.0 to 1.0) to 16-bit PCM (-32768 to 32767)
    for (let i = 0; i < input.length; i++) {
      // Clamp values to valid range
      const sample = Math.max(-1, Math.min(1, input[i]));
      // Convert to 16-bit integer
      int16Array[i] = Math.round(sample * 0x7FFF);
      // Calculate RMS for silence detection
      sumSquared += sample * sample;
    }
    
    // Calculate RMS (Root Mean Square) for silence detection
    const rms = Math.sqrt(sumSquared / input.length);
    this.lastAudioLevel = rms;
    
    // Post the Int16Array buffer to the main thread
    this.port.postMessage({
      audioData: int16Array.buffer,
      audioLevel: rms,
      isSilent: rms < 0.01 // Consider sound below 0.01 RMS as silence
    }, [int16Array.buffer]); // Transfer buffer ownership for performance
    
    return true;
  }
}

// Register the processor
registerProcessor('pcm-processor', PCMProcessor);
