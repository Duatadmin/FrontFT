// audio/worklet/pcm-processor.js
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.lastLogTime = 0;
  }
  
  process(inputs, outputs, parameters) {
    const channel = inputs[0][0]; // mono
    if (!channel) return true;

    // Convert floating point audio to 16-bit PCM
    const pcm = new Int16Array(channel.length);
    for (let i = 0; i < channel.length; i++) {
      pcm[i] = Math.max(-1, Math.min(1, channel[i])) * 0x7fff;
    }

    // Log every second for debugging
    const now = currentTime;
    if (now - this.lastLogTime > 1) {
      this.port.postMessage({
        type: 'log',
        message: `Processing audio: ${channel.length} samples, max amplitude: ${Math.max(...channel.map(Math.abs))}`
      });
      this.lastLogTime = now;
    }

    // Send the buffer as transferable to avoid copies
    this.port.postMessage({ type: 'pcm', data: pcm.buffer }, [pcm.buffer]);
    return true;  // ✅ must return true to keep processing
  }
}

registerProcessor('pcm-processor', PCMProcessor); 