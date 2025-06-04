# TTS Voice Mode

## Overview

The TTS (Text-to-Speech) Voice Mode enhances the chat experience by speaking new bot messages aloud. It features a toggle for enabling/disabling playback, a queueing system for sequential message playback, and a visual indicator when audio is playing.

## Toggle Usage

A speaker icon button (🔈/🔇) located in the chat header controls the Voice Mode:
-   **🔈 (Volume2 icon, grayed out):** Voice Mode is OFF. Click to enable.
-   **🔇 (VolumeX icon, white):** Voice Mode is ON. Click to disable.

The toggle state is persisted in `localStorage`, so your preference is remembered across page reloads and sessions.

Next to the toggle, a "Speaking..." badge with an animated radio icon (🎙️) will appear when Voice Mode is ON and a message is actively being spoken.

## Hook API (`useVoicePlayback`)

The core logic is managed by the `useVoicePlayback` hook, accessible via `VoiceContext`.

**File:** `src/hooks/useVoicePlayback.ts`
**Context:** `src/hooks/VoiceContext.tsx` (provides `useVoice`)

### Returned Values & Functions:

-   `voiceEnabled: boolean`
    -   Current state of the voice mode toggle (true if ON, false if OFF).
-   `isPlaying: boolean`
    -   True if an audio utterance is currently playing.
-   `toggleVoice: () => void`
    -   Toggles the `voiceEnabled` state.
    -   If turning OFF, it stops any current playback and clears the queue.
-   `enqueueBotUtterance: (text: string, messageId: string) => void`
    -   Adds a bot's message text to the playback queue.
    -   Does nothing if `voiceEnabled` is `false` or if the `messageId` has already been processed (to prevent duplicates).
    -   If the queue was empty and playback is not active, it starts playing the new utterance immediately.
-   `stopCurrentPlayback: (calledByToggleOff?: boolean) => void`
    -   Stops the currently playing audio stream and aborts the fetch request.
    -   Sends a `/v1/tts/stop` request to the server.
    -   If `calledByToggleOff` is true (i.e., called from `toggleVoice` when turning off), the entire queue is cleared.

### Internal State & Logic:

-   **Queue (`queue: string[]`)**: Stores text utterances waiting to be played.
-   **Current Request ID (`currentRequestId: string | null`)**: A unique ID (`crypto.randomUUID()`) for the current TTS fetch request, used for aborting and server-side stop requests.
-   **Played IDs (`playedIds: Set<string>`)**: A set of message IDs that have already been enqueued to prevent re-playing the same message (e.g., on re-renders).
-   **Audio Player (`<audio id="tts-audio-player">`)**: A hidden HTML audio element used to play the TTS stream.
-   **AbortController**: Used to cancel ongoing `fetch` requests for TTS audio, e.g., when stopping playback or unmounting.

## Endpoint Reference

The Voice Mode interacts with the following FastAPI TTS service endpoints (base URL: `http://ft_voice_service.railway.internal`):

1.  **`POST /v1/tts`**
    -   **Purpose**: Generate and stream TTS audio for the given text.
    -   **Request Body** (JSON):
        ```json
        {
          "text": "The message content to be spoken."
        }
        ```
    -   **Headers**:
        -   `Content-Type: application/json`
        -   `X-Request-ID: <generated_uuid>` (A unique ID for this specific TTS request)
    -   **Response**: Streams Opus OGG audio (`audio/ogg; codecs=opus`).

2.  **`POST /v1/tts/stop`**
    -   **Purpose**: Notify the server to stop generation/streaming for a specific request ID (fire-and-forget).
    -   **Request Body** (JSON):
        ```json
        {
          "request_id": "<currentRequestId_being_stopped>"
        }
        ```
    -   **Headers**:
        -   `Content-Type: application/json`
    -   **Response**: Typically a 200 OK or 204 No Content if successful.

## Browser Support Caveats

-   **Opus OGG Streaming**: The primary method uses `MediaSource` API to stream Opus OGG audio. This is widely supported in modern desktop browsers (Chrome, Firefox, Edge, Safari 14.1+).
-   **Mobile Safari (and older browsers) Fallback**: If `MediaSource.isTypeSupported('audio/ogg;codecs=opus')` returns `false` (common on iOS/iPadOS Safari before certain versions), the system falls back to:
    1.  Fetching the entire audio stream as a `Blob`.
    2.  Creating an object URL via `URL.createObjectURL(blob)`.
    3.  Setting this URL as the `src` for the `<audio>` element and playing it.
    This fallback ensures wider compatibility but means the audio will only start playing after the entire stream has been downloaded, potentially introducing a delay for longer messages.
-   **Autoplay Restrictions**: Browsers often have autoplay restrictions. Audio playback initiated by the hook should generally work as it's triggered in response to user interaction (receiving a message after initial setup). However, if issues arise, ensure the first playback attempt is closely tied to a user gesture.

## Event Handling for Stopping Playback

Playback is automatically stopped and resources are cleaned up in the following scenarios:

-   User toggles Voice Mode OFF.
-   The chat component (or a parent managing `VoiceProvider`) unmounts (e.g., navigating to a different part of the application).
    -   The `useEffect` cleanup in `useVoicePlayback` calls `stopCurrentPlayback()`.
    -   The React Router unmount of the Chat component should also trigger this if `VoiceProvider` is scoped to the chat route.
-   User attempts to close the tab or refresh the page (`beforeunload` event).
    -   A `navigator.sendBeacon` call is made to `/v1/tts/stop` to attempt a fire-and-forget stop on the server, as the browser may not wait for a full `fetch` request to complete during unload.
