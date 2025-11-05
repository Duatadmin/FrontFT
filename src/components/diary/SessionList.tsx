import React from 'react';
import { useCompletedSessions } from '@/hooks/useCompletedSessions';
import { SessionCard } from './SessionCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const SessionList: React.FC = () => {
  const { data: sessions, isLoading, isError, error } = useCompletedSessions();

  if (isLoading) {
    return <div className="h-48"><LoadingSpinner /></div>;
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
            onClick={() => {}} 
          />
        ))}
      </div>

    </>
  );
};
