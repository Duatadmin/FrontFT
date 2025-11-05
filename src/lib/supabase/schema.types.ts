export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      _uids: {
        Row: {
          cf_video_uid: string | null
          exercise_id: string | null
        }
        Insert: {
          cf_video_uid?: string | null
          exercise_id?: string | null
        }
        Update: {
          cf_video_uid?: string | null
          exercise_id?: string | null
        }
        Relationships: []
      }
      backup_insert_func: {
        Row: {
          pg_get_functiondef: string | null
        }
        Insert: {
          pg_get_functiondef?: string | null
        }
        Update: {
          pg_get_functiondef?: string | null
        }
        Relationships: []
      }
      chat_history: {
        Row: {
          id: string
          message: string
          metadata: Json | null
          role: string
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          message: string
          metadata?: Json | null
          role: string
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          message?: string
          metadata?: Json | null
          role?: string
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      exrcwiki: {
        Row: {
          bodypart: string | null
          cf_video_uid: string | null
          compound: boolean | null
          cons: Json | null
          created_at: string | null
          embedding: string | null
          equipment: string
          equipment_category: string | null
          exercise_id: string
          final_comment: string | null
          gifurl: string | null
          glute_region: Json | null
          instructions: Json | null
          is_compound: boolean | null
          isolation: boolean | null
          key_muscles: Json | null
          maintarget: string | null
          muscle_group: string | null
          name: string
          pros: Json | null
          secondarymuscles: Json | null
          secondarytarget: string | null
          target: string
          tier: string | null
          tips: Json | null
          updated_at: string | null
        }
        Insert: {
          bodypart?: string | null
          cf_video_uid?: string | null
          compound?: boolean | null
          cons?: Json | null
          created_at?: string | null
          embedding?: string | null
          equipment: string
          equipment_category?: string | null
          exercise_id: string
          final_comment?: string | null
          gifurl?: string | null
          glute_region?: Json | null
          instructions?: Json | null
          is_compound?: boolean | null
          isolation?: boolean | null
          key_muscles?: Json | null
          maintarget?: string | null
          muscle_group?: string | null
          name: string
          pros?: Json | null
          secondarymuscles?: Json | null
          secondarytarget?: string | null
          target: string
          tier?: string | null
          tips?: Json | null
          updated_at?: string | null
        }
        Update: {
          bodypart?: string | null
          cf_video_uid?: string | null
          compound?: boolean | null
          cons?: Json | null
          created_at?: string | null
          embedding?: string | null
          equipment?: string
          equipment_category?: string | null
          exercise_id?: string
          final_comment?: string | null
          gifurl?: string | null
          glute_region?: Json | null
          instructions?: Json | null
          is_compound?: boolean | null
          isolation?: boolean | null
          key_muscles?: Json | null
          maintarget?: string | null
          muscle_group?: string | null
          name?: string
          pros?: Json | null
          secondarymuscles?: Json | null
          secondarytarget?: string | null
          target?: string
          tier?: string | null
          tips?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      exrcwiki_ai: {
        Row: {
          embedding: string | null
          equipment: string[] | null
          exercise_id: string
          is_compound: boolean | null
          maintarget: string
          muscle_group: string
          name: string
          tier: string | null
        }
        Insert: {
          embedding?: string | null
          equipment?: string[] | null
          exercise_id: string
          is_compound?: boolean | null
          maintarget: string
          muscle_group: string
          name: string
          tier?: string | null
        }
        Update: {
          embedding?: string | null
          equipment?: string[] | null
          exercise_id?: string
          is_compound?: boolean | null
          maintarget?: string
          muscle_group?: string
          name?: string
          tier?: string | null
        }
        Relationships: []
      }
      exrcwiki_copy_backup: {
        Row: {
          bodypart: string | null
          compound: boolean | null
          cons: Json | null
          created_at: string | null
          equipment: string | null
          exercise_id: string | null
          final_comment: string | null
          gifurl: string | null
          glute_region: Json | null
          instructions: Json | null
          is_compound: boolean | null
          isolation: boolean | null
          key_muscles: Json | null
          maintarget: string | null
          muscle_group: string | null
          name: string | null
          pros: Json | null
          secondarymuscles: Json | null
          secondarytarget: string | null
          target: string | null
          tier: string | null
          tips: Json | null
          updated_at: string | null
        }
        Insert: {
          bodypart?: string | null
          compound?: boolean | null
          cons?: Json | null
          created_at?: string | null
          equipment?: string | null
          exercise_id?: string | null
          final_comment?: string | null
          gifurl?: string | null
          glute_region?: Json | null
          instructions?: Json | null
          is_compound?: boolean | null
          isolation?: boolean | null
          key_muscles?: Json | null
          maintarget?: string | null
          muscle_group?: string | null
          name?: string | null
          pros?: Json | null
          secondarymuscles?: Json | null
          secondarytarget?: string | null
          target?: string | null
          tier?: string | null
          tips?: Json | null
          updated_at?: string | null
        }
        Update: {
          bodypart?: string | null
          compound?: boolean | null
          cons?: Json | null
          created_at?: string | null
          equipment?: string | null
          exercise_id?: string | null
          final_comment?: string | null
          gifurl?: string | null
          glute_region?: Json | null
          instructions?: Json | null
          is_compound?: boolean | null
          isolation?: boolean | null
          key_muscles?: Json | null
          maintarget?: string | null
          muscle_group?: string | null
          name?: string | null
          pros?: Json | null
          secondarymuscles?: Json | null
          secondarytarget?: string | null
          target?: string | null
          tier?: string | null
          tips?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      exrcwiki_duplicate: {
        Row: {
          bodypart: string | null
          compound: boolean | null
          cons: Json | null
          created_at: string | null
          embedding: string | null
          equipment: string
          exercise_id: string
          final_comment: string | null
          gifurl: string | null
          glute_region: Json | null
          instructions: Json | null
          is_compound: boolean | null
          isolation: boolean | null
          key_muscles: Json | null
          maintarget: string | null
          muscle_group: string | null
          name: string
          pros: Json | null
          secondarymuscles: Json | null
          secondarytarget: string | null
          target: string
          tier: string | null
          tips: Json | null
          updated_at: string | null
        }
        Insert: {
          bodypart?: string | null
          compound?: boolean | null
          cons?: Json | null
          created_at?: string | null
          embedding?: string | null
          equipment: string
          exercise_id: string
          final_comment?: string | null
          gifurl?: string | null
          glute_region?: Json | null
          instructions?: Json | null
          is_compound?: boolean | null
          isolation?: boolean | null
          key_muscles?: Json | null
          maintarget?: string | null
          muscle_group?: string | null
          name: string
          pros?: Json | null
          secondarymuscles?: Json | null
          secondarytarget?: string | null
          target: string
          tier?: string | null
          tips?: Json | null
          updated_at?: string | null
        }
        Update: {
          bodypart?: string | null
          compound?: boolean | null
          cons?: Json | null
          created_at?: string | null
          embedding?: string | null
          equipment?: string
          exercise_id?: string
          final_comment?: string | null
          gifurl?: string | null
          glute_region?: Json | null
          instructions?: Json | null
          is_compound?: boolean | null
          isolation?: boolean | null
          key_muscles?: Json | null
          maintarget?: string | null
          muscle_group?: string | null
          name?: string
          pros?: Json | null
          secondarymuscles?: Json | null
          secondarytarget?: string | null
          target?: string
          tier?: string | null
          tips?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      exrcwiki_duplicate_1: {
        Row: {
          bodypart: string | null
          compound: boolean | null
          cons: Json | null
          created_at: string | null
          embedding: string | null
          equipment: string
          exercise_id: string
          final_comment: string | null
          gifurl: string | null
          glute_region: Json | null
          instructions: Json | null
          is_compound: boolean | null
          isolation: boolean | null
          key_muscles: Json | null
          maintarget: string | null
          muscle_group: string | null
          name: string
          pros: Json | null
          secondarymuscles: Json | null
          secondarytarget: string | null
          target: string
          tier: string | null
          tips: Json | null
          updated_at: string | null
        }
        Insert: {
          bodypart?: string | null
          compound?: boolean | null
          cons?: Json | null
          created_at?: string | null
          embedding?: string | null
          equipment: string
          exercise_id: string
          final_comment?: string | null
          gifurl?: string | null
          glute_region?: Json | null
          instructions?: Json | null
          is_compound?: boolean | null
          isolation?: boolean | null
          key_muscles?: Json | null
          maintarget?: string | null
          muscle_group?: string | null
          name: string
          pros?: Json | null
          secondarymuscles?: Json | null
          secondarytarget?: string | null
          target: string
          tier?: string | null
          tips?: Json | null
          updated_at?: string | null
        }
        Update: {
          bodypart?: string | null
          compound?: boolean | null
          cons?: Json | null
          created_at?: string | null
          embedding?: string | null
          equipment?: string
          exercise_id?: string
          final_comment?: string | null
          gifurl?: string | null
          glute_region?: Json | null
          instructions?: Json | null
          is_compound?: boolean | null
          isolation?: boolean | null
          key_muscles?: Json | null
          maintarget?: string | null
          muscle_group?: string | null
          name?: string
          pros?: Json | null
          secondarymuscles?: Json | null
          secondarytarget?: string | null
          target?: string
          tier?: string | null
          tips?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meal_images: {
        Row: {
          analysis_date: string | null
          calories: number | null
          carbs_g: number | null
          cloudflare_id: string
          confidence: number | null
          confidence_score: number | null
          created_at: string | null
          daily_goal_pct: Json | null
          dish_id: string | null
          energy_kcal: number | null
          fat_g: number | null
          fiber_g: number | null
          file_size: number | null
          filename: string | null
          id: string
          image_url: string
          ingredients: Json | null
          macros: Json | null
          meal_name: string | null
          meal_type: string | null
          micros: Json | null
          mime_type: string | null
          name: string | null
          photo_url: string | null
          prep_time_min: number | null
          protein_g: number | null
          rating: number | null
          recipe_steps: string[] | null
          sodium_mg: number | null
          sugar_g: number | null
          tagline: string | null
          user_id: string
        }
        Insert: {
          analysis_date?: string | null
          calories?: number | null
          carbs_g?: number | null
          cloudflare_id: string
          confidence?: number | null
          confidence_score?: number | null
          created_at?: string | null
          daily_goal_pct?: Json | null
          dish_id?: string | null
          energy_kcal?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          file_size?: number | null
          filename?: string | null
          id?: string
          image_url: string
          ingredients?: Json | null
          macros?: Json | null
          meal_name?: string | null
          meal_type?: string | null
          micros?: Json | null
          mime_type?: string | null
          name?: string | null
          photo_url?: string | null
          prep_time_min?: number | null
          protein_g?: number | null
          rating?: number | null
          recipe_steps?: string[] | null
          sodium_mg?: number | null
          sugar_g?: number | null
          tagline?: string | null
          user_id: string
        }
        Update: {
          analysis_date?: string | null
          calories?: number | null
          carbs_g?: number | null
          cloudflare_id?: string
          confidence?: number | null
          confidence_score?: number | null
          created_at?: string | null
          daily_goal_pct?: Json | null
          dish_id?: string | null
          energy_kcal?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          file_size?: number | null
          filename?: string | null
          id?: string
          image_url?: string
          ingredients?: Json | null
          macros?: Json | null
          meal_name?: string | null
          meal_type?: string | null
          micros?: Json | null
          mime_type?: string | null
          name?: string | null
          photo_url?: string | null
          prep_time_min?: number | null
          protein_g?: number | null
          rating?: number | null
          recipe_steps?: string[] | null
          sodium_mg?: number | null
          sugar_g?: number | null
          tagline?: string | null
          user_id?: string
        }
        Relationships: []
      }
      modular_training_exercise: {
        Row: {
          actual_reps: Json | null
          created_at: string | null
          difficulty: number | null
          display_order: number
          equipment: string
          exercise_id: string | null
          exercise_name: string
          id: string
          instructions: string | null
          muscle_group: string
          notes: string | null
          order_in_session: number
          recomended_weight: number | null
          reps: string
          rir: number
          secondary_muscles: Json | null
          session_id: string
          sets: number
          target: string | null
          tier: string
          tips: Json | null
          weight: number | null
        }
        Insert: {
          actual_reps?: Json | null
          created_at?: string | null
          difficulty?: number | null
          display_order?: number
          equipment: string
          exercise_id?: string | null
          exercise_name: string
          id?: string
          instructions?: string | null
          muscle_group: string
          notes?: string | null
          order_in_session?: number
          recomended_weight?: number | null
          reps: string
          rir?: number
          secondary_muscles?: Json | null
          session_id: string
          sets: number
          target?: string | null
          tier: string
          tips?: Json | null
          weight?: number | null
        }
        Update: {
          actual_reps?: Json | null
          created_at?: string | null
          difficulty?: number | null
          display_order?: number
          equipment?: string
          exercise_id?: string | null
          exercise_name?: string
          id?: string
          instructions?: string | null
          muscle_group?: string
          notes?: string | null
          order_in_session?: number
          recomended_weight?: number | null
          reps?: string
          rir?: number
          secondary_muscles?: Json | null
          session_id?: string
          sets?: number
          target?: string | null
          tier?: string
          tips?: Json | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "modular_training_exercise_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exrcwiki"
            referencedColumns: ["exercise_id"]
          },
          {
            foreignKeyName: "modular_training_exercise_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "glute_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modular_training_exercise_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "tier_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modular_training_exercise_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "modular_training_session"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modular_training_exercise_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_full_view"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "modular_training_exercise_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "workout_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      modular_training_plan: {
        Row: {
          adherence_rate: number | null
          avg_difficulty: number | null
          created_at: string | null
          goal: string
          id: string
          level: string
          notes: string | null
          plan_id: string | null
          session_quantity: number | null
          split_type: string
          status: string
          user_id: string
          version: number
          week_start: string
        }
        Insert: {
          adherence_rate?: number | null
          avg_difficulty?: number | null
          created_at?: string | null
          goal?: string
          id?: string
          level?: string
          notes?: string | null
          plan_id?: string | null
          session_quantity?: number | null
          split_type: string
          status?: string
          user_id: string
          version?: number
          week_start: string
        }
        Update: {
          adherence_rate?: number | null
          avg_difficulty?: number | null
          created_at?: string | null
          goal?: string
          id?: string
          level?: string
          notes?: string | null
          plan_id?: string | null
          session_quantity?: number | null
          split_type?: string
          status?: string
          user_id?: string
          version?: number
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "modular_training_plan_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      modular_training_session: {
        Row: {
          completed: boolean
          completed_exercises: Json | null
          created_at: string | null
          day_label: string
          day_of_week: string
          duration_minutes: number | null
          focus_area: string
          id: string
          metrics: Json | null
          notes: string | null
          overall_difficulty: number | null
          previous_session: number | null
          session_date: string
          session_details: Json | null
          session_number: number
          session_state: Json | null
          updated_at: string | null
          week_id: string
        }
        Insert: {
          completed?: boolean
          completed_exercises?: Json | null
          created_at?: string | null
          day_label: string
          day_of_week: string
          duration_minutes?: number | null
          focus_area: string
          id?: string
          metrics?: Json | null
          notes?: string | null
          overall_difficulty?: number | null
          previous_session?: number | null
          session_date: string
          session_details?: Json | null
          session_number?: number
          session_state?: Json | null
          updated_at?: string | null
          week_id: string
        }
        Update: {
          completed?: boolean
          completed_exercises?: Json | null
          created_at?: string | null
          day_label?: string
          day_of_week?: string
          duration_minutes?: number | null
          focus_area?: string
          id?: string
          metrics?: Json | null
          notes?: string | null
          overall_difficulty?: number | null
          previous_session?: number | null
          session_date?: string
          session_details?: Json | null
          session_number?: number
          session_state?: Json | null
          updated_at?: string | null
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "modular_training_session_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "modular_training_week"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modular_training_session_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "workout_full_view"
            referencedColumns: ["week_id"]
          },
        ]
      }
      modular_training_set: {
        Row: {
          created_at: string | null
          exercise_row_id: string | null
          id: string
          notes: string | null
          recorded_at: string
          reps_done: number | null
          rest_seconds: number | null
          rpe: number | null
          set_no: number | null
          tempo: string | null
          weight_kg: number | null
        }
        Insert: {
          created_at?: string | null
          exercise_row_id?: string | null
          id?: string
          notes?: string | null
          recorded_at?: string
          reps_done?: number | null
          rest_seconds?: number | null
          rpe?: number | null
          set_no?: number | null
          tempo?: string | null
          weight_kg?: number | null
        }
        Update: {
          created_at?: string | null
          exercise_row_id?: string | null
          id?: string
          notes?: string | null
          recorded_at?: string
          reps_done?: number | null
          rest_seconds?: number | null
          rpe?: number | null
          set_no?: number | null
          tempo?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "modular_training_set_exercise_row_id_fkey"
            columns: ["exercise_row_id"]
            isOneToOne: false
            referencedRelation: "modular_training_exercise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modular_training_set_exercise_row_id_fkey"
            columns: ["exercise_row_id"]
            isOneToOne: false
            referencedRelation: "workout_full_view"
            referencedColumns: ["exercise_row_id"]
          },
        ]
      }
      modular_training_week: {
        Row: {
          created_at: string | null
          id: string
          plan_id: string
          week_number: number
          week_start: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          plan_id: string
          week_number: number
          week_start: string
        }
        Update: {
          created_at?: string | null
          id?: string
          plan_id?: string
          week_number?: number
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "modular_training_week_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "modular_training_plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modular_training_week_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_full_view"
            referencedColumns: ["plan_id"]
          },
        ]
      }
      muscle_group_rep_ranges: {
        Row: {
          created_at: string | null
          goal: string
          id: string
          muscle_group: string
          rep_range: string
          tempo: string
        }
        Insert: {
          created_at?: string | null
          goal: string
          id?: string
          muscle_group: string
          rep_range: string
          tempo: string
        }
        Update: {
          created_at?: string | null
          goal?: string
          id?: string
          muscle_group?: string
          rep_range?: string
          tempo?: string
        }
        Relationships: []
      }
      muscle_group_rep_ranges_v2: {
        Row: {
          exercise_type: string
          experience_level: string
          goal_type: string
          id: number
          muscle_group: string
          reps_per_set: string | null
          rest_period: string | null
          tempo: string | null
        }
        Insert: {
          exercise_type: string
          experience_level: string
          goal_type: string
          id?: number
          muscle_group: string
          reps_per_set?: string | null
          rest_period?: string | null
          tempo?: string | null
        }
        Update: {
          exercise_type?: string
          experience_level?: string
          goal_type?: string
          id?: number
          muscle_group?: string
          reps_per_set?: string | null
          rest_period?: string | null
          tempo?: string | null
        }
        Relationships: []
      }
      muscle_group_rep_ranges_v3: {
        Row: {
          exercise_type: string | null
          goal: string | null
          id: number
          is_compound: boolean | null
          key_rationale: string | null
          level: string | null
          muscle_group: string | null
          reps_per_set: string | null
          rest_period: string | null
          tempo: string | null
        }
        Insert: {
          exercise_type?: string | null
          goal?: string | null
          id?: number
          is_compound?: boolean | null
          key_rationale?: string | null
          level?: string | null
          muscle_group?: string | null
          reps_per_set?: string | null
          rest_period?: string | null
          tempo?: string | null
        }
        Update: {
          exercise_type?: string | null
          goal?: string | null
          id?: number
          is_compound?: boolean | null
          key_rationale?: string | null
          level?: string | null
          muscle_group?: string | null
          reps_per_set?: string | null
          rest_period?: string | null
          tempo?: string | null
        }
        Relationships: []
      }
      plan_change_log: {
        Row: {
          change_type: string
          created_at: string | null
          id: string
          payload: Json
          plan_id: string | null
        }
        Insert: {
          change_type: string
          created_at?: string | null
          id?: string
          payload: Json
          plan_id?: string | null
        }
        Update: {
          change_type?: string
          created_at?: string | null
          id?: string
          payload?: Json
          plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_change_log_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "modular_training_plan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_change_log_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_full_view"
            referencedColumns: ["plan_id"]
          },
        ]
      }
      stripe_customers: {
        Row: {
          billing_address: Json | null
          created_at: string | null
          default_pm: Json | null
          stripe_customer_id: string | null
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string | null
          default_pm?: Json | null
          stripe_customer_id?: string | null
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string | null
          default_pm?: Json | null
          stripe_customer_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      stripe_prices: {
        Row: {
          active: boolean | null
          currency: string | null
          description: string | null
          id: string
          interval: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count: number | null
          metadata: Json | null
          product_id: string | null
          trial_period_days: number | null
          type: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount: number | null
        }
        Insert: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Update: {
          active?: boolean | null
          currency?: string | null
          description?: string | null
          id?: string
          interval?: Database["public"]["Enums"]["pricing_plan_interval"] | null
          interval_count?: number | null
          metadata?: Json | null
          product_id?: string | null
          trial_period_days?: number | null
          type?: Database["public"]["Enums"]["pricing_type"] | null
          unit_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stripe_products"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_products: {
        Row: {
          active: boolean | null
          description: string | null
          id: string
          image: string | null
          metadata: Json | null
          name: string | null
        }
        Insert: {
          active?: boolean | null
          description?: string | null
          id: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Update: {
          active?: boolean | null
          description?: string | null
          id?: string
          image?: string | null
          metadata?: Json | null
          name?: string | null
        }
        Relationships: []
      }
      stripe_subscriptions: {
        Row: {
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created: string
          current_period_end: string
          current_period_start: string
          ended_at: string | null
          id: string
          metadata: Json | null
          price_id: string | null
          quantity: number | null
          status: string | null
          trial_end: string | null
          trial_start: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: string | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created?: string
          current_period_end?: string
          current_period_start?: string
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          price_id?: string | null
          quantity?: number | null
          status?: string | null
          trial_end?: string | null
          trial_start?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_subscriptions_price_id_fkey"
            columns: ["price_id"]
            isOneToOne: false
            referencedRelation: "stripe_prices"
            referencedColumns: ["id"]
          },
        ]
      }
      training_plan_skeletons: {
        Row: {
          available_days_per_week: number
          created_at: string | null
          experience_level: string
          goal_type: string
          id: string
          skeleton_json: Json
          split_type: string
          user_id: string
        }
        Insert: {
          available_days_per_week: number
          created_at?: string | null
          experience_level: string
          goal_type: string
          id?: string
          skeleton_json: Json
          split_type: string
          user_id: string
        }
        Update: {
          available_days_per_week?: number
          created_at?: string | null
          experience_level?: string
          goal_type?: string
          id?: string
          skeleton_json?: Json
          split_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_plan_skeletons_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      training_set: {
        Row: {
          exercise_row_id: string
          id: string
          recorded_at: string
          reps_done: number
          rpe: number | null
          set_no: number
          weight_kg: number
        }
        Insert: {
          exercise_row_id: string
          id?: string
          recorded_at?: string
          reps_done: number
          rpe?: number | null
          set_no: number
          weight_kg: number
        }
        Update: {
          exercise_row_id?: string
          id?: string
          recorded_at?: string
          reps_done?: number
          rpe?: number | null
          set_no?: number
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_set_exercise_row_id_fkey"
            columns: ["exercise_row_id"]
            isOneToOne: false
            referencedRelation: "modular_training_exercise"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_set_exercise_row_id_fkey"
            columns: ["exercise_row_id"]
            isOneToOne: false
            referencedRelation: "workout_full_view"
            referencedColumns: ["exercise_row_id"]
          },
        ]
      }
      training_splits: {
        Row: {
          coefficients: number[]
          created_at: string | null
          days: string[]
          description: string | null
          id: string
          muscle_group: string | null
          split_type: string
          updated_at: string | null
        }
        Insert: {
          coefficients?: number[]
          created_at?: string | null
          days: string[]
          description?: string | null
          id?: string
          muscle_group?: string | null
          split_type: string
          updated_at?: string | null
        }
        Update: {
          coefficients?: number[]
          created_at?: string | null
          days?: string[]
          description?: string | null
          id?: string
          muscle_group?: string | null
          split_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      training_volume_standards: {
        Row: {
          avg_sets: number | null
          created_at: string | null
          experience_level: string
          goal_type: string
          id: string
          max_sets: number
          min_sets: number
          muscle_group: string
          split_type: string
          updated_at: string | null
        }
        Insert: {
          avg_sets?: number | null
          created_at?: string | null
          experience_level: string
          goal_type: string
          id?: string
          max_sets?: number
          min_sets?: number
          muscle_group: string
          split_type: string
          updated_at?: string | null
        }
        Update: {
          avg_sets?: number | null
          created_at?: string | null
          experience_level?: string
          goal_type?: string
          id?: string
          max_sets?: number
          min_sets?: number
          muscle_group?: string
          split_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          active_plan_id: string | null
          active_session_id: string | null
          age: number | null
          available_days_per_week: number | null
          baseline_capacity: string | null
          created_at: string
          current_agent_id: number | null
          equipment: string | null
          goal: string | null
          goal_detail: string | null
          goal_timeline_weeks: number | null
          height_cm: number | null
          id: string
          injuries: string | null
          level: string | null
          location: string | null
          onboarding_complete: boolean
          plan_feedback_state: string | null
          preferences: Json | null
          preferred_days: string | null
          raw_onboarding_answers: Json | null
          session_duration_minutes: number | null
          sex: string | null
          sleep_hours_normalized: number | null
          split_preference: string | null
          updated_at: string
          used_exercises: string | null
          user_banned_exrc_id: string | null
          user_name: string | null
          weight_kg: number | null
        }
        Insert: {
          active_plan_id?: string | null
          active_session_id?: string | null
          age?: number | null
          available_days_per_week?: number | null
          baseline_capacity?: string | null
          created_at?: string
          current_agent_id?: number | null
          equipment?: string | null
          goal?: string | null
          goal_detail?: string | null
          goal_timeline_weeks?: number | null
          height_cm?: number | null
          id?: string
          injuries?: string | null
          level?: string | null
          location?: string | null
          onboarding_complete?: boolean
          plan_feedback_state?: string | null
          preferences?: Json | null
          preferred_days?: string | null
          raw_onboarding_answers?: Json | null
          session_duration_minutes?: number | null
          sex?: string | null
          sleep_hours_normalized?: number | null
          split_preference?: string | null
          updated_at?: string
          used_exercises?: string | null
          user_banned_exrc_id?: string | null
          user_name?: string | null
          weight_kg?: number | null
        }
        Update: {
          active_plan_id?: string | null
          active_session_id?: string | null
          age?: number | null
          available_days_per_week?: number | null
          baseline_capacity?: string | null
          created_at?: string
          current_agent_id?: number | null
          equipment?: string | null
          goal?: string | null
          goal_detail?: string | null
          goal_timeline_weeks?: number | null
          height_cm?: number | null
          id?: string
          injuries?: string | null
          level?: string | null
          location?: string | null
          onboarding_complete?: boolean
          plan_feedback_state?: string | null
          preferences?: Json | null
          preferred_days?: string | null
          raw_onboarding_answers?: Json | null
          session_duration_minutes?: number | null
          sex?: string | null
          sleep_hours_normalized?: number | null
          split_preference?: string | null
          updated_at?: string
          used_exercises?: string | null
          user_banned_exrc_id?: string | null
          user_name?: string | null
          weight_kg?: number | null
        }
        Relationships: []
      }
      volume_distribution_matrix: {
        Row: {
          compound_max_sets: number
          compound_min_sets: number
          compound_pct: number
          experience_level: string
          goal_type: string
          id: number
          isolation_max_sets: number
          isolation_min_sets: number
          isolation_pct: number
          muscle_group: string
        }
        Insert: {
          compound_max_sets: number
          compound_min_sets: number
          compound_pct: number
          experience_level: string
          goal_type: string
          id?: number
          isolation_max_sets: number
          isolation_min_sets: number
          isolation_pct: number
          muscle_group: string
        }
        Update: {
          compound_max_sets?: number
          compound_min_sets?: number
          compound_pct?: number
          experience_level?: string
          goal_type?: string
          id?: number
          isolation_max_sets?: number
          isolation_min_sets?: number
          isolation_pct?: number
          muscle_group?: string
        }
        Relationships: []
      }
      workout_sessions_legacy_20250527: {
        Row: {
          completed_at: string | null
          completed_exercises: Json | null
          created_at: string | null
          current_exercise_index: number | null
          exercises_completed: number | null
          feedback: string | null
          focus_area: string | null
          id: string
          metadata: Json | null
          metrics: Json | null
          session_details: Json | null
          session_state: Json | null
          status: string
          total_volume_kg: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_exercises?: Json | null
          created_at?: string | null
          current_exercise_index?: number | null
          exercises_completed?: number | null
          feedback?: string | null
          focus_area?: string | null
          id: string
          metadata?: Json | null
          metrics?: Json | null
          session_details?: Json | null
          session_state?: Json | null
          status?: string
          total_volume_kg?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_exercises?: Json | null
          created_at?: string | null
          current_exercise_index?: number | null
          exercises_completed?: number | null
          feedback?: string | null
          focus_area?: string | null
          id?: string
          metadata?: Json | null
          metrics?: Json | null
          session_details?: Json | null
          session_state?: Json | null
          status?: string
          total_volume_kg?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      glute_exercises: {
        Row: {
          equipment: string | null
          glute_region: Json | null
          id: string | null
          key_muscles: Json | null
          name: string | null
          target: string | null
          tier: string | null
        }
        Insert: {
          equipment?: string | null
          glute_region?: Json | null
          id?: string | null
          key_muscles?: Json | null
          name?: string | null
          target?: string | null
          tier?: string | null
        }
        Update: {
          equipment?: string | null
          glute_region?: Json | null
          id?: string | null
          key_muscles?: Json | null
          name?: string | null
          target?: string | null
          tier?: string | null
        }
        Relationships: []
      }
      musclegroup_exercises: {
        Row: {
          equipment_types: string[] | null
          exercise_count: number | null
          musclegroup: string | null
          targets: string[] | null
        }
        Relationships: []
      }
      mv_weekly_kpi: {
        Row: {
          prs: number | null
          user_id: string | null
          volume: number | null
          week: string | null
        }
        Relationships: []
      }
      tier_exercises: {
        Row: {
          bodypart: string | null
          equipment: string | null
          id: string | null
          name: string | null
          target: string | null
          tier: string | null
        }
        Insert: {
          bodypart?: string | null
          equipment?: string | null
          id?: string | null
          name?: string | null
          target?: string | null
          tier?: string | null
        }
        Update: {
          bodypart?: string | null
          equipment?: string | null
          id?: string | null
          name?: string | null
          target?: string | null
          tier?: string | null
        }
        Relationships: []
      }
      v_active_users: {
        Row: {
          user_id: string | null
        }
        Insert: {
          user_id?: string | null
        }
        Update: {
          user_id?: string | null
        }
        Relationships: []
      }
      workout_full_view: {
        Row: {
          day_label: string | null
          day_of_week: string | null
          duration_minutes: number | null
          equipment: string | null
          exercise_id: string | null
          exercise_name: string | null
          exercise_row_id: string | null
          focus_area: string | null
          goal: string | null
          level: string | null
          muscle_group: string | null
          order_in_session: number | null
          overall_difficulty: number | null
          plan_id: string | null
          plan_status: string | null
          recorded_at: string | null
          rep_scheme: string | null
          reps_done: number | null
          rir: number | null
          rpe: number | null
          session_completed: boolean | null
          session_date: string | null
          session_id: string | null
          session_number: number | null
          session_state: Json | null
          set_id: string | null
          set_no: number | null
          sets_planned: number | null
          split_type: string | null
          tier: string | null
          user_id: string | null
          week_id: string | null
          week_number: number | null
          week_start: string | null
          week_start_date: string | null
          weight_kg: number | null
        }
        Relationships: [
          {
            foreignKeyName: "modular_training_exercise_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exrcwiki"
            referencedColumns: ["exercise_id"]
          },
          {
            foreignKeyName: "modular_training_exercise_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "glute_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modular_training_exercise_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "tier_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "modular_training_plan_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_sessions: {
        Row: {
          created_at: string | null
          day_of_week: string | null
          focus_area: string | null
          id: string | null
          metrics: Json | null
          phase: string | null
          session_date: string | null
          session_number: number | null
          session_state: Json | null
          status: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modular_training_plan_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      binary_quantize: {
        Args: { "": string } | { "": unknown }
        Returns: unknown
      }
      delete_modular_training_exercise: {
        Args: { p_id: string }
        Returns: string
      }
      delete_modular_training_plan: {
        Args: { p_id: string }
        Returns: string
      }
      delete_modular_training_session: {
        Args: { p_id: string }
        Returns: string
      }
      delete_modular_training_week: {
        Args: { p_id: string }
        Returns: string
      }
      get_full_plan_preview: {
        Args: { p_plan_id: string }
        Returns: Json
      }
      halfvec_avg: {
        Args: { "": number[] }
        Returns: unknown
      }
      halfvec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      halfvec_send: {
        Args: { "": unknown }
        Returns: string
      }
      halfvec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      hnsw_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnsw_sparsevec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      hnswhandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      insert_full_plan: {
        Args: { p_user_id: string; p_plan_json: Json }
        Returns: string
      }
      insert_modular_training_exercise: {
        Args: {
          p_session_id: string
          p_exercise_id: string
          p_sets: number
          p_reps: string
          p_equipment?: string
          p_order?: number
        }
        Returns: string
      }
      insert_modular_training_plan: {
        Args: {
          p_user_id: string
          p_split_type: string
          p_week_start: string
          p_version?: number
          p_status?: string
          p_goal_type?: string
          p_experience_level?: string
          p_notes?: string
        }
        Returns: string
      }
      insert_modular_training_plan_with_week: {
        Args: {
          p_user_id: string
          p_split_type: string
          p_week_start: string
          p_version?: number
          p_status?: string
          p_goal_type?: string
          p_experience_level?: string
          p_notes?: string
        }
        Returns: string
      }
      insert_modular_training_session_with_exercises: {
        Args: {
          p_week_id: string
          p_day_label: string
          p_session_date: string
          p_day_of_week: string
          p_focus_area: string
          p_exercises?: Json
        }
        Returns: string
      }
      insert_multiple_training_weeks: {
        Args: { p_plan_id: string; p_week_start_dates: Json }
        Returns: string[]
      }
      insert_new_week_for_plan: {
        Args: { p_plan_id: string; p_week_json: Json }
        Returns: string
      }
      insert_training_exercise: {
        Args: {
          p_session_id: string
          p_name: string
          p_musclegroup: string
          p_sets: number
          p_reps: string
          p_equipment: string
          p_tier: string
          p_display_order?: number
          p_rir?: number
          p_target?: string
          p_secondary_muscles?: Json
          p_tips?: Json
          p_instructions?: string
          p_weight?: number
          p_actual_reps?: Json
          p_difficulty?: number
          p_notes?: string
        }
        Returns: string
      }
      insert_training_plan: {
        Args: {
          p_user_id: string
          p_split_type: string
          p_week_start: string
          p_version?: number
          p_status?: string
          p_goal_type?: string
          p_experience_level?: string
          p_notes?: string
          p_plan_id?: string
        }
        Returns: string
      }
      insert_training_session: {
        Args: {
          p_week_id: string
          p_day_label: string
          p_session_date: string
          p_day_of_week: string
          p_focus_area: string
          p_completed?: boolean
          p_session_number?: number
          p_duration_minutes?: number
          p_overall_difficulty?: number
          p_notes?: string
        }
        Returns: string
      }
      insert_training_week: {
        Args: { p_plan_id: string; p_week_number: number; p_week_start: string }
        Returns: string
      }
      is_subscription_active: {
        Args: { p_uid: string }
        Returns: boolean
      }
      ivfflat_bit_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflat_halfvec_support: {
        Args: { "": unknown }
        Returns: unknown
      }
      ivfflathandler: {
        Args: { "": unknown }
        Returns: unknown
      }
      l2_norm: {
        Args: { "": unknown } | { "": unknown }
        Returns: number
      }
      l2_normalize: {
        Args: { "": string } | { "": unknown } | { "": unknown }
        Returns: unknown
      }
      replicate_latest_week_for_plan: {
        Args: { p_plan_id: string }
        Returns: string
      }
      sparsevec_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      sparsevec_send: {
        Args: { "": unknown }
        Returns: string
      }
      sparsevec_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
      update_modular_training_exercise: {
        Args: {
          p_id: string
          p_session_id?: string
          p_exercise_catalog_id?: string
          p_exercise_name?: string
          p_sets?: number
          p_reps?: string
          p_rest_period_seconds?: number
          p_rpe?: number
          p_notes?: string
          p_order_in_session?: number
        }
        Returns: string
      }
      update_modular_training_plan: {
        Args: {
          p_id: string
          p_name?: string
          p_description?: string
          p_start_date?: string
          p_end_date?: string
          p_status?: string
        }
        Returns: string
      }
      update_modular_training_session: {
        Args: {
          p_id: string
          p_week_id?: string
          p_day_of_week?: number
          p_name?: string
          p_description?: string
          p_status?: string
        }
        Returns: string
      }
      update_modular_training_week: {
        Args: {
          p_id: string
          p_plan_id?: string
          p_week_number?: number
          p_start_date?: string
          p_end_date?: string
          p_notes?: string
        }
        Returns: string
      }
      vector_avg: {
        Args: { "": number[] }
        Returns: string
      }
      vector_dims: {
        Args: { "": string } | { "": unknown }
        Returns: number
      }
      vector_norm: {
        Args: { "": string }
        Returns: number
      }
      vector_out: {
        Args: { "": string }
        Returns: unknown
      }
      vector_send: {
        Args: { "": string }
        Returns: string
      }
      vector_typmod_in: {
        Args: { "": unknown[] }
        Returns: number
      }
    }
    Enums: {
      pricing_plan_interval: "day" | "week" | "month" | "year"
      pricing_type: "one_time" | "recurring"
      subscription_status:
        | "trialing"
        | "active"
        | "canceled"
        | "incomplete"
        | "incomplete_expired"
        | "past_due"
        | "unpaid"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      pricing_plan_interval: ["day", "week", "month", "year"],
      pricing_type: ["one_time", "recurring"],
      subscription_status: [
        "trialing",
        "active",
        "canceled",
        "incomplete",
        "incomplete_expired",
        "past_due",
        "unpaid",
      ],
    },
  },
} as const
