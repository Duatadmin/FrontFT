/**
 * Centralized Mock Data Generation
 * 
 * This file provides mock data generators for development and testing,
 * ensuring consistent fallback data when Supabase connection is not available.
 */
import {
  WorkoutSession, 
  TrainingPlan,
  Goal,
  ProgressPhoto,
  WeeklyReflection
} from '../supabase/schema.types';

/**
 * Generate a mock training plan
 */
export const generateMockTrainingPlan = (): TrainingPlan => {
  return {
    id: 'mock-plan-001',
    user_id: 'mock-user-123',
    name: 'Strength Building Program',
    description: '12-week progressive overload program focused on compound movements',
    days: {
      monday: ['Bench Press', 'Overhead Press', 'Tricep Extensions'],
      tuesday: [], // Rest Day
      wednesday: ['Squats', 'Deadlifts', 'Lunges'],
      thursday: ['Pull-ups', 'Rows', 'Bicep Curls'],
      friday: [], // Rest Day
      saturday: ['Full Body Circuit', 'Core Work'],
      sunday: ['Active Recovery', 'Mobility']
    },
    start_date: '2025-03-15',
    end_date: '2025-06-07',
    active: true,
    created_at: '2025-03-14T08:30:00Z',
    updated_at: '2025-04-22T13:45:00Z'
  };
};

/**
 * Generate mock workout sessions
 */
export const generateMockSessions = (count: number = 10): WorkoutSession[] => {
  const sessions: WorkoutSession[] = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const session: WorkoutSession = {
      id: `session-${i}`,
      user_id: 'mock-user-123',
      session_completed: true,
      focus_area: ['Upper Body', 'Lower Body', 'Full Body', 'Core'][i % 4],
      completed_exercises: {
        'exercise-1': [
          { set_number: 1, reps: 10, weight: 50 },
          { set_number: 2, reps: 8, weight: 55 },
          { set_number: 3, reps: 6, weight: 60 }
        ],
        'exercise-2': [
          { set_number: 1, reps: 12, weight: 30 },
          { set_number: 2, reps: 12, weight: 30 },
          { set_number: 3, reps: 10, weight: 35 }
        ]
      },
      metrics: {
        start_time: date.toISOString(),
        end_time: new Date(date.getTime() + 3600000).toISOString(),
        total_duration_minutes: 60,
        total_volume: 1500 + Math.floor(Math.random() * 1000)
      },
      created_at: date.toISOString(),
      updated_at: date.toISOString(),
      session_date: date.toISOString(),
      metadata: {
        source: 'custom',
        is_deload: false,
        overall_difficulty: 7
      }
    };
    
    sessions.push(session);
  }
  
  return sessions;
};

/**
 * Generate mock fitness goals
 */
export const generateMockGoals = (count: number = 5): Goal[] => {
  const goals: Goal[] = [];
  const categories: Array<'strength' | 'endurance' | 'weight' | 'habit' | 'other'> = [
    'strength', 'endurance', 'weight', 'habit', 'other'
  ];
  
  for (let i = 0; i < count; i++) {
    const created = new Date();
    created.setDate(created.getDate() - (i * 5));
    
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (30 + i * 10));
    
    const goal: Goal = {
      id: `goal-${i}`,
      user_id: 'mock-user-123',
      title: `Goal ${i + 1}`,
      description: `Description for goal ${i + 1}`,
      target_value: 100 + (i * 25),
      current_value: 50 + (i * 10),
      unit: ['kg', 'lbs', '%', 'reps', 'days'][i % 5],
      category: categories[i % categories.length],
      deadline: deadline.toISOString().split('T')[0],
      created_at: created.toISOString(),
      status: (['not_started', 'in_progress', 'completed', 'failed'] as const)[i % 4]
    };
    
    goals.push(goal);
  }
  
  return goals;
};

/**
 * Generate mock weekly reflections
 */
export const generateMockWeeklyReflections = (count: number = 8): WeeklyReflection[] => {
  const reflections: WeeklyReflection[] = [];
  
  for (let i = 0; i < count; i++) {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - (i * 7));
    
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekEnd.getDate() - 6);
    
    const reflection: WeeklyReflection = {
      id: `reflection-${i}`,
      user_id: 'mock-user-123',
      week_start_date: weekStart.toISOString().split('T')[0],
      week_end_date: weekEnd.toISOString().split('T')[0],
      planned_sessions: 5,
      completed_sessions: 4 - (i % 2),
      total_volume: 5000 + (Math.random() * 3000),
      new_prs: i % 3,
      cardio_minutes: 60 + (i * 10),
      avg_mood: 4 - (i % 2),
      avg_sleep: 7 + (i % 2),
      avg_soreness: 5 - (i % 3),
      challenges: [
        { id: `challenge-${i}-1`, user_id: 'mock-user-123', text: `Challenge ${i}-1`, week_id: `reflection-${i}` },
        { id: `challenge-${i}-2`, user_id: 'mock-user-123', text: `Challenge ${i}-2`, week_id: `reflection-${i}` }
      ],
      wins: ["Got a new PR", "Maintained consistency", "Improved technique"],
      next_week_focus: "Increase volume on compound movements",
      next_week_session_target: 5,
      created_at: weekEnd.toISOString(),
      updated_at: weekEnd.toISOString()
    };
    
    reflections.push(reflection);
  }
  
  return reflections;
};

/**
 * Generate mock progress photos
 */
export const generateMockProgressPhotos = (count: number = 6): ProgressPhoto[] => {
  const photos: ProgressPhoto[] = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (i * 14)); // Every two weeks
    
    const photo: ProgressPhoto = {
      id: `photo-${i}`,
      user_id: 'mock-user-123',
      url: `https://example.com/mock-progress-photo-${i}.jpg`,
      caption: i % 2 === 0 ? `Progress photo ${i + 1}` : undefined,
      date: date.toISOString().split('T')[0],
      created_at: date.toISOString()
    };
    
    photos.push(photo);
  }
  
  return photos;
};

/**
 * Generate data for current week's reflection
 */
export const generateCurrentWeekReflection = (): WeeklyReflection => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return {
    id: 'current-week-reflection',
    user_id: 'mock-user-123',
    week_start_date: startOfWeek.toISOString().split('T')[0],
    week_end_date: endOfWeek.toISOString().split('T')[0],
    planned_sessions: 5,
    completed_sessions: 3,
    total_volume: 6500,
    new_prs: 1,
    cardio_minutes: 90,
    avg_mood: 4,
    avg_sleep: 7.5,
    avg_soreness: 3,
    challenges: [
      { id: 'current-challenge-1', user_id: 'mock-user-123', text: 'Finding time for longer workouts', week_id: 'current-week-reflection' },
      { id: 'current-challenge-2', user_id: 'mock-user-123', text: 'Recovery from intense leg day', week_id: 'current-week-reflection' }
    ],
    wins: ["Hit a PR on bench press", "Maintained consistent cardio", "Improved squatting form"],
    next_week_focus: "Progressive overload on compound lifts",
    next_week_session_target: 5,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };
};

/**
 * Generate mock workout streak data
 */
export const generateMockStreak = () => {
  return {
    currentStreak: 4,
    longestStreak: 9,
    lastSevenDays: [true, true, true, true, false, false, true],
    streakChange: 2
  };
};
