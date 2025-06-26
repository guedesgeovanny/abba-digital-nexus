export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agent_metrics: {
        Row: {
          agent_id: string
          conversations_count: number
          id: string
          last_activity: string | null
          success_rate: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          conversations_count?: number
          id?: string
          last_activity?: string | null
          success_rate?: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          conversations_count?: number
          id?: string
          last_activity?: string | null
          success_rate?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          channel: Database["public"]["Enums"]["agent_channel"] | null
          configuration: Json | null
          created_at: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["agent_status"]
          type: Database["public"]["Enums"]["agent_type"]
          updated_at: string
          user_id: string
          whatsapp_connected_at: string | null
          whatsapp_contact: string | null
          whatsapp_profile_name: string | null
          whatsapp_profile_picture_data: string | null
          whatsapp_profile_picture_url: string | null
        }
        Insert: {
          channel?: Database["public"]["Enums"]["agent_channel"] | null
          configuration?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["agent_status"]
          type: Database["public"]["Enums"]["agent_type"]
          updated_at?: string
          user_id: string
          whatsapp_connected_at?: string | null
          whatsapp_contact?: string | null
          whatsapp_profile_name?: string | null
          whatsapp_profile_picture_data?: string | null
          whatsapp_profile_picture_url?: string | null
        }
        Update: {
          channel?: Database["public"]["Enums"]["agent_channel"] | null
          configuration?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["agent_status"]
          type?: Database["public"]["Enums"]["agent_type"]
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
        }
        Insert: {
          address?: string | null
          agent_assigned?: string | null
          channel?: Database["public"]["Enums"]["contact_channel"] | null
          company?: string | null
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
        }
        Update: {
          address?: string | null
          agent_assigned?: string | null
          channel?: Database["public"]["Enums"]["contact_channel"] | null
          company?: string | null
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
        }
        Relationships: []
      }
      conversations: {
        Row: {
          agent_id: string | null
          channel: Database["public"]["Enums"]["communication_channel"] | null
          contact_avatar: string | null
          contact_name: string
          contact_phone: string | null
          contact_username: string | null
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string | null
          status: Database["public"]["Enums"]["conversation_status"]
          unread_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          channel?: Database["public"]["Enums"]["communication_channel"] | null
          contact_avatar?: string | null
          contact_name: string
          contact_phone?: string | null
          contact_username?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          unread_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string | null
          channel?: Database["public"]["Enums"]["communication_channel"] | null
          contact_avatar?: string | null
          contact_name?: string
          contact_phone?: string | null
          contact_username?: string | null
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string | null
          status?: Database["public"]["Enums"]["conversation_status"]
          unread_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          direction: Database["public"]["Enums"]["message_direction"]
          id: string
          message_type: Database["public"]["Enums"]["message_type"]
          read_at: string | null
          sender_name: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          direction: Database["public"]["Enums"]["message_direction"]
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          read_at?: string | null
          sender_name?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          direction?: Database["public"]["Enums"]["message_direction"]
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          read_at?: string | null
          sender_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
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
      conversation_status: "aberta" | "fechada"
      message_direction: "sent" | "received"
      message_type: "text" | "image" | "audio" | "document" | "file"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
      conversation_status: ["aberta", "fechada"],
      message_direction: ["sent", "received"],
      message_type: ["text", "image", "audio", "document", "file"],
    },
  },
} as const
