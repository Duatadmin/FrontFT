 Improved Metric System (with priorities & formulas)

2.1 MVP Core (↑ ship first)

Metric	Formula / Source	UI Pattern	Comparison
🏋️ Volume	Σ (weight × reps) over selected range	KPI card + sparkline	This week → previous week<br/>Tooltip: Δ %
🔥 PRs	count(new 1 RM or rep-PR)	Badge-style card, auto-confetti	Month vs previous month
📆 Streak	max(consecutive days with activity ≥ 1 set)	Progress ring toward 7-day goal	Current vs Best ever
2.2 Extended “Dynamics” Layer (after MVP)

Metric	Formula	UI Pattern	Additional UX
🦾 1 RM Trend	Epley (weight × (1 + reps/30))	Line chart; exercise switcher	Ghosted forecast line
♻️ Variation Index	unique_exercises / total_sets	Body-part radar	Color-code: > 0.4 = green
⏱️ Time Under Tension	Σ seconds (tempo × reps)	Stacked area per exercise	Fallback: if no tempo → reps × 2 s
❤️ Zone Minutes*	Minutes in HR zones 3–5	Bar/line	Show only if HR data; otherwise hide
2.3 Recovery & Risk

Metric	Formula	UI Pattern	Actionable
🌙 Recovery Index	z-score(HRV) × 0.5 + z-score(sleep) × 0.3 − z-score(RPE) × 0.2	Speedometer 0–100	> 70 “Green light” / 40–70 “Maintain” / < 40 “Deload”
⚠️ Fatigue Forecast	EMA(Volume, α = 0.3) / EMA(Recovery)	7-day heat bar	Tooltip with recommendations
3. UX Flow (progressive disclosure)
Glance Screen – three MVP cards visible on open.

Tap → Deep Dive – card expands to full chart + range selector (Week / Month / Custom).

Compare Toggle – switch “Me vs Best Week” or “vs Average User” (optional, default OFF).

Accessibility

Contrast ≥ 4.5 : 1

Font ≥ 14 pt

All charts include VoiceOver “alt-summary”.

Dark/Light auto – Tailwind + CSS variables; avoid pure red/green for color-blind users.

4. Updated “Wow Ideas” (with implementation hints)

Idea	Brief	Implementation
AI Fatigue Detector 2.0	Warns of over-training 3 days ahead	Swagger endpoint /analytics/fatigue → on-device LightGBM model
Momentum Spark (micro-animation)	Sparks when Volume ↑ and Variation ↑	Lottie JSON < 100 KB; show max 1× per day
Future You Projection	Ghost forecast line for 1 RM / VO₂	Holt-Winters smoothed forecast; UI opacity 0.3
5. What’s Next — Layered Roll-out
Infrastructure

Add tempo_seconds field to workout.set_logged events.

Nightly job calculates Volume, 1 RM, Variation into a Supabase view.

MVP Dashboard

Build the three cards + week toggle.

A/B test: “PRs badge-card” vs simple text.

Data QA

Alert if exercise_weight < bodyweight × 0.1 (likely input error).

Extended Layer

Ship after retention metrics look solid to avoid feature bloat early on.