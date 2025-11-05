// src/components/ui/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  size?: number;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 48, className = '' }) => {
  return (
    <div className={`flex justify-center items-center w-full h-full ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="animate-spin rounded-full border-4 border-accent-lime/20 border-t-accent-lime"
      ></div>
    </div>
  );
};
