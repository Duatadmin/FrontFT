import React, { useEffect, useRef } from 'react';
import { 
  X, Calendar, Clock, Dumbbell, BarChart3, 
  MessageSquare, Award, ChevronLeft 
} from 'lucide-react';
import useDiaryStore from '../../store/useDiaryStore';

const SessionDrawer: React.FC = () => {
  const { selectedSession, selectSession } = useDiaryStore();
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // Handle ESC key press to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedSession) {
        selectSession(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedSession, selectSession]);
  
  // Set up focus trap
  useEffect(() => {
    if (selectedSession && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [selectedSession]);
  
  // Close drawer when clicking outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      selectSession(null);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    });
  };
  
  // Format time duration to readable format
  const formatDuration = (minutes: number) => {
    if (!minutes) return '';
    
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hour${hours > 1 ? 's' : ''}${mins > 0 ? ` ${mins} minute${mins > 1 ? 's' : ''}` : ''}`;
  };
  
  // No session selected, don't render drawer
  if (!selectedSession) return null;
  
  // Check if a PR was achieved in this workout (mock implementation)
  const hasPr = selectedSession.id.charCodeAt(0) % 3 === 0; // Just for demo purposes
  
  // Group exercises by body part (mock implementation)
  const groupedExercises = selectedSession.exercises_completed.reduce((acc, exercise) => {
    // This would be based on real data, but for now we'll use a simple heuristic
    let bodyPart = 'Other';
    if (exercise.toLowerCase().includes('bench') || exercise.toLowerCase().includes('push')) {
      bodyPart = 'Chest';
    } else if (exercise.toLowerCase().includes('squat') || exercise.toLowerCase().includes('leg')) {
      bodyPart = 'Legs';
    } else if (exercise.toLowerCase().includes('curl') || exercise.toLowerCase().includes('press')) {
      bodyPart = 'Arms';
    } else if (exercise.toLowerCase().includes('row') || exercise.toLowerCase().includes('pull')) {
      bodyPart = 'Back';
    }
    
    return {
      ...acc,
      [bodyPart]: [...(acc[bodyPart] || []), exercise]
    };
  }, {} as Record<string, string[]>);
  
  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-end"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="session-drawer-title"
    >
      <div 
        ref={drawerRef}
        className="bg-background h-full w-full md:w-2/3 lg:w-1/2 xl:w-1/3 max-w-xl overflow-auto animate-slide-left focus:outline-none"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background-surface border-b border-border-light p-4 flex justify-between items-center z-10">
          <button 
            className="md:hidden p-2 -ml-2 rounded-full hover:bg-background-card/50 focus:outline-none focus:ring-2 focus:ring-accent-violet"
            onClick={() => selectSession(null)}
            aria-label="Close details"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 id="session-drawer-title" className="text-lg font-semibold">Workout Details</h2>
          <button 
            className="hidden md:block p-2 -mr-2 rounded-full hover:bg-background-card/50 focus:outline-none focus:ring-2 focus:ring-accent-violet" 
            onClick={() => selectSession(null)}
            aria-label="Close details"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5 space-y-6">
          {/* Session header info */}
          <div>
            <h3 className="text-xl font-bold mb-1">
              {selectedSession.exercises_completed[0] || 'Workout'} 
              {selectedSession.exercises_completed.length > 1 && ` +${selectedSession.exercises_completed.length - 1}`}
            </h3>
            
            <div className="flex items-center text-text-secondary mb-4">
              <Calendar size={16} className="mr-1.5" />
              <span>{formatDate(selectedSession.timestamp)}</span>
            </div>
            
            {/* Key stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-background-card rounded-xl p-4 flex flex-col items-center">
                <Clock className="text-accent-violet mb-2" size={20} />
                <div className="text-sm text-text-secondary">Duration</div>
                <div className="font-medium">{formatDuration(selectedSession.duration_minutes)}</div>
              </div>
              
              <div className="bg-background-card rounded-xl p-4 flex flex-col items-center">
                <Dumbbell className="text-accent-violet mb-2" size={20} />
                <div className="text-sm text-text-secondary">Volume</div>
                <div className="font-medium">{selectedSession.total_sets} sets / {selectedSession.total_reps} reps</div>
              </div>
              
              <div className="col-span-2 md:col-span-1 bg-background-card rounded-xl p-4 flex flex-col items-center">
                <BarChart3 className="text-accent-violet mb-2" size={20} />
                <div className="text-sm text-text-secondary">Difficulty</div>
                <div className="flex items-center mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i}
                      className={`w-2 h-8 mx-0.5 rounded-sm ${
                        i < selectedSession.overall_difficulty 
                          ? 'bg-accent-violet' 
                          : 'bg-background-surface'
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-medium">{selectedSession.overall_difficulty}/5</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* PR Achievement */}
          {hasPr && (
            <div className="bg-accent-mint/10 border border-accent-mint/20 rounded-xl p-4">
              <div className="flex items-center">
                <Award className="text-accent-mint mr-3" size={24} />
                <div>
                  <h4 className="font-medium text-accent-mint">New Personal Record!</h4>
                  <p className="text-sm">Bench Press: 225 lbs x 5 reps</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Exercises List */}
          <div>
            <h4 className="font-medium text-lg mb-3">Exercises</h4>
            
            {Object.entries(groupedExercises).map(([bodyPart, exercises]) => (
              <div key={bodyPart} className="mb-4">
                <h5 className="text-sm text-text-secondary mb-2">{bodyPart}</h5>
                <div className="space-y-2">
                  {exercises.map((exercise, index) => (
                    <div 
                      key={index}
                      className="bg-background-card rounded-lg p-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{exercise}</div>
                        <div className="text-sm text-text-secondary">
                          {/* Mock data - would come from real data in production */}
                          {Math.floor(Math.random() * 5) + 1} sets • {Math.floor(Math.random() * 12) + 5} reps
                        </div>
                      </div>
                      {exercise === 'Bench Press' && hasPr && (
                        <div className="bg-accent-mint/20 text-accent-mint text-xs font-medium px-2 py-1 rounded-full">
                          PR
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* Notes */}
          {selectedSession.user_feedback && (
            <div>
              <h4 className="font-medium text-lg mb-3 flex items-center">
                <MessageSquare size={18} className="mr-2" />
                Notes
              </h4>
              <div className="bg-background-card rounded-xl p-4 text-text-secondary">
                {selectedSession.user_feedback}
              </div>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex space-x-3 pt-4">
            <button className="flex-1 bg-accent-violet text-white py-3 rounded-xl font-medium hover:bg-accent-violet/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet focus:ring-offset-2 focus:ring-offset-background">
              Export Workout
            </button>
            
            <button className="flex items-center justify-center w-12 h-12 bg-background-card border border-border-light rounded-xl hover:bg-background-card/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-violet">
              <MessageSquare size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDrawer;
