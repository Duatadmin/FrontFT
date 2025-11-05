import { ReactNode } from 'react';
import { 
  Activity, 
  Calendar, 
  BarChart3, 
  Target, 
  Users, 
  Brain, 
  Dumbbell,
  TrendingUp,
  Trophy,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { Badge } from '../ui/badge';

interface WelcomeSlide {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
  illustration?: ReactNode;
  additionalContent?: ReactNode;
}

export const welcomeSlides: WelcomeSlide[] = [
  {
    id: 'intro',
    title: 'Welcome to the Ultimate Workout AI Bot',
    description: 'Your AI-powered fitness companion that adapts to your goals and helps you achieve lasting results.',
    icon: <Sparkles className="w-12 h-12 text-accent-violet" />,
    additionalContent: (
      <div className="flex items-center justify-center gap-2">
        <Badge variant="outline" className="border-accent-violet/30 text-accent-violet">
          AI Powered
        </Badge>
        <Badge variant="outline" className="border-accent-green/30 text-accent-green">
          Personalized
        </Badge>
      </div>
    ),
  },
  {
    id: 'smart-recommendations',
    title: 'Daily Activity Recommendations',
    description: 'Get personalized workout suggestions based on your fitness level, goals, and daily schedule.',
    illustration: (
      <div className="space-y-3">
        <div className="bg-background-surface rounded-lg p-4 border border-border-light">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-accent-violet/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-accent-violet" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Morning Cardio</p>
              <p className="text-xs text-text-tertiary">30 min • Moderate intensity</p>
            </div>
          </div>
          <div className="flex gap-2">
            {['Mon', 'Wed', 'Fri'].map((day) => (
              <span key={day} className="text-xs px-2 py-1 rounded bg-accent-violet/10 text-accent-violet">
                {day}
              </span>
            ))}
          </div>
        </div>
        <div className="bg-background-surface rounded-lg p-4 border border-border-light">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center">
              <Dumbbell className="w-5 h-5 text-accent-green" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Strength Training</p>
              <p className="text-xs text-text-tertiary">45 min • Upper body focus</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'fitness-metrics',
    title: 'Fitness Metrics That Understand You',
    description: 'Track your progress with intelligent metrics that adapt to your fitness journey and provide meaningful insights.',
    illustration: (
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-background-surface rounded-lg p-4 border border-border-light">
          <BarChart3 className="w-6 h-6 text-accent-violet mb-2" />
          <p className="text-xs text-text-tertiary mb-1">Weekly Volume</p>
          <p className="text-lg font-bold text-white">12,850 lbs</p>
          <p className="text-xs text-accent-green">+8% from last week</p>
        </div>
        <div className="bg-background-surface rounded-lg p-4 border border-border-light">
          <TrendingUp className="w-6 h-6 text-accent-green mb-2" />
          <p className="text-xs text-text-tertiary mb-1">Consistency</p>
          <p className="text-lg font-bold text-white">92%</p>
          <p className="text-xs text-accent-violet">4 week streak</p>
        </div>
        <div className="bg-background-surface rounded-lg p-4 border border-border-light">
          <Target className="w-6 h-6 text-accent-pink mb-2" />
          <p className="text-xs text-text-tertiary mb-1">Goals Met</p>
          <p className="text-lg font-bold text-white">7/8</p>
          <p className="text-xs text-text-secondary">This month</p>
        </div>
        <div className="bg-background-surface rounded-lg p-4 border border-border-light">
          <Activity className="w-6 h-6 text-blue-400 mb-2" />
          <p className="text-xs text-text-tertiary mb-1">Active Days</p>
          <p className="text-lg font-bold text-white">5</p>
          <p className="text-xs text-text-secondary">This week</p>
        </div>
      </div>
    ),
  },
  {
    id: 'custom-plans',
    title: 'Meet Your Empowering Fitness Planner',
    description: 'Create custom workout plans that evolve with your progress and keep you motivated every step of the way.',
    illustration: (
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-accent-violet/20 to-accent-violet/10 rounded-lg p-4 border border-accent-violet/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Strength & Conditioning</h3>
            <Badge className="bg-accent-violet/20 text-accent-violet border-0">Active</Badge>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div
                key={i}
                className={cn(
                  'aspect-square rounded flex items-center justify-center text-xs font-medium',
                  [0, 2, 4].includes(i)
                    ? 'bg-accent-violet text-black'
                    : 'bg-white/5 text-text-tertiary'
                )}
              >
                {day}
              </div>
            ))}
          </div>
          <p className="text-xs text-text-secondary mt-3">3 workouts per week • 12 week program</p>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-2 px-3 rounded-lg bg-background-surface border border-border-light text-sm text-white hover:bg-white/5 transition-colors">
            Browse Templates
          </button>
          <button className="flex-1 py-2 px-3 rounded-lg bg-accent-violet text-black text-sm font-medium hover:bg-accent-violet/90 transition-colors">
            Create Custom
          </button>
        </div>
      </div>
    ),
  },
  {
    id: 'perfect-fitness',
    title: 'Find Your Perfect Fitness Journey',
    description: 'Whether you\'re a beginner or advanced athlete, our AI adapts to your level and helps you progress safely.',
    illustration: (
      <div className="space-y-4">
        <div className="flex justify-center gap-3">
          {[
            { level: 'Beginner', color: 'bg-accent-green/20 text-accent-green' },
            { level: 'Intermediate', color: 'bg-accent-violet/20 text-accent-violet' },
            { level: 'Advanced', color: 'bg-accent-pink/20 text-accent-pink' },
          ].map((item) => (
            <div
              key={item.level}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium',
                item.color
              )}
            >
              {item.level}
            </div>
          ))}
        </div>
        <div className="bg-background-surface rounded-lg p-4 border border-border-light">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-accent-violet" />
              <p className="text-sm text-white">AI analyzes your form and progress</p>
            </div>
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-accent-green" />
              <p className="text-sm text-white">Personalized difficulty adjustments</p>
            </div>
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-accent-pink" />
              <p className="text-sm text-white">Achievement milestones & rewards</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'workout-styles',
    title: 'Browse Myriad of Workout Lifestyles',
    description: 'From strength training to yoga, HIIT to pilates - find the perfect workout style that matches your preferences.',
    illustration: (
      <div className="grid grid-cols-3 gap-2">
        {[
          { name: 'Strength', icon: <Dumbbell className="w-6 h-6" />, color: 'text-accent-violet' },
          { name: 'Cardio', icon: <Activity className="w-6 h-6" />, color: 'text-accent-green' },
          { name: 'Yoga', icon: <Users className="w-6 h-6" />, color: 'text-accent-pink' },
          { name: 'HIIT', icon: <TrendingUp className="w-6 h-6" />, color: 'text-blue-400' },
          { name: 'Pilates', icon: <Target className="w-6 h-6" />, color: 'text-purple-400' },
          { name: 'CrossFit', icon: <Trophy className="w-6 h-6" />, color: 'text-orange-400' },
        ].map((style) => (
          <div
            key={style.name}
            className="aspect-square bg-background-surface rounded-lg border border-border-light flex flex-col items-center justify-center gap-2 hover:border-white/20 transition-colors cursor-pointer"
          >
            <div className={style.color}>{style.icon}</div>
            <p className="text-xs text-white font-medium">{style.name}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'nutrition-meal',
    title: 'Nutrition & Meal Recommendation For You',
    description: 'Get personalized meal plans and nutrition advice that complement your workout routine and fitness goals.',
    illustration: (
      <div className="space-y-3">
        <div className="bg-background-surface rounded-lg p-4 border border-border-light">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-white">Today\'s Macros</h4>
            <span className="text-xs text-text-tertiary">2,200 cal target</span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent-violet"></div>
              <span className="text-xs text-text-secondary flex-1">Protein</span>
              <span className="text-xs font-medium text-white">165g</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent-green"></div>
              <span className="text-xs text-text-secondary flex-1">Carbs</span>
              <span className="text-xs font-medium text-white">220g</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent-pink"></div>
              <span className="text-xs text-text-secondary flex-1">Fats</span>
              <span className="text-xs font-medium text-white">73g</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-500/10 rounded-lg p-3 border border-orange-500/30">
            <p className="text-xs font-medium text-white mb-1">Pre-Workout</p>
            <p className="text-xs text-text-secondary">Banana & Oats</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-500/10 rounded-lg p-3 border border-blue-500/30">
            <p className="text-xs font-medium text-white mb-1">Post-Workout</p>
            <p className="text-xs text-text-secondary">Protein Shake</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'track-analyze',
    title: 'Track & Analyze Your Daily Vitality',
    description: 'Monitor your energy levels, sleep quality, and recovery to optimize your training schedule.',
    illustration: (
      <div className="space-y-3">
        <div className="bg-background-surface rounded-lg p-4 border border-border-light">
          <h4 className="font-medium text-white mb-3">Vitality Score</h4>
          <div className="relative h-32 flex items-end justify-between gap-1">
            {[65, 78, 82, 71, 88, 92, 85].map((value, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-accent-violet/30 rounded-t"
                  style={{ height: `${value}%` }}
                >
                  <div 
                    className="w-full bg-accent-violet rounded-t transition-all duration-300"
                    style={{ height: '100%' }}
                  />
                </div>
                <span className="text-xs text-text-tertiary">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-background-surface rounded-lg p-3 border border-border-light">
            <p className="text-2xl font-bold text-accent-green">7.5h</p>
            <p className="text-xs text-text-tertiary">Avg Sleep</p>
          </div>
          <div className="bg-background-surface rounded-lg p-3 border border-border-light">
            <p className="text-2xl font-bold text-accent-violet">85%</p>
            <p className="text-xs text-text-tertiary">Recovery</p>
          </div>
          <div className="bg-background-surface rounded-lg p-3 border border-border-light">
            <p className="text-2xl font-bold text-accent-pink">High</p>
            <p className="text-xs text-text-tertiary">Energy</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'explore-exercises',
    title: 'Explore Fitness Exercises & Resources',
    description: 'Access a comprehensive library of exercises with detailed instructions, form tips, and video demonstrations.',
    illustration: (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'Bench Press', muscle: 'Chest', difficulty: 'Intermediate' },
            { name: 'Deadlift', muscle: 'Back', difficulty: 'Advanced' },
            { name: 'Squats', muscle: 'Legs', difficulty: 'Beginner' },
            { name: 'Pull-ups', muscle: 'Back', difficulty: 'Intermediate' },
          ].map((exercise) => (
            <div
              key={exercise.name}
              className="bg-background-surface rounded-lg p-3 border border-border-light hover:border-white/20 transition-colors cursor-pointer"
            >
              <h5 className="text-sm font-medium text-white mb-1">{exercise.name}</h5>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-tertiary">{exercise.muscle}</span>
                <Badge variant="outline" className="text-xs py-0 h-5">
                  {exercise.difficulty}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gradient-to-r from-accent-violet/20 to-accent-violet/10 rounded-lg p-4 border border-accent-violet/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-accent-violet/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-accent-violet" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">1,000+ Exercises</p>
              <p className="text-xs text-text-secondary">With form videos & tips</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'achievements',
    title: 'Unlock Achievements & Earn Fitness Challenges',
    description: 'Stay motivated with gamified fitness challenges, achievement badges, and milestone rewards.',
    illustration: (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-3">
          {[
            { name: 'First Workout', icon: '🏃', unlocked: true },
            { name: '7 Day Streak', icon: '🔥', unlocked: true },
            { name: 'Heavy Lifter', icon: '💪', unlocked: true },
            { name: 'Marathon', icon: '🏅', unlocked: false },
            { name: 'Perfect Month', icon: '⭐', unlocked: false },
            { name: 'Elite Athlete', icon: '🏆', unlocked: false },
          ].map((achievement) => (
            <div
              key={achievement.name}
              className={cn(
                'aspect-square rounded-lg flex flex-col items-center justify-center gap-1 p-2 transition-all',
                achievement.unlocked
                  ? 'bg-gradient-to-br from-accent-violet/30 to-accent-violet/10 border border-accent-violet/30'
                  : 'bg-background-surface border border-border-light opacity-50'
              )}
            >
              <span className="text-2xl">{achievement.icon}</span>
              <p className="text-xs text-center text-white leading-tight">{achievement.name}</p>
            </div>
          ))}
        </div>
        <div className="bg-background-surface rounded-lg p-4 border border-border-light">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-white">Current Challenge</p>
            <Badge className="bg-accent-green/20 text-accent-green border-0">Active</Badge>
          </div>
          <p className="text-xs text-text-secondary mb-3">Complete 20 workouts this month</p>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-accent-green h-2 rounded-full transition-all duration-300" style={{ width: '65%' }} />
          </div>
          <p className="text-xs text-text-tertiary mt-2">13/20 completed</p>
        </div>
      </div>
    ),
  },
  {
    id: 'get-started',
    title: 'Ready to Transform Your Fitness Journey?',
    description: 'Join thousands of users who have already transformed their lives with our AI-powered fitness companion.',
    icon: <MessageSquare className="w-12 h-12 text-accent-violet" />,
    additionalContent: (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">50K+</p>
            <p className="text-xs text-text-tertiary">Active Users</p>
          </div>
          <div className="w-px h-8 bg-border-light" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">4.9★</p>
            <p className="text-xs text-text-tertiary">App Rating</p>
          </div>
          <div className="w-px h-8 bg-border-light" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">1M+</p>
            <p className="text-xs text-text-tertiary">Workouts</p>
          </div>
        </div>
        <p className="text-sm text-center text-text-secondary">
          Start your free trial today and experience the future of fitness
        </p>
      </div>
    ),
  },
];

// Helper function for className concatenation (if not already imported)
function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(' ');
}