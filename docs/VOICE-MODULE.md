# Voice Assistant Module Documentation

This document provides a comprehensive overview of the Voice Assistant implementation in our React frontend application and its integration with Deepgram's speech recognition API.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Audio Pipeline](#audio-pipeline)
5. [WebSocket Communication](#websocket-communication)
6. [Modes](#modes)
7. [Debugging](#debugging)
8. [Known Limitations](#known-limitations)
9. [Advanced Customization](#advanced-customization)

## Overview

The Voice Assistant module enables real-time speech recognition by capturing microphone input, streaming it to a backend service via WebSocket, and receiving transcription results from Deepgram. The module supports both push-to-talk (PTT) and walkie-talkie modes.

## Architecture

The voice module follows a clean architecture pattern with separation of concerns:

```
┌─────────────────┐         ┌────────────────┐         ┌─────────────────┐
│   UI Components │         │   Voice Hook   │         │  WebSocket API  │
│ ┌─────────────┐ │         │ ┌────────────┐ │         │ ┌─────────────┐ │
│ │ VoiceButton │◄┼────────►│ │useVoice    │◄┼────────►│ │Backend      │ │
│ └─────────────┘ │         │ │Assistant   │ │         │ │WebSocket    │ │
│ ┌─────────────┐ │         │ └────────────┘ │         │ └─────────┬───┘ │
│ │WalkieToggle │◄┼────────►│                │         │           │     │
│ └─────────────┘ │         │                │         │           ▼     │
│ ┌─────────────┐ │         │                │         │     ┌───────────┐
│ │AudioVisual. │◄┼────────►│                │         │     │ Deepgram  │
│ └─────────────┘ │         │                │         │     └───────────┘
└─────────────────┘         └────────────────┘         └─────────────────┘
```

## Components

The voice module consists of the following key components:

### UI Components

1. **VoiceButton.tsx** - A push-to-talk button component that handles user interactions (mouse/touch) for starting and stopping voice recording.

2. **WalkieToggleButton.tsx** - A toggle button for switching between normal mode and walkie-talkie mode.

3. **AudioVisualizer.tsx** - A real-time audio visualization component that displays the audio waveform during recording.

### Hooks

1. **useVoiceAssistant.ts** - The core hook that encapsulates all the logic for microphone access, audio recording, WebSocket communication, and state management.

## Audio Pipeline

The audio pipeline follows these steps:

1. **Microphone Initialization**
   - Request microphone access using `navigator.mediaDevices.getUserMedia({ audio: true })`
   - Initialize AudioContext for audio processing and visualization
   - Set up AnalyserNode for real-time audio visualization

2. **Audio Recording**
   - Create a MediaRecorder instance with PCM encoding (when supported)
   - Capture audio in small chunks (100ms intervals) using `mediaRecorder.start(100)`
   - Process audio data in the `ondataavailable` event handler

3. **Processing & Transmission**
   - Convert Blob data to ArrayBuffer using `event.data.arrayBuffer()`
   - Send audio chunks to the backend via WebSocket
   - Monitor stream status and handle stream end conditions

4. **Stream Closing**
   - Send silence buffer to help Deepgram detect end of speech
   - Send explicit `end_of_stream` message
   - Keep WebSocket open to receive the transcript

5. **Transcription Handling**
   - Process incoming WebSocket messages containing transcripts
   - Update UI with transcription results
   - Optionally auto-send transcripts to chat interface

```
┌───────────┐      ┌───────────┐      ┌───────────┐      ┌───────────┐
│ Microphone│─────►│MediaRecor │─────►│ ArrayBuff │─────►│ WebSocket │
│ Access    │      │ der (PCM) │      │ Conversion│      │ Stream    │
└───────────┘      └───────────┘      └───────────┘      └─────┬─────┘
                                                               │
                                                               ▼
┌───────────┐      ┌───────────┐      ┌───────────┐      ┌───────────┐
│ UI Update │◄─────│Transcript │◄─────│ Backend   │◄─────│ Deepgram  │
│           │      │ Processing│      │ Processing│      │ API       │
└───────────┘      └───────────┘      └───────────┘      └───────────┘
```

## WebSocket Communication

### Outgoing Messages (Frontend → Backend)

1. **Audio Data**
   - Binary ArrayBuffer data containing PCM audio chunks
   - Sent every 100ms during active recording

2. **Control Messages**
   ```typescript
   // Sent after audio recording stops
   { type: "end_of_stream" }
   ```

### Incoming Messages (Backend → Frontend)

1. **Partial Transcripts**
   ```typescript
   {
     type: "partial_transcript",
     text: "partial text being spoken..."
   }
   ```

2. **Final Transcripts**
   ```typescript
   {
     type: "final_transcript",
     text: "final transcribed text",
     audio_url?: "url-to-tts-response" // Optional TTS response
   }
   ```

3. **Error Messages**
   ```typescript
   {
     type: "error",
     message: "Error description"
   }
   ```

## Modes

The voice module supports two operational modes:

### 1. Push-to-Talk (PTT) Mode

- Default mode where recording only happens while the user is pressing the VoiceButton
- Recording starts on mouse/touch down and stops on mouse/touch up
- Ideal for precise control and shorter utterances

### 2. Walkie-Talkie Mode

- Hands-free mode that starts recording when enabled
- Uses Voice Activity Detection (VAD) to automatically stop recording after a period of silence
- Suitable for longer interactions and hands-free usage
- Configurable sensitivity for detecting speech vs. silence

## Debugging

The module includes several debugging features to help verify correct operation:

### 1. MIME Type Verification

```typescript
// Check what MIME type is actually being used
console.log('[VOICE] Actual MediaRecorder MIME type:', mediaRecorder.mimeType);

// PCM detection
if (MediaRecorder.isTypeSupported('audio/webm;codecs=pcm')) {
  console.log('[VOICE] Using PCM codec for best Deepgram compatibility');
} else {
  console.warn('[VOICE] PCM codec not supported, using fallback format');
}
```

### 2. Audio Format Testing

The module can save audio samples locally for inspection:

```typescript
// Save a sample recording to inspect format
if (event.data.size > 0) {
  const url = URL.createObjectURL(event.data);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'test-audio.webm';
  document.body.appendChild(a);
  a.click();
  console.log('[VOICE] Downloaded .webm for inspection');
}
```

You can inspect the downloaded file using:
- VLC Media Player
- ffprobe: `ffprobe -show_streams test-audio.webm`
- Chrome's media inspector

### 3. WebSocket Monitoring

The module logs all WebSocket activity:
- Connection status
- Message sending/receiving
- Error conditions

Example debugging output:
```
[VOICE] MediaRecorder created with MIME type: audio/webm;codecs=pcm
[WS] WebSocket connection established, readyState: 1
[VOICE] Received media chunk of type: audio/webm size: 1234
[WS] Sent chunk as ArrayBuffer to backend. Size: 1234
[WS] 🔇 Sent 500ms of silence to Deepgram
[WS] ✅ Sent end_of_stream to Deepgram
[VOICE] ✅ Received final transcript, releasing busy state
```

## Known Limitations

1. **Browser Compatibility**
   - Not all browsers support `audio/webm;codecs=pcm` (notably Safari)
   - Safari falls back to `audio/webm` which may use Opus encoding
   - Chrome, Edge, and Firefox have the best compatibility

2. **Memory Usage**
   - Extended recording sessions may consume significant memory
   - The busy state timeout (10s) helps prevent resource exhaustion

3. **Network Reliability**
   - WebSocket connections may drop on poor network conditions
   - Error handling tries to recover gracefully from disconnections

4. **Deepgram Format Requirements**
   - Deepgram performs best with:
     - 16-bit PCM audio (Linear16)
     - 16kHz sample rate
     - Mono channel

## Advanced Customization

### Audio Configuration

The default audio configuration is:
```typescript
const AUDIO_CONFIG = {
  sampleRate: 16000,
  channelCount: 1
};
```

### Speech Detection Sensitivity

For walkie-talkie mode, the Voice Activity Detection can be tuned:
```typescript
// Higher values (closer to 1) make it more sensitive to speech
// Lower values require louder speech to trigger recording
const vadSensitivity = 0.7; 
```

### Testing with Different MIME Types

If PCM compatibility is an issue, you can test different codecs:
```typescript
// Test if various formats are supported
console.log('audio/webm support:', MediaRecorder.isTypeSupported('audio/webm'));
console.log('audio/webm;codecs=pcm support:', MediaRecorder.isTypeSupported('audio/webm;codecs=pcm'));
console.log('audio/webm;codecs=opus support:', MediaRecorder.isTypeSupported('audio/webm;codecs=opus'));
```

### Alternative Architecture (Web Audio API)

For environments where MediaRecorder with PCM is not supported, an alternative architecture using Web Audio API + AudioWorklet is possible:

```typescript
// Example of raw PCM generation using Web Audio API
async function setupDirectPCM() {
  const context = new AudioContext({ sampleRate: 16000 });
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = context.createMediaStreamSource(stream);
  const processor = context.createScriptProcessor(1024, 1, 1);
  
  processor.onaudioprocess = (e) => {
    const float32Array = e.inputBuffer.getChannelData(0);
    const int16Array = new Int16Array(float32Array.length);
    
    // Convert Float32Array (-1.0 to 1.0) to Int16Array (-32768 to 32767)
    for (let i = 0; i < float32Array.length; i++) {
      int16Array[i] = Math.max(-1, Math.min(1, float32Array[i])) * 0x7FFF;
    }
    
    // Send as chunks
    webSocket.send(int16Array.buffer);
  };
  
  source.connect(processor);
  processor.connect(context.destination);
}
```

*Note: ScriptProcessorNode is deprecated but still widely supported. For production, consider using AudioWorklet instead.*
