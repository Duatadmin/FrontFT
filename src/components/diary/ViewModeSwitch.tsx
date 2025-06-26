import React from 'react';
import { motion } from 'framer-motion';
import { List, Calendar } from 'lucide-react';

export type ViewMode = 'list' | 'calendar';

interface ViewModeSwitchProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const spring = {
  type: 'spring',
  stiffness: 700,
  damping: 30,
};

export const ViewModeSwitch: React.FC<ViewModeSwitchProps> = ({ currentMode, onModeChange }) => {
  return (
    <div className="flex items-center gap-2 p-1 rounded-full bg-neutral-800/60 border border-white/10 w-full md:w-auto">
      <button
        onClick={() => onModeChange('list')}
        className={`relative px-4 py-1.5 text-sm font-semibold rounded-full transition-colors flex-1 md:flex-initial ${
          currentMode === 'list' ? 'text-white' : 'text-neutral-400 hover:text-white'
        }`}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <List size={16} /> List
        </span>
        {currentMode === 'list' && (
          <motion.div
            layoutId="activeViewMode"
            className="absolute inset-0 bg-white/10 rounded-full"
            transition={spring}
          />
        )}
      </button>
      <button
        onClick={() => onModeChange('calendar')}
        className={`relative px-4 py-1.5 text-sm font-semibold rounded-full transition-colors flex-1 md:flex-initial ${
          currentMode === 'calendar' ? 'text-white' : 'text-neutral-400 hover:text-white'
        }`}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <Calendar size={16} /> Calendar
        </span>
        {currentMode === 'calendar' && (
          <motion.div
            layoutId="activeViewMode"
            className="absolute inset-0 bg-white/10 rounded-full"
            transition={spring}
          />
        )}
      </button>
    </div>
  );
};
