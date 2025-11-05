import React from 'react';

interface MeterProps {
  level: number; // 0 to 1
}

const Meter: React.FC<MeterProps> = ({ level }) => {
  const baseOpacity = 0.3;
  const dynamicOpacityRange = 0.7;

  // Ensure level is within 0-1 range
  const clampedLevel = Math.max(0, Math.min(1, level));

  const dotOpacity = baseOpacity + clampedLevel * dynamicOpacityRange;

  return (
    <div className="flex items-center justify-center" aria-label={`Audio level: ${Math.round(clampedLevel * 100)}%`}>
      {[...Array(3)].map((_, i) => (
        <span
          key={i}
          className="inline-block w-2 h-2 rounded-full bg-white mx-0.5 transition-opacity duration-100"
          style={{ opacity: dotOpacity }}
          aria-hidden="true"
        ></span>
      ))}
    </div>
  );
};

export default Meter;
