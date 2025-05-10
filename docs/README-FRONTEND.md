# Voice Service: Frontend Integration Guide

## Overview

The Voice Service provides a simple way to add voice capabilities to your frontend applications. It handles:

- Converting text to speech (TTS) using OpenAI's voices
- Converting speech to text (ASR) using Deepgram
- Streaming responses for smooth, real-time user experiences
- WebSocket connectivity for continuous voice interaction

The service is deployed at: `https://ftvoiceservice-production.up.railway.app`

## Quick Start

This guide shows you how to:
1. Play synthesized speech from text
2. Transcribe user's voice input
3. Set up real-time conversations via WebSocket
4. Interrupt ongoing speech playback

## How to Use from Frontend

### 1. Text-to-Speech (TTS)

#### Basic Usage

To convert text to speech and play it:

```javascript
async function speakText(text, voiceId = 'nova') {
  try {
    const response = await fetch('https://ftvoiceservice-production.up.railway.app/tts/v1/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        voice_id: voiceId // Optional, defaults to 'nova'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    // Get the audio blob from the streaming response
    const audioBlob = await response.blob();
    
    // Create a URL for the blob
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Play the audio
    const audioElement = new Audio(audioUrl);
    audioElement.play();
    
    // Clean up the URL when done
    audioElement.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
    
    return audioElement; // Return to allow stopping later
  } catch (error) {
    console.error('TTS error:', error);
  }
}

// Example usage
const audioElement = await speakText('Hello! How can I help you with your fitness goals today?');
```

#### Advanced: Streaming Audio with Progress

For better user experience, you can stream the audio as it arrives:

```javascript
async function streamSpeech(text, voiceId = 'nova') {
  // Store the request ID to allow cancellation
  let requestId = null;
  
  try {
    // Create audio context
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioQueue = [];
    let isPlaying = false;
    
    // Function to play the next chunk
    async function playNextChunk() {
      if (audioQueue.length === 0) {
        if (!isPlaying) {
          // Done playing
          return;
        }
        // Wait for more chunks
        await new Promise(resolve => setTimeout(resolve, 100));
        return playNextChunk();
      }
      
      isPlaying = true;
      const audioBuffer = audioQueue.shift();
      
      // Create source node
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      
      // Play the chunk
      source.start(0);
      
      // Wait for it to finish before playing next chunk
      source.onended = () => {
        playNextChunk();
      };
    }
    
    // Start the request
    const response = await fetch('https://ftvoiceservice-production.up.railway.app/tts/v1/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        voice_id: voiceId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    // Get request ID from headers if available
    requestId = response.headers.get('X-Request-ID');
    
    // Process the stream
    const reader = response.body.getReader();
    const chunks = [];
    
    // Start chunk processing loop
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }
      
      // Store the chunk
      chunks.push(value);
      
      // Try to decode audio from available chunks
      const audioData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        audioData.set(chunk, offset);
        offset += chunk.length;
      }
      
      // Decode the audio
      try {
        const audioBuffer = await audioContext.decodeAudioData(audioData.buffer.slice(0));
        audioQueue.push(audioBuffer);
        chunks.length = 0; // Clear processed chunks
        
        // Start playing if not already
        if (!isPlaying) {
          playNextChunk();
        }
      } catch (error) {
        // Not enough data to decode yet, continue collecting chunks
      }
    }
    
    return { 
      requestId,
      cancel: async () => {
        if (requestId) {
          await cancelTTS(requestId);
        }
      }
    };
  } catch (error) {
    console.error('Streaming TTS error:', error);
    return { requestId, cancel: () => {} };
  }
}

// Example usage
const { cancel } = await streamSpeech('This is a longer text that will be streamed in chunks as the audio is being generated.');

// To cancel playback
document.getElementById('stopButton').addEventListener('click', () => {
  cancel();
});
```

#### Cancelling TTS

To stop an ongoing TTS stream:

```javascript
async function cancelTTS(requestId) {
  if (!requestId) return;
  
  try {
    const response = await fetch('https://ftvoiceservice-production.up.railway.app/tts/v1/tts/stop', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request_id: requestId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Cancel TTS error:', error);
  }
}
```

### 2. Speech-to-Text (ASR)

To capture user's speech and get a response:

#### Recording Audio in the Browser

First, set up audio recording:

```javascript
class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
  }
  
  async start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.audioChunks = [];
      this.mediaRecorder.addEventListener('dataavailable', event => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      });
      
      this.mediaRecorder.start();
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }
  
  stop() {
    return new Promise(resolve => {
      if (!this.mediaRecorder) {
        resolve(null);
        return;
      }
      
      this.mediaRecorder.addEventListener('stop', () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        resolve(audioBlob);
      });
      
      this.mediaRecorder.stop();
      console.log('Recording stopped');
    });
  }
}
```

#### Sending Audio and Receiving Response

Then send the recorded audio and play the response:

```javascript
async function processVoiceInput() {
  // 1. Record audio
  const recorder = new AudioRecorder();
  await recorder.start();
  
  // Record for 5 seconds (or use a button to stop)
  await new Promise(resolve => setTimeout(resolve, 5000));
  const audioBlob = await recorder.stop();
  
  if (!audioBlob) {
    console.error('No audio recorded');
    return;
  }
  
  // 2. Send to the ASR endpoint
  const formData = new FormData();
  formData.append('audio', audioBlob);
  
  try {
    const response = await fetch('https://ftvoiceservice-production.up.railway.app/asr/v1/asr', {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    // 3. Get the audio response
    const audioResponseBlob = await response.blob();
    
    // 4. Play the response
    const audioUrl = URL.createObjectURL(audioResponseBlob);
    const audio = new Audio(audioUrl);
    audio.play();
    
    audio.onended = () => {
      URL.revokeObjectURL(audioUrl);
    };
  } catch (error) {
    console.error('ASR processing error:', error);
  }
}

// Example: Activate with a button
document.getElementById('startRecordingButton').addEventListener('click', processVoiceInput);
```

### 3. Real-time Conversation via WebSocket

For continuous voice interaction:

```javascript
class VoiceAssistant {
  constructor(url = 'wss://ftvoiceservice-production.up.railway.app/asr/v1/asr/ws') {
    this.wsUrl = url;
    this.ws = null;
    this.mediaRecorder = null;
    this.audioContext = null;
    this.socket = null;
    this.isListening = false;
    this.audioQueue = [];
    this.isPlaying = false;
  }
  
  async init() {
    // Create Audio Context
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Connect to WebSocket
    this.socket = new WebSocket(this.wsUrl);
    
    // Set up WebSocket event handlers
    this.socket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    this.socket.onmessage = async (event) => {
      // Handle text message
      if (typeof event.data === 'string') {
        const data = JSON.parse(event.data);
        
        // Handle transcript
        if (data.transcript !== undefined) {
          if (data.is_final) {
            console.log('Final transcript:', data.transcript);
            // Update UI with final transcript
            document.getElementById('transcript').innerText = data.transcript;
          } else {
            console.log('Interim transcript:', data.transcript);
            // Update UI with interim transcript
            document.getElementById('interim-transcript').innerText = data.transcript;
          }
        }
        
        // Handle audio chunks (base64 encoded)
        if (data.audio_chunk) {
          // Decode base64 audio
          const binaryString = atob(data.audio_chunk);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          
          try {
            // Decode audio
            const audioBuffer = await this.audioContext.decodeAudioData(bytes.buffer);
            this.audioQueue.push(audioBuffer);
            
            // Start playing if not already
            if (!this.isPlaying) {
              this.playNextChunk();
            }
          } catch (error) {
            console.error('Error decoding audio:', error);
          }
        }
        
        // Handle audio completion
        if (data.audio_complete) {
          console.log('Audio response complete');
        }
        
        // Handle errors
        if (data.error) {
          console.error('WebSocket error:', data.error);
        }
      }
    };
    
    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  async playNextChunk() {
    if (this.audioQueue.length === 0) {
      this.isPlaying = false;
      return;
    }
    
    this.isPlaying = true;
    const audioBuffer = this.audioQueue.shift();
    
    // Create source node
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    
    // Play the chunk
    source.start(0);
    
    // Wait for it to finish before playing next chunk
    source.onended = () => {
      this.playNextChunk();
    };
  }
  
  async startListening() {
    if (this.isListening) return;
    
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up media recorder
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        // Send audio chunks to server
        if (event.data.size > 0 && this.socket?.readyState === WebSocket.OPEN) {
          // Convert Blob to ArrayBuffer and send as binary
          event.data.arrayBuffer().then(buffer => {
            this.socket.send(buffer);
          });
        }
      };
      
      // Start recording with small timeSlice for frequent chunks
      this.mediaRecorder.start(100);
      this.isListening = true;
      
      console.log('Started listening');
    } catch (error) {
      console.error('Error starting to listen:', error);
    }
  }
  
  stopListening() {
    if (!this.isListening) return;
    
    // Stop recording
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      
      // Send end_stream message
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ end_stream: true }));
      }
    }
    
    this.isListening = false;
    console.log('Stopped listening');
  }
  
  disconnect() {
    this.stopListening();
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// Example usage
const assistant = new VoiceAssistant();
await assistant.init();

// Start listening on button press
document.getElementById('startButton').addEventListener('mousedown', () => {
  assistant.startListening();
});

// Stop listening when button released
document.getElementById('startButton').addEventListener('mouseup', () => {
  assistant.stopListening();
});

// Clean up when done
window.addEventListener('beforeunload', () => {
  assistant.disconnect();
});
```

#### Barge-in Support

To implement barge-in (interrupting the assistant while it's speaking):

```javascript
// Add to your VoiceAssistant class:
bargeIn() {
  // Stop any playing audio
  this.isPlaying = false;
  this.audioQueue = [];
  
  // If there's an active request, cancel it
  if (this.activeRequestId) {
    fetch('https://ftvoiceservice-production.up.railway.app/tts/v1/tts/stop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: this.activeRequestId })
    }).catch(error => console.error('Error cancelling TTS:', error));
  }
  
  // Start listening immediately
  this.startListening();
}

// Example of barge-in triggering:
document.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    assistant.bargeIn();
  }
});
```

## UX Suggestions

### Audio Visualization

Add a waveform or volume indicator to show that the microphone is active:

```javascript
function createAudioVisualizer(stream, canvasElement) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  source.connect(analyser);
  
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  
  const canvas = canvasElement;
  const canvasCtx = canvas.getContext('2d');
  canvas.width = 300;
  canvas.height = 50;
  
  function draw() {
    requestAnimationFrame(draw);
    
    analyser.getByteFrequencyData(dataArray);
    
    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i] / 2;
      
      canvasCtx.fillStyle = `rgb(50, ${barHeight + 100}, 50)`;
      canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      
      x += barWidth + 1;
    }
  }
  
  draw();
  return { analyser, audioContext };
}

// Use with the recorder:
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const visualizer = createAudioVisualizer(stream, document.getElementById('visualizer'));
    // Continue with recording setup...
  });
```

### Voice Activity Detection

To automatically start/stop recording when voice is detected:

```javascript
function setupVAD(stream, options = {}) {
  const defaults = {
    threshold: 0.01,
    minSpeechTime: 300,
    minSilenceTime: 1000,
    onSpeechStart: () => {},
    onSpeechEnd: () => {},
  };
  
  const config = { ...defaults, ...options };
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);
  
  source.connect(analyser);
  analyser.fftSize = 512;
  
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Float32Array(bufferLength);
  
  let speaking = false;
  let speechStartTime = 0;
  let silenceStartTime = 0;
  
  const checkAudio = () => {
    analyser.getFloatTimeDomainData(dataArray);
    
    // Calculate RMS
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / bufferLength);
    
    const now = Date.now();
    
    if (rms > config.threshold) {
      if (!speaking) {
        speechStartTime = now;
        if (now - silenceStartTime >= config.minSilenceTime) {
          speaking = true;
          config.onSpeechStart();
        }
      } else {
        silenceStartTime = now;
      }
    } else if (speaking) {
      if (silenceStartTime === 0) {
        silenceStartTime = now;
      } else if (now - silenceStartTime >= config.minSilenceTime && 
                now - speechStartTime >= config.minSpeechTime) {
        speaking = false;
        speechStartTime = 0;
        silenceStartTime = 0;
        config.onSpeechEnd();
      }
    }
    
    requestAnimationFrame(checkAudio);
  };
  
  checkAudio();
  
  return {
    stop: () => {
      source.disconnect();
    }
  };
}

// Example usage:
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const vad = setupVAD(stream, {
      onSpeechStart: () => {
        console.log('Speech detected, starting recording');
        recorder.start();
      },
      onSpeechEnd: () => {
        console.log('Speech ended, stopping recording');
        recorder.stop().then(audioBlob => {
          // Process audio...
        });
      }
    });
  });
```

## Browser Compatibility

The code examples provided work in modern browsers that support:
- Web Audio API
- MediaRecorder API
- Fetch API with streaming
- WebSocket API

This includes:
- Chrome 49+
- Firefox 41+
- Safari 11+
- Edge 79+

For older browsers, consider using polyfills or alternative approaches:
- Use audio file upload instead of MediaRecorder
- Fallback to regular AJAX instead of fetch streaming

## Troubleshooting

Common issues and solutions:

1. **Audio doesn't play**
   - Check if autoplay policy is blocking (user interaction required first)
   - Verify audio format compatibility (MP3 is widely supported)

2. **WebSocket disconnects**
   - Implement reconnection logic
   - Check network connection
   - Verify SSL/TLS certificates if using secure WebSockets

3. **Permissions denied**
   - Request microphone permission with proper user interaction
   - Check browser settings for blocked permissions

4. **High latency**
   - Use smaller audio chunks
   - Optimize network requests
   - Consider adjusting buffer sizes

## End-to-End Example

Here's a minimal complete example:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Voice Assistant Demo</title>
  <style>
    button {
      padding: 16px 24px;
      font-size: 18px;
      margin: 20px;
    }
    .transcript {
      margin: 20px;
      padding: 10px;
      background: #f0f0f0;
      min-height: 50px;
    }
    #interim {
      color: #888;
    }
    canvas {
      width: 100%;
      height: 100px;
      background: #000;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <h1>Voice Assistant</h1>
  
  <div>
    <button id="record">Press & Hold to Speak</button>
    <button id="stopPlayback">Stop Playback</button>
  </div>
  
  <canvas id="visualizer"></canvas>
  
  <div class="transcript">
    <div id="interim"></div>
    <div id="final"></div>
  </div>
  
  <script>
    // Initialize WebSocket Voice Assistant
    const assistant = new VoiceAssistant('wss://ftvoiceservice-production.up.railway.app/asr/v1/asr/ws');
    let visualizer = null;
    
    // Set up UI elements
    const recordButton = document.getElementById('record');
    const stopButton = document.getElementById('stopPlayback');
    const interimTranscript = document.getElementById('interim');
    const finalTranscript = document.getElementById('final');
    const canvas = document.getElementById('visualizer');
    
    // VoiceAssistant implementation
    async function VoiceAssistant(wsUrl) {
      // Implementation from earlier examples...
    }
    
    // Initialize everything
    window.addEventListener('DOMContentLoaded', async () => {
      await assistant.init();
      
      // Set up button handlers
      recordButton.addEventListener('mousedown', () => {
        assistant.startListening();
      });
      
      recordButton.addEventListener('mouseup', () => {
        assistant.stopListening();
      });
      
      stopButton.addEventListener('click', () => {
        assistant.bargeIn();
      });
      
      // Clean up
      window.addEventListener('beforeunload', () => {
        assistant.disconnect();
      });
    });
  </script>
</body>
</html>
```

This example provides all the core functionality for voice interactions with the service.
