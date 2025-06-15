// src/components/VideoPlayer.tsx
import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';

interface VideoPlayerProps extends Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src'> {
  hlsSrc: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ hlsSrc, autoPlay, ...rest }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hlsInstanceRef = useRef<Hls | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach(entry => {
        setIsIntersecting(entry.isIntersecting);
        if (!entry.isIntersecting && !videoElement.paused) {
          videoElement.pause();
        }
      });
    };
    observerRef.current = new IntersectionObserver(observerCallback, { threshold: 0.1 });
    observerRef.current.observe(videoElement);
    return () => {
      observerRef.current?.disconnect();
      if (videoElement && !videoElement.paused) videoElement.pause();
    };
  }, []);


  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !hlsSrc) return;

    const cleanupHls = () => {
      if (hlsInstanceRef.current) {
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }
    };
    
    if (!isIntersecting) {
      if (!videoElement.paused) videoElement.pause();
      cleanupHls();
      videoElement.src = ''; 
      return;
    }

    if (Hls.isSupported()) {
      cleanupHls();
      const hls = new Hls();
      hlsInstanceRef.current = hls;
      hls.loadSource(hlsSrc);
      hls.attachMedia(videoElement);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay && videoElement.paused) {
          videoElement.play().catch(e => console.warn("Autoplay prevented for HLS:", e.message));
        }
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.error(`HLS.js fatal error (${data.type}) for ${hlsSrc}:`, data.details);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              cleanupHls();
              break;
          }
        }
      });
    } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      cleanupHls();
      videoElement.src = hlsSrc;
      videoElement.addEventListener('loadedmetadata', () => {
        if (autoPlay && videoElement.paused) {
          videoElement.play().catch(e => console.warn("Autoplay prevented for native HLS:", e.message));
        }
      });
    } else {
      console.warn('HLS playback not supported by this browser.');
    }

    return cleanupHls;
  }, [isIntersecting, hlsSrc, autoPlay]);

  const videoProps = {
    playsInline: true,
    muted: true,
    loop: true,
    preload: "metadata",
    ...rest, 
    autoPlay: autoPlay && isIntersecting,
  };

  return <video ref={videoRef} {...videoProps} />;
};

export default VideoPlayer;
