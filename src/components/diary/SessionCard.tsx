import React from 'react';
import { CompletedSession } from '@/utils/rowsToSessionHistory';
import { format } from 'date-fns';
import { Clock, Target, ChevronRight } from 'lucide-react';

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
          <h3 className="font-semibold text-white">{session.dayLabel || 'Workout Session'}</h3>
          <div className="flex items-center gap-4 text-xs text-neutral-400 mt-1">
            {session.focusArea && (
              <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                <Target size={12} />
                {session.focusArea}
              </span>
            )}
            {session.durationMinutes && (
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {session.durationMinutes} min
              </span>
            )}
          </div>
        </div>
      </div>
      <ChevronRight className="text-neutral-500" />
    </div>
  );
};
