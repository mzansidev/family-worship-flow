export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      daily_worship_entries: {
        Row: {
          application: string | null
          assistant_id: string | null
          bible_reading: string | null
          closing_song: string | null
          created_at: string
          date: string
          discussion_questions: Json | null
          family_members_present: string[] | null
          id: string
          is_completed: boolean | null
          leader_id: string | null
          opening_song: string | null
          reflection_notes: string | null
          theme: string | null
          updated_at: string
          user_id: string
          worship_plan_id: string | null
        }
        Insert: {
          application?: string | null
          assistant_id?: string | null
          bible_reading?: string | null
          closing_song?: string | null
          created_at?: string
          date?: string
          discussion_questions?: Json | null
          family_members_present?: string[] | null
          id?: string
          is_completed?: boolean | null
          leader_id?: string | null
          opening_song?: string | null
          reflection_notes?: string | null
          theme?: string | null
          updated_at?: string
          user_id: string
          worship_plan_id?: string | null
        }
        Update: {
          application?: string | null
          assistant_id?: string | null
          bible_reading?: string | null
          closing_song?: string | null
          created_at?: string
          date?: string
          discussion_questions?: Json | null
          family_members_present?: string[] | null
          id?: string
          is_completed?: boolean | null
          leader_id?: string | null
          opening_song?: string | null
          reflection_notes?: string | null
          theme?: string | null
          updated_at?: string
          user_id?: string
          worship_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_worship_entries_assistant_id_fkey"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_worship_entries_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_worship_entries_worship_plan_id_fkey"
            columns: ["worship_plan_id"]
            isOneToOne: false
            referencedRelation: "worship_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_daily_worship_entries_assistant"
            columns: ["assistant_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_daily_worship_entries_leader"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          created_at: string
          id: string
          name: string
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      principles_content: {
        Row: {
          category_id: string
          content: string
          created_at: string
          id: string
          is_new: boolean | null
          read_time: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id: string
          content: string
          created_at?: string
          id?: string
          is_new?: boolean | null
          read_time: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          is_new?: boolean | null
          read_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          daily_plan_source: string
          default_age_range: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_plan_source?: string
          default_age_range?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_plan_source?: string
          default_age_range?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          family_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          created_at?: string
          family_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          created_at?: string
          family_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      user_reflections: {
        Row: {
          bible_verse: string | null
          created_at: string
          daily_entry_id: string | null
          id: string
          reflection_text: string
          updated_at: string
          user_id: string
          worship_date: string
        }
        Insert: {
          bible_verse?: string | null
          created_at?: string
          daily_entry_id?: string | null
          id?: string
          reflection_text: string
          updated_at?: string
          user_id: string
          worship_date: string
        }
        Update: {
          bible_verse?: string | null
          created_at?: string
          daily_entry_id?: string | null
          id?: string
          reflection_text?: string
          updated_at?: string
          user_id?: string
          worship_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reflections_daily_entry_id_fkey"
            columns: ["daily_entry_id"]
            isOneToOne: false
            referencedRelation: "daily_worship_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          last_worship_date: string | null
          longest_streak: number | null
          total_worship_days: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_worship_date?: string | null
          longest_streak?: number | null
          total_worship_days?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_worship_date?: string | null
          longest_streak?: number | null
          total_worship_days?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      worship_plans: {
        Row: {
          book_name: string | null
          created_at: string
          current_chapter: number | null
          current_week: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          plan_type: string
          start_date: string
          study_type: string
          topic_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          book_name?: string | null
          created_at?: string
          current_chapter?: number | null
          current_week?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          plan_type: string
          start_date?: string
          study_type: string
          topic_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          book_name?: string | null
          created_at?: string
          current_chapter?: number | null
          current_week?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          plan_type?: string
          start_date?: string
          study_type?: string
          topic_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_principle_reads: {
        Args: { p_user_id: string }
        Returns: {
          principle_id: string
        }[]
      }
      mark_principle_as_read: {
        Args: { p_principle_id: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "user"
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
      user_role: ["admin", "user"],
    },
  },
} as const
