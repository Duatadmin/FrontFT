import React, { useState } from 'react';
import { Calendar, Clock, Dumbbell, ChevronDown, Flame } from 'lucide-react';
import useDiaryStore from '../../store/useDiaryStore';

const WorkoutDisplayCard: React.FC = () => {
  const { sessions, loading, error } = useDiaryStore();
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);

  const handleWorkoutClick = (workoutId: string) => {
    setExpandedWorkout(prevId => (prevId === workoutId ? null : workoutId));
  };

  if (loading.sessions) {
    return <LoadingSkeleton />;
  }

  if (error.sessions) {
    return <ErrorDisplay error={error.sessions} />;
  }

  if (!sessions || sessions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="bg-background-card/80 backdrop-blur-xl rounded-2xl shadow-card p-6 border border-white/5">
      <Header count={sessions.length} />
      <div className="space-y-4">
        {sessions.map((session: any) => (
          <SessionItem 
            key={session.id} 
            session={session} 
            isExpanded={expandedWorkout === session.id}
            onToggleExpand={handleWorkoutClick}
          />
        ))}
      </div>
    </div>
  );
};

// Sub-components for better readability

const LoadingSkeleton: React.FC = () => (
  <div className="bg-background-card/80 backdrop-blur-xl rounded-2xl shadow-card p-6 animate-pulse border border-white/5">
    <div className="h-8 w-48 bg-background-surface/80 rounded-lg mb-6"></div>
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-background-surface/30 backdrop-blur-md rounded-xl p-5 border border-white/5">
          <div className="h-6 w-2/3 bg-background-surface/50 rounded-lg mb-4"></div>
          <div className="flex flex-wrap gap-4">
            <div className="h-4 w-28 bg-background-surface/50 rounded-md"></div>
            <div className="h-4 w-24 bg-background-surface/50 rounded-md"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => (
  <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-8 text-center shadow-lg">
    <div className="w-16 h-16 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4">
      <Flame className="text-red-400" size={28} />
    </div>
    <h3 className="text-xl font-semibold mb-3 text-text">Workout History Unavailable</h3>
    <p className="text-text-secondary mb-5 text-sm max-w-md mx-auto">{error}</p>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="bg-background-card/80 backdrop-blur-xl rounded-2xl shadow-card p-8 text-center border border-white/5">
    <div className="mx-auto h-20 w-20 bg-background-surface/50 rounded-full flex items-center justify-center mb-5 shadow-inner">
      <Dumbbell className="text-accent-violet" size={32} />
    </div>
    <h3 className="text-xl font-semibold mb-3 text-text">No Workout History</h3>
    <p className="text-text-secondary mb-6 text-sm max-w-md mx-auto">You haven't logged any workouts yet. Start your fitness journey today!</p>
  </div>
);

const Header: React.FC<{ count: number }> = ({ count }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-10 h-10 bg-accent-violet/10 rounded-full flex items-center justify-center">
      <Dumbbell className="text-accent-violet" size={20} />
    </div>
    <div>
      <h2 className="text-xl font-bold text-text">Workout History</h2>
      <p className="text-text-secondary text-sm">
        {count} {count === 1 ? 'session' : 'sessions'} found
      </p>
    </div>
  </div>
);

const SessionItem: React.FC<{ session: any; isExpanded: boolean; onToggleExpand: (id: string) => void; }> = ({ session, isExpanded, onToggleExpand }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div 
      className="bg-background-surface/30 backdrop-blur-md rounded-2xl p-5 hover:bg-background-surface/40 transition-all duration-300 cursor-pointer border border-white/5 group shadow-sm hover:shadow-md"
      onClick={() => onToggleExpand(session.id)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-text group-hover:text-accent-violet transition-colors">
            {session.day_label || session.focus_area || 'Workout Session'}
          </h3>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-secondary mt-2">
            <div className="flex items-center gap-1.5"><Calendar size={14} className="text-accent-violet/70" />{formatDate(session.session_date)}</div>
            <div className="flex items-center gap-1.5"><Clock size={14} className="text-accent-violet/70" />{session.duration_minutes ? `${session.duration_minutes} min` : 'N/A'}</div>
          </div>
        </div>
        <ChevronDown className={`text-text-secondary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} size={20} />
      </div>

      {isExpanded && <ExpandedContent session={session} />}
    </div>
  );
};

const ExpandedContent: React.FC<{ session: any }> = ({ session }) => (
  <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
    <h4 className="font-semibold mb-3 text-text">Exercises ({session.modular_training_exercise?.length || 0})</h4>
    <ul className="space-y-2 text-sm">
      {session.modular_training_exercise?.map((ex: any) => (
        <li key={ex.id} className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
          <span className="font-medium text-text-secondary capitalize">{ex.exercise_name || 'Unknown Exercise'}</span>
          <span className="text-text font-mono">{ex.sets || 'N/A'}x{ex.reps || 'N/A'} @ {ex.weight || 'N/A'}kg</span>
        </li>
      ))}
    </ul>
  </div>
);

export default WorkoutDisplayCard;
