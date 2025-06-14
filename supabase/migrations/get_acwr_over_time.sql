CREATE OR REPLACE FUNCTION get_acwr_over_time(p_user_id UUID)
RETURNS TABLE(week_start_date DATE, weekly_load NUMERIC, chronic_load_avg NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    WITH weekly_loads AS (
        SELECT
            date_trunc('week', ts.recorded_at)::date AS week_date,
            SUM(ts.weight_kg * ts.reps_done) AS total_weekly_load
        FROM
            training_set ts
        JOIN
            modular_training_exercise e ON e.id = ts.exercise_row_id
        JOIN
            modular_training_session s ON s.id = e.session_id
        JOIN
            modular_training_week w ON w.id = s.week_id
        JOIN
            modular_training_plan p ON p.id = w.plan_id
        WHERE
            p.user_id = p_user_id
        GROUP BY
            week_date
    )
    SELECT
        wl.week_date,
        wl.total_weekly_load,
        AVG(wl.total_weekly_load) OVER (
            ORDER BY wl.week_date
            ROWS BETWEEN 3 PRECEDING AND CURRENT ROW
        ) AS chronic_avg
    FROM
        weekly_loads wl
    ORDER BY
        wl.week_date;
END;
$$;
