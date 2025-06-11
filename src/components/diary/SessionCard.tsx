import React from 'react';
import { CompletedSession } from '@/utils/rowsToSessionHistory';
import { format } from 'date-fns';
import { Target, ChevronRight } from 'lucide-react';

interface SessionCardProps {
  session: CompletedSession;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const sessionDate = new Date(session.sessionDate);

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-4 flex items-center justify-between transition-all duration-150 hover:bg-white/10">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <div className="text-sm text-neutral-400">{format(sessionDate, 'MMM')}</div>
          <div className="text-2xl font-bold text-white">{format(sessionDate, 'dd')}</div>
        </div>
        <div>
          <h3 className="font-semibold text-white">{session.sessionTitle}</h3>
          <div className="flex items-center gap-4 text-xs text-neutral-400 mt-1">
            <span className="flex items-center gap-1">
              <Target size={12} />
              {session.exercises.length} Exercises
            </span>
          </div>
        </div>
      </div>
      <ChevronRight className="text-neutral-500" />
    </div>
  );
};
