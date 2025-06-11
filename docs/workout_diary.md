Workout Diary — Design Doc

1. Goal & Scope

Render completed training sessions only (session_completed = TRUE) from the workout_full_view as a vertical list of cards. The page lives at the /diary route and leverages the same Supabase data layer as the full plan screen.

2. Data Contract

// Supabase JS v2
const { data, error } = await supabase
  .from('workout_full_view')
  .select(`
    session_id,
    session_date,
    day_label,
    focus_area,
    overall_difficulty,
    duration_minutes
  `)
  .eq('user_id', user.id)
  .eq('session_completed', true)      // ← key filter
  .order('session_date', { ascending: false });

All columns come from workout_full_view fileciteturn1file0. The client consolidates rows with groupBy(session_id) (one card per session).

3. Front‑end Architecture

Layer

Responsibility

Tech stack

Hook

useCompletedSessionsQuery() — TanStack wrapper

React, Supabase JS

List

SessionList — virtualised list, grouped by ISO week (date-fns)

@tanstack/virtual

Card

SessionCard — atomic UI unit, see §4

shadcn/ui, Tailwind

DetailsModal

SessionDetailsModal — expands exercises & sets

Radix Dialog

Component Tree

DiaryPage
└── SessionList
    ├── WeekHeader
    ├── SessionCard (×N)
    └── SkeletonRow (lazy)

Data flow: TanStack Query → React Context → Presentational components.

4. UI/UX Specification

Visual Style

Glassmorphism card — bg-white/5 + backdrop-blur-md + subtle top‑bottom gradient.

Radius rounded-3xl, shadow shadow-xl shadow-black/10.

Prominent date “21 May” with weekday icon on the left.

Colour system:

Accent / focus pills — bg-emerald-500.

Text — text-white / text-white/70.

Fonts: Inter (bold digits), SF Pro Text (body).

Card “SessionCard” (520 × 132 dp)

Zone

Content

Notes

Left 48 dp

Date DD MMM + weekday icon

semi‑transparent text

Centre

Focus pills (back, chest…) + Duration 45 min

Text wraps on narrow screens

Right 24 dp

Chevron >

44 px hit area

Entry animation (framer-motion):

<motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} />

List Behaviour

Infinite scroll + pull‑to‑refresh.

Week headers pinned: “Week 21 (19–25 May)”.

Empty state: illustration + CTA “Log your first workout”.

Accessibility

Touch targets ≥ 44 px.

Dark / light theme parity.

aria-label on interactive elements.

5. Performance & Caching

Stale‑while‑revalidate 60 s via TanStack.

Projection keeps payload < 4 KB for 50 sessions.

Images through next/image loading=\"lazy\".

6. Analytics

Event

Payload

diary_viewed

{ count_sessions, first_session_date }

session_card_open

{ session_id }