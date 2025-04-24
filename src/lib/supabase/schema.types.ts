/**
 * Supabase Database Schema Types
 * 
 * This file defines the type structure for all database tables and their relationships.
 * Use these types for all interactions with Supabase to ensure type safety.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          nickname: string;
          email?: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          nickname: string;
          email?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          nickname?: string;
          email?: string;
        };
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          status: 'active' | 'completed';
          focus_area: string;
          completed_exercises: Json;
          metrics: Json;
          created_at: string;
          updated_at: string;
          completed_at?: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          status?: 'active' | 'completed';
          focus_area: string;
          completed_exercises?: Json;
          metrics?: Json;
          created_at?: string;
          updated_at?: string;
          completed_at?: string;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          status?: 'active' | 'completed';
          focus_area?: string;
          completed_exercises?: Json;
          metrics?: Json;
          created_at?: string;
          updated_at?: string;
          completed_at?: string;
          metadata?: Json;
        };
      };
      training_plans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          days: Json;
          start_date: string;
          end_date?: string;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          days?: Json;
          start_date: string;
          end_date?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          days?: Json;
          start_date?: string;
          end_date?: string;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description?: string;
          target_value: number;
          current_value: number;
          unit: string;
          category: 'strength' | 'endurance' | 'weight' | 'habit' | 'other';
          deadline: string;
          created_at: string;
          status: 'not_started' | 'in_progress' | 'completed' | 'failed';
          completed_at?: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          target_value: number;
          current_value: number;
          unit: string;
          category?: 'strength' | 'endurance' | 'weight' | 'habit' | 'other';
          deadline: string;
          created_at?: string;
          status?: 'not_started' | 'in_progress' | 'completed' | 'failed';
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          target_value?: number;
          current_value?: number;
          unit?: string;
          category?: 'strength' | 'endurance' | 'weight' | 'habit' | 'other';
          deadline?: string;
          created_at?: string;
          status?: 'not_started' | 'in_progress' | 'completed' | 'failed';
          completed_at?: string;
        };
      };
      progress_photos: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          caption?: string;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          caption?: string;
          date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          url?: string;
          caption?: string;
          date?: string;
          created_at?: string;
        };
      };
      weekly_reflections: {
        Row: {
          id: string;
          user_id: string;
          week_start_date: string;
          week_end_date: string;
          planned_sessions: number;
          completed_sessions: number;
          total_volume: number;
          new_prs: number;
          cardio_minutes: number;
          avg_mood: number;
          avg_sleep: number;
          avg_soreness: number;
          challenges: Json;
          wins: Json;
          next_week_focus: string;
          next_week_session_target: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_start_date: string;
          week_end_date: string;
          planned_sessions: number;
          completed_sessions: number;
          total_volume?: number;
          new_prs?: number;
          cardio_minutes?: number;
          avg_mood?: number;
          avg_sleep?: number;
          avg_soreness?: number;
          challenges?: Json;
          wins?: Json;
          next_week_focus?: string;
          next_week_session_target?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_start_date?: string;
          week_end_date?: string;
          planned_sessions?: number;
          completed_sessions?: number;
          total_volume?: number;
          new_prs?: number;
          cardio_minutes?: number;
          avg_mood?: number;
          avg_sleep?: number;
          avg_soreness?: number;
          challenges?: Json;
          wins?: Json;
          next_week_focus?: string;
          next_week_session_target?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Export focused type definitions for ease of use throughout the app
export type User = Database['public']['Tables']['users']['Row'];
export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row'];
export type TrainingPlan = Database['public']['Tables']['training_plans']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type ProgressPhoto = Database['public']['Tables']['progress_photos']['Row'];
export type WeeklyReflection = Database['public']['Tables']['weekly_reflections']['Row'];

// Types for JSONB fields
export interface CompletedExercise {
  set_number: number;
  reps: number;
  weight: number;
  rpe?: number;
}

export interface WorkoutMetrics {
  start_time: string;
  end_time?: string;
  total_duration_minutes: number;
  total_volume: number;
}

export interface WorkoutMetadata {
  source: 'custom' | 'plan';
  plan_id?: string;
  is_deload: boolean;
  overall_difficulty?: number;
}
