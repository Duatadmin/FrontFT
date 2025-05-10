1 · Feature Summary
A single-screen “Progress” dashboard surfaces your most meaningful training signals—volume lifted, new personal records, and workout streaks—so users instantly see improvement, spot plateaus, and stay motivated.
Scope (MVP): 3 key KPI cards (Volume, PRs, Streak) with week-over-week deltas, a toggleable comparison range, and graceful empty-state messaging. Advanced trend graphs, recovery insights, and forecasting roll out later.

2 · User Personas & Use Cases

Persona	Goals	Typical Questions
Active Trainee “Max” (does 3–5 AI-guided workouts/week)	Understand progress; decide next focus	“Did I improve this week?” • “Am I consistent?” • “Where should I focus next?”
Investor / Coach (opens demo account)	Validate traction, see wow-factor graphs	“Show me week-to-week growth & milestones.”
3 · Metrics Specification

Priority	Name & Icon	Definition / Formula	Why It Matters	UI Pattern	Comparison Logic
MVP	🏋️ Volume	Σ (weight × reps) in selected range	Captures total work done	KPI card + sparkline	This week vs. last (Δ %) ​metrics
MVP	🔥 PRs	Count (new 1RM or rep-PR)	Highlights achievement spikes	Badge card + auto-confetti	Current month vs. previous ​metrics
MVP	📆 Streak	Max consecutive days with ≥ 1 set	Rewards consistency	Progress ring (goal = 7 days)	Current streak vs. best ever ​metrics
Advanced	🦾 1RM Trend	Epley: weight × (1 + reps/30)	Strength progression	Line chart + ghost forecast	Rolling 4-wk trend ​metrics
Advanced	♻️ Variation Index	unique_exercises / total_sets	Prevents over-use injuries	Radar by muscle group	Range color-coded ​metrics
Recovery	🌙 Recovery Index	z-score(HRV) 0.5 + sleep 0.3 – RPE 0.2	Informs deload needs	Speedometer gauge	Threshold bands (> 70 green) ​metrics
Progressive disclosure: the dashboard opens with MVP cards; tapping a card expands to its detailed chart.

4 · UI / UX Design Principles
Layout

Sticky header → Date-range selector (Week | Month | All-time) + greeting.

Responsive 2 × 2 KPI grid (cards auto-scale).

“Deep-Dive Drawer” slides up when a card is tapped, housing full-width graph & insights.

Visual Style

Tailwind CSS + shadcn/ui tokens.

System-wide CSS vars for light/dark; avoid red/green pairing (color-blind safe).

Subtle Lottie “spark” animation triggers once on PR unlock.

Typography & Spacing

Display lg (32 px) numbers, label sm (14 px).

Min 8 px spacing; 16 px outer gutters.

Accessibility

Contrast ≥ 4.5:1; focus styles visible.

VoiceOver alt summaries for every chart.

Keyboard-navigable card focus order.

5 · Data Flow & Dependencies

Metric	Source Event / View	Supabase Objects	Notes
Volume, PRs, Streak	workout.set_logged, workout.completed	views: vw_week_volume, vw_prs_month, vw_streaks	Calculated nightly via SQL jobs ​EVENTS
1RM Trend	same events + exercise metadata	vw_one_rm_daily	Requires exercise_id grouping
Recovery	Future wearables import (hrv, sleep_hours)	tbl_recovery_raw	API integration TBD
TUT (future)	Missing field tempo_seconds on workout.set_logged—add to payload schema ​EVENTS		
API Endpoints (FastAPI):
GET /api/progress?range=week → aggregated KPI JSON
GET /api/progress/volume?from=…&to=… → timeseries for chart

6 · Implementation Plan

Phase	Scope	Key Tasks	ETA*
1 (MVP – 2 wks)	Volume, PRs, Streak cards + WoW comparison	• SQL views • /progress endpoint • React KPI card component • Empty-state screens	T + 14 d
2 (Trends – 3 wks)	Line graph drawer, 1RM trend, variation radar	• Timeseries endpoints • Recharts integration • Card→drawer animation	T + 35 d
3 (Recovery – 4 wks)	Recovery index gauge, fatigue forecast	• Wearable import service • Supabase tbl_recovery_raw • Gauge component + thresholds	T + 63 d
4 (Social & Predictive – later)	Compare with friends / AI projections	• Leaderboard API • Forecast model (Holt-Winters)	TBD
*Estimates assume 1 FE, 1 BE, 0.5 DS engineers.

7 · Edge Cases & Considerations
No workouts this week → Show friendly nudge illustration + “Log one set to start tracking”.

Brand-new user → Display demo values with tooltip “Sample data”.

Missing HR / sleep → Hide Recovery card; avoid blank gauges.

PR granularity → Default per-exercise; allow switch to movement family later.

Data spikes / errors → Outlier filter (weight < bodyweight × 0.1 flagged).

Offline mode → Cache last payload; blur cards if > 7 days stale.

Diagram Description

less
Копировать
Редактировать
[Supabase Views] -> /api/progress  --> [React KPI Cards Grid]
                                          | (onClick)
                                          v
                               [Drawer] — Line/ Radar / Gauge
This document gives engineering the formulas, endpoints, and phased tasks; product the user value & scope; and design a clear UI direction—all set for build.