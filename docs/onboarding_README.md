# Onboarding Flow Documentation

## Overview

The onboarding flow is a comprehensive user journey designed to collect essential fitness and personal information from new users. This data is used to create personalized workout plans and provide tailored fitness coaching through our AI-powered platform.

## Architecture

### Components Structure

```
src/
├── components/
│   ├── welcome/
│   │   ├── PremiumWelcomeFlow.tsx    # Main onboarding component (currently active)
│   │   ├── ModernWelcomeFlow.tsx     # Alternative welcome flow
│   │   └── ConversationalOnboarding.tsx # Chat-style onboarding (alternative)
│   └── onboarding/
│       └── ConversationalOnboarding.tsx # Conversational onboarding component
```

### Routing

The onboarding flow is accessible through two routes:
- `/welcome` - Uses `PremiumWelcomeFlow` component (primary flow)
- `/onboarding` - Uses `ConversationalOnboarding` component (requires authentication)

## Onboarding Questions

The onboarding flow collects 18 pieces of information in the following order:

### 1. Goal (`goal`)
- **Type**: Select
- **Question**: "What brings you here today?"
- **Options**: 
  - Build Muscle
  - Get Stronger
  - Lose Weight
  - Improve Endurance
  - Stay Healthy

### 2. Goal Detail (`goal_detail`)
- **Type**: Text
- **Question**: "Any specific areas to focus on?"
- **Placeholder**: "E.g., bigger arms, stronger core, better stamina"

### 3. Goal Timeline (`goal_timeline_weeks`)
- **Type**: Select
- **Question**: "When do you want to see results?"
- **Options**:
  - 4 weeks - Quick wins
  - 8 weeks - Solid progress
  - 12 weeks - Major transformation
  - 6 months - Complete overhaul
  - No rush - Sustainable lifestyle
- **Note**: Values are stored as integers (4, 8, 12, 24, 0)

### 4. Experience Level (`level`)
- **Type**: Select
- **Question**: "How would you describe your fitness journey?"
- **Options**:
  - beginner - "I'm just starting out"
  - intermediate - "I've been training for a while"
  - advanced - "I'm very experienced"

### 5. Age (`age`)
- **Type**: Number
- **Question**: "What's your age?"
- **Range**: 16-100

### 6. Sex (`sex`)
- **Type**: Select
- **Question**: "What's your biological sex?"
- **Options**: Male, Female

### 7. Height (`height_cm`)
- **Type**: Slider
- **Question**: "What's your height?"
- **Range**: 140-220 cm

### 8. Weight (`weight_kg`)
- **Type**: Slider
- **Question**: "What's your current weight?"
- **Range**: 40-150 kg

### 9. Available Days (`available_days_per_week`)
- **Type**: Slider
- **Question**: "How many days can you realistically train per week?"
- **Range**: 2-7 days

### 10. Preferred Days (`preferred_days`)
- **Type**: Multiselect
- **Question**: "Which days work best for you?"
- **Options**: Monday through Sunday
- **Note**: Stored as array of strings

### 11. Session Duration (`session_duration_minutes`)
- **Type**: Select
- **Question**: "How long can your typical workouts be?"
- **Options**: 30, 45, 60, 90+ minutes

### 12. Split Preference (`split_preference`)
- **Type**: Select
- **Question**: "What training style appeals to you?"
- **Options**:
  - full_body - Full Body
  - upper_lower - Upper/Lower Split
  - push_pull_legs - Push/Pull/Legs
  - body_part - Body Part Split
  - no_preference - No preference

### 13. Location (`location`)
- **Type**: Select
- **Question**: "Where will you be training?"
- **Options**: gym, home, both

### 14. Equipment (`equipment`)
- **Type**: Multiselect
- **Question**: "What equipment do you have?"
- **Options**: Dumbbells, Barbell, Pull-up Bar, Resistance Bands, Kettlebells, Gym Machines, None
- **Note**: Stored as array of strings

### 15. Injuries (`injuries`)
- **Type**: Text
- **Question**: "Any injuries or limitations?"
- **Placeholder**: "E.g., bad knee, lower back pain, or none"

### 16. Sleep Hours (`sleep_hours_normalized`)
- **Type**: Slider
- **Question**: "How many hours do you sleep per night?"
- **Range**: 4-10 hours (0.5 increments)

### 17. Baseline Capacity (`baseline_capacity`)
- **Type**: Strength (custom interactive component)
- **Question**: "Your current strength levels?"
- **Components**:
  - Push-ups slider (0-50 reps)
  - Bodyweight Squats slider (0-50 reps)
  - Plank Hold slider (0-180 seconds)
- **Note**: Stored as string format: "X pushups, Y squats, Z sec plank"

### 18. Preferences (`preferences`)
- **Type**: Text
- **Question**: "Exercise preferences?"
- **Placeholder**: "E.g., Love deadlifts, hate burpees"

## Technical Implementation

### Component Features

#### PremiumWelcomeFlow
- **Welcome Screens**: 4 introductory screens before onboarding questions
- **Progress Tracking**: Visual progress bar and dot indicators
- **Animations**: Smooth transitions between screens using Framer Motion
- **Mobile Optimized**: Responsive design with touch gestures
- **Skip Functionality**: Users can skip to onboarding questions

#### Input Types

1. **Select**: Single choice options with icons
2. **Multiselect**: Multiple choice with checkboxes
3. **Slider**: Range input with visual feedback
4. **Text/Number**: Standard input fields
5. **Strength**: Custom component with individual sliders for exercises

### Data Flow

1. **State Management**:
   ```typescript
   const [onboardingData, setOnboardingData] = useState<Record<string, any>>({});
   const [strengthValues, setStrengthValues] = useState<Record<string, number>>({
     pushups: 0,
     squats: 0,
     plank: 0
   });
   ```

2. **Data Processing**:
   - Numeric conversions for `goal_timeline_weeks`
   - Array handling for multiselect questions
   - String formatting for `baseline_capacity`

3. **Data Persistence**:
   ```typescript
   await supabase
     .from('user_profiles')
     .upsert({
       user_id: user.id,
       ...onboardingData,
       onboarding_completed_at: new Date().toISOString()
     });
   ```

### UI/UX Features

- **Auto-advance**: Select options automatically proceed after selection
- **Validation**: Disabled continue buttons for empty required fields
- **Visual Feedback**: Hover states, active states, and transitions
- **Encouraging Copy**: Supportive messaging throughout
- **Progress Indicators**: Visual progress bar and dot navigation

## Backend Integration

The onboarding data is saved to the `user_profiles` table in Supabase with the following structure:
- All field names match the backend expectations exactly
- Timestamps are ISO formatted
- Arrays are properly formatted for PostgreSQL
- Numeric values are stored as numbers, not strings

## Future Enhancements

1. **Progressive Disclosure**: Show advanced questions based on experience level
2. **Smart Defaults**: Pre-fill common values based on demographics
3. **Validation**: Add more robust input validation
4. **Analytics**: Track drop-off points in the onboarding flow
5. **A/B Testing**: Test different question orders and UI variations