============================================================

OVERVIEW
• Purpose & user value
The Training Diary provides users with a consolidated view of their ongoing training plan and historical workout data directly inside the Jarvis PWA.  This allows quick reference to today’s session, retrospective analysis, and motivates adherence.

• Scope boundaries
− Front-end only – no schema changes server-side unless noted as TODO.
− Covers read-only rendering of data; editing/deleting sessions is out of scope.
− Voice features, dashboard analytics, chat logic remain untouched.
============================================================

EXISTING ARCHITECTURE SNAPSHOT
• Reused file paths / modules
src/app/routes.tsx                 (central React-Router config)
src/components/layout/MainLayout.tsx
src/components/ui/Card.tsx         (shared card wrapper)
src/lib/supabaseClient.ts          (singleton Supabase client)

• Relevant Zustand stores & hooks (verified in /src/store)
useUserStore       – holds authenticated userId / profile
useSettingsStore   – UI preferences (dark-mode, locale)
No workout diary store yet → will be added (see section 5)

• Supabase tables/columns already available
TABLE users
id (uuid PK) | nickname (text) | created_at (timestamptz)
TABLE training_plans
id (uuid PK) | user_id (uuid FK) | name (text) | days (jsonb)
TABLE workout_sessions
id (uuid PK) | user_id (uuid FK) | training_plan_id (uuid FK)
timestamp (timestamptz) | duration_minutes (int)
exercises_completed (text[]) | total_sets (int) | total_reps (int)
overall_difficulty (int) | user_feedback (text)
============================================================

REQUIREMENTS
• Functional
F1  Display current plan card for today (first day match in training_plans.days).
F2  List past workout_sessions ordered desc by timestamp.
F3  Filters: date-range (from-to), focus area (derived from exercises_completed), PR achieved (flag via backend RPC TODO).
F4  Click row opens drawer with full session details and user feedback.

• Non-functional
N1  Render first meaningful paint < 1 s on fibre connection.
N2  Page must pass WCAG-2 AA contrast.
N3  PWA offline: cache last 20 sessions via Service-Worker (Workbox precache).
N4  Mobile FPS ≥ 45 while scrolling 1 k rows.
============================================================

UI / COMPONENT TREE

ASCII Layout (desktop - 12-col grid)

| Header "Diary" (sticky)                                 |

| CurrentPlanCard (12 cols)                               |

| FiltersBar (12 cols)                                    |

| WorkoutTable (12 cols, virtualised)                     |

COMPONENTS
CurrentPlanCard.tsx
props: planName, dayName, exercises[], estimatedVolume
FiltersBar.tsx
props: onFilterChange({from,to,focus,pr})
WorkoutTable.tsx (uses react-virtualised)
props: sessions[]
child Row
onClick → openDrawer(session)
SessionDrawer.tsx (shadcn Sheet)
props: session (WorkoutSession)
shows exercises, reps/sets, feedback

Interaction states
• loading   → skeleton cards
• empty     → friendly illustration + CTA to start workout
• error     → Toast("Unable to load diary")
• populated → as above
============================================================

STATE MANAGEMENT & DATA FLOW
• New Zustand store: useDiaryStore
state: { sessions: WorkoutSession[], loading: bool, filters, error }
actions: fetchSessions(filters), setFilters()
• Data fetching
GET training_plans (single) → Supabase SELECT LIMIT 1 WHERE user_id
GET workout_sessions → SELECT * with range & order, pagination 50-limit
• SWR strategy
useSWRKey = ["sessions", filters]
staleTime  = 5 min | revalidateOnFocus
• Pagination fetchMore() appends sessions in store (infinite scroll Desktop, paged Mobile)
============================================================

ROUTING & NAVIGATION
• Route path             /diary
• Add to main sidebar    label "Diary" icon lucide-book
• Deep-link pattern      /diary?from=2025-01-01&to=2025-02-01&focus=legs
============================================================

RESPONSIVENESS BREAKPOINTS
• ≥1024 px  – table layout, side drawer 480 px width.
• <1024 px  – cards list (stacked), drawer slides full-width.
• Header sticky at top; filters horizontal scroll on mobile.
============================================================

ACCESSIBILITY CHECKLIST
• All interactive elements reachable via Tab, logical order.
• ARIA roles: row, grid, dialog for drawer.
• Colour contrast ≥ 4.5:1 for text on bg.
• ESC closes drawer; focus trap inside drawer.
============================================================

EDGE CASES & ERROR HANDLING
• No workouts yet → display illustration + "Start first workout" button.
• Supabase network fail → retry button + toast.
• Large history (>500 rows) → fetch in pages of 100, virtualised list to avoid DOM bloat.
============================================================

TEST PLAN
• Unit
− CurrentPlanCard renders correct exercise count
− FiltersBar emits filter object on change
• Integration
− fetchSessions → renders 10 rows given mock Supabase
− opening row shows SessionDrawer with props
• E2E (Playwright)
− User logs in → navigates /diary → sees today plan
− Applies date filter → list updates
− Opens drawer → checks exercise list renders
============================================================

TASK BREAKDOWN & ESTIMATES
1  Create route /diary & link in sidebar                  S
2  Build CurrentPlanCard component                        M
3  Build FiltersBar (date-range picker, multi-select)     M
4  Build WorkoutTable w/ virtualisation                  L
5  Build SessionDrawer (shadcn Sheet)                    M
6  Zustand store & SWR hooks                             M
7  Responsive styles & breakpoints                       S
8  Skeleton / error / empty states                       S
9  Unit + integration tests                              M
10 Playwright E2E scenario                               M
11 Docs update (this file committed)                     S
============================================================