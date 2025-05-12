# Voice Service API Integration Guide

This document provides comprehensive instructions for integrating with the FitAPP Voice Service API. The service supports two primary methods of obtaining speech recognition:

1. **Real-time WebSocket Streaming**: Send audio in real-time and receive transcriptions as they become available
2. **File Upload**: Upload pre-recorded audio files for transcription

## Service URL

**Base URL**: `https://ftvoiceservice-production.up.railway.app`

## 1. WebSocket Streaming API

### Endpoint

```
wss://ftvoiceservice-production.up.railway.app/v1/ws
```

> **Note**: This endpoint was previously `/v1/asr/ws` but was changed to `/v1/ws` to fix routing issues with the FastAPI prefix.

### Audio Format Requirements

For optimal recognition, audio should be formatted as follows:

- Sample Rate: 16000 Hz
- Channels: 1 (Mono)
- Format: 16-bit signed PCM (linear16)
- Recommended chunk size: 1024 frames (2048 bytes)

### Connection Protocol

1. Open a WebSocket connection to the endpoint
2. Stream raw audio bytes (NOT JSON) through the connection
3. Receive JSON transcription results
4. Close the connection when finished

### Example Implementation (JavaScript)

```javascript
let socket = null;
const audioContext = new AudioContext();
let mediaStream = null;
let processor = null;

async function startRecording() {
  try {
    // 1. Get microphone access
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    });
    
    // 2. Create audio processor
    processor = audioContext.createScriptProcessor(1024, 1, 1);
    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(processor);
    processor.connect(audioContext.destination);
    
    // 3. Connect to WebSocket
    socket = new WebSocket('wss://ftvoiceservice-production.up.railway.app/v1/ws');
    
    // 4. Set up WebSocket event handlers
    socket.onopen = () => {
      console.log('WebSocket connection established');
      
      // Optional: Send 1 second of silence to warm up the connection
      const silence = new ArrayBuffer(2048);
      new Int16Array(silence).fill(0);
      socket.send(silence);
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Process transcript
      if (data.text !== undefined) {
        if (data.is_final) {
          console.log(`Final transcript: ${data.text}`);
          // Add your final transcript handling code here
        } else {
          console.log(`Interim transcript: ${data.text}`);
          // Add your interim transcript handling code here
        }
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
    };
    
    // 5. Send audio data through WebSocket
    processor.onaudioprocess = (e) => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        // Get audio data
        const inputData = e.inputBuffer.getChannelData(0);
        
        // Convert Float32Array to Int16Array
        const intData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          // Convert Float32 to Int16
          const s = Math.max(-1, Math.min(1, inputData[i]));
          intData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        
        // Send the audio data as binary
        socket.send(intData.buffer);
      }
    };
  } catch (error) {
    console.error('Error starting recording:', error);
  }
}

function stopRecording() {
  // Stop audio processing
  if (processor) {
    processor.disconnect();
    processor = null;
  }
  
  // Stop microphone
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  
  // Close WebSocket connection
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close(1000, 'Recording stopped');
  }
}
```

### WebSocket Response Format

The service sends JSON messages with the following format:

```json
{
  "text": "This is the transcribed text",
  "is_final": true
}
```

Where:
- `text` (string): The transcribed speech
- `is_final` (boolean): Whether this is a final result (true) or an interim result (false)

## 2. File Upload API

### Endpoint

```
https://ftvoiceservice-production.up.railway.app/v1/asr
```

> **Note**: The URL structure reflects the API router mounted with the prefix `/v1` and the endpoint `/asr` defined in the router.

### Supported File Formats

- WAV
- MP3
- OGG
- FLAC
- M4A

### Request Format

Use a standard multipart/form-data POST request with the audio file included in the form data.

### Example Implementation (JavaScript)

```javascript
async function uploadAudioFile(file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('https://ftvoiceservice-production.up.railway.app/v1/asr', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('Transcription result:', result);
    return result;
  } catch (error) {
    console.error('Error uploading audio file:', error);
    throw error;
  }
}

// Example usage:
// const fileInput = document.getElementById('audioFileInput');
// fileInput.addEventListener('change', async (e) => {
//   const file = e.target.files[0];
//   if (file) {
//     const transcription = await uploadAudioFile(file);
//     console.log('Transcribed text:', transcription.text);
//   }
// });
```

### Response Format

The service returns a JSON response with the following format:

```json
{
  "text": "This is the transcribed text from the uploaded file"
}
```

## Error Handling

Both the WebSocket and REST API may return various error codes and messages:

- **400 Bad Request**: The audio format is invalid or corrupted
- **401 Unauthorized**: Authentication failed (if auth is required)
- **403 Forbidden**: The client doesn't have permission to access the resource
- **500 Internal Server Error**: The server encountered an unexpected error

## Best Practices

1. **Audio Quality**: Ensure audio is clear and has minimal background noise
2. **Chunk Size**: When streaming, use 1024 frames per chunk for optimal performance
3. **Connection Handling**: Implement robust error handling and reconnection logic
4. **Timeouts**: Set appropriate timeouts for API requests (30 seconds recommended)
5. **Testing**: Start with pre-recorded samples before implementing live microphone streaming

## WebSocket Connection Troubleshooting

If you encounter issues with the WebSocket connection:

1. Verify that your client is sending raw audio bytes, not JSON or other formats
2. Check that your audio format matches the requirements (16kHz, mono, 16-bit PCM)
3. Implement proper error handling with reconnection logic
4. Add logging to track the WebSocket lifecycle events
5. Test with the provided example code first before customizing

### Test Endpoint

For debugging WebSocket connection issues, a simplified test endpoint is available:

```
wss://ftvoiceservice-production.up.railway.app/v1/asr/test/ws
```

This endpoint accepts WebSocket connections and echoes back any messages sent to it, making it useful for isolating connection issues from transcription-specific problems.

### Common Issues

1. **403 Forbidden errors**: These may occur if the proxy headers are not properly forwarded. The service is configured with `--proxy-headers` in the Procfile for Railway deployment to address this.

2. **WebSocket connection failures**: If you're behind a corporate firewall or using a proxy, ensure WebSocket connections are allowed. Some networks block WebSocket traffic on non-standard ports.

3. **Latency issues**: The service has built-in debouncing for partial transcripts, sending updates approximately every 300ms or when significant text changes occur.

## Rate Limits

- WebSocket connections: Maximum 10 concurrent connections per client
- File uploads: Maximum 10MB file size, 100 requests per minute

## Implementation Details

### WebSocket Connection States

The service implements careful connection state tracking to prevent errors when sending messages after a connection closes:

1. **Connection Initiation**: When a client connects, the service accepts the connection and starts Deepgram streaming
2. **Active Streaming**: During active streaming, both interim and final transcripts are sent as they become available
3. **Connection Teardown**: The service properly handles both client-initiated and server-initiated disconnects
4. **Error States**: If errors occur, the service attempts to cleanly close connections with appropriate status codes

### Deployment Configuration

The service is deployed on Railway with these specific configurations:

1. **Proxy Headers**: The service uses `--proxy-headers` in the Procfile to ensure proper handling of WebSocket connections through Railway's proxy
2. **Router Configuration**: API routes use explicit prefixing to avoid double-prefixing issues (which previously caused 403 errors)
3. **Connection Management**: Both synchronous and asynchronous operations are properly handled with thread-safety measures

## Contact & Support

For additional support or to report issues, please contact:
- Email: support@fitapp.com
- GitHub Issues: https://github.com/Duatadmin/FT_voice_service/issues
