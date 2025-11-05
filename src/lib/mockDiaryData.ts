import { WorkoutSession, TrainingPlan } from './supabase';

/**
 * MOCK DATA FOR DEVELOPMENT
 * This file provides mock data for the Training Diary feature.
 * In production, this would be replaced with actual data from Supabase.
 */

// Exercise names for generating mock data
const EXERCISES = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Overhead Press',
  'Barbell Row',
  'Pull-up',
  'Push-up',
  'Dumbbell Curl',
  'Tricep Extension',
  'Lateral Raise',
  'Face Pull',
  'Romanian Deadlift',
  'Leg Press',
  'Calf Raise',
  'Plank',
  'Russian Twist',
  'Leg Raise',
  'Box Jump',
  'Lunge',
  'Hip Thrust'
];

// Workout names for generating mock data
const WORKOUT_NAMES = [
  'Push Day',
  'Pull Day',
  'Leg Day',
  'Upper Body',
  'Lower Body',
  'Full Body',
  'Core Strength',
  'Power Training',
  'Hypertrophy',
  'Endurance'
];

// Generate a random number of exercises (3-8)
const generateRandomExercises = () => {
  const count = 3 + Math.floor(Math.random() * 6);
  const shuffled = [...EXERCISES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Generate mock workout sessions
export const generateMockSessions = (count: number = 30): WorkoutSession[] => {
  const sessions: WorkoutSession[] = [];
  
  // Start date: 60 days ago
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 60);
  
  for (let i = 0; i < count; i++) {
    // Random date between start date and today
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(Math.random() * 60));
    
    // Random exercises
    const exercises = generateRandomExercises();
    
    // Random sets and reps
    const sets = 3 + Math.floor(Math.random() * 5);
    const repsPerSet = 6 + Math.floor(Math.random() * 10);
    
    sessions.push({
      id: `session-${i}`,
      user_id: 'mock-user-id',
      training_plan_id: 'mock-plan-id',
      timestamp: date.toISOString(),
      duration_minutes: 30 + Math.floor(Math.random() * 60),
      exercises_completed: exercises,
      total_sets: sets,
      total_reps: sets * repsPerSet,
      overall_difficulty: 1 + Math.floor(Math.random() * 5),
      user_feedback: Math.random() > 0.5 
        ? 'Felt strong today. Increased weight on all exercises.' 
        : Math.random() > 0.5 
          ? 'Tough workout but pushed through. Need to work on form for squats.'
          : ''
    });
  }
  
  // Sort by date, newest first
  return sessions.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
};

// Generate a mock training plan
export const generateMockTrainingPlan = (): TrainingPlan => {
  // Get today's day of the week
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  // Create the training plan with today's workout
  return {
    id: 'mock-plan-id',
    user_id: 'mock-user-id',
    name: '5-Day Split Program',
    days: {
      monday: {
        name: 'Push Day',
        description: 'Focus on chest, shoulders, and triceps',
        exercises: ['Bench Press', 'Overhead Press', 'Incline Dumbbell Press', 'Tricep Extension', 'Lateral Raise'],
        duration_minutes: 60,
      },
      tuesday: {
        name: 'Pull Day',
        description: 'Focus on back and biceps',
        exercises: ['Deadlift', 'Barbell Row', 'Pull-up', 'Dumbbell Curl', 'Face Pull'],
        duration_minutes: 60,
      },
      wednesday: {
        name: 'Rest Day',
        description: 'Active recovery with light mobility work',
        exercises: ['Stretching', 'Foam Rolling'],
        duration_minutes: 30,
      },
      thursday: {
        name: 'Leg Day',
        description: 'Full lower body workout',
        exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Calf Raise', 'Lunge'],
        duration_minutes: 60,
      },
      friday: {
        name: 'Upper Body',
        description: 'Full upper body workout',
        exercises: ['Bench Press', 'Barbell Row', 'Overhead Press', 'Pull-up', 'Dumbbell Curl', 'Tricep Extension'],
        duration_minutes: 70,
      },
      saturday: {
        name: 'Core & Cardio',
        description: 'Core strength and conditioning',
        exercises: ['Plank', 'Russian Twist', 'Leg Raise', 'Box Jump', 'Jump Rope'],
        duration_minutes: 45,
      },
      sunday: {
        name: 'Rest Day',
        description: 'Complete rest and recovery',
        exercises: [],
        duration_minutes: 0,
      },
      // Add today's workout for development
      [today]: {
        name: WORKOUT_NAMES[Math.floor(Math.random() * WORKOUT_NAMES.length)],
        description: 'Today\'s workout based on your 5-day split program',
        exercises: generateRandomExercises(),
        duration_minutes: 45 + Math.floor(Math.random() * 30),
      }
    }
  };
};
