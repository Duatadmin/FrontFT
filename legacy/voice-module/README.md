# Voice Module

## Overview

The Voice Module is a self-contained, embeddable JavaScript library designed for capturing, processing, and streaming microphone audio in real-time directly from a web browser. It abstracts the complexities of browser audio APIs (like `AudioContext` and `AudioWorklet`) and WebSocket communication, providing a streamlined solution for integrating voice input capabilities into web applications.

Key benefits include its modular architecture, support for both push-to-talk and voice-activated (walkie-talkie) input modes, real-time PCM audio processing, and an event-driven system for easy integration.

## Main Features

-   **Dual Input Modes:** 
    -   `Push-to-Talk`: Manual recording control initiated by user actions.
    -   `Walkie-Talkie`: Automatic voice-activated recording using Voice Activity Detection (VAD).
-   **Real-time Audio Processing:** Utilizes `AudioWorklet` for efficient, non-blocking audio processing in a separate thread. Converts microphone input to 16-bit signed PCM audio frames.
-   **WebSocket Communication:** Streams binary PCM audio data to a specified ASR (Automatic Speech Recognition) server and receives JSON-based transcript responses.
-   **Voice Activity Detection (VAD):** For walkie-talkie mode, uses RMS (Root Mean Square) energy analysis with configurable thresholds, activation duration, and hold times to accurately detect speech.
-   **Event-Driven Architecture:** Emits various events for session state changes, recording status, audio levels, and transcripts, allowing for decoupled application logic.
-   **Comprehensive State Management:** Tracks the detailed state of the voice session, including connection status, microphone access, recording activity, and transcript history.
-   **Configurable:** Offers various options for audio parameters, VAD sensitivity, WebSocket URLs, and debug logging.

## How it Works (High-Level Flow)

1.  **Initialization:** The application creates an instance of `VoiceModule`, providing configuration (mode, WebSocket URL, etc.). The `VoiceModule` constructor initializes the `VoiceCore`.
2.  **Starting the Module:** The application calls `voiceModule.start()` (or `init()` depending on the exact API, typically `start()` is the main entry point after construction).
    -   `VoiceCore` initializes essential components: `AudioContext`, `PCMWorkletNodeController` (which loads the `pcm-processor` AudioWorklet), the selected `InputMode` (Push-to-Talk or Walkie-Talkie), and `WebSocketClient`.
    -   The `WebSocketClient` attempts to connect to the ASR server.
3.  **Audio Capture & Processing:**
    -   `PCMWorkletNodeController` requests microphone access via `navigator.mediaDevices.getUserMedia()`.
    -   Once permission is granted, audio flows from the microphone `MediaStream` to the `pcm-processor` (AudioWorklet).
    -   The `pcm-processor` (running in a separate audio thread) converts the raw float32 audio samples into 16-bit PCM frames and posts them back to the main thread.
    -   `PCMWorkletNodeController` receives these PCM frames, buffers them if necessary to ensure consistent frame sizes (e.g., 20ms), and forwards them to `VoiceCore`.
4.  **Input Mode Logic & Activation:**
    -   `VoiceCore` passes the PCM frames to the active `InputMode`.
    -   **Push-to-Talk Mode:** Relies on explicit calls like `voiceModule.startRecording()` and `voiceModule.stopRecording()` from the application to set its active state.
    -   **Walkie-Talkie Mode:** The `WalkieTalkieMode` analyzes the RMS energy of each PCM frame. If the energy exceeds the configured `rmsThreshold` for the `activationDuration`, it becomes active. It remains active during speech and for a `holdDuration` after speech stops to prevent premature cutoffs.
    -   The `InputMode` notifies `VoiceCore` of changes in its active state.
5.  **Data Streaming:**
    -   If `VoiceCore` determines that the session is active (based on the input mode and WebSocket connection status), it sends the 16-bit PCM audio frames to the ASR server via `WebSocketClient.send(chunk)`.
6.  **Transcript Handling:**
    -   `WebSocketClient` listens for messages from the ASR server.
    -   Upon receiving a message, it parses the JSON transcript (which can be interim or final).
    -   It then triggers the `onTranscript` callback provided in the `VoiceModule` configuration and/or emits `TRANSCRIPT_INTERIM` or `TRANSCRIPT_FINAL` events via the internal `EventBus`.
7.  **Stopping & Cleanup:** When `voiceModule.destroy()` is called, `VoiceCore` stops recording, disconnects the WebSocket, and releases `AudioContext` resources.

## Architecture and Components

The module follows a modular, component-based architecture to promote separation of concerns.

### Folder Structure

```
voice-module/
├── index.js                    # Main VoiceModule export (facade)
├── config/
│   └── constants.js            # Default configuration, VITE_ env vars
├── audio/
│   ├── media-manager.js        # Handles navigator.mediaDevices.getUserMedia
│   ├── pcm-worklet-node.js     # Controller for the AudioWorkletNode
│   └── worklet/
│       └── pcm-processor.js    # The AudioWorkletProcessor (PCM conversion)
├── streaming/
│   └── ws-client.js            # WebSocket client for ASR communication
├── core/
│   ├── voice-core.js           # Central orchestrator, integrates all parts
│   ├── session-state.js        # Manages overall session state
│   └── event-bus.js            # Internal publish/subscribe event system
├── modes/
│   ├── mode-push.js            # Logic for Push-to-Talk mode
│   └── mode-walkie.js          # Logic for Walkie-Talkie (VAD) mode
└── styles/
    └── mic-indicator.css       # Placeholder CSS for a mic indicator
```

### Core Components

-   **`VoiceModule` (index.js):** The main public interface of the library. It acts as a facade, simplifying interaction with the underlying `VoiceCore`.
-   **`VoiceCore` (core/voice-core.js):** The heart of the module. It initializes and coordinates all other components: audio capture/processing, input mode logic, WebSocket communication, state management, and event emission.
-   **`PCMWorkletNodeController` (audio/pcm-worklet-node.js):** Manages the `AudioContext`, the microphone `MediaStream`, and the `AudioWorkletNode` instance. It's responsible for loading the `pcm-processor` worklet, connecting the audio graph, and receiving processed PCM frames from the worklet.
    -   **`pcm-processor.js` (audio/worklet/pcm-processor.js):** An `AudioWorkletProcessor` that runs in a dedicated audio thread. It receives raw float32 audio samples from the microphone, converts them to 16-bit signed PCM format, and efficiently transfers these PCM buffers back to the main thread.
-   **`WebSocketClient` (streaming/ws-client.js):** Manages the WebSocket connection to the ASR server. It handles connecting, sending binary audio data (PCM frames), receiving and parsing JSON transcript responses, and managing the connection lifecycle (open, close, error events).
-   **Input Modes (modes/):** Define how recording is activated.
    -   **`PushToTalkMode` (mode-push.js):** Implements manual recording control. The application explicitly calls methods like `startRecording()` and `stopRecording()`.
    -   **`WalkieTalkieMode` (mode-walkie.js):** Implements Voice Activity Detection (VAD). It analyzes the RMS energy of incoming audio frames to automatically start and stop recording based on configurable thresholds and timings.
-   **`SessionState` (core/session-state.js):** A dedicated class for managing the overall state of a voice session. This includes the current operational state (e.g., `IDLE`, `CONNECTING`, `RECORDING`, `ERROR`), WebSocket connection status, microphone access permissions, active recording status, and a history of received transcripts.
-   **`EventBus` (core/event-bus.js):** A simple publish/subscribe system enabling decoupled communication between different parts of the module. Components can emit events, and other components (or the consuming application via `VoiceModule.on()`) can subscribe to these events.
-   **Configuration (`config/constants.js`):** Contains default values for various settings (audio parameters, VAD thresholds, etc.) and is the source for environment variables like `VITE_ASR_WS_URL` which can define the default ASR server endpoint.

## Installation

```bash
# Using npm
npm install voice-module

# Using yarn
yarn add voice-module
```

## Usage

### Initialization

Import the module and create an instance with your desired configuration.

```javascript
import VoiceModule, { EVENTS, MODES, SESSION_STATE } from 'voice-module'; // Assuming MODES & SESSION_STATE are exported from index.js

const voiceModule = new VoiceModule({
  mode: MODES.PUSH_TO_TALK, // Or MODES.VOICE_ACTIVATED
  websocketUrl: 'wss://your-asr-service.com/v1/ws', // Or rely on VITE_ASR_WS_URL from .env
  audio: {
    sampleRate: 16000,
  },
  onTranscript: ({ text, is_final }) => {
    console.log(is_final ? `Final: ${text}` : `Interim: ${text}`);
    // Update your UI here
  },
  debug: true, // Enable verbose console logs
});

async function startVoiceModule() {
  try {
    await voiceModule.start(); // Initializes components and connects WebSocket
    console.log('Voice module ready and listening!');
  } catch (error) { 
    console.error('Failed to initialize voice module:', error);
    // Handle initialization errors (e.g., mic permission denied, WS connection failed)
  }
}

startVoiceModule();
```

### Controlling Recording (Push-to-Talk Mode)

If `mode` is set to `MODES.PUSH_TO_TALK` (or `'push'`):

```javascript
// Example: Link to UI buttons
document.getElementById('micButton').addEventListener('mousedown', () => {
  voiceModule.startRecording();
});
document.getElementById('micButton').addEventListener('mouseup', () => {
  voiceModule.stopRecording();
});

// Or toggle
document.getElementById('toggleMicButton').addEventListener('click', () => {
  voiceModule.toggleRecording();
});
```

### Walkie-Talkie Mode

If `mode` is set to `MODES.VOICE_ACTIVATED` (or `'walkie'`), recording starts and stops automatically based on voice activity. No explicit `startRecording()` or `stopRecording()` calls are typically needed from the application side once the module is started.

### Receiving Transcripts & Events

Transcripts can be handled via the `onTranscript` callback in the configuration, or by subscribing to `TRANSCRIPT_INTERIM` and `TRANSCRIPT_FINAL` events (see Events section).

### Cleanup

When the module is no longer needed, ensure to clean up its resources:

```javascript
voiceModule.destroy(); // Stops recording, disconnects WebSocket, releases AudioContext.
```

## Configuration Options

Configuration is provided as an object to the `VoiceModule` constructor. Options are merged with defaults from `config/constants.js`.

-   `mode`: (`String`) Input mode. Either `MODES.PUSH_TO_TALK` ('push') or `MODES.VOICE_ACTIVATED` ('walkie'). Default: `'push'`.
-   `websocketUrl`: (`String`) The URL of your ASR WebSocket server. If not provided, it may fall back to an environment variable like `VITE_ASR_WS_URL` defined in `config/constants.js`.
-   `audio`: (`Object`) Audio processing parameters.
    -   `sampleRate`: (`Number`) Target sample rate in Hz. Default: `16000`.
    -   `frameSize`: (`Number`) Number of PCM samples per audio frame sent. Default: `320` (which is 20ms at 16kHz).
    -   `mute`: (`Boolean`) Whether to mute local playback of the microphone input. Default: `true`.
-   `voiceDetection`: (`Object`) Configuration for 'walkie-talkie' (VAD) mode.
    -   `rmsThreshold`: (`Number`) RMS energy threshold for voice activation (typically 0.0 to 1.0). Default: `0.01`.
    -   `activationDuration`: (`Number`) Duration in milliseconds that audio must be above `rmsThreshold` to trigger activation. Default: `200`.
    -   `holdDuration`: (`Number`) Duration in milliseconds to continue recording after voice activity drops below `rmsThreshold`. Default: `1000`.
-   `onTranscript`: (`Function`) Callback function `({ text, is_final }) => void` triggered when a transcript (interim or final) is received.
-   `onStateChange`: (`Function`) Optional callback `(newState, error) => void` triggered when the overall `SessionState` changes.
-   `onWebsocketStatusChange`: (`Function`) Optional callback `(isConnected: boolean) => void` triggered when the WebSocket connection status changes.
-   `debug`: (`Boolean`) Set to `true` to enable verbose console logging from the module. Default: `false`.

## Events

The module uses an internal `EventBus` and exposes an `on(eventName, callback)` method for applications to subscribe to various events. The available event names are typically exported as an `EVENTS` object.

```javascript
voiceModule.on(EVENTS.EVENT_NAME, (payload) => {
  // Handle the event
});
```

Key `EVENTS` (refer to `core/event-bus.js` for the definitive list):

-   `SESSION_STATE_CHANGED`: Payload: `{ newState, prevState, error }`. Fired when the overall session state changes.
-   `WS_CONNECTED`: Fired when the WebSocket connection is successfully established.
-   `WS_DISCONNECTED`: Fired when the WebSocket connection is closed.
-   `MIC_ACCESS_GRANTED`: Fired when microphone permission is successfully obtained.
-   `MIC_ACCESS_DENIED`: Fired when microphone permission is denied by the user or browser.
-   `RECORDING_STARTED`: Fired when audio recording/streaming to the server begins (either by manual action or VAD).
-   `RECORDING_STOPPED`: Fired when audio recording/streaming stops.
-   `AUDIO_LEVEL`: Payload: `{ rms }`. Fired periodically with the current RMS audio level (useful for UI feedback, especially in VAD mode).
-   `TRANSCRIPT_INTERIM`: Payload: `{ text }`. Fired when an interim (non-final) transcript is received.
-   `TRANSCRIPT_FINAL`: Payload: `{ text }`. Fired when a final transcript is received.
-   `ERROR`: Payload: `{ message: string, details?: any }`. Fired for general module errors not covered by more specific events.

## State Management (`SessionState`)

The `SessionState` class (`core/session-state.js`) is responsible for tracking the comprehensive state of the voice module's session. This includes:

-   **Current Operational State:** Enum values like `IDLE`, `CONNECTING`, `READY` (connected, not recording), `RECORDING`, `ERROR`.
-   **WebSocket Connection Status:** Boolean indicating if the WebSocket is connected.
-   **Microphone Access Status:** Boolean indicating if microphone permission has been granted.
-   **Active Recording Status:** Boolean indicating if audio is currently being recorded/streamed.
-   **Transcript History:** Stores received transcripts.
-   **Last Error:** Information about the last error encountered.

The application can get a summary of the current state using `voiceModule.getState()` (if exposed) or by listening to the `EVENTS.SESSION_STATE_CHANGED` event.

## Dependencies

-   **Browser APIs:** The module relies heavily on modern browser APIs:
    -   `AudioContext`, `AudioWorkletNode`, `MediaStreamAudioSourceNode`, `GainNode` (Web Audio API).
    -   `navigator.mediaDevices.getUserMedia` (for microphone access).
    -   `WebSocket` (for communication with the ASR server).
-   **Build Tool (Development):** The module is set up to be built using Vite (as indicated by `vite.config.js` and `package.json` build scripts).

## Styling

-   `styles/mic-indicator.css`: This file is a placeholder for CSS styles related to a microphone activity indicator. Currently, it contains a `TODO` comment, indicating that specific UI styles are not yet implemented within the module itself.

## Building the Module

To build the module from source (e.g., after cloning the repository or making changes):

```bash
# Install dependencies
npm install
# or
yarn install

# Run the build process
npm run build
# or
yarn build
```

This typically compiles the source code and outputs distributable files (e.g., ESM, UMD formats) into a `dist/` directory, as configured in `vite.config.js`.

## Testing

(This section assumes standard testing practices. Update based on actual test setup.)

The project uses ESLint for code linting and Prettier for formatting.

-   **Linting:** `npm run lint` or `yarn lint`
-   **Formatting:** `npm run format` or `yarn format`

(Details about unit, integration, or end-to-end tests would go here if specified in `package.json` or known.)

## Troubleshooting

-   **"Failed to construct 'AudioContext': The number of hardware contexts is finite."**: This browser error means too many `AudioContext` instances are active. Ensure `voiceModule.destroy()` is called when the module is no longer needed to release the `AudioContext`.
-   **No Audio/Transcripts Received:**
    -   Check the browser's developer console for errors related to microphone permissions (`NotAllowedError`, `NotFoundError`).
    -   Verify WebSocket connection errors. Is the `websocketUrl` correct and the server reachable?
    -   Enable `debug: true` in the `VoiceModule` configuration for verbose logging, which can help trace the data flow and identify issues.
-   **VAD (Walkie-Talkie Mode) Issues:**
    -   **Too sensitive (activates on noise):** Increase `voiceDetection.rmsThreshold` or `voiceDetection.activationDuration`.
    -   **Not sensitive enough (misses speech):** Decrease `voiceDetection.rmsThreshold`.
    -   **Cuts off speech too early:** Increase `voiceDetection.holdDuration`.

## Contributing

Contributions are welcome! Please adhere to the following guidelines:

1.  **Bug Reports & Feature Requests:** Submit these through the project's issue tracker.
2.  **Pull Requests:** 
    -   Ensure your code follows the existing coding style and passes linting/formatting checks.
    -   Include tests for any new features or bug fixes.
    -   Discuss significant changes in an issue before starting work.

## License

(Assumed MIT, update if different) This project is licensed under the MIT License. See the `LICENSE` file for more details.
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