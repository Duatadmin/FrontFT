import React, { useRef, useEffect, useState } from 'react';
import { isVoiceRecording } from '../../voice/singleton';

interface AudioVisualizerProps {
  width?: number;
  height?: number;
  barColor?: string;
  barCount?: number;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  width = 120,
  height = 30,
  barColor = 'var(--primary-color, #3b82f6)',
  barCount = 20
}) => {
  const [isActive, setIsActive] = useState(false);
  
  // Check recording status on an interval
  useEffect(() => {
    const checkRecordingStatus = () => {
      setIsActive(isVoiceRecording());
    };
    
    // Check initially
    checkRecordingStatus();
    
    // Set up interval to check every 100ms
    const intervalId = setInterval(checkRecordingStatus, 100);
    
    return () => clearInterval(intervalId);
  }, []);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set actual dimensions for sharp rendering
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw visualization only when active
    if (isActive) {
      const drawVisualizer = () => {
        ctx.clearRect(0, 0, width, height);

        const barWidth = width / barCount - 1;

        for (let i = 0; i < barCount; i++) {
          const value = Math.random();
          const barHeight = value * height;
          const minBarHeight = height * 0.1;
          ctx.fillStyle = barColor;
          const x = i * (barWidth + 1);
          const y = (height - Math.max(barHeight, minBarHeight)) / 2;
          ctx.fillRect(x, y, barWidth, Math.max(barHeight, minBarHeight));
        }

        animationFrameRef.current = requestAnimationFrame(drawVisualizer);
      };

      // Start animation
      drawVisualizer();
    } else {
      // When not active, draw flat placeholder bars
      ctx.fillStyle = barColor;
      const barWidth = width / barCount - 1;
      const minBarHeight = height * 0.1;
      
      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + 1);
        const y = (height - minBarHeight) / 2;
        ctx.fillRect(x, y, barWidth, minBarHeight);
      }
    }

    // Cleanup animation frame on unmount or when isActive changes
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, width, height, barColor, barCount]);

  return (
    <canvas
      ref={canvasRef}
      className="audio-visualizer"
      width={width}
      height={height}
      style={{ opacity: isActive ? 1 : 0.3, transition: 'opacity 0.3s ease' }}
    />
  );
};

export default AudioVisualizer;
