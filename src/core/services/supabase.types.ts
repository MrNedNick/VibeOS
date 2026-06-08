/**
 * Supabase database type definitions
 *
 * Manually maintained until supabase CLI type generation is set up.
 * Run: npx supabase gen types typescript --project-id <id> > src/core/services/supabase.types.ts
 * to replace this with auto-generated types once the project is created.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: 'todo' | 'in_progress' | 'done'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          category: 'work' | 'learning' | 'training' | 'personal' | 'goal' | null
          due_date: string | null
          linked_goal_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          frequency: 'daily' | 'weekdays' | 'weekends' | 'custom'
          color: string | null
          icon: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['habits']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['habits']['Insert']>
      }
      habit_logs: {
        Row: {
          id: string
          user_id: string
          habit_id: string
          date: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['habit_logs']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['habit_logs']['Insert']>
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: 'career' | 'health' | 'skill' | 'personal' | 'financial'
          target_date: string | null
          progress: number
          status: 'active' | 'completed' | 'paused'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['goals']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['goals']['Insert']>
      }
      milestones: {
        Row: {
          id: string
          user_id: string
          goal_id: string
          title: string
          done: boolean
          order: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['milestones']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['milestones']['Insert']>
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string | null
          pinned: boolean
          type: 'note' | 'plan' | 'idea' | 'journal' | 'learning' | 'training' | 'reference' | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['notes']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['notes']['Insert']>
      }
      learning_plans: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          target_hours: number
          sessions_per_week: number
          status: 'active' | 'completed' | 'paused'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['learning_plans']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['learning_plans']['Insert']>
      }
      learning_sessions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          date: string
          duration_min: number
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['learning_sessions']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['learning_sessions']['Insert']>
      }
      training_plans: {
        Row: {
          id: string
          user_id: string
          title: string
          sport: string
          sessions_per_week: number
          goal_description: string | null
          status: 'active' | 'completed' | 'paused'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['training_plans']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['training_plans']['Insert']>
      }
      training_logs: {
        Row: {
          id: string
          user_id: string
          plan_id: string | null
          date: string
          duration_min: number
          distance_km: number | null
          notes: string | null
          feeling: 1 | 2 | 3 | 4 | 5 | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['training_logs']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['training_logs']['Insert']>
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          theme: string | null
          locale: string | null
          openweather_city: string | null
          subscription_tier: 'free' | 'demo' | 'pro'
          settings_json: Json | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_settings']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_settings']['Insert']>
      }
      analytics_events: {
        Row: {
          id: string
          user_id: string
          type: string
          module: string | null
          feature: string | null
          session_id: string | null
          timestamp: string
          payload: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['analytics_events']['Row'], 'id' | 'created_at'>
        Update: never
      }
      feedback_entries: {
        Row: {
          id: string
          user_id: string
          score: number
          comment: string | null
          timestamp: string
          session_id: string | null
          app_version: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['feedback_entries']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
