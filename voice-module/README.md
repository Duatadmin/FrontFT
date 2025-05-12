VoiceModule
A self-contained, embeddable JavaScript module for microphone audio streaming via AudioWorklet and WebSocket.

Summary
VoiceModule is a lightweight, modular JavaScript library that enables web applications to capture, process, and stream microphone audio in real-time. It supports both push-to-talk and voice-activated (walkie-talkie) input modes, making it versatile for various speech recognition and audio recording applications.

The module handles the complex details of audio worklet processing, voice activity detection, and WebSocket communication, allowing developers to focus on application logic rather than browser audio APIs.

Main Features
Dual Input Modes:
Push-to-talk (manual activation)
Walkie-talkie (automatic voice-activated)
Real-time Audio Processing:
Efficient PCM conversion using AudioWorklet
16-bit signed PCM format compatible with most ASR services
Configurable sample rate and frame size
Robust WebSocket Communication:
Binary audio streaming
JSON transcript reception
Automatic connection management
Advanced Voice Detection:
RMS energy threshold detection
Customizable sensitivity
Hold-over time to avoid cutting off speech
Comprehensive State Management:
Session state tracking
Transcript history
Error handling
Installation
bash
CopyInsert
# Using npm
npm install voice-module

# Using yarn
yarn add voice-module
Usage Examples
Example 1: Push-to-Talk Mode
This example demonstrates how to implement a basic push-to-talk interface that streams audio to an ASR service.

javascript
CopyInsert
import VoiceModule, { EVENTS } from 'voice-module';

// Create a voice module instance in push-to-talk mode
const voiceModule = new VoiceModule({
  mode: 'push',
  serverUrl: 'wss://your-asr-service.com/v1/ws',
  onTranscript: (transcript) => {
    if (transcript.is_final) {
      document.getElementById('transcript').textContent = transcript.text;
    } else {
      document.getElementById('interim').textContent = transcript.text;
    }
  }
});

// Initialize and connect to the server
async function initialize() {
  try {
    await voiceModule.start();
    console.log('Voice module ready!');
  } catch (error) {
    console.error('Failed to initialize voice module:', error);
  }
}

// Set up UI controls
document.getElementById('micButton').addEventListener('mousedown', () => {
  voiceModule.startRecording();
  document.getElementById('status').textContent = 'Recording...';
});

document.getElementById('micButton').addEventListener('mouseup', () => {
  voiceModule.stopRecording();
  document.getElementById('status').textContent = 'Ready';
});

// Clean up when done
document.getElementById('disconnect').addEventListener('click', () => {
  voiceModule.destroy();
  document.getElementById('status').textContent = 'Disconnected';
});

// Start the application
initialize();
Example 2: Voice-Activated Mode
This example shows how to implement automatic voice detection for a hands-free experience.

javascript
CopyInsert
import VoiceModule, { EVENTS, SESSION_STATE } from 'voice-module';

// Create a voice module instance in walkie-talkie mode
const voiceModule = new VoiceModule({
  mode: 'walkie',
  serverUrl: 'wss://your-asr-service.com/v1/ws',
  voice: {
    threshold: 0.015,      // Voice activation sensitivity (0-1)
    holdDuration: 1500     // Keep recording for 1.5s after voice ends
  },
  debug: true  // Enable verbose logging
});

// Subscribe to events
voiceModule.on(EVENTS.RECORDING_STARTED, () => {
  document.getElementById('status').textContent = 'Voice detected';
  document.getElementById('indicator').classList.add('active');
});

voiceModule.on(EVENTS.RECORDING_STOPPED, () => {
  document.getElementById('status').textContent = 'Listening for voice...';
  document.getElementById('indicator').classList.remove('active');
});

voiceModule.on(EVENTS.TRANSCRIPT_FINAL, (transcript) => {
  // Add final transcript to conversation
  const element = document.createElement('div');
  element.textContent = transcript.text;
  element.className = 'transcript final';
  document.getElementById('conversation').appendChild(element);
});

voiceModule.on(EVENTS.TRANSCRIPT_INTERIM, (transcript) => {
  document.getElementById('interim').textContent = transcript.text;
});

// Track session state changes
voiceModule.on(EVENTS.SESSION_STATE_CHANGED, ({ newState, error }) => {
  document.getElementById('sessionState').textContent = newState;
  
  if (newState === SESSION_STATE.ERROR) {
    console.error('Session error:', error);
    document.getElementById('error').textContent = error.message;
  }
});

// Initialize and start listening
async function initialize() {
  try {
    await voiceModule.start();
    document.getElementById('status').textContent = 'Listening for voice...';
  } catch (error) {
    document.getElementById('error').textContent = 
      `Failed to initialize: ${error.message}`;
  }
}

// Toggle debug mode
document.getElementById('toggleDebug').addEventListener('click', () => {
  const config = voiceModule.getConfig();
  config.debug = !config.debug;
  document.getElementById('debugStatus').textContent = 
    config.debug ? 'Debug mode ON' : 'Debug mode OFF';
});

// Start the application
initialize();
Architecture & Code Structure
The VoiceModule is designed with a modular, component-based architecture that follows single-responsibility principles.

Folder Structure
CopyInsert
voice-module/
├── index.js                    # Main VoiceModule export
├── config/
│   └── constants.js            # Configuration constants
├── audio/
│   ├── media-manager.js        # Microphone access
│   ├── pcm-worklet-node.js     # AudioWorklet controller
│   └── worklet/
│       └── pcm-processor.js    # PCM converter (runs in separate thread)
├── streaming/
│   └── ws-client.js            # WebSocket client
├── core/
│   ├── voice-core.js           # Core integration logic
│   ├── session-state.js        # State management
│   └── event-bus.js            # Event system
├── modes/
│   ├── mode-push.js            # Push-to-talk controller
│   └── mode-walkie.js          # Voice-activated controller
└── styles/
    └── mic-indicator.css       # Optional UI styles
Key Components
1. Audio Pipeline
Media Manager (media-manager.js):
Handles microphone permissions and access
Returns a MediaStream for audio processing
PCM Processor (pcm-processor.js):
AudioWorkletProcessor that runs in a separate thread
Converts floating-point audio samples to 16-bit PCM
Uses transferable buffers for optimal performance
Worklet Controller (pcm-worklet-node.js):
Manages the AudioWorklet lifecycle
Routes microphone input to the processor
Delivers processed audio chunks to the application
2. Input Modes
Push-to-Talk (mode-push.js):
Simple start/stop/toggle API for manual control
State management for recording status
Event notification for state changes
Walkie-Talkie (mode-walkie.js):
Voice activity detection using RMS energy calculation
State machine (IDLE → ACTIVE → HOLD → IDLE)
Configurable activation threshold and hold-over time
3. Streaming
WebSocket Client (ws-client.js):
Binary data transmission for audio
JSON parsing for transcript reception
Connection management and error handling
4. Core System
Voice Core (voice-core.js):
Coordinates all components
Manages initialization and cleanup
Routes audio, state changes, and events
Session State (session-state.js):
Tracks module state (idle, connecting, ready, recording, error)
Manages transcript history
Provides state transitions and validation
Event Bus (event-bus.js):
Implements publish/subscribe pattern
Decouples components through event-based communication
Provides standardized event types
5. Main Module (index.js)
Public API surface
Configuration normalization
Component instantiation and wiring
Internal Data Flow
Initialization Flow:
User creates a VoiceModule instance with configuration
VoiceModule initializes EventBus and SessionState
Core components are instantiated but not yet started
User calls start() to begin the pipeline
Microphone permission is requested
AudioContext and AudioWorklet are initialized
WebSocket connection is established
System enters "ready" state
Recording Flow (Push-to-Talk):
User calls startRecording()
Push-to-talk mode changes state to active
State change propagates to VoiceCore
Audio chunks from worklet are sent to WebSocket
Transcripts received are processed and stored
User calls stopRecording() to end
Recording Flow (Walkie-Talkie):
Audio chunks from worklet are analyzed for voice activity
When voice is detected, state changes to active
Audio chunks begin streaming to WebSocket
When voice stops, system enters hold state
After hold duration, recording stops
Transcript Processing:
WebSocket receives JSON transcript messages
WebSocketClient parses and validates messages
VoiceCore receives and timestamps transcripts
SessionState stores transcript history
Events are emitted for interim and final transcripts
User callbacks are invoked with transcript data
Design Choices
AudioWorklet vs. ScriptProcessorNode:
AudioWorklet runs on a separate thread, preventing audio glitches
More efficient for real-time processing
Future-proof as ScriptProcessorNode is deprecated
Binary Data Transfer:
Uses transferable buffers for zero-copy performance
Reduces memory overhead for streaming audio
State Machine for Voice Detection:
Prevents rapid on/off switching with hold state
Smooths detection for natural speech patterns
Configurable threshold adapts to different environments
Event-Driven Architecture:
Components communicate through events rather than direct calls
Enables easy extension and customization
Simplifies testing and debugging
Configuration Normalization:
Deeply merges user config with defaults
Provides sensible defaults for all options
Validates critical parameters
Testing Instructions
Unit Tests
bash
CopyInsert
# Install dependencies
npm install

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage
Manual Testing
For manual testing, you can use the provided development server:

bash
CopyInsert
# Start development server
npm run dev

# Open http://localhost:3000 in your browser
The development server includes a test page with controls for both push-to-talk and walkie-talkie modes.

Dependencies
VoiceModule has minimal external dependencies to ensure lightweight deployment:

No runtime dependencies for the core module
DevDependencies:
vite: Fast, modern build tooling
eslint: Code quality and style checking
prettier: Code formatting
Browser Support
VoiceModule supports modern browsers that implement the Web Audio API with AudioWorklet support:

Chrome 64+
Firefox 76+
Edge 79+
Safari 14.1+
License
ISC

Contribution & Support
Contributions are welcome! Please feel free to submit a Pull Request.

Guidelines for Contributing
Fork the repository
Create your feature branch: git checkout -b feature/my-new-feature
Commit your changes: git commit -am 'Add some feature'
Push to the branch: git push origin feature/my-new-feature
Submit a pull request
Getting Support
For bugs or feature requests, please open an issue on the GitHub repository.

Performance Considerations
The module is optimized for real-time audio processing with minimal latency
Voice detection is tuned for speech patterns rather than ambient noise
Memory usage is managed by limiting transcript history
WebSocket connection is designed to handle network fluctuations
Built with ❤️ by the FitAPP team