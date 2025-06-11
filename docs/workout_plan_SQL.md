1. Data Fetching (layer api/)
Goal	Decision	Why
Minimise round‑trips	Query workout_full_view (or a Postgres RPC that returns nested JSON) with one select	All plan‑week‑session‑exercise‑set fields are already exposed in the view – no N + 1 calls plan_full_view
Typed results	Use the Supabase code‑gen types (db_types.ts) + derive domain models (PlanTree)	Eliminates runtime shape errors
Composable hooks	Wrap TanStack Query in useWorkoutPlan(planId)	Caching, refetch on focus, pagination built‑in
Real‑time	supabase.channel('plan:'+planId) on modular_training_* tables	Push UI changes as soon as a set is logged SQL_logic_new

ts
Копировать
// src/api/workoutPlanService.ts
export const fetchPlanRows = async (planId: string) => {
  const { data, error } = await supabase
    .from('workout_full_view')
    .select('*')
    .eq('plan_id', planId);
  if (error) throw error;
  return data as WorkoutFullRow[];
};
2. State Management (layer hooks/ + context/)
TanStack Query → remote cache & background sync

ts
Копировать
export const useWorkoutPlan = (planId: string) => {
  return useQuery(['plan', planId], () => fetchPlanRows(planId), {
    staleTime: 1000 * 60,         // 1 min
    select: rowsToPlanTree,       // flatten → nested
  });
};
React Context <PlanProvider> – provides the nested tree + mutators; avoids prop drilling inside deep UI.

Zustand slice (usePlanLocalStore) – only for ephemeral UI states (accordion open/close, filter toggles).

Immer for immutable tree updates when user edits a set locally before persisting.

3. Component Structure (layer components/)
cpp
Копировать
src/
│
├─ api/
│   └─ supabaseClient.ts
│   └─ workoutPlanService.ts
│
├─ hooks/
│   └─ useWorkoutPlan.ts
│
├─ context/
│   └─ PlanContext.tsx
│
├─ utils/
│   └─ rowsToPlanTree.ts
│   └─ formatters.ts
│
└─ components/
    └─ plan/
        ├─ WorkoutPlanPage.tsx   // route: /plans/:planId
        ├─ WeekTabs.tsx          // Pills or scrollable tabs
        ├─ SessionCard.tsx       // Collapse to show exercises
        ├─ ExerciseList.tsx      // Virtualised list (react‑window)
        └─ SetTable.tsx          // Editable grid
Reusable atoms live in components/ui/ (Button, Accordion, Skeleton, Badge).
Domain components (WeekTabs, SessionCard…) are pure, declarative, and never call Supabase directly.

4. Rendering Logic (layer plan/ components)
WorkoutPlanPage

tsx
Копировать
const { plan, isLoading } = useWorkoutPlan(planId);
return (
  <PlanProvider value={plan}>
    {isLoading ? <PlanSkeleton /> : <WeekTabs />}
  </PlanProvider>
);
WeekTabs
Maps plan.weeks → tabs. On tab change, lazy‑load the week’s sessions into the viewport (code‑split chunk).

SessionCard
Accordion per session.
Shows completion badge, duration, focus area.
Expands to ExerciseList.

ExerciseList
FixedSizeList for smooth scroll even on phones.
Row renderer → ExerciseRow.

SetTable inside each exercise
Editable <table> or <DataGrid> (MUI / TanStack Table).
On cell commit → optimistic Zustand update → supabase.from('training_set').upsert.

5. Performance & UX notes
Skeleton patterns – perceived speed while useWorkoutPlan fetches.

Memoised selectors – e.g. usePlanSelector(plan => plan.completedPercentage) via reselect.

Virtualisation – only render visible exercises/sets.

Optimistic UI – user instantly sees logged set; rollback on error.

Connection awareness – disable edit actions when offline, queue writes with localforage.

6. Extensibility / Separation of Concerns
Concern	Kept in	Swap‑out ease
Data source	api/	Switch Supabase → GraphQL by rewriting service layer only
Remote cache	hooks/	Replace TanStack with SWR in one file
Presentation	components/	UI library agnostic; storybook stories for each
Cross‑cutting (auth, theming)	providers/	Mounted once in App.tsx

7. Key Type Definitions
ts
Копировать
export interface WorkoutSet {
  id: string;
  setNo: number;
  repsDone: number | null;
  weightKg: number | null;
  rpe: number | null;
}

export interface WorkoutExercise {
  exerciseRowId: string;
  exerciseId: string | null;
  name: string;
  muscleGroup: string;
  setsPlanned: number;
  repScheme: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  sessionId: string;
  dayLabel: string;
  date: string;
  focusArea: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutWeek {
  weekId: string;
  weekNumber: number;
  startDate: string;
  sessions: WorkoutSession[];
}

export interface WorkoutPlan {
  planId: string;
  splitType: string;
  goal: string;
  level: string;
  status: string;
  weeks: WorkoutWeek[];
}
The rowsToPlanTree util folds the flat workout_full_view dataset into this structure in O(n) time using a Map for each level.

8. Sample transform utility (excerpt)
ts
Копировать
export const rowsToPlanTree = (rows: WorkoutFullRow[]): WorkoutPlan => {
  const plan = {} as WorkoutPlan;
  const weekMap = new Map<string, WorkoutWeek>();
  const sessionMap = new Map<string, WorkoutSession>();
  const exerciseMap = new Map<string, WorkoutExercise>();

  rows.forEach(r => {
    // PLAN (filled once)
    if (!plan.planId) {
      Object.assign(plan, {
        planId: r.plan_id,
        splitType: r.split_type,
        goal: r.goal,
        level: r.level,
        status: r.plan_status,
        weeks: [],
      });
    }

    // WEEK
    if (!weekMap.has(r.week_id)) {
      const week: WorkoutWeek = {
        weekId: r.week_id,
        weekNumber: r.week_number,
        startDate: r.week_start_date,
        sessions: [],
      };
      weekMap.set(r.week_id, week);
      plan.weeks.push(week);
    }

    // SESSION
    if (!sessionMap.has(r.session_id)) {
      const session: WorkoutSession = {
        sessionId: r.session_id,
        dayLabel: r.day_label,
        date: r.session_date,
        focusArea: r.focus_area,
        exercises: [],
      };
      sessionMap.set(r.session_id, session);
      weekMap.get(r.week_id)!.sessions.push(session);
    }

    // EXERCISE
    if (!exerciseMap.has(r.exercise_row_id)) {
      const ex: WorkoutExercise = {
        exerciseRowId: r.exercise_row_id,
        exerciseId: r.exercise_id,
        name: r.exercise_name,
        muscleGroup: r.muscle_group,
        setsPlanned: r.sets_planned,
        repScheme: r.rep_scheme,
        sets: [],
      };
      exerciseMap.set(r.exercise_row_id, ex);
      sessionMap.get(r.session_id)!.exercises.push(ex);
    }

    // SET (nullable in planning stage)
    if (r.set_id) {
      exerciseMap.get(r.exercise_row_id)!.sets.push({
        id: r.set_id,
        setNo: r.set_no,
        repsDone: r.reps_done,
        weightKg: r.weight_kg,
        rpe: r.rpe,
      });
    }
  });

  return plan;
};
9. Next Steps for the Team
Generate DB types – npx supabase-gen types typescript --local.

Implement transform & provider as shown.

Build vertical slice for /plans/:id route using the proposed components.

Write Storybook stories for SessionCard, ExerciseList, SetTable.

Add e2e tests (Cypress) to validate optimistic set logging & RLS errors.

This architecture keeps data logic, state, and presentation decisively separated, scales to very large plans (virtualisation), and stays flexible for upcoming features such as in‑session timers, coach chat, or analytics overlays.