export interface Company {
  id: string
  name: string
  website: string | null
  offer: string | null
  target_customer: string | null
  icp_description: string | null
  primary_sales_goal: string | null
  brand_voice: string | null
  approved_ctas: string[] | null
  case_studies: string | null
  compliance_config: ComplianceConfig | null
  // New comprehensive fields
  industry: string | null
  company_size: string | null
  founding_year: number | null
  location: string | null
  products_services: ProductService[] | null
  pricing_model: string | null
  average_deal_size: string | null
  sales_cycle_length: string | null
  competitors: Competitor[] | null
  unique_differentiators: string[] | null
  pain_points_solved: string[] | null
  objection_handling: ObjectionResponse[] | null
  social_profiles: SocialProfiles | null
  content_themes: string[] | null
  communication_channels: string[] | null
  timezone: string | null
  email_signature: string | null
  meeting_link: string | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

export interface ProductService {
  name: string
  description: string
  price_range?: string
  target_audience?: string
}

export interface Competitor {
  name: string
  website?: string
  differentiator?: string
}

export interface ObjectionResponse {
  objection: string
  response: string
}

export interface SocialProfiles {
  linkedin?: string
  twitter?: string
  facebook?: string
  instagram?: string
  youtube?: string
  tiktok?: string
}

export interface ComplianceConfig {
  unsubscribe_url?: string
  physical_address?: string
  quiet_hours_start?: string
  quiet_hours_end?: string
  default_opt_in_source?: string
}

export interface Lead {
  id: string
  company_id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  score: number | null
  status: string | null
  created_at: string
}

export interface SequenceEnrollment {
  id: string
  company_id: string
  status: 'active' | 'paused' | 'completed' | 'cancelled'
  created_at: string
}

export interface Approval {
  id: string
  company_id: string
  entity_type: 'campaign' | 'sequence' | 'outreach_message' | 'social_post'
  entity_id: string
  status: 'pending_approval' | 'approved' | 'rejected'
  reviewer_notes: string | null
  created_at: string
  reviewed_at: string | null
}

export interface OutreachMessage {
  id: string
  company_id: string
  sequence_step_id: string | null
  lead_id: string | null
  channel: string
  subject: string | null
  body: string | null
  status: 'draft' | 'pending' | 'sent' | 'delivered' | 'failed'
  sent_at: string | null
  created_at: string
}

export interface LearningEvent {
  id: string
  company_id: string
  event_type: 'sent' | 'replied' | 'opened' | 'clicked'
  created_at: string
}

export interface ChannelActivity {
  id: string
  company_id: string
  channel: string
  action: string
  dry_run: boolean
  created_at: string
}

export interface SocialPost {
  id: string
  company_id: string
  content: string | null
  approval_status: 'pending' | 'approved' | 'rejected'
  buffer_status: 'not_scheduled' | 'scheduled' | 'posted'
  created_at: string
}

export interface PerformanceMetric {
  id: string
  company_id: string
  metric: string
  scope: string | null
  engagements: number | null
  impressions: number | null
  created_at: string
}

export interface Campaign {
  id: string
  company_id: string
  name: string
  status: 'draft' | 'pending_approval' | 'active' | 'paused' | 'completed'
  kpi_targets: CampaignKpiTargets | null
  created_at: string
  updated_at: string
}

export interface CampaignKpiTargets {
  target_segment_id?: string
  target_segment_name?: string
  leads_needed?: number
  lead_pull_frequency?: 'one-time' | 'daily' | 'weekly' | 'monthly'
  geography?: string
  industry?: string
  role_title?: string
  keywords?: string
  offer_promoted?: string
  channels?: string[]
  sequence_length?: number
  approval_required?: boolean
  sub_segment_ids?: string[]
}

export interface Segment {
  id: string
  company_id: string
  name: string
  description: string | null
  icp_criteria: Record<string, unknown> | null
  created_at: string
}

export interface OutreachSequence {
  id: string
  company_id: string
  campaign_id: string | null
  name: string
  rationale: string | null
  status: 'draft' | 'active' | 'paused' | 'completed'
  created_at: string
}

export interface SequenceStep {
  id: string
  sequence_id: string
  step_index: number
  channel: 'email' | 'sms' | 'linkedin'
  delay_hours: number
  subject_template: string | null
  prompt_template: string | null
  personalization_angle: string | null
  stop_condition: string | null
  compliance_notes: string | null
  variant: string | null
  created_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  leads_per_month: number
  created_at: string
}

export interface UsageLimit {
  id: string
  company_id: string
  period_start: string
  period_end: string
  leads_used: number
  created_at: string
}

export interface AgentLog {
  id: string
  company_id: string
  action: string
  details: Record<string, unknown> | null
  created_at: string
}
