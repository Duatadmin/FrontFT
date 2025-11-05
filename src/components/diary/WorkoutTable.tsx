import React, { useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Clock, Calendar, Dumbbell, Award, ChevronRight } from 'lucide-react';
import useDiaryStore from '../../store/useDiaryStore';
import useUserStore from '../../store/useUserStore';
import { WorkoutSession } from '../../lib/supabase';

const WorkoutTable: React.FC = () => {
  // Get data from stores
  const { sessions, loading, error, fetchSessions, selectSession } = useDiaryStore();
  const { user } = useUserStore();
  
  // Reference for the virtual list container
  const parentRef = React.useRef<HTMLDivElement>(null);
  
  // Fetch sessions on component mount and when user changes
  useEffect(() => {
    if (user?.id) {
      fetchSessions(user.id);
    }
  }, [user?.id, fetchSessions]);
  
  // Set up virtualization
  const rowVirtualizer = useVirtualizer({
    count: sessions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 88, // Estimated row height
    overscan: 5, // Number of items to render outside of the visible area
  });
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Format time duration to readable format
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`;
  };
  
  // Handle row click to select a session
  const handleRowClick = (session: WorkoutSession) => {
    selectSession(session);
  };
  
  // Loading state
  if (loading.sessions) {
    return (
      <div className="bg-background-card rounded-2xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-border-light">
          <h2 className="text-lg font-semibold">Workout History</h2>
        </div>
        
        <div className="p-4 space-y-4">
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col gap-2">
              <div className="flex justify-between">
                <div className="h-5 w-32 bg-background-surface rounded"></div>
                <div className="h-5 w-24 bg-background-surface rounded"></div>
              </div>
              <div className="h-4 w-48 bg-background-surface rounded"></div>
              <div className="flex gap-4">
                <div className="h-4 w-16 bg-background-surface rounded"></div>
                <div className="h-4 w-16 bg-background-surface rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error.sessions) {
    return (
      <div className="bg-background-card rounded-2xl shadow-card p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">Unable to Load Workout History</h3>
          <p className="text-text-secondary mb-4 text-sm">{error.sessions}</p>
          <button 
            onClick={() => user?.id && fetchSessions(user.id)}
            className="bg-accent-violet hover:bg-accent-violet/90 text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (sessions.length === 0) {
    return (
      <div className="bg-background-card rounded-2xl shadow-card p-6">
        <div className="text-center py-8">
          <div className="mx-auto h-16 w-16 bg-background-surface rounded-full flex items-center justify-center mb-4">
            <Dumbbell className="text-text-tertiary" size={24} />
          </div>
          <h3 className="text-lg font-medium mb-2">No Workout History</h3>
          <p className="text-text-secondary mb-4 text-sm">You haven't logged any workouts yet. Start your fitness journey today!</p>
          <button className="bg-accent-violet hover:bg-accent-violet/90 text-white px-4 py-2 rounded-lg text-sm">
            Record First Workout
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-background-card rounded-2xl shadow-card overflow-hidden">
      <div className="p-5 border-b border-border-light">
        <h2 className="text-lg font-semibold">Workout History</h2>
        <p className="text-sm text-text-secondary">
          {sessions.length} {sessions.length === 1 ? 'workout' : 'workouts'} found
        </p>
      </div>
      
      <div 
        ref={parentRef}
        className="overflow-auto h-[500px] md:h-[600px]"
        role="table"
        aria-label="Workout History"
      >
        {/* Header for desktop - hidden on mobile */}
        <div className="hidden md:flex bg-background-surface py-3 px-5 border-b border-border-light sticky top-0 z-10" role="row">
          <div className="flex-1 font-medium text-sm" role="columnheader">Date & Workout</div>
          <div className="w-28 text-center font-medium text-sm" role="columnheader">Duration</div>
          <div className="w-24 text-center font-medium text-sm" role="columnheader">Sets/Reps</div>
          <div className="w-28 text-center font-medium text-sm" role="columnheader">Difficulty</div>
          <div className="w-10"></div>
        </div>
        
        {/* Virtual list container */}
        <div
          className="relative"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const session = sessions[virtualRow.index];
            return (
              <div
                key={session.id}
                className="absolute top-0 left-0 w-full md:flex py-4 px-5 border-b border-border-light cursor-pointer hover:bg-background-surface/50 transition-colors"
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                onClick={() => handleRowClick(session)}
                role="row"
                tabIndex={0}
                aria-label={`Workout session on ${formatDate(session.timestamp)}`}
              >
                {/* Mobile View */}
                <div className="md:hidden">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium">
                      {session.exercises_completed[0] || 'Workout'} 
                      {session.exercises_completed.length > 1 && ` +${session.exercises_completed.length - 1}`}
                    </div>
                    <div className="text-text-secondary text-sm flex items-center">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(session.timestamp)}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary mt-1">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {formatDuration(session.duration_minutes)}
                    </div>
                    <div className="flex items-center">
                      <Dumbbell size={14} className="mr-1" />
                      {session.total_sets} sets / {session.total_reps} reps
                    </div>
                    {/* Show PR badge if PR was achieved */}
                    {Math.random() > 0.7 && (
                      <div className="flex items-center text-accent-mint">
                        <Award size={14} className="mr-1" />
                        PR
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Desktop View */}
                <div className="hidden md:flex flex-1 items-center" role="cell">
                  <div className="flex-1">
                    <div className="font-medium">
                      {session.exercises_completed[0] || 'Workout'} 
                      {session.exercises_completed.length > 1 && ` +${session.exercises_completed.length - 1}`}
                    </div>
                    <div className="text-text-secondary text-sm flex items-center mt-1">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(session.timestamp)}
                    </div>
                  </div>
                </div>
                
                <div className="hidden md:flex w-28 items-center justify-center" role="cell">
                  <div className="text-center">
                    <Clock size={14} className="mx-auto mb-1" />
                    <div className="text-sm">{formatDuration(session.duration_minutes)}</div>
                  </div>
                </div>
                
                <div className="hidden md:flex w-24 items-center justify-center" role="cell">
                  <div className="text-center">
                    <div className="text-sm">{session.total_sets} / {session.total_reps}</div>
                    <div className="text-xs text-text-tertiary">sets / reps</div>
                  </div>
                </div>
                
                <div className="hidden md:flex w-28 items-center justify-center" role="cell">
                  <div className="flex items-center">
                    {/* Show difficulty as a rating out of 5 */}
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div 
                          key={i}
                          className={`w-2 h-6 mx-0.5 rounded-sm ${
                            i < session.overall_difficulty 
                              ? 'bg-accent-violet' 
                              : 'bg-background-surface'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="ml-2 text-sm">{session.overall_difficulty}/5</div>
                  </div>
                </div>
                
                <div className="hidden md:flex w-10 items-center justify-center text-text-tertiary" role="cell">
                  <ChevronRight size={18} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkoutTable;
