export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      chat_conversations: {
        Row: {
          chat_user_id: string | null;
          created_at: string;
          id: string;
          updated_at: string | null;
        };
        Insert: {
          chat_user_id?: string | null;
          created_at?: string;
          id?: string;
          updated_at?: string | null;
        };
        Update: {
          chat_user_id?: string | null;
          created_at?: string;
          id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_conversations_chat_user_id_fkey';
            columns: ['chat_user_id'];
            isOneToOne: false;
            referencedRelation: 'chat_users';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_messages: {
        Row: {
          attachment: string | null;
          chat_conversation_id: string;
          chat_platform_id: number;
          chat_user_id: string;
          completion_tokens: number | null;
          content: string;
          created_at: string;
          delivery_status: string;
          id: string;
          latency_ms: number | null;
          organization_id: string;
          prompt_tokens: number | null;
          provider_payload: Json | null;
          role: string;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          attachment?: string | null;
          chat_conversation_id: string;
          chat_platform_id: number;
          chat_user_id: string;
          completion_tokens?: number | null;
          content: string;
          created_at?: string;
          delivery_status: string;
          id?: string;
          latency_ms?: number | null;
          organization_id: string;
          prompt_tokens?: number | null;
          provider_payload?: Json | null;
          role: string;
          type: string;
          updated_at?: string | null;
        };
        Update: {
          attachment?: string | null;
          chat_conversation_id?: string;
          chat_platform_id?: number;
          chat_user_id?: string;
          completion_tokens?: number | null;
          content?: string;
          created_at?: string;
          delivery_status?: string;
          id?: string;
          latency_ms?: number | null;
          organization_id?: string;
          prompt_tokens?: number | null;
          provider_payload?: Json | null;
          role?: string;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_messages_chat_conversation_id_fkey';
            columns: ['chat_conversation_id'];
            isOneToOne: false;
            referencedRelation: 'chat_conversations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_messages_chat_platform_id_fkey';
            columns: ['chat_platform_id'];
            isOneToOne: false;
            referencedRelation: 'chat_platforms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_messages_chat_user_id_fkey';
            columns: ['chat_user_id'];
            isOneToOne: false;
            referencedRelation: 'chat_users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_messages_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_platforms: {
        Row: {
          code: string;
          created_at: string;
          id: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          code: string;
          created_at?: string;
          id?: number;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string;
          id?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      chat_users: {
        Row: {
          created_at: string;
          credential: string;
          id: string;
          name: string | null;
          organization_id: string;
          platform_id: number;
          profile_url: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string;
          credential: string;
          id?: string;
          name?: string | null;
          organization_id: string;
          platform_id: number;
          profile_url?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string;
          credential?: string;
          id?: string;
          name?: string | null;
          organization_id?: string;
          platform_id?: number;
          profile_url?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_users_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_users_platform_id_fkey';
            columns: ['platform_id'];
            isOneToOne: false;
            referencedRelation: 'chat_platforms';
            referencedColumns: ['id'];
          },
        ];
      };
      organization_memberships: {
        Row: {
          created_at: string;
          organization_id: string;
          profile_id: string;
          role_id: string | null;
        };
        Insert: {
          created_at?: string;
          organization_id: string;
          profile_id: string;
          role_id?: string | null;
        };
        Update: {
          created_at?: string;
          organization_id?: string;
          profile_id?: string;
          role_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'organization_memberships_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'organization_memberships_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'organization_memberships_role_id_fkey';
            columns: ['role_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
      };
      organizations: {
        Row: {
          billing_customer: string | null;
          branding: Json;
          contact_email: string | null;
          contact_phone: string | null;
          created_at: string;
          id: string;
          locale: string;
          name: string;
          plan_id: number;
          slug: string | null;
          status: string;
          timezone: string;
          updated_at: string | null;
        };
        Insert: {
          billing_customer?: string | null;
          branding?: Json;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          id?: string;
          locale?: string;
          name: string;
          plan_id: number;
          slug?: string | null;
          status?: string;
          timezone?: string;
          updated_at?: string | null;
        };
        Update: {
          billing_customer?: string | null;
          branding?: Json;
          contact_email?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          id?: string;
          locale?: string;
          name?: string;
          plan_id?: number;
          slug?: string | null;
          status?: string;
          timezone?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tenants_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      permissions: {
        Row: {
          code: string;
          created_at: string;
          description: string;
          id: number;
        };
        Insert: {
          code: string;
          created_at?: string;
          description: string;
          id?: number;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string;
          id?: number;
        };
        Relationships: [];
      };
      plan_permissions: {
        Row: {
          permission_id: number;
          plan_id: number;
        };
        Insert: {
          permission_id: number;
          plan_id: number;
        };
        Update: {
          permission_id?: number;
          plan_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'plan_permissions_permission_id_fkey';
            columns: ['permission_id'];
            isOneToOne: false;
            referencedRelation: 'permissions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'plan_permissions_plan_id_fkey';
            columns: ['plan_id'];
            isOneToOne: false;
            referencedRelation: 'plans';
            referencedColumns: ['id'];
          },
        ];
      };
      plans: {
        Row: {
          code: string;
          created_at: string;
          description: string | null;
          id: number;
          is_active: boolean;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string | null;
          id?: number;
          is_active?: boolean;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string | null;
          id?: number;
          is_active?: boolean;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          settings: Json | null;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          settings?: Json | null;
          status: string;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          settings?: Json | null;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          permission_id: number;
          role_id: string;
        };
        Insert: {
          permission_id: number;
          role_id: string;
        };
        Update: {
          permission_id?: number;
          role_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'role_permissions_permission_id_fkey';
            columns: ['permission_id'];
            isOneToOne: false;
            referencedRelation: 'permissions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'role_permissions_role_id_fkey';
            columns: ['role_id'];
            isOneToOne: false;
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          },
        ];
      };
      roles: {
        Row: {
          created_at: string;
          created_by: string | null;
          description: string | null;
          id: string;
          name: string;
          organization_id: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          organization_id?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          organization_id?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'roles_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'roles_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'roles_updated_by_fkey';
            columns: ['updated_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
