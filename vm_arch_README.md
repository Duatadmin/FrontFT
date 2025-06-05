Isinka React Voice Client – Final Integration Plan v3

(June 5 2025)

0. Changes After Review

Item

What Changed

Why

“No processing” requirement

Single processing step only – decode / resample to 16 kHz Int16 PCM

Back‑end (BAC) accepts only this format; changing BAC is risky.

MediaRecorder (Opus)

Removed – outputs Opus 48 kHz and would need expensive server‑side decoding

Keeps back‑end simple, preserves compatibility.

AudioWorklet from scratch

Replaced with SEPIA Web‑Audio Recorder (MIT)

Provides stable resampling to 16 kHz; verified in Chrome / Firefox / Safari.

1. Minimal Tech Stack

React 18 + TypeScript – Vite template.

SEPIA Web‑Audio Recorder (≈ 40 kB) – captures mic → 16 kHz mono Int16 PCM (optional VAD can be disabled).

WebSocket API – native; two sessions:

wss://api.isinka.ai/v2/ws/walkie – audio chunks (binary, raw Int16 LE PCM).

wss://api.isinka.ai/v2/ws/walkie-ctrl – JSON events.

UI – Tailwind CSS + HeadlessUI: PTTButton, VUBar, StatusLabel.

2. Code Architecture

src/
  hooks/
    useWalkie.ts        # controls SEPIA recorder + WS
  services/
    WalkieWS.ts         # opens two sockets, keep‑alive, reconnection
  components/
    PTTButton.tsx       # push‑to‑talk (mouse / touch)
    Meter.tsx           # RMS bar from recorder callbacks
  pages/
    App.tsx             # glue logic, session ID
  lib/
    sepia/              # bundled dist build or CDN import

Resampling Details

const recorder = SepiaVoiceRecorder.create({
  targetSampleRate: 16000,
  mono: true,
  onAudioProcess: (data: Int16Array) => sendToWalkieWS(data),
});

Chunk size ≈ 480 samples (30 ms at 16 kHz) – identical to the Python prototype.  fileciteturn4file0