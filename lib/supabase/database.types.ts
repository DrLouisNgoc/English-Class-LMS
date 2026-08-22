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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      answers: {
        Row: {
          answered_at: string
          attempt_id: string
          given_answer: string | null
          id: string
          is_correct: boolean | null
          question_id: string
          seconds_spent: number | null
        }
        Insert: {
          answered_at?: string
          attempt_id: string
          given_answer?: string | null
          id?: string
          is_correct?: boolean | null
          question_id: string
          seconds_spent?: number | null
        }
        Update: {
          answered_at?: string
          attempt_id?: string
          given_answer?: string | null
          id?: string
          is_correct?: boolean | null
          question_id?: string
          seconds_spent?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_questions: {
        Row: {
          assignment_id: string
          position: number
          question_id: string
        }
        Insert: {
          assignment_id: string
          position: number
          question_id: string
        }
        Update: {
          assignment_id?: string
          position?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_questions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          class_id: string
          created_at: string
          due_at: string
          id: string
          title: string
        }
        Insert: {
          class_id: string
          created_at?: string
          due_at: string
          id?: string
          title: string
        }
        Update: {
          class_id?: string
          created_at?: string
          due_at?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          assignment_id: string
          id: string
          score: number | null
          started_at: string
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          assignment_id: string
          id?: string
          score?: number | null
          started_at?: string
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: string
          id?: string
          score?: number | null
          started_at?: string
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attempts_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          grade: number
          id: string
          is_active: boolean
          join_code: string
          name: string
          teacher_id: string
        }
        Insert: {
          grade: number
          id?: string
          is_active?: boolean
          join_code: string
          name: string
          teacher_id: string
        }
        Update: {
          grade?: number
          id?: string
          is_active?: boolean
          join_code?: string
          name?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          class_id: string
          id: string
          joined_at: string
          left_at: string | null
          student_id: string
        }
        Insert: {
          class_id: string
          id?: string
          joined_at?: string
          left_at?: string | null
          student_id: string
        }
        Update: {
          class_id?: string
          id?: string
          joined_at?: string
          left_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      question_tags: {
        Row: {
          is_primary: boolean
          question_id: string
          skill_tag_id: string
        }
        Insert: {
          is_primary?: boolean
          question_id: string
          skill_tag_id: string
        }
        Update: {
          is_primary?: boolean
          question_id?: string
          skill_tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_tags_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_tags_skill_tag_id_fkey"
            columns: ["skill_tag_id"]
            isOneToOne: false
            referencedRelation: "skill_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          content: string
          correct_answer: string
          difficulty: string
          explanation: string | null
          grade: number
          id: string
          kind: string
          media_url: string | null
          options: Json | null
          source: string | null
          status: string
          teacher_id: string
        }
        Insert: {
          content: string
          correct_answer: string
          difficulty: string
          explanation?: string | null
          grade: number
          id?: string
          kind: string
          media_url?: string | null
          options?: Json | null
          source?: string | null
          status?: string
          teacher_id: string
        }
        Update: {
          content?: string
          correct_answer?: string
          difficulty?: string
          explanation?: string | null
          grade?: number
          id?: string
          kind?: string
          media_url?: string | null
          options?: Json | null
          source?: string | null
          status?: string
          teacher_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "teachers"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_tags: {
        Row: {
          code: string
          group_name: string
          id: string
          name_vi: string
        }
        Insert: {
          code: string
          group_name: string
          id?: string
          name_vi: string
        }
        Update: {
          code?: string
          group_name?: string
          id?: string
          name_vi?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string
          full_name: string
          id: string
          pin_hash: string
          username: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          pin_hash: string
          username: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          pin_hash?: string
          username?: string
        }
        Relationships: []
      }
      teachers: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
