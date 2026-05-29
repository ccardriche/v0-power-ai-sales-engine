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
      agent_logs: {
        Row: {
          action: string
          agent: string | null
          company_id: string | null
          created_at: string | null
          data: Json | null
          details: Json | null
          dry_run: boolean | null
          id: string
          level: string | null
          message: string | null
        }
        Insert: {
          action: string
          agent?: string | null
          company_id?: string | null
          created_at?: string | null
          data?: Json | null
          details?: Json | null
          dry_run?: boolean | null
          id?: string
          level?: string | null
          message?: string | null
        }
        Update: {
          action?: string
          agent?: string | null
          company_id?: string | null
          created_at?: string | null
          data?: Json | null
          details?: Json | null
          dry_run?: boolean | null
          id?: string
          level?: string | null
          message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_logs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      approvals: {
        Row: {
          channel: string | null
          company_id: string | null
          created_at: string | null
          entity_id: string
          entity_table: string | null
          entity_type: string
          id: string
          requested_by: string | null
          reviewed_at: string | null
          reviewer_notes: string | null
          source: string | null
          status: string | null
          summary: string | null
        }
        Insert: {
          channel?: string | null
          company_id?: string | null
          created_at?: string | null
          entity_id: string
          entity_table?: string | null
          entity_type: string
          id?: string
          requested_by?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          source?: string | null
          status?: string | null
          summary?: string | null
        }
        Update: {
          channel?: string | null
          company_id?: string | null
          created_at?: string | null
          entity_id?: string
          entity_table?: string | null
          entity_type?: string
          id?: string
          requested_by?: string | null
          reviewed_at?: string | null
          reviewer_notes?: string | null
          source?: string | null
          status?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "approvals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          budget: number | null
          company_id: string | null
          created_at: string | null
          id: string
          kpi_targets: Json | null
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          kpi_targets?: Json | null
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          kpi_targets?: Json | null
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_activity: {
        Row: {
          action: string
          channel: string
          company_id: string | null
          created_at: string | null
          details: Json | null
          dry_run: boolean | null
          id: string
        }
        Insert: {
          action: string
          channel: string
          company_id?: string | null
          created_at?: string | null
          details?: Json | null
          dry_run?: boolean | null
          id?: string
        }
        Update: {
          action?: string
          channel?: string
          company_id?: string | null
          created_at?: string | null
          details?: Json | null
          dry_run?: boolean | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_activity_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          approved_ctas: Json | null
          average_deal_size: string | null
          brand_voice: string | null
          case_studies: string | null
          communication_channels: Json | null
          company_size: string | null
          competitors: Json | null
          compliance_config: Json | null
          content_themes: Json | null
          created_at: string | null
          email_signature: string | null
          founding_year: number | null
          icp_description: string | null
          id: string
          industry: string | null
          location: string | null
          logo_url: string | null
          meeting_link: string | null
          name: string
          objection_handling: Json | null
          offer: string | null
          pain_points_solved: Json | null
          pricing_model: string | null
          primary_sales_goal: string | null
          products_services: Json | null
          sales_cycle_length: string | null
          social_profiles: Json | null
          target_customer: string | null
          timezone: string | null
          unique_differentiators: Json | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          approved_ctas?: Json | null
          average_deal_size?: string | null
          brand_voice?: string | null
          case_studies?: string | null
          communication_channels?: Json | null
          company_size?: string | null
          competitors?: Json | null
          compliance_config?: Json | null
          content_themes?: Json | null
          created_at?: string | null
          email_signature?: string | null
          founding_year?: number | null
          icp_description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          meeting_link?: string | null
          name: string
          objection_handling?: Json | null
          offer?: string | null
          pain_points_solved?: Json | null
          pricing_model?: string | null
          primary_sales_goal?: string | null
          products_services?: Json | null
          sales_cycle_length?: string | null
          social_profiles?: Json | null
          target_customer?: string | null
          timezone?: string | null
          unique_differentiators?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          approved_ctas?: Json | null
          average_deal_size?: string | null
          brand_voice?: string | null
          case_studies?: string | null
          communication_channels?: Json | null
          company_size?: string | null
          competitors?: Json | null
          compliance_config?: Json | null
          content_themes?: Json | null
          created_at?: string | null
          email_signature?: string | null
          founding_year?: number | null
          icp_description?: string | null
          id?: string
          industry?: string | null
          location?: string | null
          logo_url?: string | null
          meeting_link?: string | null
          name?: string
          objection_handling?: Json | null
          offer?: string | null
          pain_points_solved?: Json | null
          pricing_model?: string | null
          primary_sales_goal?: string | null
          products_services?: Json | null
          sales_cycle_length?: string | null
          social_profiles?: Json | null
          target_customer?: string | null
          timezone?: string | null
          unique_differentiators?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      contact_imports: {
        Row: {
          company_id: string | null
          created_at: string | null
          errors: Json | null
          file_name: string | null
          id: string
          rows_imported: number | null
          status: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          errors?: Json | null
          file_name?: string | null
          id?: string
          rows_imported?: number | null
          status?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          errors?: Json | null
          file_name?: string | null
          id?: string
          rows_imported?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_imports_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string | null
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          linkedin_url: string | null
          organization: string | null
          phone: string | null
          status: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          organization?: string | null
          phone?: string | null
          status?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          linkedin_url?: string | null
          organization?: string | null
          phone?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      content_calendar: {
        Row: {
          approval_status: string | null
          audience: string | null
          company_id: string | null
          content_theme: string | null
          content_type: string | null
          created_at: string | null
          cta: string | null
          day: string | null
          id: string
          platform: string | null
          post_goal: string | null
          scheduled_date: string | null
          source_copy: string | null
          status: string | null
          title: string
          week: number | null
        }
        Insert: {
          approval_status?: string | null
          audience?: string | null
          company_id?: string | null
          content_theme?: string | null
          content_type?: string | null
          created_at?: string | null
          cta?: string | null
          day?: string | null
          id?: string
          platform?: string | null
          post_goal?: string | null
          scheduled_date?: string | null
          source_copy?: string | null
          status?: string | null
          title: string
          week?: number | null
        }
        Update: {
          approval_status?: string | null
          audience?: string | null
          company_id?: string | null
          content_theme?: string | null
          content_type?: string | null
          created_at?: string | null
          cta?: string | null
          day?: string | null
          id?: string
          platform?: string | null
          post_goal?: string | null
          scheduled_date?: string | null
          source_copy?: string | null
          status?: string | null
          title?: string
          week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_calendar_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          company_id: string | null
          config: Json | null
          created_at: string | null
          id: string
          provider: string
          status: string | null
        }
        Insert: {
          company_id?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          provider: string
          status?: string | null
        }
        Update: {
          company_id?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          provider?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_segments: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string | null
          segment_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          segment_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          segment_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_segments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lead_segments_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_sources: {
        Row: {
          company_id: string | null
          config: Json | null
          created_at: string | null
          id: string
          name: string
          source_type: string | null
        }
        Insert: {
          company_id?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          name: string
          source_type?: string | null
        }
        Update: {
          company_id?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          name?: string
          source_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_sources_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          crm_status: string | null
          id: string
          score: number | null
          score_breakdown: Json | null
          sequence_status: string | null
          sms_opt_in: boolean | null
          source: string | null
          status: string | null
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          crm_status?: string | null
          id?: string
          score?: number | null
          score_breakdown?: Json | null
          sequence_status?: string | null
          sms_opt_in?: boolean | null
          source?: string | null
          status?: string | null
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          crm_status?: string | null
          id?: string
          score?: number | null
          score_breakdown?: Json | null
          sequence_status?: string | null
          sms_opt_in?: boolean | null
          source?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_events: {
        Row: {
          company_id: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_events_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_messages: {
        Row: {
          approval_status: string | null
          body: string | null
          channel: string
          company_id: string | null
          created_at: string | null
          id: string
          lead_id: string | null
          sent_at: string | null
          sequence_step_id: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          approval_status?: string | null
          body?: string | null
          channel: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          sent_at?: string | null
          sequence_step_id?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          approval_status?: string | null
          body?: string | null
          channel?: string
          company_id?: string | null
          created_at?: string | null
          id?: string
          lead_id?: string | null
          sent_at?: string | null
          sequence_step_id?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_messages_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_messages_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_messages_sequence_step_id_fkey"
            columns: ["sequence_step_id"]
            isOneToOne: false
            referencedRelation: "sequence_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      outreach_sequences: {
        Row: {
          campaign_id: string | null
          company_id: string | null
          created_at: string | null
          id: string
          name: string
          rationale: string | null
          status: string | null
        }
        Insert: {
          campaign_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          rationale?: string | null
          status?: string | null
        }
        Update: {
          campaign_id?: string | null
          company_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          rationale?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "outreach_sequences_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outreach_sequences_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_metrics: {
        Row: {
          company_id: string | null
          created_at: string | null
          engagements: number | null
          id: string
          impressions: number | null
          metric: string
          scope: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          engagements?: number | null
          id?: string
          impressions?: number | null
          metric: string
          scope?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          engagements?: number | null
          id?: string
          impressions?: number | null
          metric?: string
          scope?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_metrics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      segments: {
        Row: {
          company_id: string | null
          created_at: string | null
          description: string | null
          icp_criteria: Json | null
          id: string
          name: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          icp_criteria?: Json | null
          id?: string
          name: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          icp_criteria?: Json | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "segments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_enrollments: {
        Row: {
          company_id: string | null
          created_at: string | null
          current_step: number | null
          id: string
          lead_id: string | null
          sequence_id: string | null
          status: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          lead_id?: string | null
          sequence_id?: string | null
          status?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          lead_id?: string | null
          sequence_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sequence_enrollments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_enrollments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_enrollments_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "outreach_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      sequence_steps: {
        Row: {
          channel: string
          compliance_notes: string | null
          created_at: string | null
          delay_hours: number | null
          id: string
          personalization_angle: string | null
          prompt_template: string | null
          sequence_id: string | null
          step_index: number
          stop_condition: string | null
          subject_template: string | null
          variant: string | null
        }
        Insert: {
          channel: string
          compliance_notes?: string | null
          created_at?: string | null
          delay_hours?: number | null
          id?: string
          personalization_angle?: string | null
          prompt_template?: string | null
          sequence_id?: string | null
          step_index: number
          stop_condition?: string | null
          subject_template?: string | null
          variant?: string | null
        }
        Update: {
          channel?: string
          compliance_notes?: string | null
          created_at?: string | null
          delay_hours?: number | null
          id?: string
          personalization_angle?: string | null
          prompt_template?: string | null
          sequence_id?: string | null
          step_index?: number
          stop_condition?: string | null
          subject_template?: string | null
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "outreach_sequences"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          approval_status: string | null
          audience: string | null
          buffer_status: string | null
          calendar_id: string | null
          clicks: number | null
          company_id: string | null
          content: string | null
          content_theme: string | null
          created_at: string | null
          cta: string | null
          day: string | null
          engagements: number | null
          hook: string | null
          id: string
          image_prompt: string | null
          impressions: number | null
          likes: number | null
          media_url: string | null
          platform: string
          post_goal: string | null
          rationale: string | null
          scheduled_for: string | null
          source: string | null
          status: string | null
          video_prompt: string | null
          week: number | null
        }
        Insert: {
          approval_status?: string | null
          audience?: string | null
          buffer_status?: string | null
          calendar_id?: string | null
          clicks?: number | null
          company_id?: string | null
          content?: string | null
          content_theme?: string | null
          created_at?: string | null
          cta?: string | null
          day?: string | null
          engagements?: number | null
          hook?: string | null
          id?: string
          image_prompt?: string | null
          impressions?: number | null
          likes?: number | null
          media_url?: string | null
          platform: string
          post_goal?: string | null
          rationale?: string | null
          scheduled_for?: string | null
          source?: string | null
          status?: string | null
          video_prompt?: string | null
          week?: number | null
        }
        Update: {
          approval_status?: string | null
          audience?: string | null
          buffer_status?: string | null
          calendar_id?: string | null
          clicks?: number | null
          company_id?: string | null
          content?: string | null
          content_theme?: string | null
          created_at?: string | null
          cta?: string | null
          day?: string | null
          engagements?: number | null
          hook?: string | null
          id?: string
          image_prompt?: string | null
          impressions?: number | null
          likes?: number | null
          media_url?: string | null
          platform?: string
          post_goal?: string | null
          rationale?: string | null
          scheduled_for?: string | null
          source?: string | null
          status?: string | null
          video_prompt?: string | null
          week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "social_posts_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "content_calendar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string | null
          id: string
          leads_per_month: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          leads_per_month?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          leads_per_month?: number
          name?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          company_id: string | null
          created_at: string | null
          ends_at: string | null
          id: string
          plan_id: string | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          ends_at?: string | null
          id?: string
          plan_id?: string | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      suppression_list: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string
          id: string
          reason: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email: string
          id?: string
          reason?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string
          id?: string
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppression_list_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_limits: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          leads_used: number | null
          period_end: string
          period_start: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          leads_used?: number | null
          period_end: string
          period_start: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          leads_used?: number | null
          period_end?: string
          period_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_limits_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
