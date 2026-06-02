export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      emotion_entries: {
        Row: {
          background_thought_custom: string | null;
          background_thought_id: number | null;
          body_zones: string[];
          cause_custom: string | null;
          cause_sphere: string | null;
          created_at: string;
          emotion_color: string;
          emotion_name: string;
          family_id: string;
          id: string;
          intensity: number;
          shade_id: string;
          user_id: string;
        };
        Insert: {
          background_thought_custom?: string | null;
          background_thought_id?: number | null;
          body_zones?: string[];
          cause_custom?: string | null;
          cause_sphere?: string | null;
          created_at?: string;
          emotion_color: string;
          emotion_name: string;
          family_id: string;
          id?: string;
          intensity: number;
          shade_id: string;
          user_id: string;
        };
        Update: {
          background_thought_custom?: string | null;
          background_thought_id?: number | null;
          body_zones?: string[];
          cause_custom?: string | null;
          cause_sphere?: string | null;
          created_at?: string;
          emotion_color?: string;
          emotion_name?: string;
          family_id?: string;
          id?: string;
          intensity?: number;
          shade_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      light_body_state: {
        Row: {
          points: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          points?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          points?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          base_vibration: number | null;
          birth_date: string | null;
          birth_lat: number | null;
          birth_lng: number | null;
          birth_location: string | null;
          birth_time: string | null;
          chakra_profile: Json | null;
          consent_pdn_accepted_at: string;
          created_at: string;
          display_name: string;
          id: string;
          intention_30d: string | null;
          marketing_consent: boolean;
          onboarding_completed: boolean;
          timezone: string;
          totem: string | null;
          updated_at: string;
        };
        Insert: {
          base_vibration?: number | null;
          birth_date?: string | null;
          birth_lat?: number | null;
          birth_lng?: number | null;
          birth_location?: string | null;
          birth_time?: string | null;
          chakra_profile?: Json | null;
          consent_pdn_accepted_at: string;
          created_at?: string;
          display_name: string;
          id: string;
          intention_30d?: string | null;
          marketing_consent?: boolean;
          onboarding_completed?: boolean;
          timezone?: string;
          totem?: string | null;
          updated_at?: string;
        };
        Update: {
          base_vibration?: number | null;
          birth_date?: string | null;
          birth_lat?: number | null;
          birth_lng?: number | null;
          birth_location?: string | null;
          birth_time?: string | null;
          chakra_profile?: Json | null;
          consent_pdn_accepted_at?: string;
          created_at?: string;
          display_name?: string;
          id?: string;
          intention_30d?: string | null;
          marketing_consent?: boolean;
          onboarding_completed?: boolean;
          timezone?: string;
          totem?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_light_point: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
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

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
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
