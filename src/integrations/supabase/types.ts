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
      conexoes: {
        Row: {
          active: boolean
          assigned_users: Json | null
          channel: string | null
          configuration: Json | null
          created_at: string
          description: string | null
          id: string
          name: string
          status: string
          type: string
          updated_at: string
          user_id: string
          whatsapp_connected_at: string | null
          whatsapp_contact: string | null
          whatsapp_profile_name: string | null
          whatsapp_profile_picture_data: string | null
          whatsapp_profile_picture_url: string | null
        }
        Insert: {
          active?: boolean
          assigned_users?: Json | null
          channel?: string | null
          configuration?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: string
          type?: string
          updated_at?: string
          user_id: string
          whatsapp_connected_at?: string | null
          whatsapp_contact?: string | null
          whatsapp_profile_name?: string | null
          whatsapp_profile_picture_data?: string | null
          whatsapp_profile_picture_url?: string | null
        }
        Update: {
          active?: boolean
          assigned_users?: Json | null
          channel?: string | null
          configuration?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
          whatsapp_connected_at?: string | null
          whatsapp_contact?: string | null
          whatsapp_profile_name?: string | null
          whatsapp_profile_picture_data?: string | null
          whatsapp_profile_picture_url?: string | null
        }
        Relationships: []
      }
      contact_interactions: {
        Row: {
          channel: Database["public"]["Enums"]["contact_channel"] | null
          contact_id: string
          content: string
          created_at: string
          direction: string
          id: string
          type: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["contact_channel"] | null
          contact_id: string
          content: string
          created_at?: string
          direction?: string
          id?: string
          type?: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["contact_channel"] | null
          contact_id?: string
          content?: string
          created_at?: string
          direction?: string
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_interactions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tag_relations: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          tag_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          tag_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tag_relations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tag_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "contact_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tags: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          address: string | null
          agent_assigned: string | null
          channel: Database["public"]["Enums"]["contact_channel"] | null
          company: string | null
          cpf_cnpj: string | null
          created_at: string
          crm_stage: string | null
          email: string | null
          id: string
          instagram: string | null
          last_contact_date: string | null
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          source: string | null
          status: string
          updated_at: string
          user_id: string
          value: number | null
        }
        Insert: {
          address?: string | null
          agent_assigned?: string | null
          channel?: Database["public"]["Enums"]["contact_channel"] | null
          company?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          crm_stage?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          last_contact_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id: string
          value?: number | null
        }
        Update: {
          address?: string | null
          agent_assigned?: string | null
          channel?: Database["public"]["Enums"]["contact_channel"] | null
          company?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          crm_stage?: string | null
          email?: string | null
          id?: string
          instagram?: string | null
          last_contact_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          value?: number | null
        }
        Relationships: []
      }
      conversation_attachments: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          media_file_id: string
          uploaded_by: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          media_file_id: string
          uploaded_by: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          media_file_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_conversation_attachments_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversation_attachments_media_file"
            columns: ["media_file_id"]
            isOneToOne: false
            referencedRelation: "media_files"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_read_status: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          last_read_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          last_read_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          last_read_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_read_status_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          account: string | null
          assigned_to: string | null
          channel: Database["public"]["Enums"]["communication_channel"] | null
          contact_avatar: string | null
          contact_id: string | null
          contact_name: string
          contact_phone: string | null
          contact_username: string | null
          created_at: string
          crm_stage: string | null
          have_agent: boolean | null
          id: string
          last_message: string | null
          last_message_at: string | null
          status: string
          status_agent: string | null
          unread_count: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account?: string | null
          assigned_to?: string | null
          channel?: Database["public"]["Enums"]["communication_channel"] | null
          contact_avatar?: string | null
          contact_id?: string | null
          contact_name: string
          contact_phone?: string | null
          contact_username?: string | null
          created_at?: string
          crm_stage?: string | null
          have_agent?: boolean | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          status?: string
          status_agent?: string | null
          unread_count?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account?: string | null
          assigned_to?: string | null
          channel?: Database["public"]["Enums"]["communication_channel"] | null
          contact_avatar?: string | null
          contact_id?: string | null
          contact_name?: string
          contact_phone?: string | null
          contact_username?: string | null
          created_at?: string
          crm_stage?: string | null
          have_agent?: boolean | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          status?: string
          status_agent?: string | null
          unread_count?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_stages: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          position: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          position?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      media_files: {
        Row: {
          created_at: string | null
          extension: string | null
          filename: string
          id: string
          mimetype: string
          original_filename: string | null
          size_bytes: number | null
          updated_at: string | null
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          extension?: string | null
          filename: string
          id?: string
          mimetype: string
          original_filename?: string | null
          size_bytes?: number | null
          updated_at?: string | null
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          extension?: string | null
          filename?: string
          id?: string
          mimetype?: string
          original_filename?: string | null
          size_bytes?: number | null
          updated_at?: string | null
          uploaded_by?: string | null
          url?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          connection_account: string | null
          connection_name: string | null
          conversa_id: string
          created_at: string
          data_hora: string | null
          direcao: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          mensagem: string
          mensagem_is_agent: boolean | null
          "mensagem-type": Json | null
          nome_contato: string | null
          numero: number
          updated_at: string | null
        }
        Insert: {
          connection_account?: string | null
          connection_name?: string | null
          conversa_id: string
          created_at?: string
          data_hora?: string | null
          direcao: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          mensagem: string
          mensagem_is_agent?: boolean | null
          "mensagem-type"?: Json | null
          nome_contato?: string | null
          numero?: number
          updated_at?: string | null
        }
        Update: {
          connection_account?: string | null
          connection_name?: string | null
          conversa_id?: string
          created_at?: string
          data_hora?: string | null
          direcao?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          mensagem?: string
          mensagem_is_agent?: boolean | null
          "mensagem-type"?: Json | null
          nome_contato?: string | null
          numero?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      n8n_chat_histories: {
        Row: {
          id: number
          message: Json
          session_id: string
          user_id: string | null
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
          user_id?: string | null
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          count: number
          created_at: string
          expires_at: string
          id: string
          identifier: string
          updated_at: string
          window_start: string
        }
        Insert: {
          action: string
          count?: number
          created_at?: string
          expires_at?: string
          id?: string
          identifier: string
          updated_at?: string
          window_start?: string
        }
        Update: {
          action?: string
          count?: number
          created_at?: string
          expires_at?: string
          id?: string
          identifier?: string
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_favorite_connections: {
        Row: {
          connection_name: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          connection_name: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          connection_name?: string
          created_at?: string
          id?: string
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
      check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_limit?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_rate_limits: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_sample_conversations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_conversation_number: {
        Args: { conversation_uuid: string }
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_optimized_conversations: {
        Args: { is_admin_param?: boolean; user_id_param: string }
        Returns: {
          assigned_to: string
          channel: string
          contact_avatar: string
          contact_id: string
          contact_name: string
          contact_phone: string
          contact_username: string
          created_at: string
          crm_stage: string
          id: string
          last_message: string
          last_message_at: string
          status: string
          unread_count: number
          updated_at: string
          user_id: string
        }[]
      }
      log_security_event: {
        Args: {
          p_details?: Json
          p_event_type: string
          p_ip_address?: unknown
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      agent_channel: "whatsapp" | "instagram" | "messenger"
      agent_status: "active" | "inactive" | "training"
      agent_type:
        | "vendas"
        | "atendimento"
        | "marketing"
        | "rh"
        | "personalizado"
      communication_channel: "whatsapp" | "instagram" | "messenger"
      contact_channel:
        | "instagram"
        | "whatsapp"
        | "messenger"
        | "email"
        | "telefone"
        | "site"
        | "indicacao"
      contact_status:
        | "novo"
        | "em_andamento"
        | "qualificado"
        | "convertido"
        | "perdido"
      conversation_status:
        | "aberta"
        | "fechada"
        | "novo"
        | "qualificado"
        | "convertido"
        | "perdido"
      message_direction: "sent" | "received"
      message_type: "text" | "image" | "audio" | "document" | "file"
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
      agent_channel: ["whatsapp", "instagram", "messenger"],
      agent_status: ["active", "inactive", "training"],
      agent_type: ["vendas", "atendimento", "marketing", "rh", "personalizado"],
      communication_channel: ["whatsapp", "instagram", "messenger"],
      contact_channel: [
        "instagram",
        "whatsapp",
        "messenger",
        "email",
        "telefone",
        "site",
        "indicacao",
      ],
      contact_status: [
        "novo",
        "em_andamento",
        "qualificado",
        "convertido",
        "perdido",
      ],
      conversation_status: [
        "aberta",
        "fechada",
        "novo",
        "qualificado",
        "convertido",
        "perdido",
      ],
      message_direction: ["sent", "received"],
      message_type: ["text", "image", "audio", "document", "file"],
    },
  },
} as const
