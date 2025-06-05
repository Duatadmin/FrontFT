Business Logic – Push‑to‑Talk Mode (Walkie‑Talkie)

Source of truth: [test_walkie_online.py] fileciteturn6file0Status: extracted spec, June 5 2025

1. High‑Level Overview

A lightweight CLI prototype implements a push‑to‑talk (PTT) workflow for Isinka’s Voice Service. The client:

Opens two WebSocket connections per session:

Audio channel → /v2/ws/walkie – streams raw PCM and receives ASR events.

Control channel → /v2/ws/walkie-ctrl – exchanges JSON control commands (e.g., {"cmd":"mute"}).

Uses the spacebar as the PTT button: press to start, press again to stop.

Sends mono 16 kHz, 16‑bit PCM frames of 30 ms (~480 bytes) while the key is held.

Waits for the server‑issued final transcript before closing sockets and printing stats.

No audio is ever streamed on the control WS; only JSON control messages flow there. The audio WS carries both PCM and JSON ASR events (string frames).

2. Session Lifecycle

Phase

Trigger

Client Action

Server Interaction

Idle

App start

Wait for first spacebar

–

Handshake

Spacebar ↓

Generate sid = uuid4()Connect to URL and CTRL_URLsend({"sid": sid}) on both sockets

Server binds sockets to same session ID

Streaming

sd.InputStream loop

▸ Capture 30 ms PCM▸ If mic_locked == False, audio_ws.send(pcm)▸ Every N frames, print meter char

Server performs ASR and may push partial transcripts (JSON text) back on audio_ws

Mic‑lock

Server control msg {"cmd":"mute"} on ctrl_ws

Set mic_locked = True ⇒ stop sending PCMPrint ! as visual cue

–

Stop‑listen

Spacebar ↓ again

Cease capturing; flush meter row

–

Final wait

After stop

Await final==true JSON on audio_ws or reader completion

Server issues final ASR transcript

Tear‑down

final_evt.set()

Close both sockets, cancel reader tasks, log stats

–

3. Message Formats

3.1 Outgoing (client → server)

Channel

Type

Schema / Example

both

text

{"sid":"<uuid>"} – one‑time handshake

audio

binary

Raw PCM Int16 Little‑Endian, 30 ms @ 16 kHz, mono

3.2 Incoming (server → client)

Channel

Type

Example

Meaning

audio

text

{"text":"hello","final":false}

Partial ASR result

audio

text

{"text":"hello world","final":true}

Final ASR result – triggers end of session

ctrl

text

{"cmd":"mute"}

Server requests client to mute mic until next final

Note: Binary control packets were removed; all control now JSON over /walkie-ctrl.

4. State Machine (Simplified)

stateDiagram-v2
    [*] --> Idle
    Idle --> Handshake: space↓
    Handshake --> Streaming: sockets open
    Streaming --> MicLocked: ctrl_ws «mute»
    MicLocked --> Streaming: final transcript
    Streaming --> WaitingFinal: space↓
    WaitingFinal --> Idle: final transcript

5. Meter Logic

For every 4th audio frame (~120 ms) print:

# if RMS > 300

· otherwise

On new partial/final transcript → flush to newline so text appears cleanly.

6. Metrics Logged

chunks_sent × CHUNK_MS → total streamed duration.

Overflow warnings from sounddevice.

Debug of raw messages (toggle via logging level).

7. Known Limitations

Uses keyboard library – requires admin on Windows, not available in browsers.

Mic‑lock simply drops frames; no client‑side buffering.

No reconnection logic; a dropped WS ends the session.

8. Porting Notes for React Client

Spacebar becomes PTTButton (mouse / touch).

Replace sounddevice with Web Audio API + resample → 16 kHz PCM.

Maintain single audio WS + single control WS; do not split PCM across two audio channels.

Preserve session ID handshake and mic‑lock behaviour.

