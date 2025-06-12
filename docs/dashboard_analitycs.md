Dashboard Analytics Design (v0.1)

This document specifies the data‑model, aggregation logic, and front‑end requirements for the ten analytics modules chosen for the Isinka (Jarvis) dashboard.

Table of Contents

Training Load & Readiness

Progressive Progress

Muscle & Movement Balance

Health & Recovery

Adherence & Retention

Business Insights

AI‑Insights Feed

Benchmarking Engine

Data‑Brag Counter

What‑If Simulator

Notation⧉ schema object from current DBMV – Materialised View↻ refresh cadenceCitations reference the production schema doc.

1 Training Load & Readiness

Real‑time picture of athlete stress & ACWR ratio.

Aspect

Detail

Purpose

Avoid over‑training, reduce injury risk, surface daily readiness

Tables

⧉training_set (reps_done, weight_kg, recorded_at) fileciteturn1file4  ⧉modular_training_exercise (id, session_id) fileciteturn1file0  ⧉modular_training_session (session_date, completed) fileciteturn1file0

Derived columns

day_load = Σ(weight_kg × reps_done)  cw_load = 7‑day sum  aw_load = 28‑day rolling avg × 4  acwr = cw_load / aw_load

Storage

weekly_load_mv (MV, per‑user‑week)  ↻ nightly

SQL sketch

```sql

CREATE MATERIALIZED VIEW weekly_load_mv AS

SELECT p.user_id,

   date_trunc('week', ts.recorded_at)::date AS week_date,
   SUM(ts.weight_kg * ts.reps_done)         AS weekly_load,
   AVG(SUM(ts.weight_kg * ts.reps_done)) OVER (
       PARTITION BY p.user_id
       ORDER BY date_trunc('week', ts.recorded_at)
       ROWS BETWEEN 3 PRECEDING AND CURRENT ROW
   )                                        AS chronic_avg

FROM training_set ts
JOIN modular_training_exercise e ON e.id = ts.exercise_row_id
JOIN modular_training_session  s ON s.id = e.session_id
JOIN modular_training_week     w ON w.id = s.week_id
JOIN modular_training_plan     p ON p.id = w.plan_id
GROUP BY p.user_id, week_date;``` |
| Frontend | Stacked column (weekly load) + line (chronic avg); ACWR pill (‘green/amber/red’) |
| Perf notes | Uses existing idx_set_recorded desc fileciteturn1file4; Redis TTL = 10 min |
| Future | Merge with HRV once recovery_metrics exists |

2 Progressive Progress

Tracks PR ladder and rate of strength gain.

Aspect

Detail

Tables

⧉training_set, ⧉modular_training_exercise

Metrics

1RM_est per exercise (Epley) => weight_kg × (1 + reps_done/30)  best_1rm_week, best_1rm_alltime, weekly_delta_%

MV

one_rm_mv (per‑user‑exercise‑week); ↻ nightly

SQL sketch

```sql

CREATE MATERIALIZED VIEW one_rm_mv AS

SELECT p.user_id,

   e.exercise_name,
   date_trunc('week', ts.recorded_at)::date   AS week_date,
   MAX(ts.weight_kg * (1 + ts.reps_done/30.0)) AS est_1rm

FROM training_set ts
JOIN modular_training_exercise e ON e.id = ts.exercise_row_id
JOIN modular_training_session  s ON s.id = e.session_id
JOIN modular_training_week     w ON w.id = s.week_id
JOIN modular_training_plan     p ON p.id = w.plan_id
GROUP BY p.user_id, e.exercise_name, week_date;``` |
| Frontend | Line chart with PR annotations; tooltip shows % change week‑on‑week |
| Unique Value | Immediate visual proof of strength gains; triggers motivational nudges |

3 Muscle & Movement Balance

Highlight volume distribution across muscle groups & planes.

Aspect

Detail

Tables

⧉training_set, ⧉modular_training_exercise.muscle_group

Metric

volume_kg = weight_kg × reps_done; aggregate by muscle_group 4‑wk rolling

MV

muscle_balance_mv (per‑user‑muscle‑week)

UI

Donut or stacked bar; filter week / month; warns if group < 10 % total

4 Health & Recovery

(Requires new ingestion)

Aspect

Detail

New Table

recovery_metrics ‹user_id PK date› → hrv_ms, sleep_hours, resting_hr

Rules

Recovery Score = z‑scaled HRV + sleep factor – stress factor; cardinal 0‑100

UI

Card with trend sparkline; AI suggestion chip

Backfill

Import from Apple Health / Oura nightly via cron

5 Adherence & Retention

Measures how consistently users follow the plan.

Aspect

Detail

Tables

⧉modular_training_session.completed & session_date

KPIs

Streak (days), 7‑day completion‑rate, D1/D7/D30 retention cohorts

MV

session_completion_mv; cohort table retention_mv

UI

KPI cards + funnel chart; fireworks when streak hits milestones

6 Business Insights (Coach)

Financial & marketing lens for paid coaches.

Aspect

Detail

Tables

External: stripe_invoice, stripe_subscription (to be imported)   Internal maps: users, modular_training_plan

KPIs

MRR, ARPU, LTV cohort, revenue by channel (utm fields)

MV

finance_mv, cohort_revenue_mv

7 AI‑Insights Feed

Push actionable, personalised recommendations.

Aspect

Detail

Generator

Async worker consumes Redis Stream analytics.events; rules + ML model produce JSON

Table

insight_events (id, user_id, type, payload, created_at)

Delivery

Supabase Realtime → in‑app feed & push‑notification

8 Benchmarking Engine

Compare user stats vs similar cohort.

Aspect

Detail

Data

Percentiles from weekly_load_mv, one_rm_mv aggregated by (gender, age_band, goal_type)

UI

Radar chart "You vs Cohort 50/75‑percentile"

Privacy

Uses only anonymised aggregates ≥ 100 users per bucket

9 Data‑Brag Counter

Showcases how much data we track.

Aspect

Detail

Metric

total_sets = count(*) of training_set; total_weight = sum(weight_kg × reps_done)

Refresh

↻ hourly (cheap count)

UI

Animated odometer number with confetti on milestones

10 What‑If Simulator

Interactive slider predicting effect of load changes.

Aspect

Detail

Engine

Front‑end: TypeScript worker; formula = current chronic_avg & planned delta => predicted ACWR + recovery days

Inputs

weekly_load_mv.chronic_avg, proposed delta %

Outputs

Chart + text suggestion; option to auto‑adjust next session plan

No DB write

simulation only until user confirms plan adjustment

Cross‑Cutting Concerns

Security – All reads via RLS policies already present on training_set etc. fileciteturn1file2

Caching – Redis hash keyed analytics:{user_id}:{widget} TTL 10‑30 min.

Testing – dbt tests on MV nulls & duplicates; unit tests on insight rules.

Observability – log refresh durations, row counts, error rates to Prometheus.

