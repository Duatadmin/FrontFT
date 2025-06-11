import React, { useState } from 'react';
import { useCompletedSessions } from '@/hooks/useCompletedSessions';
import type { CompletedSession } from '@/utils/rowsToSessionHistory';
import { SessionCard } from './SessionCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/Alert';
import { AlertCircle } from 'lucide-react';
import { SessionDetailsModal } from './SessionDetailsModal';

export const SessionList: React.FC = () => {
  const { data: sessions, isLoading, isError, error } = useCompletedSessions();
  const [selectedSession, setSelectedSession] = useState<CompletedSession | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-2xl p-4 h-24 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error.message || 'Failed to load workout history.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-500">
        <h3 className="text-lg font-semibold">No Workouts Logged</h3>
        <p>Your completed workouts will appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {sessions.map(session => (
          <SessionCard 
            key={session.sessionId} 
            session={session} 
            onClick={() => setSelectedSession(session)} 
          />
        ))}
      </div>
      {selectedSession && (
        <SessionDetailsModal 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
        />
      )}
    </>
  );
};
