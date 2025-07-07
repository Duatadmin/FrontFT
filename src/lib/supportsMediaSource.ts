export const supportsMediaSource = () => {
  if (typeof window === 'undefined') return false;
  return 'MediaSource' in window || 'ManagedMediaSource' in window;
};

export const getManagedMediaSource = () => {
  if (typeof window === 'undefined') return null;
  if (window.ManagedMediaSource) return window.ManagedMediaSource;
  if (window.MediaSource) return window.MediaSource;
  return null;
};

export const canUseStreamingAudio = (mimeType: string = 'audio/ogg; codecs="opus"') => {
  const MediaSourceConstructor = getManagedMediaSource();
  if (!MediaSourceConstructor) return false;
  
  try {
    return MediaSourceConstructor.isTypeSupported?.(mimeType) ?? false;
  } catch (e) {
    console.warn('[MediaSource] Error checking type support:', e);
    return false;
  }
};
