// voice-module/audio/pcm-worklet-node.js
import { getMicrophoneStream } from './media-manager.js';

export class PCMWorkletNodeController {
  constructor(audioContext, onChunk) {
    this.audioContext = audioContext;
    this.onChunk = onChunk;
    this.node = null;
  }

  async init() {
    await this.audioContext.audioWorklet.addModule(new URL('./worklet/pcm-processor.js', import.meta.url));
    const stream = await getMicrophoneStream();
    
    console.log('[MEDIA]', stream.getAudioTracks()[0].label,
                'rate', this.audioContext.sampleRate);
                
    const source = this.audioContext.createMediaStreamSource(stream);

    this.node = new AudioWorkletNode(this.audioContext, 'pcm-processor');
    this.node.port.onmessage = (e) => {
      // Check if it's a log message or audio data
      if (e.data instanceof ArrayBuffer) {
        const chunk = new Int16Array(e.data);
        console.log('[WORKLET] samples', chunk.length);
        this.onChunk(chunk);
      } else if (e.data?.type === 'log') {
        console.log('[WORKLET]', e.data.message);
      }
    };

    const muteGain = new GainNode(this.audioContext, { gain: 0 });
    source.connect(this.node).connect(muteGain);   // ← no feedback
    
    this._stream = stream;
    
    console.log('[AUDIO]', this.audioContext.state);
  }

  stop() {
    this.node?.disconnect();
    this._stream?.getTracks().forEach(t => t.stop());
    this.audioContext?.close();
  }
}
