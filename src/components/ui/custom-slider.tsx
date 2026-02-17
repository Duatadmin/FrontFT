import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';

interface CustomSliderProps {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  label?: string;
  showInput?: boolean;
  showButtons?: boolean;
  tickInterval?: number;
  snapToTicks?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
  enableImperial?: boolean;
  imperialUnit?: string;
  toImperial?: (value: number) => number;
  fromImperial?: (value: number) => number;
}

export function CustomSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  unit = '',
  label,
  showInput = true,
  showButtons = true,
  tickInterval,
  snapToTicks = false,
  formatValue,
  className,
  enableImperial = false,
  imperialUnit,
  toImperial,
  fromImperial,
}: CustomSliderProps) {
  const [isImperial, setIsImperial] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Prevent page scrolling when touching the slider track
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const prevent = (e: TouchEvent) => { e.preventDefault(); e.stopPropagation(); };
    el.addEventListener('touchstart', prevent, { passive: false });
    return () => el.removeEventListener('touchstart', prevent);
  }, []);

  // Calculate display values based on unit system
  const displayValue = isImperial && toImperial ? toImperial(value) : value;
  const displayUnit = isImperial && imperialUnit ? imperialUnit : unit;
  const displayMin = isImperial && toImperial ? toImperial(min) : min;
  const displayMax = isImperial && toImperial ? toImperial(max) : max;

  // Update input when value changes externally
  useEffect(() => {
    if (!isDragging) {
      setInputValue(displayValue.toString());
    }
  }, [displayValue, isDragging]);

  // Unified pointer handler for both tap-to-position and drag
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const el = sliderRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    setIsDragging(true);

    const rect = el.getBoundingClientRect();
    const updateFromPointer = (clientX: number) => {
      const thumbRadius = 24;
      const x = clientX - rect.left;
      const adjusted = x - thumbRadius;
      const available = rect.width - thumbRadius * 2;
      const pct = Math.max(0, Math.min(1, adjusted / available));
      let val = min + pct * (max - min);
      val = Math.round(val / step) * step;
      if (snapToTicks && tickInterval) {
        const nearest = Math.round(val / tickInterval) * tickInterval;
        if (Math.abs(val - nearest) < tickInterval * 0.2) val = nearest;
      }
      onChange(Math.max(min, Math.min(max, val)));
    };

    updateFromPointer(e.clientX);

    const onMove = (ev: PointerEvent) => updateFromPointer(ev.clientX);
    const onUp = () => {
      setIsDragging(false);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
  }, [min, max, step, snapToTicks, tickInterval, onChange]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    let newValue = parseFloat(inputValue);
    if (isNaN(newValue)) {
      setInputValue(displayValue.toString());
      return;
    }

    // Convert from imperial if needed
    if (isImperial && fromImperial) {
      newValue = fromImperial(newValue);
    }

    // Clamp to range
    newValue = Math.max(min, Math.min(max, newValue));
    onChange(newValue);
    
    // Update the input to show the clamped value
    const clampedDisplayValue = isImperial && toImperial ? toImperial(newValue) : newValue;
    setInputValue(clampedDisplayValue.toString());
  };

  // Handle increment/decrement
  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onChange(newValue);
  };

  // Toggle unit system
  const toggleUnitSystem = () => {
    setIsImperial(!isImperial);
  };

  // Progress percentage - ensure it's clamped between 0 and 100
  const progress = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  
  // Debug: Uncomment to check synchronization
  // useEffect(() => {
  //   console.log('Slider sync:', { value, min, max, progress, displayValue });
  // }, [value, progress]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {label && <span className="text-white/80 text-base font-semibold">{label}</span>}
            {enableImperial && (
              <button
                type="button"
                onClick={toggleUnitSystem}
                className={cn(
                  "text-xs font-medium px-4 py-2 rounded-full transition-all",
                  "bg-accent-lime/10 hover:bg-accent-lime/20 border border-accent-lime/30",
                  "text-accent-lime hover:text-accent-lime/90",
                  "shadow-md shadow-black/20"
                )}
              >
                {isImperial ? 'Switch to Metric' : 'Switch to Imperial'}
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3">
          {showButtons && (
            <button
              type="button"
              onClick={handleDecrement}
              disabled={value <= min}
              className={cn(
                "w-12 h-12 rounded-2xl",
                "bg-black/30 hover:bg-black/40 active:bg-black/50",
                "border border-white/10",
                "flex items-center justify-center",
                "transition-all duration-200",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                "hover:border-accent-lime/30",
                "shadow-lg shadow-black/20"
              )}
            >
              <Minus className="w-5 h-5 text-white/80" />
            </button>
          )}
          
          <div className="flex items-center gap-2 min-w-[160px] justify-center">
            {showInput ? (
              <input
                type="number"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.currentTarget.blur();
                  }
                }}
                className={cn(
                  "w-28 h-14 px-4",
                  "bg-black/30 border-2 border-white/10",
                  "rounded-2xl text-white text-center",
                  "text-4xl font-bold tracking-tight",
                  "focus:outline-none focus:border-accent-lime/50 focus:bg-black/40",
                  "transition-all duration-200",
                  "shadow-inner shadow-black/50",
                  // Hide number input arrows
                  "[appearance:textfield]",
                  "[&::-webkit-outer-spin-button]:appearance-none",
                  "[&::-webkit-inner-spin-button]:appearance-none"
                )}
                min={displayMin}
                max={displayMax}
                step={step}
              />
            ) : (
              <span className="text-5xl font-bold text-white tracking-tight">
                {formatValue ? formatValue(displayValue) : displayValue}
              </span>
            )}
            <span className="text-white/60 text-xl font-medium min-w-[3rem]">{displayUnit}</span>
          </div>

          {showButtons && (
            <button
              type="button"
              onClick={handleIncrement}
              disabled={value >= max}
              className={cn(
                "w-12 h-12 rounded-2xl",
                "bg-black/30 hover:bg-black/40 active:bg-black/50",
                "border border-white/10",
                "flex items-center justify-center",
                "transition-all duration-200",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                "hover:border-accent-lime/30",
                "shadow-lg shadow-black/20"
              )}
            >
              <Plus className="w-5 h-5 text-white/80" />
            </button>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="relative mt-8">
        {/* Slider Track Container */}
        <div
          ref={sliderRef}
          className="relative h-12 touch-none cursor-pointer"
          onPointerDown={handlePointerDown}
        >
          {/* Track Background */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-3 bg-black/40 rounded-full overflow-hidden">
            {/* Progress Fill — aligned to thumb center */}
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-lime to-accent-orange"
              style={{ width: `calc(${progress}% * (100% - 48px) / 100% + 24px)` }}
            />
          </div>

          {/* Thumb — pointer-events-none since track handles all interaction */}
          <motion.div
            className="absolute w-12 h-12 -translate-x-1/2 touch-none z-20 pointer-events-none"
            style={{
              left: `calc(${progress}% * (100% - 48px) / 100% + 24px)`,
              top: '50%',
              y: '-50%',
              touchAction: 'none',
            }}
            initial={false}
            animate={{
              scale: isDragging ? 1.1 : 1,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          >
            <div className={cn(
              "relative w-full h-full rounded-full",
              "bg-gradient-to-br from-accent-lime to-accent-orange",
              "shadow-xl shadow-black/50",
              "cursor-grab active:cursor-grabbing",
              "ring-2 ring-black/20 ring-offset-2 ring-offset-transparent",
              "hover:shadow-2xl hover:shadow-accent-lime/30",
              "transition-all duration-200"
            )}>
              {/* Inner highlight */}
              <div className="absolute inset-[2px] rounded-full bg-gradient-to-tr from-white/30 to-transparent" />

              {/* Center dot */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-black/30 backdrop-blur-sm" />
              </div>

              {/* Outer glow effect when dragging */}
              {isDragging && (
                <motion.div
                  className="absolute -inset-3 rounded-full bg-accent-lime/20 blur-xl"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </div>
          </motion.div>
        </div>

        {/* Tick Marks and Labels */}
        {tickInterval && (
          <div className="relative mt-3">
            <div className="relative h-2">
              {Array.from({ length: Math.floor((max - min) / tickInterval) + 1 }, (_, i) => {
                const tickValue = min + i * tickInterval;
                const tickProgress = ((tickValue - min) / (max - min)) * 100;
                const showLabel = i % 2 === 0; // Show every other label
                
                return (
                  <div
                    key={i}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${tickProgress}%` }}
                  >
                    {/* Tick mark */}
                    <div className={cn(
                      "w-px bg-white/10",
                      showLabel ? "h-2" : "h-1"
                    )} />
                    
                    {/* Label */}
                    {showLabel && (
                      <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] text-white/30 whitespace-nowrap">
                        {tickValue}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}