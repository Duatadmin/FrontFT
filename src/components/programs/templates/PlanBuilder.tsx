import React, { useState, useEffect } from 'react';
import { ProgramDay, ProgramExercise } from '../../../store/useProgramStore';
import { Plus, Trash2, Grip, Copy } from 'lucide-react';
import createLogger from '../../../utils/logger';

const logger = createLogger('PlanBuilder');

interface PlanBuilderProps {
  templateId: string | null;
  onChange: () => void;
}

// Day of week mapping
const DAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

// Mock empty program
const EMPTY_PROGRAM: ProgramDay[] = [
  {
    dayOfWeek: 1, // Monday
    focus: 'Full Body',
    exercises: [],
  },
  {
    dayOfWeek: 3, // Wednesday
    focus: 'Full Body',
    exercises: [],
  },
  {
    dayOfWeek: 5, // Friday
    focus: 'Full Body',
    exercises: [],
  },
];

// Mock 5x5 program
const TEMPLATE_5X5: ProgramDay[] = [
  {
    dayOfWeek: 1, // Monday
    focus: 'Full Body A',
    exercises: [
      { id: 'ex-1', name: 'Squat', sets: 5, reps: 5, load: 80 },
      { id: 'ex-2', name: 'Bench Press', sets: 5, reps: 5, load: 60 },
      { id: 'ex-3', name: 'Barbell Row', sets: 5, reps: 5, load: 50 },
      { id: 'ex-4', name: 'Overhead Press', sets: 3, reps: 8, load: 30 },
      { id: 'ex-5', name: 'Tricep Extensions', sets: 3, reps: 10, load: 20 },
    ],
  },
  {
    dayOfWeek: 3, // Wednesday
    focus: 'Full Body B',
    exercises: [
      { id: 'ex-6', name: 'Deadlift', sets: 5, reps: 5, load: 100 },
      { id: 'ex-7', name: 'Overhead Press', sets: 5, reps: 5, load: 35 },
      { id: 'ex-8', name: 'Lat Pulldown', sets: 5, reps: 5, load: 60 },
      { id: 'ex-9', name: 'Dips', sets: 3, reps: 8, load: 0 },
      { id: 'ex-10', name: 'Barbell Curl', sets: 3, reps: 10, load: 25 },
    ],
  },
  {
    dayOfWeek: 5, // Friday
    focus: 'Full Body A',
    exercises: [
      { id: 'ex-11', name: 'Squat', sets: 5, reps: 5, load: 85 },
      { id: 'ex-12', name: 'Bench Press', sets: 5, reps: 5, load: 65 },
      { id: 'ex-13', name: 'Barbell Row', sets: 5, reps: 5, load: 55 },
      { id: 'ex-14', name: 'Pull-ups', sets: 3, reps: 8, load: 0 },
      { id: 'ex-15', name: 'Face Pulls', sets: 3, reps: 12, load: 20 },
    ],
  },
];

// Get mock program based on template ID
const getMockProgramByTemplateId = (templateId: string | null): ProgramDay[] => {
  if (!templateId) return EMPTY_PROGRAM;
  
  switch (templateId) {
    case 'template-5x5':
      return TEMPLATE_5X5;
    // Add more template mocks as needed
    default:
      return EMPTY_PROGRAM;
  }
};

/**
 * PlanBuilder Component
 * Allows creating and editing custom training plans
 */
const PlanBuilder: React.FC<PlanBuilderProps> = ({ templateId, onChange }) => {
  // State for the program being built
  const [program, setProgram] = useState<ProgramDay[]>([]);
  const [planName, setPlanName] = useState('My Custom Program');
  const [planGoalType, setPlanGoalType] = useState<'strength' | 'hypertrophy' | 'endurance' | 'weight_loss' | 'general'>('strength');
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  
  // Load template on mount or when templateId changes
  useEffect(() => {
    const templateProgram = getMockProgramByTemplateId(templateId);
    logger.debug('Loading template program', { templateId, dayCount: templateProgram.length });
    setProgram(templateProgram);
    
    // Set default name based on template
    if (templateId === 'template-5x5') {
      setPlanName('5x5 Strength Program');
      setPlanGoalType('strength');
    } else if (templateId) {
      setPlanName('Custom Program from Template');
    } else {
      setPlanName('My Custom Program');
    }
  }, [templateId]);
  
  // Notify parent of changes
  useEffect(() => {
    onChange();
  }, [program, planName, planGoalType, onChange]);
  
  // Handle adding a day
  const handleAddDay = () => {
    // Find an unused day of the week
    const usedDays = program.map(day => day.dayOfWeek);
    const availableDays = DAYS.filter(day => !usedDays.includes(day.value));
    
    if (availableDays.length === 0) {
      alert('All days of the week are already scheduled. Please remove a day first.');
      return;
    }
    
    const newDay: ProgramDay = {
      dayOfWeek: availableDays[0].value,
      focus: 'New Workout',
      exercises: [],
    };
    
    const updatedProgram = [...program, newDay].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    setProgram(updatedProgram);
    logger.debug('Added new day', { dayOfWeek: newDay.dayOfWeek });
  };
  
  // Handle removing a day
  const handleRemoveDay = (dayIndex: number) => {
    const updatedProgram = program.filter((_, index) => index !== dayIndex);
    setProgram(updatedProgram);
    logger.debug('Removed day', { dayIndex });
  };
  
  // Handle day edit (updating focus)
  const handleEditDayFocus = (dayIndex: number, focus: string) => {
    const updatedProgram = [...program];
    updatedProgram[dayIndex].focus = focus;
    setProgram(updatedProgram);
  };
  
  // Handle day of week change
  const handleDayOfWeekChange = (dayIndex: number, dayOfWeek: number) => {
    // Check if day is already used
    if (program.some(day => day.dayOfWeek === dayOfWeek)) {
      alert('This day is already scheduled. Please choose another day.');
      return;
    }
    
    const updatedProgram = [...program];
    updatedProgram[dayIndex].dayOfWeek = dayOfWeek as 0 | 1 | 2 | 3 | 4 | 5 | 6;
    setProgram(updatedProgram.sort((a, b) => a.dayOfWeek - b.dayOfWeek));
  };
  
  // Handle adding an exercise
  const handleAddExercise = (dayIndex: number) => {
    const newExercise: ProgramExercise = {
      id: `ex-${Date.now()}`,
      name: 'New Exercise',
      sets: 3,
      reps: 10,
      load: 0,
    };
    
    const updatedProgram = [...program];
    updatedProgram[dayIndex].exercises.push(newExercise);
    setProgram(updatedProgram);
    logger.debug('Added new exercise', { dayIndex, exerciseId: newExercise.id });
  };
  
  // Handle removing an exercise
  const handleRemoveExercise = (dayIndex: number, exerciseIndex: number) => {
    const updatedProgram = [...program];
    updatedProgram[dayIndex].exercises.splice(exerciseIndex, 1);
    setProgram(updatedProgram);
    logger.debug('Removed exercise', { dayIndex, exerciseIndex });
  };
  
  // Handle updating an exercise
  const handleUpdateExercise = (dayIndex: number, exerciseIndex: number, field: string, value: string | number) => {
    const updatedProgram = [...program];
    const exercise = updatedProgram[dayIndex].exercises[exerciseIndex];
    
    if (field === 'name') {
      exercise.name = value as string;
    } else if (field === 'sets') {
      exercise.sets = Number(value);
    } else if (field === 'reps') {
      exercise.reps = Number(value);
    } else if (field === 'load') {
      exercise.load = Number(value);
    }
    
    setProgram(updatedProgram);
  };
  
  // Calculate day volume
  const calculateDayVolume = (day: ProgramDay): number => {
    return day.exercises.reduce((total, exercise) => {
      const load = exercise.load || 0;
      return total + (exercise.sets * exercise.reps * load);
    }, 0);
  };
  
  // Function to duplicate a day
  const handleDuplicateDay = (dayIndex: number) => {
    const dayToDuplicate = program[dayIndex];
    
    // Find an unused day of the week
    const usedDays = program.map(day => day.dayOfWeek);
    const availableDays = DAYS.filter(day => !usedDays.includes(day.value));
    
    if (availableDays.length === 0) {
      alert('All days of the week are already scheduled. Please remove a day first.');
      return;
    }
    
    // Create duplicate with new exercises IDs
    const duplicatedDay: ProgramDay = {
      dayOfWeek: availableDays[0].value,
      focus: `${dayToDuplicate.focus} (Copy)`,
      exercises: dayToDuplicate.exercises.map(ex => ({
        ...ex,
        id: `ex-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      })),
    };
    
    const updatedProgram = [...program, duplicatedDay].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    setProgram(updatedProgram);
    logger.debug('Duplicated day', { originalDayIndex: dayIndex, newDayOfWeek: duplicatedDay.dayOfWeek });
  };

  return (
    <div className="space-y-6" data-testid="plan-builder">
      {/* Plan metadata */}
      <div className="bg-background-surface rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4">Program Details</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="plan-name" className="block text-sm text-text-secondary mb-1">
              Program Name
            </label>
            <input
              type="text"
              id="plan-name"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full px-3 py-2 bg-background-default border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="plan-name-input"
            />
          </div>
          
          <div>
            <label htmlFor="plan-goal-type" className="block text-sm text-text-secondary mb-1">
              Primary Goal
            </label>
            <select
              id="plan-goal-type"
              value={planGoalType}
              onChange={(e) => setPlanGoalType(e.target.value as any)}
              className="w-full px-3 py-2 bg-background-default border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="plan-goal-select"
            >
              <option value="strength">Strength</option>
              <option value="hypertrophy">Hypertrophy</option>
              <option value="endurance">Endurance</option>
              <option value="weight_loss">Weight Loss</option>
              <option value="general">General Fitness</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Weekly schedule */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Weekly Schedule</h3>
          <button
            onClick={handleAddDay}
            className="flex items-center gap-1 px-3 py-1.5 bg-primary rounded-lg text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            data-testid="add-day-button"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Day
          </button>
        </div>
        
        {program.length === 0 ? (
          <div className="bg-background-surface rounded-xl p-8 text-center">
            <p className="text-text-secondary">
              No workout days added yet. Click "Add Day" to start building your program.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {program.map((day, dayIndex) => (
              <div 
                key={`${day.dayOfWeek}-${dayIndex}`}
                className="bg-background-surface rounded-xl overflow-hidden border border-border"
                data-testid={`day-card-${dayIndex}`}
              >
                {/* Day header */}
                <div className="bg-background-hover/30 p-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Grip className="h-5 w-5 text-text-tertiary cursor-grab" />
                    <select
                      value={day.dayOfWeek}
                      onChange={(e) => handleDayOfWeekChange(dayIndex, parseInt(e.target.value))}
                      className="bg-background-default border border-border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {DAYS.map(d => (
                        <option 
                          key={d.value} 
                          value={d.value}
                          disabled={program.some(p => p.dayOfWeek === d.value && p !== day)}
                        >
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={day.focus}
                      onChange={(e) => handleEditDayFocus(dayIndex, e.target.value)}
                      className="bg-background-default border border-border rounded-lg px-3 py-1.5 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Workout focus (e.g., Upper Body)"
                    />
                  </div>
                  
                  <div className="text-xs bg-background-default px-2 py-1 rounded text-text-tertiary">
                    Volume: {calculateDayVolume(day).toLocaleString()}
                  </div>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDuplicateDay(dayIndex)}
                      className="p-1.5 text-text-tertiary hover:text-text-primary hover:bg-background-hover rounded transition-colors"
                      title="Duplicate day"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveDay(dayIndex)}
                      className="p-1.5 text-text-tertiary hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                      title="Remove day"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Exercises */}
                <div className="p-4">
                  {day.exercises.length === 0 ? (
                    <div className="text-center py-4 text-text-tertiary text-sm">
                      No exercises added yet. Click "Add Exercise" to start building this workout.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-2 font-medium text-text-secondary">Exercise</th>
                            <th className="text-center py-2 font-medium text-text-secondary">Sets</th>
                            <th className="text-center py-2 font-medium text-text-secondary">Reps</th>
                            <th className="text-center py-2 font-medium text-text-secondary">Load (kg)</th>
                            <th className="text-right py-2 font-medium text-text-secondary">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {day.exercises.map((exercise, exerciseIndex) => (
                            <tr 
                              key={exercise.id}
                              className="border-b border-border/50 last:border-0"
                              data-testid={`exercise-row-${dayIndex}-${exerciseIndex}`}
                            >
                              <td className="py-2">
                                <input
                                  type="text"
                                  value={exercise.name}
                                  onChange={(e) => handleUpdateExercise(dayIndex, exerciseIndex, 'name', e.target.value)}
                                  className="bg-transparent border-b border-border/50 px-1 py-0.5 w-full focus:outline-none focus:border-primary"
                                />
                              </td>
                              <td className="py-2 text-center">
                                <input
                                  type="number"
                                  value={exercise.sets}
                                  onChange={(e) => handleUpdateExercise(dayIndex, exerciseIndex, 'sets', e.target.value)}
                                  min="1"
                                  max="20"
                                  className="bg-transparent border-b border-border/50 px-1 py-0.5 w-12 text-center focus:outline-none focus:border-primary"
                                />
                              </td>
                              <td className="py-2 text-center">
                                <input
                                  type="number"
                                  value={exercise.reps}
                                  onChange={(e) => handleUpdateExercise(dayIndex, exerciseIndex, 'reps', e.target.value)}
                                  min="1"
                                  max="100"
                                  className="bg-transparent border-b border-border/50 px-1 py-0.5 w-12 text-center focus:outline-none focus:border-primary"
                                />
                              </td>
                              <td className="py-2 text-center">
                                <input
                                  type="number"
                                  value={exercise.load || 0}
                                  onChange={(e) => handleUpdateExercise(dayIndex, exerciseIndex, 'load', e.target.value)}
                                  min="0"
                                  step="2.5"
                                  className="bg-transparent border-b border-border/50 px-1 py-0.5 w-16 text-center focus:outline-none focus:border-primary"
                                />
                              </td>
                              <td className="py-2 text-right">
                                <button
                                  onClick={() => handleRemoveExercise(dayIndex, exerciseIndex)}
                                  className="p-1 text-text-tertiary hover:text-red-500 rounded transition-colors"
                                  title="Remove exercise"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleAddExercise(dayIndex)}
                    className="mt-4 flex items-center gap-1 px-3 py-1.5 bg-background-hover rounded-lg text-text-primary text-sm hover:bg-background-hover/80 transition-colors w-full justify-center"
                    data-testid={`add-exercise-button-${dayIndex}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Exercise
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Program summary */}
      <div className="bg-background-surface rounded-xl p-6">
        <h3 className="text-lg font-medium mb-3">Program Summary</h3>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-text-secondary text-sm mb-1">Workout Days</p>
            <p className="text-xl font-semibold text-text-primary">{program.length}</p>
          </div>
          
          <div>
            <p className="text-text-secondary text-sm mb-1">Total Exercises</p>
            <p className="text-xl font-semibold text-text-primary">
              {program.reduce((total, day) => total + day.exercises.length, 0)}
            </p>
          </div>
          
          <div>
            <p className="text-text-secondary text-sm mb-1">Total Volume</p>
            <p className="text-xl font-semibold text-text-primary">
              {program.reduce((total, day) => total + calculateDayVolume(day), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanBuilder;
