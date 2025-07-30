# Voice Visualization Architecture

## Overview

The voice visualization system has been refactored to provide a cleaner, more maintainable architecture with the following improvements:

1. **Unified Hooks**: Centralized state management and data flow
2. **Performance Optimizations**: Shared ResizeObserver instances
3. **Standardized RMS Data Flow**: Consistent normalization and distribution

## Architecture Components

### 1. VoiceTickerWithOptimizations Component
Located at: `src/components/chat/VoiceTickerWithOptimizations.tsx`

- Optimized version of VoiceTicker with shared ResizeObserver
- Maintains compatibility with existing ISepiaVoiceRecorder interface
- Direct DOM manipulation for performance
- GPU-accelerated CSS animations

### 2. useVoiceVisualization Hook
Located at: `src/hooks/useVoiceVisualization.ts`

Provides unified interface for voice visualization:
```typescript
const voiceVisualization = useVoiceVisualization({
  isRecordingActive: boolean,
  onLevelChange?: (level: number) => void
});

// Returns:
// - recorderRef: React ref for VoiceTicker
// - level: Current RMS level (0-1)
// - updateRmsData: Method to update RMS
// - isVisualizationActive: Whether to show visualization
```

### 3. useRmsDataFlow Hook
Located at: `src/hooks/useRmsDataFlow.ts`

Manages RMS data normalization and distribution:
```typescript
const rmsDataFlow = useRmsDataFlow({
  source: {
    source: 'VoiceWidget',
    isNormalized: true
  },
  targets: [voiceVisualization.updateRmsData],
  debug: false
});
```

## Data Flow

```
VoiceWidget/SEPIA Recorder
    ↓ (RMS data)
useRmsDataFlow (normalization)
    ↓
useVoiceVisualization (state management)
    ↓
VoiceTickerWithOptimizations (visualization)
```

## Usage Example

```typescript
// In your component
const voiceVisualization = useVoiceVisualization({
  isRecordingActive: isRecording
});

const rmsDataFlow = useRmsDataFlow({
  source: { source: 'MyAudioSource', isNormalized: false },
  targets: [voiceVisualization.updateRmsData]
});

// In render
<VoiceTickerWithOptimizations 
  isRecordingActive={true} 
  recorder={voiceVisualization.recorderRef} 
/>

// Connect your audio source
<AudioSource onRmsData={rmsDataFlow.processRmsData} />
```

## Performance Considerations

1. **Shared ResizeObserver**: Single observer instance for all visualizations
2. **Direct DOM Manipulation**: Bypasses React reconciliation for animations
3. **GPU Acceleration**: CSS transforms and will-change properties
4. **Throttled Updates**: RMS updates limited to 30ms intervals

## Migration Guide

### From Legacy AudioVisualizer:
```typescript
// Old
<AudioVisualizer width={180} height={30} />

// New
<VoiceTickerWithOptimizations 
  isRecordingActive={isListening} 
  recorder={voiceVisualization.recorderRef} 
/>
```

### From Original VoiceTicker:
Simply replace import:
```typescript
// Old
import VoiceTicker from './VoiceTicker';

// New
import VoiceTickerWithOptimizations from './VoiceTickerWithOptimizations';
```

## Future Enhancements

1. **Web Audio API Integration**: Direct connection to audio nodes
2. **Multiple Visualization Modes**: Waveform, spectrum, etc.
3. **Accessibility**: Screen reader announcements for audio levels
4. **Recording Quality Indicators**: Visual feedback for audio quality