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
      catalog_connections: {
        Row: {
          configurator_id: string | null
          created_at: string
          credentials: Json
          credentials_hint: string | null
          currency: string
          id: string
          label: string
          last_error: string | null
          last_sync_at: string | null
          organization_id: string
          product_count: number
          provider: string
          settings: Json
          status: string
          store_domain: string
          updated_at: string
          webhook_secret: string | null
        }
        Insert: {
          configurator_id?: string | null
          created_at?: string
          credentials?: Json
          credentials_hint?: string | null
          currency?: string
          id?: string
          label: string
          last_error?: string | null
          last_sync_at?: string | null
          organization_id: string
          product_count?: number
          provider: string
          settings?: Json
          status?: string
          store_domain: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Update: {
          configurator_id?: string | null
          created_at?: string
          credentials?: Json
          credentials_hint?: string | null
          currency?: string
          id?: string
          label?: string
          last_error?: string | null
          last_sync_at?: string | null
          organization_id?: string
          product_count?: number
          provider?: string
          settings?: Json
          status?: string
          store_domain?: string
          updated_at?: string
          webhook_secret?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_connections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_pairings: {
        Row: {
          code: string
          configurator_id: string | null
          connection_id: string | null
          created_at: string
          expires_at: string
          id: string
          organization_id: string
          paired_site: string | null
          provider: string
          status: string
          used_at: string | null
        }
        Insert: {
          code: string
          configurator_id?: string | null
          connection_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          organization_id: string
          paired_site?: string | null
          provider?: string
          status?: string
          used_at?: string | null
        }
        Update: {
          code?: string
          configurator_id?: string | null
          connection_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          organization_id?: string
          paired_site?: string | null
          provider?: string
          status?: string
          used_at?: string | null
        }
        Relationships: []
      }
      catalog_sync_runs: {
        Row: {
          archived_count: number
          connection_id: string
          created_count: number
          error: string | null
          failed_count: number
          finished_at: string | null
          id: string
          organization_id: string
          skipped_count: number
          started_at: string
          status: string
          trigger: string
          updated_count: number
        }
        Insert: {
          archived_count?: number
          connection_id: string
          created_count?: number
          error?: string | null
          failed_count?: number
          finished_at?: string | null
          id?: string
          organization_id: string
          skipped_count?: number
          started_at?: string
          status?: string
          trigger?: string
          updated_count?: number
        }
        Update: {
          archived_count?: number
          connection_id?: string
          created_count?: number
          error?: string | null
          failed_count?: number
          finished_at?: string | null
          id?: string
          organization_id?: string
          skipped_count?: number
          started_at?: string
          status?: string
          trigger?: string
          updated_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "catalog_sync_runs_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "catalog_connections"
            referencedColumns: ["id"]
          },
        ]
      }
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
          payload: Json
          session_id: string | null
          step: number | null
          visitor_id: string | null
        }
        Insert: {
          configurator_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          organization_id: string
          payload?: Json
          session_id?: string | null
          step?: number | null
          visitor_id?: string | null
        }
        Update: {
          configurator_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          organization_id?: string
          payload?: Json
          session_id?: string | null
          step?: number | null
          visitor_id?: string | null
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
      product_imports: {
        Row: {
          id: string
          organization_id: string
          source: string
          status: string
          row_count: number
          imported_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          source?: string
          status?: string
          row_count?: number
          imported_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          source?: string
          status?: string
          row_count?: number
          imported_at?: string
        }
        Relationships: []
      }
      prospect_access: {
        Row: {
          id: string
          organization_id: string
          quote_id: string
          token: string
          pin_hash: string
          expires_at: string
          last_accessed: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          quote_id: string
          token: string
          pin_hash: string
          expires_at: string
          last_accessed?: string | null
          created_at?: string
        }
        Update: {
          last_accessed?: string | null
        }
        Relationships: []
      }
      prospect_messages: {
        Row: {
          id: string
          organization_id: string
          quote_id: string
          sender: string
          content: string
          sent_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          quote_id: string
          sender: string
          content: string
          sent_at?: string
          read_at?: string | null
        }
        Update: {
          read_at?: string | null
        }
        Relationships: []
      }
      woo_connections: {
        Row: {
          id: string
          organization_id: string
          site_url: string
          consumer_key: string
          consumer_secret: string
          last_sync: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          site_url: string
          consumer_key: string
          consumer_secret: string
          last_sync?: string | null
          created_at?: string
        }
        Update: {
          site_url?: string
          consumer_key?: string
          consumer_secret?: string
          last_sync?: string | null
        }
        Relationships: []
      }
      quote_assignees: {
        Row: {
          created_at: string
          organization_id: string
          quote_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          organization_id: string
          quote_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          organization_id?: string
          quote_id?: string
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
          archived_by_sync: boolean
          configurator_id: string
          connection_id: string | null
          content_hash: string | null
          created_at: string
          currency: string
          description: string | null
          external_id: string | null
          external_updated_at: string | null
          external_url: string | null
          id: string
          image_url: string | null
          images: Json
          is_active: boolean
          name: string
          options: Json
          organization_id: string
          price_max: number | null
          price_min: number | null
          sku: string | null
          category: string | null
          required_fields: Json
          source: string
          stock_status: string | null
          synced_at: string | null
          tags: string[]
          updated_at: string
          variants: Json
        }
        Insert: {
          archived_by_sync?: boolean
          configurator_id: string
          connection_id?: string | null
          content_hash?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          external_id?: string | null
          external_updated_at?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          images?: Json
          is_active?: boolean
          name: string
          options?: Json
          organization_id: string
          price_max?: number | null
          price_min?: number | null
          sku?: string | null
          category?: string | null
          required_fields?: Json
          source?: string
          stock_status?: string | null
          synced_at?: string | null
          tags?: string[]
          updated_at?: string
          variants?: Json
        }
        Update: {
          archived_by_sync?: boolean
          configurator_id?: string
          connection_id?: string | null
          content_hash?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          external_id?: string | null
          external_updated_at?: string | null
          external_url?: string | null
          id?: string
          image_url?: string | null
          images?: Json
          is_active?: boolean
          name?: string
          options?: Json
          organization_id?: string
          price_max?: number | null
          price_min?: number | null
          sku?: string | null
          category?: string | null
          required_fields?: Json
          source?: string
          stock_status?: string | null
          synced_at?: string | null
          tags?: string[]
          updated_at?: string
          variants?: Json
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
          landing_path: string | null
          last_activity_at: string
          mode: string
          organization_id: string
          referrer: string | null
          selected_suggestion_id: string | null
          submitted_quote_id: string | null
          token: string
          updated_at: string
          contact_draft: Json
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_id: string | null
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
          landing_path?: string | null
          last_activity_at?: string
          mode?: string
          organization_id: string
          referrer?: string | null
          selected_suggestion_id?: string | null
          submitted_quote_id?: string | null
          token: string
          updated_at?: string
          contact_draft?: Json
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
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
          landing_path?: string | null
          last_activity_at?: string
          mode?: string
          organization_id?: string
          referrer?: string | null
          selected_suggestion_id?: string | null
          submitted_quote_id?: string | null
          token?: string
          updated_at?: string
          contact_draft?: Json
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_id?: string | null
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
          referrer: string | null
          score: number | null
          score_label: string | null
          session_id: string | null
          status: string
          status_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
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
          referrer?: string | null
          score?: number | null
          score_label?: string | null
          session_id?: string | null
          status?: string
          status_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
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
          referrer?: string | null
          score?: number | null
          score_label?: string | null
          session_id?: string | null
          status?: string
          status_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
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

export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]
