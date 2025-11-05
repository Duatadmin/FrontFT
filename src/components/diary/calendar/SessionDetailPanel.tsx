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
  const overlayVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <AnimatePresence>
      {selectedDate && (
        <motion.div
          className="absolute inset-0 bg-neutral-900/80 backdrop-blur-lg z-20 rounded-2xl"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <>
            <button onClick={onClose} className="absolute top-4 right-4 z-30 p-2 rounded-full bg-black/20 hover:bg-white/10 transition-colors">
              <X className="h-6 w-6 text-white" />
            </button>
            <div className="h-full overflow-y-auto p-4 space-y-4">
              {sessions.length > 0 ? (
                sessions.map(session => (
                  <SessionCard key={session.sessionId} session={session} defaultExpanded onClick={() => {}} />
                ))
              ) : (
                <div className="text-center py-16 text-neutral-500">
                  <h3 className="text-lg font-semibold">No Workouts</h3>
                  <p>No workouts were logged on this day.</p>
                </div>
              )}
            </div>
          </>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
