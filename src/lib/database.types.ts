export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      // Define other tables here if needed, though not strictly necessary for workout_full_view
    };
    Views: {
      workout_full_view: {
        Row: {
          plan_id: string | null;
          user_id: string | null;
          split_type: string | null;
          goal: string | null;
          level: string | null;
          plan_status: string | null;
          week_start: string | null; // date
          week_id: string | null;
          week_number: number | null;
          week_start_date: string | null; // date
          session_id: string | null;
          day_label: string | null;
          session_date: string | null; // date
          day_of_week: string | null;
          focus_area: string | null;
          session_number: number | null;
          overall_difficulty: number | null;
          duration_minutes: number | null;
          session_completed: boolean | null;
          session_state: Json | null; // jsonb
          exercise_row_id: string | null;
          exercise_id: string | null;
          exercise_name: string | null;
          muscle_group: string | null;
          sets_planned: number | null;
          rep_scheme: string | null;
          rir: number | null;
          equipment: string | null;
          tier: string | null;
          order_in_session: number | null;
          set_id: string | null;
          set_no: number | null; // smallint
          reps_done: number | null; // smallint
          weight_kg: number | null; // real
          rpe: number | null; // smallint
          recorded_at: string | null; // timestamptz
        };
        Insert: { // Optional: Define Insert type if you plan to insert into the view (usually not the case for views)
          plan_id?: string | null;
          user_id?: string | null;
          // ... other fields
        };
        Update: { // Optional: Define Update type
          plan_id?: string | null;
          user_id?: string | null;
          // ... other fields
        };
      };
    };
    Functions: {
      // Define functions here if needed
    };
    Enums: {
      // Define enums here if needed
    };
    CompositeTypes: {
      // Define composite types here if needed
    };
  };
}

// This export ensures the file is treated as a module.
export {};
