# 🎙️ VoiceModule — Real-Time Audio Streaming with Auto Activation

> A plug-and-play voice input module for web applications using Web Audio, AudioWorklet, and WebSocket. Supports both **push-to-talk** and **walkie-talkie (voice-activated)** modes with real-time transcription via an ASR backend.

---

## 🚀 Features

- ✅ Audio streaming from microphone using `AudioWorklet`
- ✅ Converts Float32 to 16-bit PCM in-browser (compatible with Deepgram / ASR APIs)
- ✅ Real-time bi-directional WebSocket connection
- ✅ Dual input modes:
  - **Push-to-Talk** — manual press and hold
  - **Walkie-Talkie** — auto-activation based on voice level
- ✅ Lightweight, event-based API (`onTranscript`, `onStart`, `onStop`)
- ✅ Easy to embed into any JS frontend
- ✅ Fault-tolerant WebSocket client with auto-reconnect (optional)
- ✅ Modular structure, extensible with TTS, silence detection, or UI overlay

---

## 📦 Folder Structure

voice-module/
├── index.js # Main public API (VoiceModule class)
├── config/constants.js # Static config (thresholds, URLs, sample rate)
├── core/
│ ├── voice-core.js # Internal logic: audio → websocket → transcript
│ ├── session-state.js # FSM: idle → listening → streaming → stopped
│ └── event-bus.js # Event routing for public callbacks
├── audio/
│ ├── media-manager.js # Microphone permission + stream acquisition
│ ├── pcm-worklet-node.js # AudioWorkletNode bridge
│ └── worklet/pcm-processor.js # AudioWorkletProcessor (Float32 → Int16 PCM)
├── streaming/
│ └── ws-client.js # WebSocket wrapper (binary out, JSON in)
├── modes/
│ ├── mode-push.js # Manual (button-press) microphone control
│ └── mode-walkie.js # Voice-activated logic using RMS threshold
└── styles/ # Optional UI styles (for microphone indicators)

yaml
Копировать
Редактировать

---

## 🧠 How It Works

1. Microphone input is captured at `16kHz` using `AudioWorklet`
2. The stream is converted to 16-bit PCM chunks
3. Chunks are streamed over WebSocket to `/v1/asr/ws`
4. The backend returns partial/final transcriptions as JSON
5. Events are propagated via `onTranscript`, `onStart`, etc.

---

## 🛠 Installation

Install from your project root:

```bash
# Clone or copy into your frontend project
git clone https://github.com/your-org/voice-module.git
Or convert to an ES module and publish privately if needed.

🧪 Usage Example
js
Копировать
Редактировать
import { VoiceModule } from './voice-module';

const voice = new VoiceModule({
  onTranscript: ({ text, is_final }) => {
    console.log('🗣️', text);
    if (is_final) appendToChat(text);
  },
  onStart: () => console.log('🎙️ Listening...'),
  onStop: () => console.log('🛑 Stopped.'),
  wsUrl: 'wss://yourdomain.com/v1/asr/ws',
});

await voice.setMode('walkie');  // or 'push'
voice.start();  // you can switch modes later with voice.setMode()
🕹 API Reference
new VoiceModule(options)
Options:

Name	Type	Description
onTranscript	(data: { text: string, is_final: boolean }) => void	Called when a transcript is received
onStart	() => void	Called when microphone is activated
onStop	() => void	Called when microphone is deactivated
wsUrl	string	WebSocket endpoint for ASR
mode	`'push'	'walkie'`

voice.start()
Starts the microphone and WebSocket stream according to selected mode.

voice.stop()
Stops the audio stream and closes WebSocket.

voice.setMode(mode: 'push' | 'walkie')
Switches between manual and voice-activated input.
You can call this at runtime to seamlessly change modes; any active
recording will be stopped automatically and the new mode will take effect.

voice.destroy()
Cleans up all resources. Call this when unmounting component/page.

🧱 Push vs Walkie Mode Behavior
Feature	push	walkie
Mic start	On voice.start()	Auto-start on detected speech
Mic stop	On voice.stop()	Auto-stop on silence
UI interaction	Button required	Hands-free
Suitable for...	Button-controlled UIs	Continuous listening / voice-only UX

🌐 Expected WebSocket Protocol
Binary PCM chunks (16-bit signed mono @ 16kHz) sent by client

JSON responses expected from server:

json
Копировать
Редактировать
{ "text": "your transcription", "is_final": true }
🔒 Browser Requirements
Chrome, Edge, Firefox, Safari (latest)

getUserMedia and AudioWorklet support

HTTPS required (except on localhost)

📌 Roadmap / Extensions (Optional)
✅ Voice activity detection using RMS

🔜 Silence timer to stop session

🔜 In-browser TTS playback for AI responses

🔜 WebSocket reconnect with exponential backoff

🔜 Native support for Whisper or Vosk as ASR backends