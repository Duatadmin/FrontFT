import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { SessionCard } from '../SessionCard';
import type { CompletedSession } from '@/utils/rowsToSessionHistory';

interface SessionDetailPanelProps {
  selectedDate: Date | null;
  sessions: CompletedSession[];
  onClose: () => void;
}

export const SessionDetailPanel: React.FC<SessionDetailPanelProps> = ({ selectedDate, sessions, onClose }) => {
  const panelVariants = {
    hidden: { x: '100%' },
    visible: { x: '0%' },
  };

  return (
    <AnimatePresence>
      {selectedDate && (
        <motion.div
          className="fixed top-0 right-0 h-full w-full max-w-md bg-neutral-900/80 backdrop-blur-lg shadow-2xl z-50 border-l border-white/10"
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className="p-6 h-full flex flex-col">
            <header className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Workouts for {selectedDate.toLocaleDateString()}
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <X className="h-6 w-6 text-white" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {sessions.length > 0 ? (
                sessions.map(session => (
                  <SessionCard key={session.sessionId} session={session} />
                ))
              ) : (
                <div className="text-center py-16 text-neutral-500">
                  <h3 className="text-lg font-semibold">No Workouts</h3>
                  <p>No workouts were logged on this day.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
