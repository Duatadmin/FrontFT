import React, { useRef, useState, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { setTranscriptTarget } from './index';
import { 
  getVoiceModule, 
  onVoiceState, 
  destroyVoiceModule,
  startVoiceRecording,
  stopVoiceRecording
} from '../../voice/singleton';
import { clsx as cx } from 'clsx';

const COOLDOWN = 300;  // stop → next start delay

export interface VoiceButtonProps {
  disabled?: boolean;
  targetId?: string;
}

export default function VoiceButton({ disabled = false, targetId }: VoiceButtonProps) {
  const [state, setState] = useState<'idle' | 'recording'>('idle');
  const lastStop  = useRef<number>(0);
  const btnRef    = useRef<HTMLButtonElement>(null);

  // Set up transcript target if provided
  useEffect(() => {
    if (targetId) {
      setTranscriptTarget(targetId);
    }
    
    // Listen for voice state changes
    const off = onVoiceState((s) => {
      setState(s === 'recording' ? 'recording' : 'idle');
    });
    
    // Make sure voice module is initialized
    getVoiceModule();
    
    return () => {
      off();
      // Only destroy if this is the last component using it
      // In a real app, you might want to track reference counts
      destroyVoiceModule();
    };
  }, [targetId]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || state !== 'idle' || e.button !== 0) return;
    if (Date.now() - lastStop.current < COOLDOWN) return;
    btnRef.current?.setPointerCapture(e.pointerId);

    startVoiceRecording();
    setState('recording');
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (state === 'recording') {
      // Use the wrapper function instead of direct method call
      stopVoiceRecording();

      lastStop.current = Date.now();
      setState('idle');
      // navigator.vibrate?.(30);            // optional haptic
    }
    btnRef.current?.releasePointerCapture(e.pointerId);
  };

  return (
    <button
      ref={btnRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      disabled={disabled}
      className={cx(
        'p-3 rounded-full transition-all select-none',
        state === 'recording'
          ? 'bg-primary text-white scale-110'
          : 'bg-input hover:bg-input/80'
      )}
      aria-label="Push-to-talk"
    >
      <Mic size={22} />
    </button>
  );
}
