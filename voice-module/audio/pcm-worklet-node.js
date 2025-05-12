// voice-module/audio/pcm-worklet-node.js
import { getMicrophoneStream } from './media-manager.js';

export class PCMWorkletNodeController {
  constructor(audioContext, onChunk) {
    this.audioContext = audioContext;
    this.onChunk = onChunk;
    this.node = null;
  }

  async init() {
    await this.audioContext.audioWorklet.addModule('/voice-module/audio/worklet/pcm-processor.js');
    const stream = await getMicrophoneStream();
    const source = this.audioContext.createMediaStreamSource(stream);

    this.node = new AudioWorkletNode(this.audioContext, 'pcm-processor');
    this.node.port.onmessage = (e) => {
      const chunk = new Int16Array(e.data);
      this.onChunk(chunk);
    };

    source.connect(this.node).connect(this.audioContext.destination);
    this._stream = stream;
  }

  stop() {
    this.node?.disconnect();
    this._stream?.getTracks().forEach(t => t.stop());
    this.audioContext?.close();
  }
}
