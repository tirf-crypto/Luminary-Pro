export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          biological_sex: string | null;
          wake_time: string | null;
          work_start: string | null;
          work_end: string | null;
          training_preference: string | null;
          personas: string[] | null;
          goals: string[] | null;
          why: string | null;
          currency: string;
          onboarding_completed: boolean;
          streak: number;
          settings: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          biological_sex?: string | null;
          wake_time?: string | null;
          work_start?: string | null;
          work_end?: string | null;
          training_preference?: string | null;
          personas?: string[] | null;
          goals?: string[] | null;
          why?: string | null;
          currency?: string;
          onboarding_completed?: boolean;
          streak?: number;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          biological_sex?: string | null;
          wake_time?: string | null;
          work_start?: string | null;
          work_end?: string | null;
          training_preference?: string | null;
          personas?: string[] | null;
          goals?: string[] | null;
          why?: string | null;
          currency?: string;
          onboarding_completed?: boolean;
          streak?: number;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      daily_checkins: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          energy: number;
          clarity: number;
          body: number;
          mood: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          energy: number;
          clarity: number;
          body: number;
          mood: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          energy?: number;
          clarity?: number;
          body?: number;
          mood?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      hybrid_day_plans: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          word: string;
          completion_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          word?: string;
          completion_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          word?: string;
          completion_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      day_blocks: {
        Row: {
          id: string;
          plan_id: string;
          name: string;
          start_time: string;
          end_time: string;
          type: string;
          color: string | null;
          activities: string[] | null;
          completion_percentage: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          plan_id: string;
          name: string;
          start_time: string;
          end_time: string;
          type: string;
          color?: string | null;
          activities?: string[] | null;
          completion_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          plan_id?: string;
          name?: string;
          start_time?: string;
          end_time?: string;
          type?: string;
          color?: string | null;
          activities?: string[] | null;
          completion_percentage?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          frequency: string;
          streak: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          frequency?: string;
          streak?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          frequency?: string;
          streak?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      habit_completions: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          date: string;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          date: string;
          completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          date?: string;
          completed?: boolean;
          created_at?: string;
        };
      };
      herbs: {
        Row: {
          id: string;
          name: string;
          latin_name: string | null;
          description: string;
          benefits: string[];
          usage: string | null;
          precautions: string | null;
          categories: string[];
          image_url: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          latin_name?: string | null;
          description: string;
          benefits?: string[];
          usage?: string | null;
          precautions?: string | null;
          categories?: string[];
          image_url?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          latin_name?: string | null;
          description?: string;
          benefits?: string[];
          usage?: string | null;
          precautions?: string | null;
          categories?: string[];
          image_url?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      saved_herbs: {
        Row: {
          id: string;
          user_id: string;
          herb_id: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          herb_id: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          herb_id?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      quotes: {
        Row: {
          id: string;
          content: string;
          author: string;
          category: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          content: string;
          author: string;
          category?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          content?: string;
          author?: string;
          category?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          compare_price: number | null;
          category: string;
          image_url: string | null;
          in_stock: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          compare_price?: number | null;
          category: string;
          image_url?: string | null;
          in_stock?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          compare_price?: number | null;
          category?: string;
          image_url?: string | null;
          in_stock?: boolean;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
