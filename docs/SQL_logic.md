SQL Logic – Current Production Schema

Last sync: 2025‑05‑27 – reflects migration to Modular tables and deprecation of legacy workout_sessions.

📦 Entity Relationships

Table

Purpose

Key Relationships

users

Supabase Auth users

–

modular_training_plan

Root object – one plan per goal/phase

belongs‑to users · has‑many modular_training_week

modular_training_week

One calendar week inside a plan

belongs‑to modular_training_plan · has‑many modular_training_session

modular_training_session

One workout day

belongs‑to modular_training_week · has‑many modular_training_exercise

modular_training_exercise

One exercise inside a session

belongs‑to modular_training_session · references exrcwiki.exercise_id

exrcwiki

Master exercise catalogue

–

workout_sessions (VIEW)

Back‑compat façade for old services

Selects from modular_training_session + joins to expose user_id, status

🗄️ Table Schemas

modular_training_plan

CREATE TABLE modular_training_plan (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id),
  split_type    TEXT   NOT NULL,
  week_start    DATE   NOT NULL,
  goal_type     TEXT   NOT NULL DEFAULT 'general_fitness',
  experience_level TEXT NOT NULL DEFAULT 'intermediate',
  status        TEXT   NOT NULL DEFAULT 'active', -- plan‑level lifecycle
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

modular_training_week

CREATE TABLE modular_training_week (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id      UUID NOT NULL REFERENCES modular_training_plan(id) ON DELETE CASCADE,
  week_number  INT  NOT NULL,
  week_start   DATE NOT NULL,
  notes        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

modular_training_session

CREATE TABLE modular_training_session (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_id          UUID NOT NULL REFERENCES modular_training_week(id) ON DELETE CASCADE,
  day_label        TEXT NOT NULL,          -- e.g. "Push‑H"
  session_date     DATE NOT NULL,
  day_of_week      INT  NOT NULL,          -- 1 = Monday … 7 = Sunday
  focus_area       TEXT NOT NULL,          -- csv of target muscles
  session_number   INT  NOT NULL DEFAULT 1,
  overall_difficulty INT,                  -- 1–10
  duration_minutes  INT,
  completed        BOOLEAN NOT NULL DEFAULT FALSE, -- replaces old text status
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

modular_training_exercise

Selected columns only; see DB for full list.

CREATE TABLE modular_training_exercise (

1	id	uuid
2	session_id	uuid
3	exercise_name	text
4	muscle_group	text
5	sets	integer
6	reps	text
7	rir	integer
8	equipment	text
9	tier	text
10	target	text (nullable)
11	secondary_muscles	jsonb (nullable)
12	tips	jsonb (nullable)
13	instructions	text (nullable)
14	weight	real (nullable)
15	actual_reps	jsonb (nullable)
16	difficulty	integer (nullable)
17	notes	text (nullable)
18	created_at	timestamp with time zone
19	display_order	integer (default 0)
20	exercise_id	text (nullable)
21	order_in_session	integer (default 1)
);

🔄 Back‑compat VIEW workout_sessions

Keeps legacy services (SessionAgent, ProgressTracker) operational until code refactor is complete.

CREATE OR REPLACE VIEW workout_sessions AS
SELECT
  s.id                               AS id,
  p.user_id                          AS user_id,
  CASE WHEN s.completed THEN 'completed' ELSE 'active' END AS status,
  s.focus_area,
  s.day_of_week,
  s.session_date                     AS created_at,
  s.updated_at
FROM   modular_training_session   s
JOIN   modular_training_week      w ON w.id = s.week_id
JOIN   modular_training_plan      p ON p.id = w.plan_id;

CREATE INDEX IF NOT EXISTS workout_sessions_user_status_idx
  ON workout_sessions (user_id, status) INCLUDE (created_at);

Remove after session_repository.py migrates to the modular tables.

🔁 Core PL/pgSQL Functions

insert_full_plan (updated)

CREATE OR REPLACE FUNCTION insert_full_plan(
  p_user_id UUID,
  p_plan_json JSONB
) RETURNS UUID
LANGUAGE plpgsql AS $$
DECLARE
  v_plan_id     UUID;
  v_week_id     UUID;
  v_session_id  UUID;
  v_week_start  DATE := (p_plan_json->>'week_start')::date;
  v_session     JSONB;
  v_slot        JSONB;
BEGIN
  -- 1. PLAN
  INSERT INTO modular_training_plan(
    user_id, split_type, week_start,
    goal_type, experience_level, status
  ) VALUES (
    p_user_id,
    p_plan_json->>'split_type',
    v_week_start,
    p_plan_json->>'goal_type',
    p_plan_json->>'experience_level',
    'active'
  ) RETURNING id INTO v_plan_id;

  -- 2. WEEK (wk#1)
  INSERT INTO modular_training_week(plan_id, week_number, week_start)
  VALUES (v_plan_id, 1, v_week_start)
  RETURNING id INTO v_week_id;

  -- 3. SESSIONS
  FOR v_session IN SELECT * FROM jsonb_array_elements(p_plan_json->'sessions') LOOP
    INSERT INTO modular_training_session(
      week_id, day_label, session_date, day_of_week, focus_area
    ) VALUES (
      v_week_id,
      v_session->>'day_name',
      (v_session->>'date')::date,
      (v_session->>'day_of_week')::int,
      v_session->>'focus_area'
    ) RETURNING id INTO v_session_id;

    -- 4. EXERCISES
    FOR v_slot IN SELECT * FROM jsonb_array_elements(v_session->'slots') LOOP
      INSERT INTO modular_training_exercise(
        session_id, exercise_id, exercise_name,
        muscle_group, sets, reps, equipment,
        tier, order_in_session
      ) VALUES (
        v_session_id,
        v_slot->>'exercise_id',
        v_slot->>'name',
        v_slot->>'muscle_group',
        (v_slot->>'sets')::int,
        v_slot->>'reps',
        v_slot->>'equipment',
        v_slot->>'tier',
        (v_slot->>'order_in_session')::int
      );
    END LOOP;
  END LOOP;

  RETURN v_plan_id;
END $$;

Note: status removed from session insert; completed defaults to FALSE.

---

## 🆕 `modular_training_set` — actual sets performed

| # | Column name       | Data type & constraints                                            | Description                                   |
|---|-------------------|--------------------------------------------------------------------|-----------------------------------------------|
| 1 | `id`              | `UUID` **PK** `DEFAULT uuid_generate_v4()`                         | Unique identifier of the set                  |
| 2 | `exercise_row_id` | `UUID NOT NULL` → `modular_training_exercise(id)` `ON DELETE CASCADE` | Links the set to its exercise row             |
| 3 | `set_no`          | `SMALLINT NOT NULL`                                                | Set order (1, 2, 3…)                          |
| 4 | `reps_done`       | `SMALLINT NOT NULL`                                                | Repetitions actually completed                |
| 5 | `weight_kg`       | `REAL NOT NULL`                                                    | Weight used in kilograms                      |
| 6 | `rpe`             | `SMALLINT` _(nullable)_                                            | Perceived effort (6–10 scale)                 |
| 7 | `recorded_at`     | `TIMESTAMPTZ NOT NULL DEFAULT now()`                               | Timestamp when the set was recorded           |

### SQL DDL

```sql
-- Table definition
CREATE TABLE IF NOT EXISTS training_set (
  id              UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  exercise_row_id UUID         NOT NULL REFERENCES modular_training_exercise(id) ON DELETE CASCADE,
  set_no          SMALLINT     NOT NULL,
  reps_done       SMALLINT     NOT NULL,
  weight_kg       REAL         NOT NULL,
  rpe             SMALLINT,
  recorded_at     TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Indexes for analytical queries
CREATE INDEX IF NOT EXISTS idx_set_exercise   ON training_set(exercise_row_id);
CREATE INDEX IF NOT EXISTS idx_set_recorded   ON training_set(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_set_weight     ON training_set(weight_kg);

-- Row-Level Security (Owner Read/Write)
ALTER TABLE training_set ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner-Read" ON training_set
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM   modular_training_exercise e
      JOIN   modular_training_session  s ON s.id = e.session_id
      JOIN   modular_training_week     w ON w.id = s.week_id
      JOIN   modular_training_plan     p ON p.id = w.plan_id
      WHERE  e.id = exercise_row_id
        AND  p.user_id = auth.uid()
    )
  );

CREATE POLICY "Owner-Write" ON training_set
  FOR INSERT, UPDATE, DELETE USING (
    EXISTS (
      SELECT 1
      FROM   modular_training_exercise e
      JOIN   modular_training_session  s ON s.id = e.session_id
      JOIN   modular_training_week     w ON w.id = s.week_id
      JOIN   modular_training_plan     p ON p.id = w.plan_id
      WHERE  e.id = exercise_row_id
        AND  p.user_id = auth.uid()
    )
  );

🚦 Row‑Level Security (RLS)

All modular tables inherit the same pattern:

ALTER TABLE <table_name> ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner‑Read" ON <table_name>
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Owner‑Write" ON <table_name>
  FOR INSERT, UPDATE, DELETE USING (user_id = auth.uid());

modular_training_session & modular_training_exercise derive user_id via join → create security definer views if strict RLS needed.

📝 Migration Checklist

Apply table changes (completed flag, new fields).

Create the workout_sessions VIEW and index.

Update any triggers that referenced status in sessions.

Regenerate Supabase client types (if using code‑gen TS/Python).

Refactor session_repository.py → use modular tables, then drop the VIEW.