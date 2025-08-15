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
          email: string | null
          id: string
          instagram: string | null
          last_contact_date: string | null
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          source: string | null
          status: Database["public"]["Enums"]["contact_status"]
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
          email?: string | null
          id?: string
          instagram?: string | null
          last_contact_date?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
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
          email?: string | null
          id?: string
          instagram?: string | null
          last_contact_date?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["contact_status"]
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
          have_agent: boolean | null
          id: string
          last_message: string | null
          last_message_at: string | null
          status: Database["public"]["Enums"]["conversation_status"]
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
          have_agent?: boolean | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
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
          have_agent?: boolean | null
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
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
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          position?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          position?: number
          updated_at?: string
          user_id?: string
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
          conversa_id: string
          created_at: string
          data_hora: string | null
          direcao: string
          mensagem: string
          mensagem_is_agent: boolean | null
          "mensagem-type": Json | null
          nome_contato: string | null
          numero: number
          updated_at: string | null
        }
        Insert: {
          conversa_id: string
          created_at?: string
          data_hora?: string | null
          direcao: string
          mensagem: string
          mensagem_is_agent?: boolean | null
          "mensagem-type"?: Json | null
          nome_contato?: string | null
          numero?: number
          updated_at?: string | null
        }
        Update: {
          conversa_id?: string
          created_at?: string
          data_hora?: string | null
          direcao?: string
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
        }
        Insert: {
          id?: number
          message: Json
          session_id: string
        }
        Update: {
          id?: number
          message?: Json
          session_id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
