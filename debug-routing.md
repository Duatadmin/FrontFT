# Routing Debug Guide

## Current Flow

1. **Login Page** → User logs in
2. **ProtectedRoute** checks:
   - If `isLoading` → Shows spinner
   - If `!isAuthenticated` → Redirects to `/login`
   - If `!onboardingComplete` → Redirects to `/welcome`
   - Otherwise → Shows protected content

3. **Welcome/Onboarding Flow**:
   - User completes questions
   - On preferences submission → API call
   - Shows "Generating..." screen
   - After 3 seconds → Navigate to `/` (chat)

## Potential Issues Fixed

1. **`updateOnboardingStatus` was setting `isLoading: true`** 
   - This caused the ProtectedRoute to show spinner
   - Fixed: Now only updates error state and onboardingComplete

2. **Auto-navigation timing**
   - Added proper conditions to useEffect
   - Set `isSubmitting` to false after successful API call

3. **Protected welcome route**
   - Welcome page now requires authentication
   - This ensures user state is available

## Debugging Steps

1. Check browser console for:
   - `[useUserStore]` logs
   - `[ProtectedRoute]` logs
   - `[PremiumWelcomeFlow]` logs

2. Check Network tab for:
   - Supabase auth calls
   - API onboarding submission
   - Database updates

3. Check Application/Storage for:
   - Supabase auth tokens
   - User store state

## Common Issues

1. **Stuck on loading**: Check if `isLoading` is stuck as true
2. **Login redirect loop**: Check `isAuthenticated` state
3. **Welcome redirect loop**: Check `onboardingComplete` state
4. **Can't navigate**: Check console for navigation errors