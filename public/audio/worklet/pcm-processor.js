// PCM Processor AudioWorklet
// Converts Float32Array audio samples to Int16Array PCM format for streaming

class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0][0]; // mono
    if (!channel) return true;

    const pcm = new Int16Array(channel.length);
    for (let i = 0; i < channel.length; i++) {
      pcm[i] = Math.max(-1, Math.min(1, channel[i])) * 0x7fff;
    }

    this.port.postMessage(pcm.buffer, [pcm.buffer]);
    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
