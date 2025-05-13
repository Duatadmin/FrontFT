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
      console.log('[WORKLET] module loaded', workletURL);
    } catch (err) {
      console.error('[WORKLET] addModule failed', err);
      throw err;
    }
    const stream = await getMicrophoneStream();
    
    console.log('[MEDIA]', stream.getAudioTracks()[0].label,
                'rate', this.audioContext.sampleRate);
                
    const source = this.audioContext.createMediaStreamSource(stream);

    this.node = new AudioWorkletNode(this.audioContext, 'pcm-processor');
    this.node.port.onmessage = (e) => {
       if (e.data?.type === 'pcm') {
            const chunk = new Int16Array(e.data.data);
           console.log('[WORKLET] samples', chunk.length);
           this.onChunk(chunk);
         } else if (e.data?.type === 'log') {
           console.log('[WORKLET]', e.data.message);
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
