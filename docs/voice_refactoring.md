Replace the current MediaRecorder-based voice pipeline with a low-latency, format-controlled AudioWorklet-based pipeline that streams real-time Int16 PCM (16kHz, mono) audio to Deepgram via WebSocket. This ensures compatibility, removes format ambiguity, and improves transcription reliability.

🛠 Migration Plan: MediaRecorder → AudioWorklet
✅ Phase 1 – Preparation & Cleanup
Remove MediaRecorder Logic

Delete all references to new MediaRecorder(...), ondataavailable, and Blob-to-ArrayBuffer conversions.

Remove .webm saving logic (optional for debugging only).

Retain WebSocket + Transcript Handling

Keep the backend streaming logic and transcript message parsing as-is.

✅ Phase 2 – AudioWorklet Setup
Initialize AudioContext

ts
Копировать
Редактировать
const audioContext = new AudioContext({ sampleRate: 16000 });
Create AudioWorkletProcessor
File: pcm-processor.js
Purpose: Convert raw Float32Array microphone data to Int16Array PCM and post to main thread.

js
Копировать
Редактировать
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0][0];
    if (!input) return true;
    const int16 = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      int16[i] = s * 0x7FFF;
    }
    this.port.postMessage(int16.buffer, [int16.buffer]);
    return true;
  }
}
registerProcessor('pcm-processor', PCMProcessor);
Register and Connect the Worklet

ts
Копировать
Редактировать
await audioContext.audioWorklet.addModule('pcm-processor.js');
const node = new AudioWorkletNode(audioContext, 'pcm-processor');
node.port.onmessage = (e) => {
  socket.send(e.data); // Send Int16 PCM buffer
};
const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
const source = audioContext.createMediaStreamSource(micStream);
source.connect(node);
node.connect(audioContext.destination);
✅ Phase 3 – Closing Stream Gracefully
Send Silence (Optional but Recommended)

ts
Копировать
Редактировать
const silence = new Int16Array(16000); // 1 second of silence
socket.send(silence.buffer);
Send CloseStream

ts
Копировать
Редактировать
socket.send(JSON.stringify({ type: 'CloseStream' }));
✅ Phase 4 – Hook Refactoring
Update useVoiceAssistant.ts (or create useVoiceAssistantAudioWorklet.ts)

startRecording() → sets up AudioContext, registers Worklet, starts stream.

stopRecording() → disconnects, flushes silence, sends CloseStream.

Maintain mode, busy, transcript state handling.

✅ Phase 5 – Documentation Update
Update VOICE-MODULE.md with:

📊 Audio pipeline: AudioContext → AudioWorklet → WebSocket

🧠 Format: 16-bit PCM / 16kHz / Mono

🔌 Supported browsers: Chrome, Edge, Firefox (Safari: limited)

🧪 Debug tips: Print Int16Array samples, log chunk sizes

🧠 Optional Add-ons (Post-Migration)
Voice Activity Detection (VAD) integration using AnalyserNode or RMS thresholding.

Silence detection for walkie-talkie mode.

Chunk batching for smoother WebSocket performance.

Graceful fallback if AudioWorklet isn't supported.

✅ Migration Success Criteria
Criteria	Target
Deepgram transcripts	Appear consistently (no empty)
SchemaError in logs	Fully eliminated
Audio format	Verified: Linear16 / 16kHz / mono
Latency	Sub-300ms (record-to-transcript)
WebSocket messages	Binary + valid CloseStream JSON