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
    const isSupported = MediaSourceConstructor.isTypeSupported?.(mimeType) ?? false;
    
    // Debug: Check various audio formats that might be supported
    if (!isSupported) {
      console.log('[MediaSource] Testing alternative audio formats:');
      const formats = [
        'audio/mp4; codecs="mp4a.40.2"',
        'audio/webm; codecs="opus"', 
        'audio/mpeg',
        'audio/mp4',
        'audio/webm'
      ];
      
      formats.forEach(format => {
        const supported = MediaSourceConstructor.isTypeSupported?.(format) ?? false;
        console.log(`[MediaSource] ${format}: ${supported}`);
      });
    }
    
    return isSupported;
  } catch (e) {
    console.warn('[MediaSource] Error checking type support:', e);
    return false;
  }
};
