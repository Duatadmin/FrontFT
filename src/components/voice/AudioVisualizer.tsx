import React, { useRef, useEffect, useState } from 'react';
import { getVisualizationData, getIsRecording } from './index';

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
      setIsActive(getIsRecording());
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
        // Get data from our voice module
        const dataArray = getVisualizationData();
        if (!dataArray) {
          // If no data, schedule next frame and return
          animationFrameRef.current = requestAnimationFrame(drawVisualizer);
          return;
        }

        // Clear canvas for next drawing
        ctx.clearRect(0, 0, width, height);

        // Bar width with small gap between bars
        const barWidth = width / barCount - 1;
        
        // Calculate how many dataArray points to skip to get barCount bars
        const sliceWidth = Math.floor(dataArray.length / barCount);
        
        // Calculate and draw bars
        for (let i = 0; i < barCount; i++) {
          // Sample from data array
          const dataIndex = i * sliceWidth;
          
          // Normalize the waveform data (0-255) to the canvas height
          // Taking the absolute difference from 128 (the center line)
          const value = Math.abs(dataArray[dataIndex] - 128);
          
          // Scale the bar height (0.5 minimum height to 1.0 maximum)
          const barHeight = (value / 128) * height;
          const minBarHeight = height * 0.1; // Minimum height for aesthetics
          
          // Set bar color
          ctx.fillStyle = barColor;
          
          // Position the bar in the center vertically
          const x = i * (barWidth + 1);
          const y = (height - Math.max(barHeight, minBarHeight)) / 2;
          
          // Draw the bar
          ctx.fillRect(x, y, barWidth, Math.max(barHeight, minBarHeight));
        }
        
        // Schedule next frame
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
  }, [isActive, getVisualizationData, width, height, barColor, barCount]);

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
