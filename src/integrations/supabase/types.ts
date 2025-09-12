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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id: string
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string
        }
        Relationships: []
      }
      credit_packages: {
        Row: {
          active: boolean | null
          bonus_credits: number | null
          created_at: string
          credits: number
          id: string
          name: string
          popular: boolean | null
          price_inr: number
        }
        Insert: {
          active?: boolean | null
          bonus_credits?: number | null
          created_at?: string
          credits: number
          id?: string
          name: string
          popular?: boolean | null
          price_inr: number
        }
        Update: {
          active?: boolean | null
          bonus_credits?: number | null
          created_at?: string
          credits?: number
          id?: string
          name?: string
          popular?: boolean | null
          price_inr?: number
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          action_type: string | null
          amount: number
          created_at: string
          description: string
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          action_type?: string | null
          amount: number
          created_at?: string
          description: string
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          action_type?: string | null
          amount?: number
          created_at?: string
          description?: string
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_templates: {
        Row: {
          background_image: string | null
          category: string
          colors: Json
          created_at: string | null
          created_by: string
          default_positions: Json
          fonts: Json
          id: string
          is_premium: boolean | null
          name: string
          tags: string[] | null
          thumbnail: string | null
          updated_at: string | null
        }
        Insert: {
          background_image?: string | null
          category?: string
          colors?: Json
          created_at?: string | null
          created_by: string
          default_positions?: Json
          fonts?: Json
          id?: string
          is_premium?: boolean | null
          name: string
          tags?: string[] | null
          thumbnail?: string | null
          updated_at?: string | null
        }
        Update: {
          background_image?: string | null
          category?: string
          colors?: Json
          created_at?: string | null
          created_by?: string
          default_positions?: Json
          fonts?: Json
          id?: string
          is_premium?: boolean | null
          name?: string
          tags?: string[] | null
          thumbnail?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      shared_wedding_cards: {
        Row: {
          bride_name: string
          created_at: string
          customization: Json | null
          element_positions: Json | null
          groom_name: string
          id: string
          is_public: boolean | null
          logo_image: string | null
          message: string | null
          share_token: string | null
          template_id: string
          updated_at: string
          uploaded_images: Json | null
          user_id: string
          venue: string
          wedding_date: string
        }
        Insert: {
          bride_name: string
          created_at?: string
          customization?: Json | null
          element_positions?: Json | null
          groom_name: string
          id?: string
          is_public?: boolean | null
          logo_image?: string | null
          message?: string | null
          share_token?: string | null
          template_id: string
          updated_at?: string
          uploaded_images?: Json | null
          user_id: string
          venue: string
          wedding_date: string
        }
        Update: {
          bride_name?: string
          created_at?: string
          customization?: Json | null
          element_positions?: Json | null
          groom_name?: string
          id?: string
          is_public?: boolean | null
          logo_image?: string | null
          message?: string | null
          share_token?: string | null
          template_id?: string
          updated_at?: string
          uploaded_images?: Json | null
          user_id?: string
          venue?: string
          wedding_date?: string
        }
        Relationships: []
      }
      tag_groups: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      template_tags: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          group_id: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          group_id?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          group_id?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_tags_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "tag_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_credits: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wedding_cards: {
        Row: {
          bride_name: string
          created_at: string
          customization: Json | null
          groom_name: string
          id: string
          logo_image: string | null
          message: string | null
          template_id: string
          updated_at: string
          uploaded_image: string | null
          uploaded_images: Json | null
          user_id: string | null
          venue: string
          wedding_date: string
        }
        Insert: {
          bride_name: string
          created_at?: string
          customization?: Json | null
          groom_name: string
          id?: string
          logo_image?: string | null
          message?: string | null
          template_id: string
          updated_at?: string
          uploaded_image?: string | null
          uploaded_images?: Json | null
          user_id?: string | null
          venue: string
          wedding_date: string
        }
        Update: {
          bride_name?: string
          created_at?: string
          customization?: Json | null
          groom_name?: string
          id?: string
          logo_image?: string | null
          message?: string | null
          template_id?: string
          updated_at?: string
          uploaded_image?: string | null
          uploaded_images?: Json | null
          user_id?: string | null
          venue?: string
          wedding_date?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          p_amount: number
          p_description: string
          p_reference_id?: string
          p_user_id: string
        }
        Returns: undefined
      }
      admin_manage_credits: {
        Args:
          | {
              p_admin_user_id: string
              p_amount: number
              p_description: string
              p_operation: string
              p_target_user_id: string
            }
          | {
              p_amount: number
              p_description: string
              p_operation: string
              p_target_user_id: string
            }
        Returns: boolean
      }
      admin_remove_user_role: {
        Args: { admin_user_id?: string; target_user_email: string }
        Returns: boolean
      }
      admin_set_user_role: {
        Args: {
          admin_user_id?: string
          new_role: Database["public"]["Enums"]["app_role"]
          target_user_email: string
        }
        Returns: boolean
      }
      deduct_credits: {
        Args: {
          p_action_type: string
          p_amount: number
          p_description: string
          p_reference_id?: string
          p_user_id: string
        }
        Returns: boolean
      }
      fetch_shared_card: {
        Args: { p_share_token: string }
        Returns: {
          bride_name: string
          created_at: string
          customization: Json
          element_positions: Json
          groom_name: string
          id: string
          logo_image: string
          message: string
          template_id: string
          uploaded_images: Json
          venue: string
          wedding_date: string
        }[]
      }
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      log_admin_action: {
        Args: {
          action_details?: Json
          action_type: string
          target_user_id: string
        }
        Returns: undefined
      }
      set_user_as_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
      validate_credit_operation: {
        Args: { p_amount: number; p_operation_type: string; p_user_id?: string }
        Returns: boolean
      }
      validate_wedding_card_data: {
        Args: {
          p_bride_name: string
          p_groom_name: string
          p_message?: string
          p_venue: string
          p_wedding_date: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
