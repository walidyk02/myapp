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
      manual_scripts: {
        Row: {
          id: number;
          name: string;
          description: string;
          script: string;
          created_at: string;
        };
        Insert: {
          name: string;
          description: string;
          script: string;
        };
        Update: {
          name?: string;
          description?: string;
          script?: string;
        };
      };
      scenarios: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          status: string | null;
          progress: number | null;
          patterns: Json | null;
          endpoint: string | null;
          category: string | null;
          priority: string | null;
          confidence: number | null;
          created_at: string | null;
          user_id: string | null;
          model_data: Json | null;
          training_status: string | null;
          training_progress: number | null;
          last_trained_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          status?: string | null;
          progress?: number | null;
          patterns?: Json | null;
          endpoint?: string | null;
          category?: string | null;
          priority?: string | null;
          confidence?: number | null;
          created_at?: string | null;
          user_id?: string | null;
          model_data?: Json | null;
          training_status?: string | null;
          training_progress?: number | null;
          last_trained_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          status?: string | null;
          progress?: number | null;
          patterns?: Json | null;
          endpoint?: string | null;
          category?: string | null;
          priority?: string | null;
          confidence?: number | null;
          created_at?: string | null;
          user_id?: string | null;
          model_data?: Json | null;
          training_status?: string | null;
          training_progress?: number | null;
          last_trained_at?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
