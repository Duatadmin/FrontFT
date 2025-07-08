# Frontend Integration Guide

This guide explains how to integrate your frontend application with the ASR Service v3.

## Overview

The ASR Service provides real-time speech-to-text capabilities through WebSocket connections. It supports two modes:
- **Push-to-Talk**: Client controls when to send audio
- **Walkie-Talkie**: Always listening with automatic speech detection

## WebSocket Endpoints

### 1. Push-to-Talk Mode: `/v2/ws/push`

Best for: Applications where users explicitly control when to speak (e.g., push a button to talk).

**Connection Flow:**
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8000/v2/ws/push');

// Connection opened
ws.onopen = () => {
    console.log('Connected to ASR service');
};

// Handle incoming transcripts
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.text) {
        console.log(`Transcript: ${data.text} (final: ${data.final})`);
    }
};

// Send audio data (16-bit PCM @ 16kHz)
ws.send(audioData); // audioData is ArrayBuffer or Blob

// Optional: Force finalization
ws.send(JSON.stringify({ type: "Finalize" }));

// Close connection
ws.close();
```

### 2. Walkie-Talkie Mode: `/v2/ws/walkie`

Best for: Always-on applications with automatic speech detection.

**Connection Flow:**
```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8000/v2/ws/walkie');

// Handle incoming transcripts
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.text) {
        console.log(`Transcript: ${data.text} (final: ${data.final})`);
    }
};

// Send continuous audio stream
// The service automatically detects speech boundaries
ws.send(audioData); // Send audio chunks continuously
```

## Audio Format Requirements

The service expects audio in the following format:
- **Encoding**: 16-bit PCM (signed integers)
- **Sample Rate**: 16,000 Hz
- **Channels**: 1 (mono)
- **Byte Order**: Little-endian

### Browser Audio Capture Example

```javascript
// Get microphone access
navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        const audioContext = new AudioContext({ sampleRate: 16000 });
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(512, 1, 1);
        
        processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            
            // Convert float32 to int16
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
                pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
            }
            
            // Send to WebSocket
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(pcm16.buffer);
            }
        };
        
        source.connect(processor);
        processor.connect(audioContext.destination);
    });
```

## Message Format

### Incoming Messages (from server)

**Transcript Message:**
```json
{
    "text": "Hello world",
    "final": true
}
```
- `text`: The transcribed text
- `final`: Whether this is the final transcript for the current utterance

**Error Message:**
```json
{
    "error": "Error description"
}
```

### Outgoing Messages (to server)

**Audio Data:**
- Send raw binary audio data (ArrayBuffer/Blob)
- No JSON wrapper needed

**Control Messages (Push mode only):**
```json
{
    "type": "Finalize"
}
```

## Implementation Tips

### 1. Connection Management

```javascript
class ASRClient {
    constructor(mode = 'walkie') {
        this.mode = mode;
        this.ws = null;
        this.reconnectDelay = 1000;
    }
    
    connect() {
        const endpoint = this.mode === 'push' 
            ? '/v2/ws/push' 
            : '/v2/ws/walkie';
            
        this.ws = new WebSocket(`ws://localhost:8000${endpoint}`);
        
        this.ws.onopen = () => {
            console.log('ASR connected');
            this.reconnectDelay = 1000; // Reset delay
        };
        
        this.ws.onclose = () => {
            console.log('ASR disconnected');
            // Auto-reconnect for walkie mode
            if (this.mode === 'walkie') {
                setTimeout(() => this.connect(), this.reconnectDelay);
                this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('ASR error:', error);
        };
    }
    
    sendAudio(audioData) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(audioData);
        }
    }
}
```

### 2. Audio Processing

For better performance, process audio in chunks:

```javascript
class AudioProcessor {
    constructor(chunkSize = 800) { // 50ms @ 16kHz
        this.chunkSize = chunkSize;
        this.buffer = new Int16Array(0);
    }
    
    addAudio(newAudio) {
        // Accumulate audio
        const combined = new Int16Array(this.buffer.length + newAudio.length);
        combined.set(this.buffer);
        combined.set(newAudio, this.buffer.length);
        this.buffer = combined;
        
        // Process chunks
        const chunks = [];
        while (this.buffer.length >= this.chunkSize) {
            chunks.push(this.buffer.slice(0, this.chunkSize));
            this.buffer = this.buffer.slice(this.chunkSize);
        }
        
        return chunks;
    }
}
```

### 3. UI Feedback

Provide visual feedback for speech detection and transcription:

```javascript
// Show speaking indicator
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.text && !data.final) {
        // Show "speaking" indicator
        showSpeakingIndicator();
        // Show partial transcript
        updateTranscript(data.text, false);
    } else if (data.text && data.final) {
        // Hide "speaking" indicator
        hideSpeakingIndicator();
        // Show final transcript
        updateTranscript(data.text, true);
    }
};
```

## Complete Example

Here's a complete example of a simple voice assistant:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Voice Assistant</title>
</head>
<body>
    <button id="connectBtn">Connect</button>
    <button id="talkBtn" disabled>Push to Talk</button>
    <div id="status">Disconnected</div>
    <div id="transcript"></div>
    
    <script>
        let ws = null;
        let audioContext = null;
        let processor = null;
        
        document.getElementById('connectBtn').onclick = connect;
        document.getElementById('talkBtn').onmousedown = startTalking;
        document.getElementById('talkBtn').onmouseup = stopTalking;
        
        async function connect() {
            // Get microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            // Setup audio processing
            audioContext = new AudioContext({ sampleRate: 16000 });
            const source = audioContext.createMediaStreamSource(stream);
            processor = audioContext.createScriptProcessor(512, 1, 1);
            
            // Connect to ASR service
            ws = new WebSocket('ws://localhost:8000/v2/ws/push');
            
            ws.onopen = () => {
                document.getElementById('status').textContent = 'Connected';
                document.getElementById('talkBtn').disabled = false;
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.text) {
                    document.getElementById('transcript').textContent = data.text;
                }
            };
            
            ws.onclose = () => {
                document.getElementById('status').textContent = 'Disconnected';
                document.getElementById('talkBtn').disabled = true;
            };
            
            // Audio processing
            processor.onaudioprocess = (e) => {
                if (ws.readyState === WebSocket.OPEN && isTalking) {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcm16 = new Int16Array(inputData.length);
                    
                    for (let i = 0; i < inputData.length; i++) {
                        pcm16[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
                    }
                    
                    ws.send(pcm16.buffer);
                }
            };
            
            source.connect(processor);
            processor.connect(audioContext.destination);
        }
        
        let isTalking = false;
        
        function startTalking() {
            isTalking = true;
            document.getElementById('talkBtn').style.backgroundColor = 'red';
        }
        
        function stopTalking() {
            isTalking = false;
            document.getElementById('talkBtn').style.backgroundColor = '';
            
            // Send finalize command
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "Finalize" }));
            }
        }
    </script>
</body>
</html>
```

## Testing Your Integration

1. **Test Audio Format**: Ensure your audio is correctly formatted (16-bit PCM @ 16kHz)
2. **Monitor Network**: Use browser DevTools to monitor WebSocket messages
3. **Handle Errors**: Implement proper error handling and reconnection logic
4. **Test Edge Cases**: Test with background noise, silence, and network interruptions

## Performance Considerations

1. **Chunk Size**: Send audio in 32-50ms chunks for optimal performance
2. **Buffer Management**: Don't accumulate too much audio before sending
3. **Connection Reuse**: For walkie mode, maintain persistent connections
4. **Error Recovery**: Implement exponential backoff for reconnections

## Security Considerations

1. **HTTPS/WSS**: Use secure WebSocket (wss://) in production
2. **Authentication**: Implement authentication if needed (headers/tokens)
3. **Rate Limiting**: Be aware of any rate limits on the service
4. **CORS**: Ensure proper CORS configuration for your domain