import React, { useState, useEffect } from 'react';
import type { WorkoutSet } from '@/utils/rowsToPlanTree';
import { supabase } from '@/lib/supabase';
// import { useWorkoutStore } from '@/stores/useWorkoutStore'; // Assuming a Zustand store for optimistic updates

import { useWorkoutStore } from '@/stores/useWorkoutStore';

interface SetTableProps {
  sets: WorkoutSet[];
  // planId: string; // Removed, store should have context
  weekId: string;
  sessionId: string;
  exerciseId: string; // Unique ID for the exercise instance from workout_full_view (exercise_row_id)
}

interface EditableSet extends WorkoutSet {
  isEditing?: boolean;
  // Store pending changes locally before submitting
  pendingRepsDone?: number | null;
  pendingWeightKg?: number | null;
  pendingRpe?: number | null;
}

export const SetTable: React.FC<SetTableProps> = ({ sets: initialSets, weekId, sessionId, exerciseId }) => { // planId removed
  const [editableSets, setEditableSets] = useState<EditableSet[]>([]);
  const { updateSetOptimistically } = useWorkoutStore();

  useEffect(() => {
    setEditableSets(initialSets.map(set => ({ ...set, isEditing: false })));
  }, [initialSets]);

  const handleInputChange = (setId: string, field: keyof EditableSet, value: string) => {
    const numericValue = value === '' ? null : parseFloat(value);
    setEditableSets(prevSets =>
      prevSets.map(set =>
        set.id === setId ? { ...set, [`pending${field.charAt(0).toUpperCase() + field.slice(1)}`]: numericValue } : set
      )
    );
  };

  const toggleEdit = (setId: string) => {
    setEditableSets(prevSets =>
      prevSets.map(set => {
        if (set.id === setId) {
          if (set.isEditing) {
            // If was editing, reset pending changes if any, or prepare to save
            return { 
              ...set, 
              isEditing: false, 
              pendingRepsDone: undefined, 
              pendingWeightKg: undefined, 
              pendingRpe: undefined 
            };
          } else {
            // If starting to edit, populate pending fields with current values
            return { 
              ...set, 
              isEditing: true, 
              pendingRepsDone: set.repsDone,
              pendingWeightKg: set.weightKg,
              pendingRpe: set.rpe
            };
          }
        }
        return set;
      })
    );
  };

  const handleSave = async (set: EditableSet) => {
    if (!set.isEditing) return; // Should not happen

    const updatedSetData = {
      reps_done: set.pendingRepsDone !== undefined ? set.pendingRepsDone : set.repsDone,
      weight_kg: set.pendingWeightKg !== undefined ? set.pendingWeightKg : set.weightKg,
      rpe: set.pendingRpe !== undefined ? set.pendingRpe : set.rpe,
      recorded_at: new Date().toISOString(), // Update timestamp on save
    };

    // Optimistic update
    // The planId argument will be removed or handled differently after store review.
    // For now, let's assume the store's updateSetOptimistically might not need it directly if plan is already set in store.
    const optimisticResult = updateSetOptimistically(weekId, sessionId, exerciseId, set.id, updatedSetData);
    let originalSetForRevert: WorkoutSet | undefined = optimisticResult.originalSet;

    // Actual Supabase update
    try {
      const { error } = await supabase
        .from('workout_sets') // Assuming 'workout_sets' is your table name for sets
        .update(updatedSetData)
        .eq('id', set.id);

      if (error) {
        console.error('Error updating set:', error);
        // Revert optimistic update if Supabase failed
        if (optimisticResult.success && originalSetForRevert) {
          // This is a simplified revert; a more robust solution might involve a dedicated revert action in the store
          // or re-fetching data. For now, we'll just log and alert.
          console.warn('Supabase update failed, optimistic changes were made. Consider a revert strategy.');
          // To truly revert, you'd call another store action with originalSetForRevert
          // For example: revertSetOptimistically(planId, weekId, sessionId, exerciseId, set.id, originalSetForRevert);
        }
        alert(`Failed to save set: ${error.message}`);
      } else {
        // Successfully saved, reflect changes from pending to actual if not already done by store
        setEditableSets(prevSets =>
          prevSets.map(s => 
            s.id === set.id ? { 
              ...s, 
              repsDone: updatedSetData.reps_done,
              weightKg: updatedSetData.weight_kg,
              rpe: updatedSetData.rpe,
              recordedAt: updatedSetData.recorded_at,
              isEditing: false, 
              pendingRepsDone: undefined, 
              pendingWeightKg: undefined, 
              pendingRpe: undefined 
            } : s
          )
        );
        console.log('Set updated successfully:', set.id);
      }
    } catch (e) {
      console.error('Exception updating set:', e);
      // Revert optimistic update if Supabase failed due to an exception
      if (optimisticResult.success && originalSetForRevert) {
        // This is a simplified revert; a more robust solution might involve a dedicated revert action in the store
        // or re-fetching data. For now, we'll just log and alert.
        console.warn('Supabase update failed (exception), optimistic changes were made. Consider a revert strategy.');
        // To truly revert, you'd call another store action with originalSetForRevert
        // For example: revertSetOptimistically(planId, weekId, sessionId, exerciseId, set.id, originalSetForRevert);
      }
      alert('An unexpected error occurred while saving the set.');
    }
  };

  if (!editableSets || editableSets.length === 0) {
    return <p className="text-sm text-neutral-500 italic">No sets available.</p>;
  }

  return (
    <div className="overflow-hidden">
      {/* Modern Table Design with Glassmorphism */}
      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
        <table className="min-w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-3 py-2 text-left text-[0.65rem] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider">Set</th>
              <th className="px-3 py-2 text-center text-[0.65rem] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider">Reps</th>
              <th className="px-3 py-2 text-center text-[0.65rem] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider whitespace-nowrap">Weight</th>
              <th className="px-3 py-2 text-center text-[0.65rem] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider">RPE</th>
              <th className="px-3 py-2 text-right text-[0.65rem] sm:text-xs font-medium text-neutral-400 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {editableSets.map((set, index) => (
              <tr 
                key={set.id || `set-${index}`} 
                className="group hover:bg-white/5 transition-colors duration-200"
              >
                {/* Set Number with visual indicator */}
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-green-500/20 to-green-400/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-green-400">{set.setNo ?? index + 1}</span>
                    </div>
                  </div>
                </td>
                
                {/* Reps with modern input */}
                <td className="px-3 py-3 text-center">
                  {set.isEditing ? (
                    <input 
                      type="number" 
                      value={set.pendingRepsDone ?? ''} 
                      onChange={(e) => handleInputChange(set.id, 'repsDone', e.target.value)} 
                      className="bg-white/10 backdrop-blur-sm text-white px-2 py-1 rounded-lg w-16 text-center text-sm border border-white/20 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-all duration-200"
                      placeholder="-"
                    />
                  ) : (
                    <span className="text-white font-medium">
                      {set.repsDone ?? <span className="text-neutral-500">-</span>}
                    </span>
                  )}
                </td>
                
                {/* Weight with modern input and unit */}
                <td className="px-3 py-3 text-center">
                  {set.isEditing ? (
                    <div className="flex items-center justify-center gap-1">
                      <input 
                        type="number" 
                        step="0.25" 
                        value={set.pendingWeightKg ?? ''} 
                        onChange={(e) => handleInputChange(set.id, 'weightKg', e.target.value)} 
                        className="bg-white/10 backdrop-blur-sm text-white px-2 py-1 rounded-lg w-16 text-center text-sm border border-white/20 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-all duration-200"
                        placeholder="-"
                      />
                      <span className="text-xs text-neutral-400">kg</span>
                    </div>
                  ) : (
                    <span className="text-white font-medium">
                      {set.weightKg ? (
                        <>
                          {set.weightKg}
                          <span className="text-xs text-neutral-400 ml-1">kg</span>
                        </>
                      ) : (
                        <span className="text-neutral-500">-</span>
                      )}
                    </span>
                  )}
                </td>
                
                {/* RPE with visual scale indicator */}
                <td className="px-3 py-3 text-center">
                  {set.isEditing ? (
                    <input 
                      type="number" 
                      step="0.5" 
                      min="1" 
                      max="10" 
                      value={set.pendingRpe ?? ''} 
                      onChange={(e) => handleInputChange(set.id, 'rpe', e.target.value)} 
                      className="bg-white/10 backdrop-blur-sm text-white px-2 py-1 rounded-lg w-16 text-center text-sm border border-white/20 focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-400/50 transition-all duration-200"
                      placeholder="-"
                    />
                  ) : (
                    <div className="flex items-center justify-center">
                      {set.rpe ? (
                        <div className="flex items-center gap-1">
                          <span className="text-white font-medium">{set.rpe}</span>
                          <div className="w-12 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full transition-all duration-300"
                              style={{ width: `${(set.rpe / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-neutral-500">-</span>
                      )}
                    </div>
                  )}
                </td>
                
                {/* Modern Action Buttons */}
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    {set.isEditing ? (
                      <>
                        <button 
                          onClick={() => handleSave(set)} 
                          className="p-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Save"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => toggleEdit(set.id)} 
                          className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Cancel"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => toggleEdit(set.id)} 
                        className="p-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg transition-all duration-200 hover:scale-105"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// This export ensures the file is treated as a module.
export {};
