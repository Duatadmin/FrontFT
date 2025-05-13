import React, { useRef, useState, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { setTranscriptTarget } from './index';
import { getVoiceModule, onVoiceState, destroyVoiceModule } from '../../voice/singleton';
import { clsx as cx } from 'clsx';

const HOLD_MS  = 200;  // min press to start
const GRACE_PX = 8;    // leeway radius
const COOLDOWN = 300;  // stop → next start delay

export interface VoiceButtonProps {
  disabled?: boolean;
  targetId?: string;
}

export default function VoiceButton({ disabled = false, targetId }: VoiceButtonProps) {
  const [state, setState] = useState<'idle' | 'arming' | 'recording'>('idle');
  const holdTimer = useRef<number | null>(null);
  const lastStop  = useRef<number>(0);
  const btnRef    = useRef<HTMLButtonElement>(null);

  // Set up transcript target if provided
  useEffect(() => {
    if (targetId) {
      setTranscriptTarget(targetId);
    }
    
    // Listen for voice state changes
    onVoiceState((s) => {
      if (s === 'recording') {
        setState('recording');
      } else if (s === 'idle' && state === 'recording') {
        setState('idle');
      }
    });
    
    // Make sure voice module is initialized
    getVoiceModule();
    
    return () => {
      // Only destroy if this is the last component using it
      // In a real app, you might want to track reference counts
      destroyVoiceModule();
    };
  }, [targetId]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || state !== 'idle' || e.button !== 0) return;
    btnRef.current?.setPointerCapture(e.pointerId);

    setState('arming');
    holdTimer.current = window.setTimeout(() => {
      if (Date.now() - lastStop.current < COOLDOWN) return;
      const voice = getVoiceModule();
      setTimeout(() => {
        voice.startRecording();
      }, 0);
      // navigator.vibrate?.(20);            // optional haptic
      setState('recording');
    }, HOLD_MS);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (state === 'arming' || state === 'recording') {
      const rect = btnRef.current!.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left  - GRACE_PX &&
        e.clientX <= rect.right + GRACE_PX &&
        e.clientY >= rect.top   - GRACE_PX &&
        e.clientY <= rect.bottom+ GRACE_PX;
      if (!inside && state === 'arming') cancelArming();
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (state === 'arming') {
      cancelArming();
    } else if (state === 'recording') {
      const voice = getVoiceModule();
      setTimeout(() => {
        voice.stopRecording();
      }, 0);
      lastStop.current = Date.now();
      setState('idle');
      // navigator.vibrate?.(30);            // optional haptic
    }
    btnRef.current?.releasePointerCapture(e.pointerId);
  };

  const cancelArming = () => {
    if (holdTimer.current !== null) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;     // 
    }
    setState('idle');
  };

  return (
    <button
      ref={btnRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      disabled={disabled}
      className={cx(
        'p-3 rounded-full transition-all select-none',
        state === 'recording'
          ? 'bg-primary text-white scale-110'
          : state === 'arming'
          ? 'bg-primary/20'
          : 'bg-input hover:bg-input/80'
      )}
      aria-label="Push-to-talk"
    >
      <Mic size={22} />
    </button>
  );
}
