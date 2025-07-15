# Onboarding API Integration

## Overview

The onboarding flow has been updated to use the new `/api/v1/onboarding/submit` endpoint. The flow now automatically submits data after the last question and navigates to the chat page where the generated plan will appear through the chat message pipeline.

## Changes Made

### 1. API Service Update (`src/services/apiService.ts`)

Added:
- `OnboardingData` interface matching the API requirements
- `OnboardingSubmitRequest` and `OnboardingSubmitResponse` interfaces
- `submitOnboarding()` function to handle the API call

### 2. PremiumWelcomeFlow Component (`src/components/welcome/PremiumWelcomeFlow.tsx`)

Updated:
- Imported `submitOnboarding` from apiService and `toast` for notifications
- Added `isSubmitting` state for loading indication
- Created `submitOnboardingData()` function that:
  - Transforms frontend data format to match API expectations
  - Submits to API endpoint after the last question (preferences)
  - Saves to Supabase as backup
  - Shows success/error messages via toast
- Modified flow:
  - Submission happens automatically after the preferences question
  - Shows "Generating..." screen for 3 seconds
  - Auto-navigates to chat page where the plan will appear
- Added loading states:
  - Visual indicator shows "Submitting..." during API call
  - Button hidden on complete screen (auto-navigation)

## Data Transformations

The frontend collects data in a slightly different format than the API expects. Key transformations:

1. **Goal**: Frontend uses short codes (muscle, strength, etc.) → API expects full names ("Build Muscle", "Get Stronger", etc.)
2. **Preferred Days**: Frontend uses lowercase full names → API expects 3-letter abbreviations ("Mon", "Tue", etc.)
3. **Equipment**: Frontend uses underscores → API expects spaces ("pull_up_bar" → "pull-up bar")
4. **Baseline Capacity**: Frontend stores as string → API expects object with numeric values

## Testing

Use the test script to verify the integration:

```bash
node test-onboarding-integration.mjs
```

This will send a sample request to the API and display the response.

## User Flow

1. User completes all onboarding questions
2. On the preferences question submission:
   - Data is immediately sent to the API endpoint
   - User sees "Submitting..." message
3. API responds with success
4. "Generating..." screen appears for 3 seconds
5. Auto-navigation to chat page
6. Generated plan appears in chat via message pipeline

## Error Handling

- API errors are caught and displayed to the user via toast notifications
- On error, user stays on the preferences screen to retry
- Supabase save acts as a backup for user profile data

## Next Steps

1. Test with the actual backend API
2. Monitor for any data format mismatches
3. Consider adding retry logic for network failures
4. Add analytics to track onboarding completion rates