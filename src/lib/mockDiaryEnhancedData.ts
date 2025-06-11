import { 
  FitnessGoal,
  Goal, 
  WeeklyReflection, 
  ProgressPhoto,
  Challenge,
  Reflection
} from '../store/diaryTypes';

/**
 * Mock data generators for the enhanced diary features
 */

// Generate mock goals for new Goal type
export const generateMockGoals = (userId: string = 'user-1', count = 5): Goal[] => {
  const goals: Goal[] = [];
  
  const goalTemplates = [
    {
      title: 'Bench Press 225 lbs',
      description: 'Achieve a 225 lb bench press for 5 reps',
      type: 'short_term' as const,
      progress: 80,
    },
    {
      title: 'Run 10K',
      description: 'Complete a 10K run in under 50 minutes',
      type: 'short_term' as const,
      progress: 65,
    },
    {
      title: 'Learn to do a handstand',
      description: 'Hold a freestanding handstand for 30 seconds',
      type: 'long_term' as const,
      progress: 40,
    },
    {
      title: 'Complete 100 workouts this year',
      description: 'Build consistency through the year',
      type: 'long_term' as const,
      progress: 32,
    },
    {
      title: 'Improve flexibility',
      description: 'Touch toes without bending knees',
      type: 'short_term' as const,
      progress: 50,
    },
    {
      title: 'Add 50lbs to deadlift',
      description: 'Increase deadlift from 275 to 325',
      type: 'long_term' as const, 
      progress: 60,
    },
    {
      title: 'Master the muscle up',
      description: 'Perform 3 consecutive muscle ups',
      type: 'long_term' as const,
      progress: 25,
    }
  ];
  
  // Use a counter to ensure we don't exceed templateCount
  let templateCounter = 0;
  
  for (let i = 0; i < count; i++) {
    // Reset the counter if we exceed templates length
    if (templateCounter >= goalTemplates.length) {
      templateCounter = 0;
    }
    
    const template = goalTemplates[templateCounter];
    templateCounter++;
    
    // Generate a date between 2 weeks ago and 6 months from now
    const randomOffset = Math.floor(Math.random() * 180) - 14; 
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + randomOffset);
    
    // Randomly set some goals as completed
    const completed = Math.random() > 0.7;
    
    goals.push({
      id: `goal-${i + 1}`,
      user_id: userId,
      title: template.title,
      description: template.description,
      target_date: targetDate.toISOString().split('T')[0],
      type: template.type,
      progress: completed ? 100 : template.progress,
      created_at: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
      completed
    });
  }
  
  return goals;
};

// Original generateMockGoals for FitnessGoal type (for backward compatibility)
export const generateMockFitnessGoals = (userId: string = 'user-1', count = 5): FitnessGoal[] => {
  const goals: FitnessGoal[] = [];
  
  const goalTemplates = [
    {
      title: 'Bench Press 225 lbs',
      description: 'Achieve a 225 lb bench press for 5 reps',
      target_value: 225,
      current_value: 205,
      unit: 'lbs',
      category: 'strength' as const,
    },
    {
      title: 'Run 10K',
      description: 'Complete a 10K run in under 50 minutes',
      target_value: 50,
      current_value: 55,
      unit: 'minutes',
      category: 'endurance' as const,
    },
    {
      title: 'Reduce Body Fat',
      description: 'Reduce body fat to 15%',
      target_value: 15,
      current_value: 18,
      unit: '%',
      category: 'weight' as const,
    },
    {
      title: 'Deadlift 315 lbs',
      description: 'Deadlift 315 lbs for 3 reps',
      target_value: 315,
      current_value: 285,
      unit: 'lbs',
      category: 'strength' as const,
    },
    {
      title: 'Train 5 Days/Week',
      description: 'Consistently hit the gym 5 days per week',
      target_value: 5,
      current_value: 3,
      unit: 'sessions/week',
      category: 'habit' as const,
    },
    {
      title: 'Squat 275 lbs',
      description: 'Squat 275 lbs for 5 reps',
      target_value: 275,
      current_value: 245,
      unit: 'lbs',
      category: 'strength' as const,
    },
    {
      title: 'Do 20 Pull-ups',
      description: 'Complete 20 consecutive pull-ups',
      target_value: 20,
      current_value: 12,
      unit: 'reps',
      category: 'strength' as const,
    },
    {
      title: 'Increase Mobility',
      description: 'Touch toes without bending knees',
      target_value: 100,
      current_value: 60,
      unit: '%',
      category: 'other' as const,
    }
  ];

  // Get random goals from templates
  const selectedTemplates = [...goalTemplates]
    .sort(() => 0.5 - Math.random())
    .slice(0, count);
  
  // Create goals with different deadlines and completion statuses
  const now = new Date();
  
  for (let i = 0; i < selectedTemplates.length; i++) {
    const template = selectedTemplates[i];
    const targetDate = new Date();
    
    // Random future date (1-90 days from now)
    targetDate.setDate(targetDate.getDate() + Math.floor(Math.random() * 90) + 1);
    
    // Randomly mark some goals as completed
    const completed = Math.random() > 0.7;
    
    goals.push({
      id: `goal-${i}`,
      user_id: userId,
      title: template.title,
      description: template.description,
      target_value: template.target_value,
      current_value: completed ? template.target_value : template.current_value,
      unit: template.unit,
      category: template.category,
      target_date: targetDate.toISOString(),
      created_at: new Date(now.getTime() - (Math.random() * 90 * 24 * 60 * 60 * 1000)).toISOString(),
      completed
    });
  }
  
  return goals;
};

// Generate mock weekly reflections
export const generateMockWeeklyReflections = (userId: string = 'user-1', count = 8): WeeklyReflection[] => {
  const reflections: WeeklyReflection[] = [];
  
  // Start from 8 weeks ago
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (7 * count));
  
  for (let i = 0; i < count; i++) {
    // Calculate week dates
    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + (i * 7));
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    // Random values for metrics
    const plannedSessions = 4 + Math.floor(Math.random() * 2); // 4-5
    const completedSessions = Math.floor(Math.random() * (plannedSessions + 1)); // 0-plannedSessions
    
    // More metrics
    const newPrs = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;
    const totalVolume = 10000 + Math.floor(Math.random() * 5000);
    const cardioMinutes = Math.floor(Math.random() * 120);
    
    // Feelings metrics (1-5 scale)
    const avgMood = 3 + Math.random() * 2;
    const avgSleep = 2.5 + Math.random() * 2.5;
    const avgSoreness = 1 + Math.random() * 4;
    
    // Text feedback
    const challengeOptions = [
      'Time management',
      'Low energy levels',
      'Shoulder pain during overhead press',
      'Inconsistent sleep affecting recovery',
      'Work stress impacting focus',
      'Scheduling conflicts',
      'Nutrition issues - not enough protein',
      'Gym too crowded during peak hours'
    ];
    
    const winOptions = [
      'Hit a new PR on deadlift',
      'Consistent with post-workout stretching',
      'Improved squat form',
      'Better sleep quality',
      'Meal prep for the whole week',
      'Completed all planned workouts',
      'Improved cardio endurance',
      'Reduced rest times between sets'
    ];
    
    // Randomly select challenges and wins
    [...challengeOptions]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);
    
    const wins = [...winOptions]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);
    
    // Next week focus
    const focusOptions = [
      'Focus on improving squat depth',
      'Increase cardio frequency',
      'Aim for better sleep hygiene',
      'Improve nutrition timing around workouts',
      'Add more mobility work',
      'Try a new workout split',
      'Increase overall volume',
      'Work on mind-muscle connection'
    ];
    
    const nextWeekFocus = focusOptions[Math.floor(Math.random() * focusOptions.length)];
    
    // Create reflection
    reflections.push({
      id: `reflection-${i}`,
      user_id: userId,
      week_start_date: weekStart.toISOString(),
      week_end_date: weekEnd.toISOString(),
      planned_sessions: plannedSessions,
      completed_sessions: completedSessions,
      total_volume: totalVolume,
      new_prs: newPrs,
      cardio_minutes: cardioMinutes,
      avg_mood: avgMood,
      avg_sleep: avgSleep,
      avg_soreness: avgSoreness,
      challenges: generateMockChallenges(userId, `week-${i+1}`),
      wins,
      next_week_focus: nextWeekFocus,
      created_at: weekEnd.toISOString(),
      updated_at: weekEnd.toISOString(),
      next_week_session_target: 4
    });
  }
  
  return reflections.sort((a, b) => 
    new Date(b.week_start_date).getTime() - new Date(a.week_start_date).getTime()
  );
};

// Generate current week reflection
export const generateCurrentWeekReflection = (userId: string = 'user-1'): WeeklyReflection => {
  // Calculate current week dates
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate week start (previous Sunday)
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);
  
  // Calculate week end (next Saturday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  
  // For current week, base metrics on progress so far
  const plannedSessions = 5;
  const daysElapsed = dayOfWeek;
  
  // Estimate values based on partial week
  const completedSessions = Math.min(Math.floor(Math.random() * (daysElapsed + 1)), plannedSessions);
  const totalVolume = Math.floor(Math.random() * 1000) * completedSessions;
  const newPrs = Math.random() > 0.8 ? 1 : 0;
  const cardioMinutes = Math.floor(Math.random() * 30) * completedSessions;
  
  return {
    id: 'current-week',
    user_id: userId,
    week_start_date: weekStart.toISOString(),
    week_end_date: weekEnd.toISOString(),
    planned_sessions: plannedSessions,
    completed_sessions: completedSessions,
    total_volume: totalVolume,
    new_prs: newPrs,
    cardio_minutes: cardioMinutes,
    avg_mood: 3.5 + Math.random(),
    avg_sleep: 3 + Math.random() * 2,
    avg_soreness: 2 + Math.random() * 2,
    challenges: [],
    wins: [],
    next_week_focus: '',
    created_at: now.toISOString(),
    updated_at: new Date().toISOString(),
    next_week_session_target: 4
  };
};

// Generate mock progress photos
export const generateMockProgressPhotos = (userId: string = 'user-1', count = 6): ProgressPhoto[] => {
  const photos: ProgressPhoto[] = [];
  
  // Photo URLs (placeholder images)
  const photoUrls = [
    'https://placehold.co/400x600/333/white?text=Progress+Photo+1',
    'https://placehold.co/400x600/333/white?text=Progress+Photo+2',
    'https://placehold.co/400x600/333/white?text=Progress+Photo+3',
    'https://placehold.co/400x600/333/white?text=Progress+Photo+4',
    'https://placehold.co/400x600/333/white?text=Progress+Photo+5',
    'https://placehold.co/400x600/333/white?text=Progress+Photo+6',
    'https://placehold.co/400x600/333/white?text=Progress+Photo+7',
    'https://placehold.co/400x600/333/white?text=Progress+Photo+8'
  ];
  
  // Caption options
  [
    'Week 4 progress - seeing definition in shoulders',
    'Starting to see abs definition',
    '12 weeks in - arms showing improvement',
    'Month 3 checkpoint - overall more muscle tone',
    'Noticing more vascularity',
    'Back development progress',
    'Leg day is paying off!',
    '16 weeks transformation'
  ];
  
  // Create photos every 4 weeks starting from most recent
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const photoDate = new Date(now);
    // Each photo is 4 weeks apart
    photoDate.setDate(photoDate.getDate() - (i * 28));
    
    const photoUrl = photoUrls[i % photoUrls.length];
    photos.push({
      id: `photo-${i}`,
      user_id: userId,
      url: photoUrl,
      caption: `Progress photo ${i + 1}`,
      description: i % 2 === 0 ? `Week ${Math.floor(i/2) + 8} of training program` : undefined,
      date: photoDate.toISOString()
    });
  }
  
  return photos.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
};

// Generate mock reflection entries
export const generateMockReflections = (userId: string = 'user-1'): Reflection[] => {
  return [
    {
      id: 'reflection-1',
      user_id: userId,
      text: 'Really happy with my progress this month. Feeling stronger in all my lifts and recovery time has improved.',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'reflection-2',
      user_id: userId,
      text: 'Had a challenging week. Struggled with motivation but pushed through. Need to focus on better sleep habits.',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'reflection-3',
      user_id: userId,
      text: 'Hit a new PR on squat today! 225lbs x 5 reps. Technique improvements are really paying off.',
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

// Generate mock challenges
export const generateMockChallenges = (userId: string = 'user-1', weekId: string = 'week-current'): Challenge[] => {
  return [
    {
      id: 'challenge-1',
      user_id: userId,
      text: 'Wrist pain during push movements',
      solution: 'Working on better stretching routine and wrist mobility',
      week_id: weekId
    },
    {
      id: 'challenge-2',
      user_id: userId,
      text: 'Struggling with nutrition on weekends',
      solution: 'Preparing meals in advance on Friday',
      week_id: weekId
    },
    {
      id: 'challenge-3',
      user_id: userId,
      text: 'Lack of energy for evening workouts',
      solution: null,
      week_id: weekId
    }
  ];
};

// Calculate mock streak data
export const calculateMockStreak = (sessions: any[] = []): { currentStreak: number; longestStreak: number; lastSevenDays: boolean[]; streakChange: number } => {
  if (!sessions.length) return { currentStreak: 0, longestStreak: 0, lastSevenDays: [], streakChange: 0 };
  
  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Get today's date with time set to beginning of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentStreak = 0;
  let currentDate = new Date(today);
  
  // Check if there's a session today to start the streak
  const todaySession = sortedSessions.find(session => {
    const sessionDate = new Date(session.timestamp);
    sessionDate.setHours(0, 0, 0, 0);
    return sessionDate.getTime() === today.getTime();
  });
  
  // If no session today, start checking from yesterday
  if (!todaySession) {
    currentDate.setDate(currentDate.getDate() - 1);
  } else {
    currentStreak = 1;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  // Check consecutive days backwards
  while (true) {
    const sessionOnDate = sortedSessions.find(session => {
      const sessionDate = new Date(session.timestamp);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === currentDate.getTime();
    });
    
    if (!sessionOnDate) break;
    
    currentStreak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }
  
  return currentStreak;
};
