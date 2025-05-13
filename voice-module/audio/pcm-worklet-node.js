// voice-module/audio/pcm-worklet-node.js
import { getMicrophoneStream } from './media-manager.js';

export class PCMWorkletNodeController {
  constructor(audioContext, onChunk) {
    this.audioContext = audioContext;
    this.onChunk = onChunk;
    this.node = null;
  }

  async init() {
    const workletURL = import.meta.env.BASE_URL + 'worklet/pcm-processor.js';
    try {
      await this.audioContext.audioWorklet.addModule(workletURL);
      console.log('[WORKLET] ✅ module loaded', workletURL);
    } catch (err) {
      console.error('[WORKLET] ❌ addModule failed', err);
      throw err;
    }
    
    try {
      this.node = new AudioWorkletNode(this.audioContext, 'pcm-processor');
      console.log('[WORKLET] ✅ node constructed');
    } catch (err) {
      console.error('[WORKLET] ❌ node construct failed', err);
      throw err;
    }

    const stream = await getMicrophoneStream();
    
    console.log('[MEDIA]', stream.getAudioTracks()[0].label,
                'rate', this.audioContext.sampleRate);
                
    const source = this.audioContext.createMediaStreamSource(stream);

    this.node.port.onmessage = (e) => {
      if (e.data?.type === 'log') {
        console.log('[WORKLET]', e.data.message);
        return;
      }
      if (e.data?.type !== 'pcm' || !e.data.data) return;
      const chunk = new Int16Array(e.data.data);

      // ─── Buffer to 320-sample frames (20 ms) ───
      if (!this.cache) this.cache = new Int16Array(0);
      const combined = new Int16Array(this.cache.length + chunk.length);
      combined.set(this.cache);
      combined.set(chunk, this.cache.length);

      const FRAME = 320;
      const frames = Math.floor(combined.length / FRAME);
      if (frames > 0) {
        const sendBuf = combined.subarray(0, frames * FRAME);
        this.onChunk(sendBuf);                     // send to WS
        this.cache = combined.subarray(frames * FRAME); // tail
      } else {
        this.cache = combined;
      }
    };

    const muteGain = new GainNode(this.audioContext, { gain: 0 });
    source.connect(this.node).connect(muteGain);  
    muteGain.connect(this.audioContext.destination); // ← no feedback
    
    this._stream = stream;
    
    console.log('[AUDIO]', this.audioContext.state);
  }

  stop() {
    this.node?.disconnect();
    this._stream?.getTracks().forEach(t => t.stop());
    this.audioContext?.close();
  }
}
