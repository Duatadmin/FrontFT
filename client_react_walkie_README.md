Business Logic – Push‑to‑Talk Mode (React Client Spec)

Based on test_walkie_online.py fileciteturn7file0 – June 5 2025

1. What the Python Prototype Does (line‑by‑line)

Phase

Code reference

Purpose

Idle

waits for keyboard.wait("space")

Toggle start.

Session init

sid = uuid.uuid4()

Generate unique session id shared by both sockets.

Connect sockets

websockets.connect(URL) → /walkie (audio)  

websockets.connect(CTRL_URL) → /walkie-ctrl (control)

Two independent WS channels. ping_interval=None – keep‑alives handled in‑app.

Handshake

await ws.send({"sid": sid}) (both sockets)

Backend registers the session.

Mic capture

sd.InputStream(sr=16k, blocksize=30 ms)

Pull 30 ms Int16 PCM frames.

Streaming loop

await audio_ws.send(pcm) every 30 ms

Send PCM while mic_locked == False.

Meter

_meter_char(pcm) every 4 frames

CLI visualisation.

Control rx

on ctrl_ws expect { "cmd": "mute" } → mic_locked = True

Backend tells client to pause streaming.

ASR rx

on audio_ws expect { "final": true, "text": … }

Print transcript, unlock mic, set final_evt.

Stop

second SPACE or prototype exit

Close streams, display stats chunks_sent, duration.

Frame & timing constants

SR = 16_000, FMT = int16, mono.

CHUNK_MS = 30  → blocksize = SR * 0.03 ≈ 480 samples.

METER_EVERY_N_FRAMES = 4 (≈ 8 Hz visual update).

2. React Migration – What Changes, What Stays

Concern

Python behaviour

React replacement

Start / stop trigger

SPACE key toggles session

<PTTButton/> click toggles; same immediate start semantics.

Keyboard lib

keyboard.wait() (blocking)

onClick handler; keydown listeners can be added later if hardware key required.

Mic capture

Blocking sounddevice.InputStream

getUserMedia({ audio:true }) + AudioWorklet resampler → 16 kHz Int16 PCM.

WS client

websockets (asyncio)

WebSocket API in browser. Two instances: audioWS, ctrlWS.

Handshake message

{ sid } JSON on both sockets

Same JSON payload.

PCM send loop

await audio_ws.send(pcm)

audioWS.send(pcmArrayBuffer) every 30 ms via setInterval.

Meter CLI

dots / hashes to stdout

Temporary placeholder component that shows dots; real voice visualiser later.

Control ‑ mute

mic_locked = True on {cmd:"mute"}

Same; stop pushing PCM while flag true.

Final rx

unlock mic, wait for final_evt

Same; when {final:true} arrives, stop capture, close sockets.

Stats print

chunks & seconds

Console log; UI badge later if needed.

Everything else (session id, chunk size, timing, control commands) remains untouched.

3. Recommended React Structure (minimal parity)

src/
  hooks/
    useWalkiePTT.ts    # holds full state machine & WebSocket logic
  components/
    PTTButton.tsx      # Start/Stop toggle, disabled during connecting
    VoiceMeterStub.tsx # Shows • and # every 4 frames
  audio/
    resample-worklet.ts # 48→16 kHz, emits Int16 PCM 30 ms

3.1 useWalkiePTT (hook)

interface WalkieState {
  status: 'idle' | 'connecting' | 'live' | 'waiting-final' | 'error';
  meterChar: '·' | '#';
}

start() →

create sid = crypto.randomUUID()

open two WebSockets, send {sid} on open

start mic + worklet, schedule sendFrame() every 30 ms

stop() → stop interval, close sockets, await final.

handle ctrlWS.onmessage → set micLocked = true via ref.

handle audioWS.onmessage → if {final:true} → resolve final.

3.2 PTTButton

shows “Talk” when state.idle.

disabled + spinner while state.connecting (~50‑200 ms in LAN).

shows “Stop” during state.live.

3.3 VoiceMeterStub

receives meterChar from hook, renders dot/hash as text.

4. Exact Message & Frame Specs (for backend parity)

4.1 Audio Frames

Format: little‑endian Int16, mono, 16 kHz.

Frame duration: 30 ms (480 samples, 960 bytes).

Send rate: every 30 ms (± 2 ms).

4.2 Control Messages (JSON over /walkie-ctrl)

Direction

Example

Meaning

client → server

{ "sid": "<uuid>" }

Identify session.

server → client

{ "cmd": "mute" }

Pause sending audio until un‑muted by final.

4.3 Transcription Messages (JSON over /walkie)

Field

Example

Notes

final

true

Only one per utterance – triggers stop/cleanup.

text

"hello world"

Transcript snippet.

5. Mic & Resampler Details

Browsers capture 48 kHz Float32; convert to 16 kHz Int16 inside an AudioWorkletProcessor (≈ 150 LoC). Use linear interpolation or Speex WASM for production‑grade quality.

Emit exactly 480 samples per tick; accumulate fractional samples to keep sync.

6. Developer Checklist

pnpm create vite@latest isinka-voice --template react-ts.

Add audio/resample-worklet.ts, register in main thread.

Implement useWalkiePTT following state table above.

Wire PTTButton and VoiceMeterStub in App.tsx.

Test: click Talk → verify WS connected, backend receives PCM, returns final. Click Stop → session ends.

7. Future (Out of Scope)

Proper waveform/volume meter.

Hold‑to‑talk vs toggle.

Service Worker / Offline.

Mobile Safari quirks.