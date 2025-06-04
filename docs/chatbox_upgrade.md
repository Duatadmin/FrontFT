# 🎨 Voice Assistant Input Field — UI Design Document

## 🧭 Overview

**Component**: `VoiceInputField`  
**Purpose**: A unified user interaction zone for AI voice assistant — supports text input, voice recording, and message submission.

**States**:
1. `Idle` — assistant is not listening, default input field
2. `Active Listening` — microphone is engaged, shows waveform visualization

---

## 📂 Component Structure

```plaintext
VoiceInputField
├── AttachButton          (icon: "+")
├── SearchButton          (icon: 🌐 + label "Search")
├── MoreOptionsButton     (icon: "⋯")
├── InputArea
│   └── TextInput         (Idle) or AudioWaveform (Active)
├── MicButton             (icon: microphone)
├── SendButton            (icon: upward arrow "↑")
🎛 State 1: Idle (Default Input Field)
🖼️ Visual
Background: #1E1E1E (dark gray)

Border: 1px solid #333333, border-radius: 12px

Text Field:

No placeholder needed

Text color: #FFFFFF

Expands vertically with multiline input

🧭 Behavior
Microphone button activates voice recording mode

Send button (↑) sends typed text

Enter key acts as send shortcut

Search button and others are optional utilities

🎛 State 2: Active Listening (Microphone Recording)
🖼️ Visual
Background: same as idle

Replaces Text Input with:

Live Audio Waveform

Color: #FFFFFF or #00FFCC

Animated based on RMS/volume level

Centered vertically, stretches full width

🎚️ Animation
Waveform updates in real-time (e.g., every 100 ms)

Subtle glow: box-shadow: 0 0 6px rgba(0,255,204,0.5)

🧭 Behavior
Mic button:

Press once: starts recording

Press again: stops and prepares transcript

Send button:

Enabled after recording ends

Sends transcript or audio blob depending on logic

🎚 Microinteraction Table
Element	Trigger	Animation / Feedback
MicButton	idle → active	Pulse glow + scale animation
AudioWaveform	active	Live waveform animation
SendButton	enabled	Glow on hover, bounce on click
InputArea	mode switch	Fade-out text → fade-in waveform

🧱 Tailwind Example Snippet (React)
jsx
Копировать
Редактировать
<div className="flex items-center p-2 bg-gray-900 rounded-xl border border-gray-700">
  <button className="text-white mr-2"><PlusIcon /></button>
  <button className="flex items-center text-white mr-2"><GlobeIcon /> <span className="ml-1">Search</span></button>
  <button className="text-white mr-2"><DotsHorizontalIcon /></button>

  <div className="flex-grow mx-2">
    {!isListening ? (
      <input
        className="w-full bg-transparent text-white outline-none"
        value={input}
        onChange={handleChange}
      />
    ) : (
      <WaveformVisualizer audioData={audioData} />
    )}
  </div>

  <button onClick={toggleMic} className="text-white mr-2">
    <MicIcon />
  </button>

  <button onClick={handleSend} className="bg-white text-black rounded-full p-2">
    <ArrowUpIcon />
  </button>
</div>
📐 Responsiveness
On smaller screens:

Auxiliary buttons collapse into a hamburger or overflow menu

On mobile:

Mic button may use push-and-hold behavior

Swipe up or tap to send

🧪 Test Cases
Clicking mic starts waveform animation and begins recording

Audio waveform reflects real-time volume (RMS)

Send button becomes active after recording ends

Pressing send dispatches transcription or audio depending on settings

✅ Optional Enhancements
Hotkey support (e.g., CMD + M to toggle mic)

Voice threshold auto-activation (walkie-talkie mode)

Loading spinner when sending/transcribing

Voice level indicator overlay

