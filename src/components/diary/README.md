# Training Diary Feature

## Overview
The Training Diary feature provides users with a comprehensive view of their ongoing training plan and historical workout data. It allows users to quickly reference today's workout session, analyze past workout data, and filter their workout history by various criteria.

## Components

### 1. CurrentPlanCard
Displays the current training plan for today, including workout name, description, duration, and exercise count.

### 2. FiltersBar
Provides filtering options for workout history:
- Date range selection
- Focus area filtering
- PR achievement filtering

### 3. WorkoutTable
Displays workout history in a virtualized table for efficient rendering:
- Shows date, workout type, duration, and difficulty
- Optimized for both desktop and mobile views
- Clicking on a row opens the session details

### 4. SessionDrawer
Shows detailed information about a selected workout session:
- Complete exercise list with sets and reps
- Performance metrics
- User feedback and notes
- PR achievements

## State Management
- Zustand store (`useDiaryStore.ts`) for data management
- Actions for fetching data, filtering, and selecting sessions
- Mock data providers during development

## Data Flows
1. User visits `/diary` route
2. App fetches current plan and session history
3. User can filter sessions by date range, focus area, or PR status
4. User can click on a session to view detailed information

## Accessibility Features
- ARIA roles and labels
- Keyboard navigation (tab, enter, esc)
- Focus trap in session drawer
- Screen reader compatible content structure

## Mobile Responsiveness
- Stacked card layout on mobile
- Touch-friendly UI elements (min 48px height)
- Swipe gestures for drawer
- Full-width drawer on mobile, partial-width on desktop

## Implementation Notes
- Uses virtualized list for efficient rendering of large datasets
- Data fetching with error handling and loading states
- Filter state persists during navigation
- Smooth animations for drawer and UI interactions
