# Migration to AudioWorklet for Deepgram Voice Streaming

This document details the migration from MediaRecorder to AudioWorklet for the voice assistant module, explaining the benefits, implementation details, and testing procedures.

## Why Migrate from MediaRecorder to AudioWorklet?

### Issues with MediaRecorder

1. **Format Incompatibility**: MediaRecorder's `audio/webm` format (even with PCM codec) doesn't match Deepgram's preferred input format.
2. **Schema Errors**: Deepgram frequently reports `SchemaError` when receiving WebM chunks.
3. **Codec Inconsistency**: Browser support for `audio/webm;codecs=pcm` is inconsistent and often falls back to Opus encoding.
4. **Latency**: MediaRecorder introduces additional latency due to buffering and encoding overhead.

### Benefits of AudioWorklet

1. **Format Control**: Direct access to raw PCM samples, allowing exact Int16 (16-bit) encoding that Deepgram requires.
2. **Lower Latency**: Process audio samples in real-time with minimal buffering.
3. **Better Compatibility**: Works consistently across browsers that support AudioWorklet (Chrome, Edge, Firefox).
4. **Precise Control**: Full control over sample rate, bit depth, and audio chunking.

## Implementation Overview

### 1. AudioWorklet Processor

A dedicated AudioWorklet processor (`pcm-processor.js`) runs in a separate thread to:

- Convert Float32 audio samples (-1.0 to 1.0) to Int16 (-32768 to 32767)
- Process chunks of audio in real-time
- Send the processed data back to the main thread
- Calculate audio levels for silence detection

```js
// pcm-processor.js (simplified)
class PCMProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0][0]; // Mono channel
    if (!input) return true;
    
    const int16Array = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      int16Array[i] = Math.max(-1, Math.min(1, input[i])) * 0x7FFF; 
    }
    
    this.port.postMessage({ audioData: int16Array.buffer }, [int16Array.buffer]);
    return true;
  }
}
registerProcessor('pcm-processor', PCMProcessor);
```

### 2. AudioWorklet Hook Implementation

The main voice assistant hook now:

- Loads the AudioWorklet processor module
- Creates an AudioWorkletNode to process audio
- Streams Int16 PCM data directly to the WebSocket
- Maintains existing functionality (VAD, modes, state management)

```typescript
// useVoiceAssistantAudioWorklet.ts (simplified)
await audioContext.audioWorklet.addModule('/pcm-processor.js');
const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');

workletNode.port.onmessage = (event) => {
  const { audioData, audioLevel } = event.data;
  wsRef.current?.send(audioData); // Send raw PCM data
};

streamSource.connect(workletNode);
```

### 3. End-of-Stream Handling

To properly close the audio stream:

```typescript
// Send 1 second of silence followed by end_of_stream message
const silence = new Int16Array(16000); // 1s at 16kHz
wsRef.current.send(silence.buffer);

setTimeout(() => {
  wsRef.current.send(JSON.stringify({ type: 'end_of_stream' }));
}, 100);
```

## Audio Format Specifications

| Parameter | Value | Notes |
|-----------|-------|-------|
| Format | PCM Int16 | 16-bit signed integers |
| Sample Rate | 16 kHz | Required by Deepgram |
| Channels | 1 (Mono) | Recommended for speech |
| Chunk Size | ~128-256 samples | Controlled by AudioWorklet |
| Bit Depth | 16 bits | -32768 to 32767 range |

## Browser Compatibility

| Browser | AudioWorklet Support | Notes |
|---------|----------------------|-------|
| Chrome  | ✅ Full support      | Recommended |
| Edge    | ✅ Full support      | Recommended |
| Firefox | ✅ Support           | Some performance differences |
| Safari  | ⚠️ Partial support   | May require additional handling |

## Migration Steps for Developers

1. Replace imports from `useVoiceAssistant` to `useVoiceAssistantAudioWorklet`
2. Ensure the public path contains `pcm-processor.js`
3. No changes needed to components using the hook

## Testing and Verification

### 1. Audio Format Testing

To verify proper PCM encoding:

```typescript
// Log audio levels and formats
workletNode.port.onmessage = (event) => {
  const { audioData, audioLevel } = event.data;
  console.log('Audio level:', audioLevel, 'Buffer size:', audioData.byteLength);
  
  // Optional: Inspect the first few samples
  const view = new Int16Array(audioData, 0, 10);
  console.log('First 10 samples:', Array.from(view));
};
```

### 2. Success Criteria

| Metric | Target | Verification Method |
|--------|--------|---------------------|
| Deepgram Transcripts | Consistent, no empty | Check console logs |
| SchemaError | Eliminated | Check backend logs |
| Audio Format | Linear16/16kHz/mono | Format validation |
| Latency | < 300ms | Testing with timing logs |

## Advanced Configuration

### Fine-tuning VAD Sensitivity

```typescript
// Adjust sensitivity parameters
const vadSensitivity = 0.7; // Higher = more sensitive to speech
const silenceDuration = 1500; // ms of silence before auto-stop
```

### Processing Buffer Size

The default buffer size is determined by the browser, but you can use:

```typescript
const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor', {
  processorOptions: {
    bufferSize: 256 // Smaller = lower latency but more CPU
  }
});
```

## Fallback Strategy

For browsers without AudioWorklet support, a fallback to ScriptProcessorNode is possible:

```typescript
if (!audioContext.audioWorklet) {
  console.warn('AudioWorklet not supported, using ScriptProcessor fallback');
  const scriptProcessor = audioContext.createScriptProcessor(1024, 1, 1);
  scriptProcessor.onaudioprocess = (e) => {
    // Similar conversion logic...
  };
}
```

## Known Limitations

1. **Safari Support**: Safari has limited AudioWorklet support in some versions
2. **CPU Usage**: Higher than MediaRecorder due to sample-by-sample processing
3. **Permission Handling**: Some browsers may require persistent permissions

## Reference Implementation

See `useVoiceAssistantAudioWorklet.ts` for the complete implementation.
