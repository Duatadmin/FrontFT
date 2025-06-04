# FitAPP Voice Service - Text-to-Speech (TTS)

[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0-009688.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg)](https://www.python.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-TTS--1-4A90E2.svg)](https://platform.openai.com/docs/guides/text-to-speech)

## 1. Project Overview

The FitAPP Voice Service is a high-performance Text-to-Speech (TTS) microservice built with FastAPI. It leverages OpenAI's `tts-1` model to convert text input into natural-sounding speech, streamed as Opus-encoded OGG audio. This service is designed for seamless integration into modern web front-ends, particularly React.js applications, providing real-time audio generation with support for caching and stream cancellation.

## 2. Quick Start

### Prerequisites

- Python 3.10+
- Pip (Python package installer)
- An OpenAI API Key

### Installation

1.  **Clone the repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd voice_service
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    # On Windows
    venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up environment variables:**
    Create a `.env` file in the project root by copying `.env.example`:
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file with your specific configurations (see section 3).

## 3. Configuration

Environment variables are used to configure the service. Create a `.env` file in the root directory or set them in your deployment environment.

| Variable             | Required | Description                                      | Default Value                  | Example Value                               |
| -------------------- | -------- | ------------------------------------------------ | ------------------------------ | ------------------------------------------- |
| `OPENAI_API_KEY`     | Yes      | Your OpenAI API key.                             | N/A                            | `sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx`           |
| `CHAT_BACKEND_URL`   | Yes      | URL for the chat backend (if used).              | N/A                            | `https://api.example.com/chat`              |
| `TIMEOUT_SEC`        | No       | Timeout in seconds for requests to OpenAI.       | `10`                           | `30`                                        |
| `ENABLE_TTS_CACHE`   | No       | Enable or disable TTS audio caching.             | `false`                        | `true`                                      |
| `TTS_MAX_CHAR_LIMIT` | No       | Maximum character limit for TTS input text.      | `1000`                         | `500`                                       |
| `TTS_DEFAULT_VOICE`  | No       | Default voice ID for TTS.                        | `nova`                         | `alloy`                                     |
| `USE_MOCK_CHAT`      | No       | Use mock chat service (dev only).                | `true`                         | `false`                                     |

## 4. Running Locally

For local development with hot-reloading, use Uvicorn:

```bash
cd path/to/your/voice_service # Ensure you are in the project root
uvicorn main:app --reload --port 8000
```

The service will be available at `http://localhost:8000`.

## 5. API Reference

The API root path is `/tts`.

### Generate Speech

-   **Endpoint:** `POST /tts/v1/tts`
-   **Description:** Converts text to speech and streams Opus/OGG audio.
-   **Request Body (`application/json`):**
    ```json
    {
      "text": "Hello world, this is a test.",
      "voice_id": "nova"
    }
    ```
    -   `text` (string, required): The text to synthesize. Min length: 1, Max length: `TTS_MAX_CHAR_LIMIT`.
    -   `voice_id` (string, optional): The voice to use. Defaults to `TTS_DEFAULT_VOICE`. See Voice Options.
-   **Headers:**
    -   `X-Request-ID` (string, optional): A unique ID for the request, useful for tracing and cancellation.
-   **Response:**
    -   `200 OK`: Streams `audio/ogg;codecs=opus`.
    -   `422 Unprocessable Entity`: If validation fails (e.g., text too long).
    -   `502 Bad Gateway`: If OpenAI TTS service returns an error.
    -   `504 Gateway Timeout`: If OpenAI TTS service times out.
-   **`curl` Example:**
    ```bash
    curl -X POST http://localhost:8000/tts/v1/tts \
    -H "Content-Type: application/json" \
    -H "X-Request-ID: my-unique-request-123" \
    -d '{"text":"Hello from the FitAPP Voice Service!", "voice_id":"alloy"}' \
    --output audio.ogg
    ```
    This command saves the streamed audio to `audio.ogg`.

### Stop Speech Stream

-   **Endpoint:** `POST /tts/v1/tts/stop`
-   **Description:** Stops an ongoing TTS stream for a given `request_id`.
-   **Request Body (`application/json`):**
    ```json
    {
      "request_id": "my-unique-request-123"
    }
    ```
    -   `request_id` (string, required): The `X-Request-ID` of the stream to stop.
-   **Response:**
    -   `200 OK`: If the stop signal was accepted.
        ```json
        {
          "detail": "Stream stop request accepted"
        }
        ```
    -   `404 Not Found`: If no active stream matches the `request_id`.
        ```json
        {
          "detail": "No active stream found with the provided request ID"
        }
        ```
-   **`curl` Example:**
    ```bash
    curl -X POST http://localhost:8000/tts/v1/tts/stop \
    -H "Content-Type: application/json" \
    -d '{"request_id":"my-unique-request-123"}'
    ```

## 6. Voice Options

The service supports the following OpenAI voice IDs:

-   `alloy`
-   `echo`
-   `fable`
-   `nova` (Default)
-   `onyx`
-   `shimmer`

These are mapped in `services/openai_tts_service.py` in the `VOICE_MAP` dictionary. To update or change available voices, modify this map according to OpenAI's supported voices for the `tts-1` model.

## 7. React Integration Guide

Here's how a React.js front-end can integrate with the TTS service:

```javascript
// Helper function to generate a unique ID (e.g., using uuid library)
const generateRequestId = () => `tts-req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

const playTextToSpeech = async (text, voiceId = 'nova') => {
  const audioElement = document.getElementById('tts-audio-player'); // Assuming <audio id="tts-audio-player"></audio>
  if (!audioElement) {
    console.error('Audio element not found');
    return;
  }

  const requestId = generateRequestId();
  let mediaSource;
  let sourceBuffer;
  const audioQueue = [];
  let isAppending = false;
  let streamEnded = false;

  try {
    const response = await fetch('http://localhost:8000/tts/v1/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
      },
      body: JSON.stringify({ text, voice_id: voiceId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('TTS API Error:', errorData.detail || response.statusText);
      // Handle error display to user
      return;
    }

    if (!response.body) {
      console.error('No response body from TTS service');
      return;
    }

    // Use MediaSource API for robust streaming playback
    mediaSource = new MediaSource();
    audioElement.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener('sourceopen', () => {
      try {
        // Opus in OGG container is 'audio/ogg; codecs=opus' or sometimes 'audio/webm; codecs=opus'
        // Browsers are generally good at detecting if 'audio/ogg' or 'audio/webm' is used.
        sourceBuffer = mediaSource.addSourceBuffer('audio/ogg; codecs=opus');
        sourceBuffer.mode = 'sequence'; // Important for concatenating chunks

        sourceBuffer.addEventListener('updateend', () => {
          isAppending = false;
          if (audioQueue.length > 0) {
            appendNextChunk();
          } else if (streamEnded && mediaSource.readyState === 'open' && !sourceBuffer.updating) {
            mediaSource.endOfStream();
          }
        });

        const reader = response.body.getReader();
        const processStream = ({ done, value }) => {
          if (done) {
            streamEnded = true;
            if (!isAppending && audioQueue.length === 0 && mediaSource.readyState === 'open' && sourceBuffer && !sourceBuffer.updating) {
              mediaSource.endOfStream();
            }
            return;
          }
          audioQueue.push(value); // value is a Uint8Array
          if (!isAppending) {
            appendNextChunk();
          }
          reader.read().then(processStream).catch(streamError => {
            console.error('Error reading stream:', streamError);
            if (mediaSource.readyState === 'open') mediaSource.endOfStream();
          });
        };

        reader.read().then(processStream).catch(streamError => {
          console.error('Error starting stream read:', streamError);
          if (mediaSource.readyState === 'open') mediaSource.endOfStream();
        });

      } catch (e) {
        console.error('MediaSource or SourceBuffer error:', e);
      }
    });

    audioElement.oncanplay = () => {
      audioElement.play().catch(e => console.error('Audio play error:', e));
    };
    audioElement.onerror = (e) => console.error('Audio element error:', e);

  } catch (error) {
    console.error('Fetch TTS error:', error);
    // Handle network errors or other fetch issues
  }

  const appendNextChunk = () => {
    if (sourceBuffer && !sourceBuffer.updating && audioQueue.length > 0) {
      isAppending = true;
      try {
        const chunkToAppend = audioQueue.shift();
        sourceBuffer.appendBuffer(chunkToAppend);
      } catch (e) {
        console.error('Error appending buffer:', e);
        isAppending = false; 
        // Potentially try to recover or end stream
        if (mediaSource && mediaSource.readyState === 'open') {
            try { mediaSource.endOfStream(); } catch (eosErr) { console.error('Error ending stream on append error:', eosErr); }
        }
      }
    }
  };

  // Return a function to stop this specific stream
  return async () => {
    console.log(`Requesting to stop TTS stream with ID: ${requestId}`);
    try {
      const stopResponse = await fetch('http://localhost:8000/tts/v1/tts/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ request_id: requestId }),
      });
      if (stopResponse.ok) {
        console.log('TTS stream stop request accepted.');
        // The server will signal the stream to stop. The client-side stream processing
        // will naturally end when the server closes the connection for that stream.
        // You might also want to manually stop audio playback and clean up MediaSource here if needed.
        if (audioElement) audioElement.pause();
        if (mediaSource && mediaSource.readyState === 'open') {
            try { mediaSource.endOfStream(); } catch (e) { /* ignore */ }
        }
      } else {
        const errorData = await stopResponse.json();
        console.error('Stop TTS API Error:', errorData.detail || stopResponse.statusText);
      }
    } catch (error) {
      console.error('Fetch stop TTS error:', error);
    }
  };
};

// Example Usage:
// let stopCurrentTTS;
// const handlePlay = async () => {
//   if (stopCurrentTTS) await stopCurrentTTS(); // Stop previous before starting new
//   stopCurrentTTS = await playTextToSpeech('Hello, this is a test of the streaming audio system.');
// };
// const handleStop = async () => {
//   if (stopCurrentTTS) await stopCurrentTTS();
// };
```

**Key points for React integration:**

1.  **Audio Element:** Have an `<audio>` element in your component.
2.  **`X-Request-ID`:** Generate and send a unique `X-Request-ID` header. This is crucial for the stop functionality.
3.  **Streaming with `fetch` and `ReadableStream`:** The response body (`response.body`) is a `ReadableStream`. Use its `getReader()` to process chunks.
4.  **`MediaSource` API:** This is the recommended way to play streamed audio that isn't a complete file. It allows appending audio buffers as they arrive.
    -   Set `sourceBuffer.mode = 'sequence';` for correct concatenation of Opus/OGG chunks.
    -   The MIME type for `addSourceBuffer` should be `audio/ogg; codecs=opus`.
5.  **Stopping the Stream:** Call the `/tts/v1/tts/stop` endpoint with the `request_id` used for the initial `/tts/v1/tts` call. The server will then terminate the corresponding stream. The client-side `ReadableStream` will then complete.
6.  **Error Handling:** Implement robust error handling for network issues, API errors, and `MediaSource` errors.

## 8. Caching Behaviour

-   **Enabled/Disabled:** Caching is controlled by the `ENABLE_TTS_CACHE` environment variable.
    -   If `true`, the service will first check a local disk cache for the requested text and voice combination.
    -   If `false` (default), all requests will go directly to OpenAI.
-   **Cache Hits:** If a cache entry exists, the audio is streamed directly from the cache, bypassing OpenAI. This is significantly faster and reduces API costs.
-   **Cache Misses:** If no cache entry is found (and caching is enabled), the audio is generated by OpenAI, streamed to the client, and simultaneously saved to the cache for future requests.
-   **Cache Key:** A unique MD5 hash is generated from the input text and voice ID to serve as the cache key.
-   **Time-To-Live (TTL):** Cached items expire after 24 hours (configurable in `services/cache_service.py` via `DEFAULT_TTL`).
-   **Location:** The cache is stored in a `./cache` directory in the project root.

## 9. Docker / Railway Deployment

### Docker

A minimal `Dockerfile` could look like this:

```dockerfile
# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code to the working directory
COPY . .

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable for OpenAI API Key (pass during run or in compose)
# ENV OPENAI_API_KEY="your_api_key_here"
# Add other ENV vars as needed (e.g., CHAT_BACKEND_URL, ENABLE_TTS_CACHE)

# Run uvicorn when the container launches
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t fitapp-voice-service .
docker run -p 8000:8000 -e OPENAI_API_KEY="your_openai_key" fitapp-voice-service
```

### Railway

Railway typically detects Python applications and can deploy them using a `Procfile` or by directly understanding `uvicorn` commands.

1.  Ensure your `requirements.txt` is up to date.
2.  Railway will likely use a command similar to the Docker `CMD`:
    `uvicorn main:app --host 0.0.0.0 --port $PORT`
    (Railway sets the `$PORT` environment variable automatically).
3.  Configure environment variables (like `OPENAI_API_KEY`, `ENABLE_TTS_CACHE`, etc.) in the Railway project settings.
4.  Ensure Railway exposes the application on port `8000` (or the port specified by `$PORT`).

## 10. Troubleshooting

-   **502 Bad Gateway / 504 Gateway Timeout:** These errors usually indicate a problem with the upstream OpenAI TTS service (unavailable, rate limits, API key issue) or a network timeout connecting to OpenAI. Check your `OPENAI_API_KEY` and OpenAI's status page.
-   **Opus Support in Browsers:** `audio/ogg;codecs=opus` is widely supported in modern browsers (Chrome, Firefox, Edge, Safari 11+). Ensure your target browsers are compatible. The `MediaSource` API is the most reliable way to handle this format for streaming.
-   **CORS (Cross-Origin Resource Sharing):** If your React app is on a different domain than the TTS service, you'll need to configure CORS in `main.py`. FastAPI's `CORSMiddleware` can be used:
    ```python
    # In main.py
    from fastapi.middleware.cors import CORSMiddleware

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "https://your-react-app.com"], # Add your React app's origin
        allow_credentials=True,
        allow_methods=["GET", "POST"],
        allow_headers=["X-Request-ID", "Content-Type"],
    )
    ```
-   **Text Length Limits:** Requests exceeding `TTS_MAX_CHAR_LIMIT` will result in a `422 Unprocessable Entity` error.
-   **Invalid Voice ID:** Using a `voice_id` not in the `VOICE_MAP` will fall back to the `TTS_DEFAULT_VOICE`.

## 11. License & Contributing

This project is licensed under the [MIT License](LICENSE.md) (assuming you add one).

Contributions are welcome! Please open an issue or submit a pull request.


1. Use appropriate HTTP client libraries that support streaming
2. Process audio chunks as they arrive
3. For WebSocket connections, handle binary audio data appropriately

### Cancelling TTS Streams

To cancel an ongoing TTS stream:

1. Store the `request_id` when initiating a TTS request
2. Send a POST request to `/tts/v1/tts/stop` with the request_id when cancellation is needed
3. The server will stop streaming and release resources

### Error Handling

The API follows standard HTTP status codes:

- `200`: Success
- `400`: Bad request (invalid parameters)
- `404`: Resource not found
- `502`: Backend service error
- `503`: Service unavailable
- `504`: Backend service timeout

## Configuration and Environment

### Required Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key for TTS | (Required) |
| `DEEPGRAM_API_KEY` | Deepgram API key for ASR | (Required) |
| `CHAT_BACKEND_URL` | URL of the chat backend API | (Required) |
| `TIMEOUT_SEC` | Timeout for external service requests | 10 |
| `ENABLE_TTS_CACHE` | Enable caching for TTS responses | false |
| `USE_MOCK_CHAT` | Use mock chat service instead of real backend | true |

### Mock Chat Mode

The service can operate in two modes controlled by the `USE_MOCK_CHAT` environment variable:

- `true`: Uses an internal mock chat service for testing (default)
- `false`: Forwards requests to the real chat backend at `CHAT_BACKEND_URL`

In mock mode, the service responds with predefined messages based on keywords detected in the input text.

## Status and Monitoring

### Health Checks

- `/health/live`: Simple liveness check
- `/health/ready`: Readiness check that verifies API keys are configured

### Metrics

The service exposes Prometheus metrics at `/metrics` for monitoring:

- HTTP request counts
- Request duration histograms
- Status code counters

### Logging

The service uses structured logging with request IDs for traceability:

- Format: `%(asctime)s | %(levelname)s | %(message)s`
- Important operations include request IDs for correlation
- TTS and ASR operations are logged with performance metrics

## Development and Testing

For local development:

1. Copy `.env.example` to `.env` and fill in the required API keys
2. Run with `uvicorn main:app --reload`
3. For testing without external services, set `USE_MOCK_CHAT=true`

Integration tests are available in the `tests/` directory.
