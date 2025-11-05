import React, { useState } from 'react';
import { Plus, X, Check, Edit2, AlertTriangle } from 'lucide-react';
import useDiaryStore from '../../../store/useDiaryStore';
import useUserStore from '../../../store/useUserStore';
import type { Challenge } from '../../../store/diaryTypes';

/**
 * ChallengesAndFixes Component
 * Allows users to record challenges faced during the week and potential solutions
 */
const ChallengesAndFixes: React.FC = () => {
  const { currentWeekReflection, addChallenge, removeChallenge, updateChallenge } = useDiaryStore();
  const { user } = useUserStore();
  
  const [newChallenge, setNewChallenge] = useState('');
  const [newSolution, setNewSolution] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editSolution, setEditSolution] = useState('');
  
  // Handle adding a new challenge
  const handleAddChallenge = () => {
    if (!newChallenge.trim() || !user?.id || !currentWeekReflection?.id) return;
    
    const challengeData: Omit<Challenge, 'id' | 'user_id' | 'week_id'> = {
      text: newChallenge.trim(),
      solution: newSolution.trim() || null, // Ensure solution can be null if empty
    };
    
    addChallenge(challengeData, user.id, currentWeekReflection.id);
    setNewChallenge('');
    setNewSolution('');
  };
  
  // Handle removing a challenge
  const handleRemoveChallenge = (id: string) => {
    if (!user?.id) return;
    removeChallenge(id, user.id);
  };
  
  // Start editing a challenge
  const startEditing = (id: string, text: string, solution: string) => {
    setEditingId(id);
    setEditText(text);
    setEditSolution(solution);
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
    setEditSolution('');
  };
  
  // Save edits
  const saveEdits = (id: string) => {
    if (!editText.trim() || !user?.id) return;
    
    const updateData: Partial<Omit<Challenge, 'id' | 'user_id' | 'week_id'>> = {
      text: editText.trim(),
      solution: editSolution.trim() || null, // Ensure solution can be null if empty
    };
    
    updateChallenge(id, updateData, user.id);
    
    setEditingId(null);
  };
  
  // If no reflection exists yet, show a placeholder
  if (!currentWeekReflection) {
    return (
      <div className="bg-neutral-800/50 rounded-2xl shadow-card p-5">
        <h3 className="text-base font-semibold mb-4 flex items-center">
          <AlertTriangle className="text-accent-violet mr-2" size={18} />
          Challenges & Solutions
        </h3>
        <p className="text-sm text-text-secondary mb-3">
          Record challenges you face during workouts and how you overcome them.
        </p>
        <div className="text-xs text-text-tertiary">
          Complete at least one workout to start tracking weekly challenges.
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-neutral-800/50 rounded-2xl shadow-card p-5" data-testid="challenges-fixes">
      <h3 className="text-base font-semibold mb-4 flex items-center">
        <AlertTriangle className="text-accent-violet mr-2" size={18} />
        Challenges & Solutions
      </h3>
      
      {/* Challenge list */}
      <div className="mb-4 space-y-3">
        {currentWeekReflection.challenges.length === 0 ? (
          <p className="text-sm text-text-tertiary italic">
            No challenges recorded this week. Great job!
          </p>
        ) : (
          currentWeekReflection.challenges.map((challenge) => (
            <div 
              key={challenge.id} 
              className="border border-border-light rounded-lg p-3 bg-neutral-900/70"
              data-testid={`challenge-${challenge.id}`}
            >
              {editingId === challenge.id ? (
                // Edit mode
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
                    placeholder="Challenge"
                    aria-label="Edit challenge"
                  />
                  <textarea
                    value={editSolution}
                    onChange={(e) => setEditSolution(e.target.value)}
                    className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
                    placeholder="Solution (optional)"
                    rows={2}
                    aria-label="Edit solution"
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={cancelEditing}
                      className="text-text-secondary text-xs flex items-center hover:text-red-500"
                      aria-label="Cancel editing"
                    >
                      <X size={14} className="mr-1" />
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdits(challenge.id)}
                      className="bg-accent-violet text-white text-xs flex items-center px-2 py-1 rounded-md hover:bg-accent-violet/90"
                      aria-label="Save challenge edits"
                    >
                      <Check size={14} className="mr-1" />
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <div>
                  <div className="flex justify-between">
                    <h4 className="font-medium text-sm">{challenge.text}</h4>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => startEditing(challenge.id, challenge.text, challenge.solution || '')}
                        className="text-text-tertiary hover:text-accent-violet"
                        aria-label="Edit challenge"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleRemoveChallenge(challenge.id)}
                        className="text-text-tertiary hover:text-red-500"
                        aria-label="Remove challenge"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  {challenge.solution && (
                    <div className="mt-2 bg-neutral-900/70 rounded-md p-2 text-xs text-text-secondary">
                      <span className="font-medium">Solution:</span> {challenge.solution}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      
      {/* Add new challenge form */}
      <div className="space-y-2 mt-4 border-t border-border-light pt-4">
        <h4 className="text-sm font-medium mb-2">Add New Challenge</h4>
        <input
          type="text"
          value={newChallenge}
          onChange={(e) => setNewChallenge(e.target.value)}
          className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
          placeholder="What challenge did you face?"
          aria-label="New challenge"
          data-testid="new-challenge-input"
        />
        <textarea
          value={newSolution}
          onChange={(e) => setNewSolution(e.target.value)}
          className="w-full p-2 text-sm bg-neutral-900/70 border border-border-light rounded-md focus:ring-1 focus:ring-accent-violet"
          placeholder="How did you overcome it? (optional)"
          rows={2}
          aria-label="Solution for new challenge"
          data-testid="new-solution-input"
        />
        <div className="flex justify-end">
          <button
            onClick={handleAddChallenge}
            disabled={!newChallenge.trim()}
            className={`flex items-center text-sm px-3 py-1.5 rounded-lg ${
              !newChallenge.trim()
                ? 'bg-background-surface text-text-tertiary cursor-not-allowed'
                : 'bg-neutral-900/70 text-accent-violet border border-border-light hover:bg-neutral-800/70'
            }`}
            data-testid="add-challenge-button"
          >
            <Plus size={16} className="mr-1" />
            Add Challenge
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChallengesAndFixes;
