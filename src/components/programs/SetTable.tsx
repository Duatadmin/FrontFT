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
    <div className="overflow-x-auto mt-2">
      <table className="min-w-full text-xs sm:text-sm text-left text-neutral-300 bg-neutral-700/30 rounded">
        <thead className="text-[0.65rem] sm:text-xs text-neutral-400 uppercase bg-neutral-700/50">
          <tr>
            <th scope="col" className="px-2 py-1 sm:px-3 sm:py-1.5">Set</th>
            <th scope="col" className="px-2 py-1 sm:px-3 sm:py-1.5">Reps</th>
            <th scope="col" className="px-2 py-1 sm:px-3 sm:py-1.5 whitespace-nowrap">Wt (kg)</th>
            <th scope="col" className="px-2 py-1 sm:px-3 sm:py-1.5">RPE</th>
            <th scope="col" className="px-2 py-1 sm:px-3 sm:py-1.5">Actions</th>
          </tr>
        </thead>
        <tbody>
          {editableSets.map((set, index) => (
            <tr key={set.id || `set-${index}`} className="border-b border-neutral-600 hover:bg-neutral-700/40 align-middle">
              <td className="px-2 py-1 sm:px-3 sm:py-1.5 font-medium">{set.setNo ?? index + 1}</td>
              <td className="px-2 py-1 sm:px-3 sm:py-1.5">
                {set.isEditing ? (
                  <input 
                    type="number" 
                    value={set.pendingRepsDone ?? ''} 
                    onChange={(e) => handleInputChange(set.id, 'repsDone', e.target.value)} 
                    className="bg-neutral-600 text-neutral-100 p-0.5 sm:p-1 rounded w-14 sm:w-16 text-center text-xs sm:text-sm"
                  />
                ) : (
                  set.repsDone ?? '–'
                )}
              </td>
              <td className="px-2 py-1 sm:px-3 sm:py-1.5">
                {set.isEditing ? (
                  <input 
                    type="number" 
                    step="0.25" 
                    value={set.pendingWeightKg ?? ''} 
                    onChange={(e) => handleInputChange(set.id, 'weightKg', e.target.value)} 
                    className="bg-neutral-600 text-neutral-100 p-0.5 sm:p-1 rounded w-14 sm:w-16 text-center text-xs sm:text-sm"
                  />
                ) : (
                  set.weightKg ?? '–'
                )}
              </td>
              <td className="px-2 py-1 sm:px-3 sm:py-1.5">
                {set.isEditing ? (
                  <input 
                    type="number" 
                    step="0.5" 
                    min="1" max="10" 
                    value={set.pendingRpe ?? ''} 
                    onChange={(e) => handleInputChange(set.id, 'rpe', e.target.value)} 
                    className="bg-neutral-600 text-neutral-100 p-0.5 sm:p-1 rounded w-14 sm:w-16 text-center text-xs sm:text-sm"
                  />
                ) : (
                  set.rpe ?? '–'
                )}
              </td>
              <td className="px-2 py-1 sm:px-3 sm:py-1.5 whitespace-nowrap">
                {set.isEditing ? (
                  <button onClick={() => handleSave(set)} className="font-medium text-green-400 hover:text-green-300 mr-1 sm:mr-2 text-xs p-0.5 sm:p-1 bg-green-700/50 hover:bg-green-600/50 rounded">
                    Save
                  </button>
                ) : null}
                <button onClick={() => toggleEdit(set.id)} className={`font-medium text-xs p-0.5 sm:p-1 rounded ${set.isEditing ? 'text-yellow-400 hover:text-yellow-300 bg-yellow-700/50 hover:bg-yellow-600/50' : 'text-blue-400 hover:text-blue-300 bg-blue-700/50 hover:bg-blue-600/50'}`}>
                  {set.isEditing ? 'Cancel' : 'Edit'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// This export ensures the file is treated as a module.
export {};
