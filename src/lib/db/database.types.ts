export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      configurators: {
        Row: {
          chat_enabled: boolean
          created_at: string
          id: string
          is_active: boolean
          name: string
          organization_id: string
          sector: string
          slug: string
          theme: Json
          wizard_enabled: boolean
        }
        Insert: {
          chat_enabled?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          sector?: string
          slug: string
          theme?: Json
          wizard_enabled?: boolean
        }
        Update: {
          chat_enabled?: boolean
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          sector?: string
          slug?: string
          theme?: Json
          wizard_enabled?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "configurators_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          id: string
          kind: string
          organization_id: string
          subject: string
        }
        Insert: {
          body: string
          id?: string
          kind: string
          organization_id: string
          subject: string
        }
        Update: {
          body?: string
          id?: string
          kind?: string
          organization_id?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string
          id: string
          invite_token: string | null
          invited_email: string | null
          organization_id: string
          role: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invite_token?: string | null
          invited_email?: string | null
          organization_id: string
          role: string
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invite_token?: string | null
          invited_email?: string | null
          organization_id?: string
          role?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          configurator_id: string | null
          created_at: string
          event_type: string
          id: string
          organization_id: string
          session_id: string | null
          step: number | null
        }
        Insert: {
          configurator_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          organization_id: string
          session_id?: string | null
          step?: number | null
        }
        Update: {
          configurator_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          organization_id?: string
          session_id?: string | null
          step?: number | null
        }
        Relationships: []
      }
      automation_flows: {
        Row: {
          active: boolean
          created_at: string
          delay_hours: number
          id: string
          organization_id: string
          recipient: string
          template_kind: string
          trigger: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          delay_hours?: number
          id?: string
          organization_id: string
          recipient: string
          template_kind: string
          trigger: string
        }
        Update: {
          active?: boolean
          created_at?: string
          delay_hours?: number
          id?: string
          organization_id?: string
          recipient?: string
          template_kind?: string
          trigger?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          organization_id: string
          quote_id: string | null
          read_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          organization_id: string
          quote_id?: string | null
          read_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          organization_id?: string
          quote_id?: string | null
          read_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_activities: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          organization_id: string
          payload: Json
          quote_id: string
          type: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          organization_id: string
          payload?: Json
          quote_id: string
          type: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          payload?: Json
          quote_id?: string
          type?: string
        }
        Relationships: []
      }
      quote_notes: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          id: string
          organization_id: string
          quote_id: string
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          id?: string
          organization_id: string
          quote_id: string
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          id?: string
          organization_id?: string
          quote_id?: string
        }
        Relationships: []
      }
      quote_statuses: {
        Row: {
          color: string
          id: string
          is_closed: boolean
          is_default: boolean
          label: string
          organization_id: string
          position: number
          slug: string
        }
        Insert: {
          color?: string
          id?: string
          is_closed?: boolean
          is_default?: boolean
          label: string
          organization_id: string
          position?: number
          slug: string
        }
        Update: {
          color?: string
          id?: string
          is_closed?: boolean
          is_default?: boolean
          label?: string
          organization_id?: string
          position?: number
          slug?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          allowed_origins: string[]
          branding: Json
          created_at: string
          ga_measurement_id: string | null
          id: string
          name: string
          plan: string
          sales_email: string | null
          sales_name: string | null
          sales_phone: string | null
          slug: string
        }
        Insert: {
          allowed_origins?: string[]
          branding?: Json
          created_at?: string
          ga_measurement_id?: string | null
          id?: string
          name: string
          plan?: string
          sales_email?: string | null
          sales_name?: string | null
          sales_phone?: string | null
          slug: string
        }
        Update: {
          allowed_origins?: string[]
          branding?: Json
          created_at?: string
          ga_measurement_id?: string | null
          id?: string
          name?: string
          plan?: string
          sales_email?: string | null
          sales_name?: string | null
          sales_phone?: string | null
          slug?: string
        }
        Relationships: []
      }
      pdf_templates: {
        Row: {
          footer: string | null
          id: string
          intro: string | null
          organization_id: string
          title: string
        }
        Insert: {
          footer?: string | null
          id?: string
          intro?: string | null
          organization_id: string
          title?: string
        }
        Update: {
          footer?: string | null
          id?: string
          intro?: string | null
          organization_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdf_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          configurator_id: string
          created_at: string
          currency: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          options: Json
          organization_id: string
          price_max: number | null
          price_min: number | null
          tags: string[]
        }
        Insert: {
          configurator_id: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          options?: Json
          organization_id: string
          price_max?: number | null
          price_min?: number | null
          tags?: string[]
        }
        Update: {
          configurator_id?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          options?: Json
          organization_id?: string
          price_max?: number | null
          price_min?: number | null
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "products_configurator_id_fkey"
            columns: ["configurator_id"]
            isOneToOne: false
            referencedRelation: "configurators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_files: {
        Row: {
          created_at: string
          file_name: string
          id: string
          mime_type: string | null
          organization_id: string
          quote_id: string | null
          session_id: string | null
          storage_path: string
        }
        Insert: {
          created_at?: string
          file_name: string
          id?: string
          mime_type?: string | null
          organization_id: string
          quote_id?: string | null
          session_id?: string | null
          storage_path: string
        }
        Update: {
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          organization_id?: string
          quote_id?: string | null
          session_id?: string | null
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_files_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_files_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_files_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quote_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_items: {
        Row: {
          id: string
          name: string
          options: Json
          organization_id: string
          price_max: number | null
          price_min: number | null
          product_id: string | null
          quantity: number
          quote_id: string
        }
        Insert: {
          id?: string
          name: string
          options?: Json
          organization_id: string
          price_max?: number | null
          price_min?: number | null
          product_id?: string | null
          quantity?: number
          quote_id: string
        }
        Update: {
          id?: string
          name?: string
          options?: Json
          organization_id?: string
          price_max?: number | null
          price_min?: number | null
          product_id?: string | null
          quantity?: number
          quote_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_sessions: {
        Row: {
          answers: Json
          chat_messages: Json
          configurator_id: string
          created_at: string
          current_step: number
          customization: Json
          extracted_params: Json
          id: string
          mode: string
          organization_id: string
          selected_suggestion_id: string | null
          submitted_quote_id: string | null
          token: string
          updated_at: string
        }
        Insert: {
          answers?: Json
          chat_messages?: Json
          configurator_id: string
          created_at?: string
          current_step?: number
          customization?: Json
          extracted_params?: Json
          id?: string
          mode?: string
          organization_id: string
          selected_suggestion_id?: string | null
          submitted_quote_id?: string | null
          token: string
          updated_at?: string
        }
        Update: {
          answers?: Json
          chat_messages?: Json
          configurator_id?: string
          created_at?: string
          current_step?: number
          customization?: Json
          extracted_params?: Json
          id?: string
          mode?: string
          organization_id?: string
          selected_suggestion_id?: string | null
          submitted_quote_id?: string | null
          token?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quote_sessions_configurator_id_fkey"
            columns: ["configurator_id"]
            isOneToOne: false
            referencedRelation: "configurators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quote_sessions_submitted_quote_fk"
            columns: ["submitted_quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          answers: Json
          assigned_to: string | null
          configurator_id: string
          contact_company: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          extracted_params: Json
          id: string
          notes: string | null
          organization_id: string
          score: number | null
          score_label: string | null
          session_id: string | null
          status: string
          status_id: string | null
        }
        Insert: {
          answers?: Json
          assigned_to?: string | null
          configurator_id: string
          contact_company?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          extracted_params?: Json
          id?: string
          notes?: string | null
          organization_id: string
          score?: number | null
          score_label?: string | null
          session_id?: string | null
          status?: string
          status_id?: string | null
        }
        Update: {
          answers?: Json
          assigned_to?: string | null
          configurator_id?: string
          contact_company?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          extracted_params?: Json
          id?: string
          notes?: string | null
          organization_id?: string
          score?: number | null
          score_label?: string | null
          session_id?: string | null
          status?: string
          status_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_configurator_id_fkey"
            columns: ["configurator_id"]
            isOneToOne: false
            referencedRelation: "configurators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "quote_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      suggestion_rules: {
        Row: {
          conditions: Json
          configurator_id: string
          created_at: string
          description: string | null
          headline: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          organization_id: string
          price_max: number | null
          price_min: number | null
          priority: number
          product_ids: string[]
        }
        Insert: {
          conditions?: Json
          configurator_id: string
          created_at?: string
          description?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          organization_id: string
          price_max?: number | null
          price_min?: number | null
          priority?: number
          product_ids?: string[]
        }
        Update: {
          conditions?: Json
          configurator_id?: string
          created_at?: string
          description?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          organization_id?: string
          price_max?: number | null
          price_min?: number | null
          priority?: number
          product_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "suggestion_rules_configurator_id_fkey"
            columns: ["configurator_id"]
            isOneToOne: false
            referencedRelation: "configurators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "suggestion_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempts: number
          created_at: string
          id: string
          last_error: string | null
          organization_id: string
          quote_id: string | null
          request_body: Json | null
          response_body: string | null
          status: string
          status_code: number | null
          webhook_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          organization_id: string
          quote_id?: string | null
          request_body?: Json | null
          response_body?: string | null
          status?: string
          status_code?: number | null
          webhook_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          organization_id?: string
          quote_id?: string | null
          request_body?: Json | null
          response_body?: string | null
          status?: string
          status_code?: number | null
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_deliveries_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          organization_id: string
          secret: string
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id: string
          secret: string
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          secret?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      wizard_questions: {
        Row: {
          created_at: string
          help_text: string | null
          id: string
          key: string
          label: string
          options: Json
          organization_id: string
          required: boolean
          sort_order: number
          step_id: string
          type: string
        }
        Insert: {
          created_at?: string
          help_text?: string | null
          id?: string
          key: string
          label: string
          options?: Json
          organization_id: string
          required?: boolean
          sort_order?: number
          step_id: string
          type: string
        }
        Update: {
          created_at?: string
          help_text?: string | null
          id?: string
          key?: string
          label?: string
          options?: Json
          organization_id?: string
          required?: boolean
          sort_order?: number
          step_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "wizard_questions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wizard_questions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "wizard_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      wizard_steps: {
        Row: {
          configurator_id: string
          created_at: string
          id: string
          organization_id: string
          screen_type: string
          sort_order: number
          subtitle: string | null
          title: string
        }
        Insert: {
          configurator_id: string
          created_at?: string
          id?: string
          organization_id: string
          screen_type: string
          sort_order?: number
          subtitle?: string | null
          title: string
        }
        Update: {
          configurator_id?: string
          created_at?: string
          id?: string
          organization_id?: string
          screen_type?: string
          sort_order?: number
          subtitle?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "wizard_steps_configurator_id_fkey"
            columns: ["configurator_id"]
            isOneToOne: false
            referencedRelation: "configurators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wizard_steps_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
