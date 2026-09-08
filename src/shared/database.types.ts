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
      ad_campaign_configs: {
        Row: {
          ad_account_id: string
          created_at: string
          currency: string
          daily_budget_cents: number
          external_ad_id: string | null
          external_ad_set_id: string | null
          external_campaign_id: string | null
          external_creative_id: string | null
          generation_id: string
          id: string
          last_error: string | null
          objective: string
          operation_key: string
          status: Database["public"]["Enums"]["ad_campaign_status"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          ad_account_id: string
          created_at?: string
          currency?: string
          daily_budget_cents: number
          external_ad_id?: string | null
          external_ad_set_id?: string | null
          external_campaign_id?: string | null
          external_creative_id?: string | null
          generation_id: string
          id?: string
          last_error?: string | null
          objective: string
          operation_key: string
          status?: Database["public"]["Enums"]["ad_campaign_status"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          ad_account_id?: string
          created_at?: string
          currency?: string
          daily_budget_cents?: number
          external_ad_id?: string | null
          external_ad_set_id?: string | null
          external_campaign_id?: string | null
          external_creative_id?: string | null
          generation_id?: string
          id?: string
          last_error?: string | null
          objective?: string
          operation_key?: string
          status?: Database["public"]["Enums"]["ad_campaign_status"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_campaign_configs_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: true
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ad_campaign_configs_generation_workspace_fk"
            columns: ["generation_id", "workspace_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id", "workspace_id"]
          },
          {
            foreignKeyName: "ad_campaign_configs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_decisions: {
        Row: {
          client_name: string | null
          created_at: string
          feedback: string | null
          generation_id: string
          id: string
          ip_hash: string | null
          status: Database["public"]["Enums"]["approval_status"]
          user_agent: string | null
          workspace_id: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          feedback?: string | null
          generation_id: string
          id?: string
          ip_hash?: string | null
          status: Database["public"]["Enums"]["approval_status"]
          user_agent?: string | null
          workspace_id: string
        }
        Update: {
          client_name?: string | null
          created_at?: string
          feedback?: string | null
          generation_id?: string
          id?: string
          ip_hash?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          user_agent?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_decisions_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_decisions_generation_workspace_fk"
            columns: ["generation_id", "workspace_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id", "workspace_id"]
          },
          {
            foreignKeyName: "approval_decisions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      approval_links: {
        Row: {
          created_at: string
          expires_at: string
          generation_id: string
          id: string
          revoked_at: string | null
          token_hash: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          generation_id: string
          id?: string
          revoked_at?: string | null
          token_hash: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          generation_id?: string
          id?: string
          revoked_at?: string | null
          token_hash?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "approval_links_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "approval_links_generation_workspace_fk"
            columns: ["generation_id", "workspace_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id", "workspace_id"]
          },
          {
            foreignKeyName: "approval_links_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_type: string
          actor_user_id: string | null
          created_at: string
          id: number
          metadata: Json | null
          resource_id: string
          resource_type: string
          workspace_id: string
        }
        Insert: {
          action: string
          actor_type: string
          actor_user_id?: string | null
          created_at?: string
          id?: never
          metadata?: Json | null
          resource_id: string
          resource_type: string
          workspace_id: string
        }
        Update: {
          action?: string
          actor_type?: string
          actor_user_id?: string | null
          created_at?: string
          id?: never
          metadata?: Json | null
          resource_id?: string
          resource_type?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_user_id_fkey"
            columns: ["actor_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      brands: {
        Row: {
          created_at: string
          forbidden_words: string[]
          id: string
          name: string
          niche: string
          persona: Json
          target_audience: string
          tone_of_voice: string
          updated_at: string
          value_proposition: string
          voice_examples: string[]
          workspace_id: string
        }
        Insert: {
          created_at?: string
          forbidden_words?: string[]
          id?: string
          name: string
          niche: string
          persona?: Json
          target_audience: string
          tone_of_voice: string
          updated_at?: string
          value_proposition: string
          voice_examples?: string[]
          workspace_id: string
        }
        Update: {
          created_at?: string
          forbidden_words?: string[]
          id?: string
          name?: string
          niche?: string
          persona?: Json
          target_audience?: string
          tone_of_voice?: string
          updated_at?: string
          value_proposition?: string
          voice_examples?: string[]
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      generations: {
        Row: {
          ads_copy_variations: Json
          approval_status: Database["public"]["Enums"]["approval_status"]
          approved_at: string | null
          brand_profile_hash: string
          compliance: Json
          created_at: string
          id: string
          input_tokens: number | null
          latency_ms: number | null
          media_upload_id: string
          model: string
          organic_copy: Json
          output_tokens: number | null
          prompt_version: string
          schema_version: string
          updated_at: string
          version: number
          visual_analysis: Json
          workspace_id: string
        }
        Insert: {
          ads_copy_variations: Json
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          brand_profile_hash: string
          compliance: Json
          created_at?: string
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          media_upload_id: string
          model: string
          organic_copy: Json
          output_tokens?: number | null
          prompt_version: string
          schema_version: string
          updated_at?: string
          version?: number
          visual_analysis: Json
          workspace_id: string
        }
        Update: {
          ads_copy_variations?: Json
          approval_status?: Database["public"]["Enums"]["approval_status"]
          approved_at?: string | null
          brand_profile_hash?: string
          compliance?: Json
          created_at?: string
          id?: string
          input_tokens?: number | null
          latency_ms?: number | null
          media_upload_id?: string
          model?: string
          organic_copy?: Json
          output_tokens?: number | null
          prompt_version?: string
          schema_version?: string
          updated_at?: string
          version?: number
          visual_analysis?: Json
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generations_media_upload_id_fkey"
            columns: ["media_upload_id"]
            isOneToOne: true
            referencedRelation: "media_uploads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generations_upload_workspace_fk"
            columns: ["media_upload_id", "workspace_id"]
            isOneToOne: false
            referencedRelation: "media_uploads"
            referencedColumns: ["id", "workspace_id"]
          },
          {
            foreignKeyName: "generations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      media_uploads: {
        Row: {
          brand_id: string
          byte_size: number
          checksum_sha256: string
          created_at: string
          duration_ms: number | null
          height: number | null
          id: string
          mime_type: string
          original_name: string
          status: Database["public"]["Enums"]["upload_status"]
          storage_bucket: string
          storage_key: string
          updated_at: string
          uploaded_by_id: string
          width: number | null
          workspace_id: string
        }
        Insert: {
          brand_id: string
          byte_size: number
          checksum_sha256: string
          created_at?: string
          duration_ms?: number | null
          height?: number | null
          id?: string
          mime_type: string
          original_name: string
          status?: Database["public"]["Enums"]["upload_status"]
          storage_bucket: string
          storage_key: string
          updated_at?: string
          uploaded_by_id: string
          width?: number | null
          workspace_id: string
        }
        Update: {
          brand_id?: string
          byte_size?: number
          checksum_sha256?: string
          created_at?: string
          duration_ms?: number | null
          height?: number | null
          id?: string
          mime_type?: string
          original_name?: string
          status?: Database["public"]["Enums"]["upload_status"]
          storage_bucket?: string
          storage_key?: string
          updated_at?: string
          uploaded_by_id?: string
          width?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_uploads_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_uploads_brand_workspace_fk"
            columns: ["brand_id", "workspace_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id", "workspace_id"]
          },
          {
            foreignKeyName: "media_uploads_uploaded_by_id_fkey"
            columns: ["uploaded_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_uploads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_connections: {
        Row: {
          access_token_cipher: string
          access_token_iv: string
          access_token_tag: string
          ad_account_id: string | null
          brand_id: string
          created_at: string
          id: string
          instagram_account_id: string | null
          key_version: number
          last_validated_at: string | null
          page_id: string
          scopes: string[]
          status: Database["public"]["Enums"]["meta_connection_status"]
          token_expires_at: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          access_token_cipher: string
          access_token_iv: string
          access_token_tag: string
          ad_account_id?: string | null
          brand_id: string
          created_at?: string
          id?: string
          instagram_account_id?: string | null
          key_version: number
          last_validated_at?: string | null
          page_id: string
          scopes?: string[]
          status?: Database["public"]["Enums"]["meta_connection_status"]
          token_expires_at?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          access_token_cipher?: string
          access_token_iv?: string
          access_token_tag?: string
          ad_account_id?: string | null
          brand_id?: string
          created_at?: string
          id?: string
          instagram_account_id?: string | null
          key_version?: number
          last_validated_at?: string | null
          page_id?: string
          scopes?: string[]
          status?: Database["public"]["Enums"]["meta_connection_status"]
          token_expires_at?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meta_connections_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_connections_brand_workspace_fk"
            columns: ["brand_id", "workspace_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id", "workspace_id"]
          },
          {
            foreignKeyName: "meta_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          method: string | null
          mp_payment_id: string
          provider_updated_at: string
          raw_payload: Json
          status: string
          subscription_id: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          mp_payment_id: string
          provider_updated_at: string
          raw_payload: Json
          status: string
          subscription_id: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          method?: string | null
          mp_payment_id?: string
          provider_updated_at?: string
          raw_payload?: Json
          status?: string
          subscription_id?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_subscription_workspace_fk"
            columns: ["subscription_id", "workspace_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id", "workspace_id"]
          },
          {
            foreignKeyName: "payment_transactions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          active: boolean
          allows_ads: boolean
          allows_white_label: boolean
          brand_limit: number
          creative_limit: number
          id: string
          mp_preapproval_plan_id: string | null
          name: string
          price_cents: number
          version: number
        }
        Insert: {
          active?: boolean
          allows_ads?: boolean
          allows_white_label?: boolean
          brand_limit: number
          creative_limit: number
          id: string
          mp_preapproval_plan_id?: string | null
          name: string
          price_cents: number
          version?: number
        }
        Update: {
          active?: boolean
          allows_ads?: boolean
          allows_white_label?: boolean
          brand_limit?: number
          creative_limit?: number
          id?: string
          mp_preapproval_plan_id?: string | null
          name?: string
          price_cents?: number
          version?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      publication_attempts: {
        Row: {
          attempt_number: number
          error_class: string | null
          finished_at: string | null
          id: string
          provider_code: string | null
          sanitized_error: string | null
          schedule_id: string
          started_at: string
          workspace_id: string
        }
        Insert: {
          attempt_number: number
          error_class?: string | null
          finished_at?: string | null
          id?: string
          provider_code?: string | null
          sanitized_error?: string | null
          schedule_id: string
          started_at?: string
          workspace_id: string
        }
        Update: {
          attempt_number?: number
          error_class?: string | null
          finished_at?: string | null
          id?: string
          provider_code?: string | null
          sanitized_error?: string | null
          schedule_id?: string
          started_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "publication_attempts_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "publication_attempts_schedule_workspace_fk"
            columns: ["schedule_id", "workspace_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id", "workspace_id"]
          },
          {
            foreignKeyName: "publication_attempts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          channel: Database["public"]["Enums"]["schedule_channel"]
          created_at: string
          external_container_id: string | null
          external_post_id: string | null
          generation_id: string
          id: string
          last_error: string | null
          operation_key: string
          published_at: string | null
          retry_count: number
          scheduled_at: string
          status: Database["public"]["Enums"]["schedule_status"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["schedule_channel"]
          created_at?: string
          external_container_id?: string | null
          external_post_id?: string | null
          generation_id: string
          id?: string
          last_error?: string | null
          operation_key: string
          published_at?: string | null
          retry_count?: number
          scheduled_at: string
          status?: Database["public"]["Enums"]["schedule_status"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["schedule_channel"]
          created_at?: string
          external_container_id?: string | null
          external_post_id?: string | null
          generation_id?: string
          id?: string
          last_error?: string | null
          operation_key?: string
          published_at?: string | null
          retry_count?: number
          scheduled_at?: string
          status?: Database["public"]["Enums"]["schedule_status"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_generation_workspace_fk"
            columns: ["generation_id", "workspace_id"]
            isOneToOne: false
            referencedRelation: "generations"
            referencedColumns: ["id", "workspace_id"]
          },
          {
            foreignKeyName: "schedules_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_mode: string
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          mp_preapproval_id: string | null
          mp_preference_id: string | null
          plan_id: string
          provider_updated_at: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          workspace_id: string
        }
        Insert: {
          billing_mode: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          mp_preapproval_id?: string | null
          mp_preference_id?: string | null
          plan_id: string
          provider_updated_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          workspace_id: string
        }
        Update: {
          billing_mode?: string
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          mp_preapproval_id?: string | null
          mp_preference_id?: string | null
          plan_id?: string
          provider_updated_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_periods: {
        Row: {
          created_at: string
          creative_limit: number
          id: string
          period_end: string
          period_start: string
          reserved_creatives: number
          updated_at: string
          used_creatives: number
          workspace_id: string
        }
        Insert: {
          created_at?: string
          creative_limit: number
          id?: string
          period_end: string
          period_start: string
          reserved_creatives?: number
          updated_at?: string
          used_creatives?: number
          workspace_id: string
        }
        Update: {
          created_at?: string
          creative_limit?: number
          id?: string
          period_end?: string
          period_start?: string
          reserved_creatives?: number
          updated_at?: string
          used_creatives?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_periods_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          attempt_count: number
          event_type: string
          external_event_id: string
          id: string
          last_error: string | null
          payload: Json
          processed_at: string | null
          provider: Database["public"]["Enums"]["webhook_provider"]
          provider_created_at: string | null
          received_at: string
          resource_id: string
          status: Database["public"]["Enums"]["webhook_status"]
        }
        Insert: {
          attempt_count?: number
          event_type: string
          external_event_id: string
          id?: string
          last_error?: string | null
          payload: Json
          processed_at?: string | null
          provider: Database["public"]["Enums"]["webhook_provider"]
          provider_created_at?: string | null
          received_at?: string
          resource_id: string
          status?: Database["public"]["Enums"]["webhook_status"]
        }
        Update: {
          attempt_count?: number
          event_type?: string
          external_event_id?: string
          id?: string
          last_error?: string | null
          payload?: Json
          processed_at?: string | null
          provider?: Database["public"]["Enums"]["webhook_provider"]
          provider_created_at?: string | null
          received_at?: string
          resource_id?: string
          status?: Database["public"]["Enums"]["webhook_status"]
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      meta_connection_summaries: {
        Row: {
          ad_account_id: string | null
          brand_id: string | null
          created_at: string | null
          id: string | null
          instagram_account_id: string | null
          last_validated_at: string | null
          page_id: string | null
          scopes: string[] | null
          status: Database["public"]["Enums"]["meta_connection_status"] | null
          token_expires_at: string | null
          updated_at: string | null
          workspace_id: string | null
        }
        Insert: {
          ad_account_id?: string | null
          brand_id?: string | null
          created_at?: string | null
          id?: string | null
          instagram_account_id?: string | null
          last_validated_at?: string | null
          page_id?: string | null
          scopes?: string[] | null
          status?: Database["public"]["Enums"]["meta_connection_status"] | null
          token_expires_at?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Update: {
          ad_account_id?: string | null
          brand_id?: string | null
          created_at?: string | null
          id?: string | null
          instagram_account_id?: string | null
          last_validated_at?: string | null
          page_id?: string | null
          scopes?: string[] | null
          status?: Database["public"]["Enums"]["meta_connection_status"] | null
          token_expires_at?: string | null
          updated_at?: string | null
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meta_connections_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: true
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_connections_brand_workspace_fk"
            columns: ["brand_id", "workspace_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id", "workspace_id"]
          },
          {
            foreignKeyName: "meta_connections_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_brand_with_plan_limit: {
        Args: {
          p_forbidden_words: string[]
          p_name: string
          p_niche: string
          p_persona: Json
          p_target_audience: string
          p_tone_of_voice: string
          p_value_proposition: string
          p_voice_examples: string[]
          p_workspace_id: string
        }
        Returns: {
          created_at: string
          forbidden_words: string[]
          id: string
          name: string
          niche: string
          persona: Json
          target_audience: string
          tone_of_voice: string
          updated_at: string
          value_proposition: string
          voice_examples: string[]
          workspace_id: string
        }
      }
    }
    Enums: {
      ad_campaign_status: "draft" | "active" | "paused" | "failed"
      approval_status: "pending_review" | "changes_requested" | "approved"
      meta_connection_status: "active" | "expiring" | "needs_reauth" | "revoked"
      schedule_channel:
        | "instagram_feed"
        | "instagram_reel"
        | "instagram_story"
        | "facebook_page"
      schedule_status: "scheduled" | "publishing" | "published" | "failed"
      subscription_status:
        | "pending"
        | "trialing"
        | "active"
        | "past_due"
        | "paused"
        | "canceled"
        | "suspended"
      upload_status: "pending" | "uploaded" | "processing" | "ready" | "failed"
      webhook_provider: "mercadopago" | "meta"
      webhook_status:
        | "received"
        | "queued"
        | "processing"
        | "processed"
        | "retryable"
        | "dead_letter"
      workspace_role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      ad_campaign_status: ["draft", "active", "paused", "failed"],
      approval_status: ["pending_review", "changes_requested", "approved"],
      meta_connection_status: ["active", "expiring", "needs_reauth", "revoked"],
      schedule_channel: [
        "instagram_feed",
        "instagram_reel",
        "instagram_story",
        "facebook_page",
      ],
      schedule_status: ["scheduled", "publishing", "published", "failed"],
      subscription_status: [
        "pending",
        "trialing",
        "active",
        "past_due",
        "paused",
        "canceled",
        "suspended",
      ],
      upload_status: ["pending", "uploaded", "processing", "ready", "failed"],
      webhook_provider: ["mercadopago", "meta"],
      webhook_status: [
        "received",
        "queued",
        "processing",
        "processed",
        "retryable",
        "dead_letter",
      ],
      workspace_role: ["OWNER", "ADMIN", "EDITOR", "VIEWER"],
    },
  },
} as const

