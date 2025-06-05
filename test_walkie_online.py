"""Interactive smoke‑test for /v2/ws/walkie (walkie‑talkie mode)

Adds two QoL tweaks requested by Maksimilian:
1. When we receive a transcript from Deepgram, the local “dot/hash” meter is
   flushed to a new line so the transcript appears on its own row.
2. After every recording cycle we print how many audio *chunks* were streamed
   to Deepgram (along with their total duration in seconds).
"""

import asyncio, functools, json, logging, math, time, uuid # MODIFIED
from typing import Optional

import keyboard  # pip install keyboard (admin privileges on Windows)
import numpy as np
import sounddevice as sd
import websockets
from colorama import Fore, Style, init as colorama_init

colorama_init()

URL         = "ws://voiceservicev2-production.up.railway.app/v2/ws/walkie"       # audio channel # MODIFIED
CTRL_URL    = "ws://voiceservicev2-production.up.railway.app/v2/ws/walkie-ctrl"  # control channel # MODIFIED
SR = 16_000  # sample rate
CH = 1  # mono
FMT = np.int16
CHUNK_MS = 30  # must match server (30‑ms frames)

METER_EVERY_N_FRAMES = 4  # print a char ~4×/sec

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(message)s",
    datefmt="%H:%M:%S",
)


def _meter_char(pcm: bytes, silence_thresh: int = 300):
    """Return a simple dot/hash depending on signal RMS."""
    if not pcm:
        return "·"
    frame = np.frombuffer(pcm, dtype=FMT)
    rms = math.sqrt(np.mean(frame.astype(np.float32) ** 2))
    return "#" if rms > silence_thresh else "·"


async def walkie_loop():
    logging.info("Press SPACE to start, press again to stop.")

    while True:
        keyboard.wait("space")  # ─── 1st SPACE → start ───

        sid = str(uuid.uuid4()) # ADDED

        async with \
            websockets.connect(URL,      ping_interval=None) as audio_ws, \
            websockets.connect(CTRL_URL, ping_interval=None) as ctrl_ws: # MODIFIED

            # ───── handshake with session id ───── # ADDED
            await audio_ws.send(json.dumps({"sid": sid})) # ADDED
            await ctrl_ws.send(json.dumps({"sid": sid})) # ADDED

            final_evt   = asyncio.Event()
            final_text: Optional[str] = None
            chunks_sent = 0
            mic_locked = False      # Flag to indicate if mic should be muted

            # ---------- AUDIO-reader ---------- # MODIFIED
            async def reader():
                nonlocal final_text, mic_locked # MODIFIED
                logging.debug("Reader task started, entering message loop...")
                try:
                    async for message in audio_ws: # MODIFIED (ws -> audio_ws)
                        logging.debug(f"Raw message received in reader: type={type(message)}, content='{str(message)[:100]}...'")
                        if isinstance(message, str):
                            try:
                                data = json.loads(message)
                            except json.JSONDecodeError as e:
                                logging.error(f"JSONDecodeError in reader: {e} for message: {message}")
                                continue # Skip this message
                            if data.get("final"): # final from server
                                logging.info(f"RX final: {data['text']}")
                                mic_locked = False # Unlock mic immediately
                                logging.debug("Mic unlocked due to final transcript.")
                                final_evt.set()
                            else:
                                logging.info(f"RX: {data['text']}")
                        # Binary control messages (like "CD...") are now handled by ctrl_reader via walkie_ctrl.py
                        # So, we don't expect them on the audio_ws anymore.
                        elif isinstance(message, bytes):
                             logging.debug(f"Received unexpected binary message on audio_ws: {message[:50]}...")

                except Exception as e:
                    logging.error(f"Error in reader message loop: {e}", exc_info=True)
                finally:
                    logging.debug("Reader task finishing, setting final_evt.")
                    final_evt.set()

            reader_task  = asyncio.create_task(reader()) # MODIFIED

            # ---------- CONTROL-reader ---------- # ADDED
            async def ctrl_reader(): # ADDED
                nonlocal mic_locked # ADDED
                async for msg in ctrl_ws: # ADDED
                    try: # ADDED
                        data = json.loads(msg) # ADDED
                    except json.JSONDecodeError: # ADDED
                        continue # ADDED
                    if data.get("cmd") == "mute": # ADDED
                        mic_locked = True # ADDED
                        print("!", end="", flush=True)  # визуальный индикатор # ADDED
            # ADDED
            ctrl_task = asyncio.create_task(ctrl_reader()) # ADDED


            logging.info(
                "▶ WALKIE – listening (dots = silence, # = speech)"
            )
            frame_count = 0
            with sd.InputStream(
                samplerate=SR,
                channels=CH,
                dtype=FMT,
                blocksize=int(SR * CHUNK_MS / 1000),
            ) as stream:

                stop_future = asyncio.get_running_loop().run_in_executor(
                    None, functools.partial(keyboard.wait, "space")
                )
                loop = asyncio.get_running_loop()

                while not stop_future.done():
                    # Read audio in executor
                    pcm_data, overflowed = await loop.run_in_executor(
                        None, stream.read, stream.blocksize
                    )
                    if overflowed:
                        logging.warning("Sounddevice input overflowed!")
                    
                    pcm = pcm_data.tobytes()

                    if not mic_locked: # Only send if not locked
                        await audio_ws.send(pcm)
                        chunks_sent += 1
                    # If mic_locked, pcm is read but not sent.

                    if frame_count % METER_EVERY_N_FRAMES == 0:
                        print(_meter_char(pcm), end="", flush=True)
                    frame_count += 1

            print()
            logging.info("⏸ stop‑listen – awaiting final transcript…")

            await final_evt.wait()

            await audio_ws.close() # MODIFIED
            await ctrl_ws.close()  # ADDED

            if final_text:
                logging.info("FINAL ASR: %s", final_text)
            else:
                logging.info("No speech detected or already shown above.")

            total_ms = chunks_sent * CHUNK_MS
            logging.info(
                "Sent %d chunks → %.2f s of audio to Deepgram",
                chunks_sent,
                total_ms / 1000,
            )

            reader_task.cancel() # MODIFIED
            ctrl_task.cancel()   # ADDED


if __name__ == "__main__":
    try:
        asyncio.run(walkie_loop())
    except KeyboardInterrupt:
        logging.info("Exiting…")
