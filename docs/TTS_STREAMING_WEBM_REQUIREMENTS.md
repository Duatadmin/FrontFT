# TTS Streaming with WebM Container Requirements

## Current Situation

The frontend is now capable of streaming audio using MediaSource API with WebM/Opus format, but the backend currently returns Ogg/Opus format which is **not supported** by MediaSource API for streaming.

## Browser Support for Opus Streaming

### ✅ Supported by MediaSource API:
- `audio/webm; codecs="opus"` - WebM container with Opus codec
- `audio/mp4; codecs="opus"` - MP4 container with Opus codec (newer browsers)

### ❌ NOT Supported by MediaSource API:
- `audio/ogg; codecs="opus"` - Ogg container with Opus codec

This is a limitation of the MediaSource Extensions (MSE) specification, not a browser bug.

## Backend Changes Required

To enable true streaming with low latency, the backend needs to support WebM output format. Here are the required changes:

### 1. Update TTS Service Response Format

The backend at `https://ftvoiceservice-production-6960.up.railway.app/tts/v1/tts` needs to:

1. Accept a `container_format` parameter in the request:
```json
{
  "text": "Hello world",
  "voice": "shimmer",
  "response_format": "opus",
  "container_format": "webm"  // New parameter
}
```

2. Return audio in WebM container format when requested:
- Content-Type: `audio/webm; codecs=opus`
- Stream WebM-formatted Opus audio chunks

### 2. Alternative Approach - Format Negotiation

Use HTTP Accept header for format negotiation:
```javascript
headers: {
  'Accept': 'audio/webm; codecs=opus, audio/ogg; codecs=opus',
  'Content-Type': 'application/json',
  'X-Request-ID': requestId,
}
```

Backend can then choose the best format based on what it supports.

### 3. OpenAI TTS to WebM Conversion

Since OpenAI's TTS API returns audio in specific formats, the backend may need to:

1. **Option A**: Use a library like FFmpeg to convert Ogg/Opus to WebM/Opus on-the-fly:
```python
# Example using ffmpeg-python
import ffmpeg

stream = ffmpeg.input('pipe:', format='ogg')
stream = ffmpeg.output(stream, 'pipe:', format='webm', acodec='copy')
ffmpeg.run_async(stream, pipe_stdin=True, pipe_stdout=True)
```

2. **Option B**: Use a Python library like `pymediainfo` or `pyav` for container conversion

3. **Option C**: Request a different format from OpenAI if they support WebM output

## Frontend Implementation Status

The frontend is ready for WebM streaming:

1. ✅ Detection of WebM/Opus support via MediaSource API
2. ✅ Streaming logic updated to use `STREAMING_MIME = 'audio/webm; codecs="opus"'`
3. ✅ Progressive download fallback for compatibility
4. ✅ Flag `backendSupportsWebM` ready to enable streaming when backend is updated

## Enabling Streaming

Once the backend supports WebM output:

1. Set `backendSupportsWebM = true` in `/src/hooks/useVoicePlayback.ts` line 305
2. Optionally add container format parameter to the TTS request
3. Test streaming performance improvements

## Benefits of WebM Streaming

- **Lower latency**: Audio starts playing before download completes
- **Better mobile performance**: Reduced memory usage
- **Cancellable streams**: Can stop mid-stream without downloading entire file
- **Progressive playback**: Smoother experience on slow connections

## Testing

To verify WebM support in browser console:
```javascript
// Should return true in modern browsers
MediaSource.isTypeSupported('audio/webm; codecs="opus"')

// Currently returns false (Ogg not supported for streaming)
MediaSource.isTypeSupported('audio/ogg; codecs="opus"')
```

## References

- [W3C MediaSource Extensions](https://www.w3.org/TR/media-source/)
- [WebM Project](https://www.webmproject.org/)
- [Opus Codec](https://opus-codec.org/)
- [MDN MediaSource API](https://developer.mozilla.org/en-US/docs/Web/API/MediaSource)