import React from 'react';

interface GlassFrameProps {
  color?: string; // Accepts Tailwind token, HEX, or CSS var
  children: React.ReactNode;
}

/**
 * Universal glass/noise card wrapper. Handles all visual logic inside.
 * - glassmorphism-50, backdrop-blur-lg, noise-subtle
 * - Diagonal gradient overlay (80%→15% fade)
 * - White base layer
 * - Only public prop: color
 */
const GlassFrame: React.FC<GlassFrameProps> = ({
  color = '#FF62C4',
  children,
}) => {
  // Compute gradient using CSS var for color
  const style: React.CSSProperties = {
    // Diagonal gradient: 80% opacity → 15%
    // Uses passed color or fallback
    '--glass-color': color,
    backgroundImage:
      `linear-gradient(135deg, var(--glass-color)CC 0%, var(--glass-color)26 100%)`,
  } as React.CSSProperties;

  return (
    <div
      className="relative glassmorphism-50 backdrop-blur-lg noise-subtle rounded-2xl overflow-hidden"
      style={style}
    >
      {/* White base layer below content */}
      <div className="absolute inset-0 bg-white/25 pointer-events-none" aria-hidden="true" />
      {/* Gradient overlay above white base, below content */}
      <div className="absolute inset-0" style={{backgroundImage: style.backgroundImage}} aria-hidden="true" />
      {/* Actual content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GlassFrame;
