// Gets microphone access and returns a MediaStream
export async function getMicrophoneStream() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return stream;
}
