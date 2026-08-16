export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      event: {
        Row: {
          created_at: string
          date: string
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_template_sectors: {
        Row: {
          created_at: string
          id: string
          sector_id: string
          template_shift_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sector_id: string
          template_shift_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sector_id?: string
          template_shift_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_template_sectors_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_template_sectors_template_shift_id_fkey"
            columns: ["template_shift_id"]
            isOneToOne: false
            referencedRelation: "event_template_shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      event_template_settings: {
        Row: {
          created_at: string
          default_event_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_event_name?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_event_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      event_template_shifts: {
        Row: {
          created_at: string
          id: string
          scheduled_time: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          scheduled_time: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          scheduled_time?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      scales: {
        Row: {
          created_at: string
          id: string
          sector_id: string
          shift_id: string
          updated_at: string
          volunteer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          sector_id: string
          shift_id: string
          updated_at?: string
          volunteer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          sector_id?: string
          shift_id?: string
          updated_at?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scales_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scales_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scales_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      sectors: {
        Row: {
          id: string
          name: string
          slug: string
          url_icon: string | null
          url_icon_apprentice: string | null
          url_icon_knowledgeable: string | null
          url_icon_master: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          url_icon?: string | null
          url_icon_apprentice?: string | null
          url_icon_knowledgeable?: string | null
          url_icon_master?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          url_icon?: string | null
          url_icon_apprentice?: string | null
          url_icon_knowledgeable?: string | null
          url_icon_master?: string | null
        }
        Relationships: []
      }
      shifts: {
        Row: {
          created_at: string
          event_id: string
          id: string
          lider_id: string | null
          scheduled_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          lider_id?: string | null
          scheduled_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          lider_id?: string | null
          scheduled_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_lider_id_fkey"
            columns: ["lider_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteer_sectors: {
        Row: {
          created_at: string
          id: string
          is_active_in_sector: boolean
          proficiency_status: Database["public"]["Enums"]["volunteer_sector_proficiency_status"]
          sector_id: string
          volunteer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active_in_sector?: boolean
          proficiency_status?: Database["public"]["Enums"]["volunteer_sector_proficiency_status"]
          sector_id: string
          volunteer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active_in_sector?: boolean
          proficiency_status?: Database["public"]["Enums"]["volunteer_sector_proficiency_status"]
          sector_id?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_sectors_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_sectors_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "volunteers"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteers: {
        Row: {
          avatar_url: string | null
          contact_phone: string | null
          created_at: string
          id: string
          ministry_entry_date: string
          name: string
          nickname: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          ministry_entry_date?: string
          name: string
          nickname?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          ministry_entry_date?: string
          name?: string
          nickname?: string | null
          updated_at?: string
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
      volunteer_sector_proficiency_status:
        | "apprentice"
        | "knowledgeable"
        | "master"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      volunteer_sector_proficiency_status: [
        "apprentice",
        "knowledgeable",
        "master",
      ],
    },
  },
} as const

