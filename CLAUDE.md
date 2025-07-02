# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:5173
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run tests with Vitest
- `npm run serve:api` - Start backend API server with ts-node
- `npm run build:api` - Build API server for production
- `npm run build:legacy-voice` - Build legacy voice module

## Project Architecture

This is a **React PWA (Progressive Web App)** combining a conversational chat interface with a comprehensive fitness tracking dashboard. The app follows a modern component-based architecture with TypeScript throughout.

### Key Technologies
- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Chakra UI + shadcn/ui components
- **State Management**: Zustand stores + SWR for data fetching
- **Database**: Supabase with typed schema
- **Testing**: Vitest + Testing Library
- **Voice**: Custom voice module with TTS/STT capabilities

### Core Application Structure

**Main Routes**:
- `/` - Chat interface (default home)
- `/dashboard` - Fitness analytics dashboard
- `/diary` - Workout diary and session tracking
- `/programs` - Training plans and templates
- `/library` - Exercise library and details

**State Management Pattern**:
- Zustand stores in `src/lib/stores/` and `src/store/` (legacy)
- SWR for API data fetching and caching
- Supabase client with typed database schema

**Component Organization**:
- `src/components/chat/` - Chat-specific UI components
- `src/components/dashboard/` - Analytics and metrics components  
- `src/components/diary/` - Workout tracking components
- `src/components/programs/` - Training plan management
- `src/components/voice/` - Voice interaction components
- `src/components/ui/` - Reusable UI primitives

### Database Integration

The app uses **Supabase** as the backend with automatic fallback to mock data:
- Real data when `workout_sessions` table exists in Supabase
- Mock data fallback when tables are missing or `VITE_USE_MOCK_DATA=true`
- Typed schema in `src/lib/supabase/schema.types.ts`
- Hybrid auth storage using cookies + localStorage

### Voice Module Architecture

Custom voice functionality with dual implementation:
- Modern voice components in `src/components/voice/`
- Legacy voice module in `legacy/voice-module/` (requires separate build)
- TTS/STT integration with WebRTC for real-time communication
- Walkie-talkie mode for continuous voice interaction

### Key Hooks and Services

**Data Fetching**:
- `useDashboardData()` - Dashboard metrics and analytics
- `useChat()` - Chat message management
- `useWalkie()` - Voice communication state

**Authentication**:
- Supabase auth with PKCE flow
- Protected routes in `src/routes/ProtectedRoutes.tsx`
- Auth guards in `src/hooks/useAuthGuard.ts`

### Environment Configuration

Required environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_USE_MOCK_DATA` - Force mock data usage (optional)

### Development Notes

**Testing Strategy**:
- Component tests in `src/**/*.{test,spec}.ts(x)`
- Mock implementations in `src/mocks/`
- Vitest configured with jsdom environment

**Build Configuration**:
- Vite with React plugin and PWA capabilities
- Path aliases: `@/*` maps to `src/*`
- Legacy voice module requires separate Yarn build process

**Code Patterns**:
- TypeScript strict mode throughout
- Functional components with hooks
- Error boundaries for robust error handling
- Mobile-first responsive design with Tailwind

### API Integration

The app is designed to integrate with a FastAPI backend:
- Chat API endpoints for conversational interface
- Workout data APIs for fitness tracking
- TTS/STT endpoints for voice functionality
- Proxy configuration in Vite for local development

### PWA Features

- Service worker for offline functionality
- Installable app manifest
- Background sync capabilities (placeholder)
- Push notification ready (future enhancement)