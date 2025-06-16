import React from 'react';
import { CompletedSession } from '@/utils/rowsToSessionHistory';
import { X } from 'lucide-react';

interface SessionDetailsModalProps {
  session: CompletedSession;
  onClose: () => void;
}

export const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({ session, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 safe-top safe-bot safe-left safe-right" onClick={onClose}>
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-6 w-full max-w-2xl relative max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-white">{session.sessionTitle}</h2>
        <div className="space-y-4">
          {session.exercises.map(exercise => (
            <div key={exercise.exerciseRowId} className="bg-white/5 p-4 rounded-lg">
              <h4 className="font-semibold text-lg text-emerald-400">{exercise.exerciseName}</h4>
              <ul className="mt-2 space-y-1 text-sm text-neutral-300">
                {exercise.sets.map(set => (
                  <li key={set.setId} className="flex justify-between">
                    <span>Set {set.setNo}</span>
                    <span>{set.repsDone} reps at {set.weightKg}kg</span>
                    <span>RPE: {set.rpe || 'N/A'}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
