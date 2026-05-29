import type { Database } from './database.types'

type Tables = Database['public']['Tables']

// Row types (for reading)
export type Company = Tables['companies']['Row']
export type Lead = Tables['leads']['Row']
export type Contact = Tables['contacts']['Row']
export type Organization = Tables['organizations']['Row']
export type Approval = Tables['approvals']['Row']
export type AgentLog = Tables['agent_logs']['Row']
export type SocialPost = Tables['social_posts']['Row']
export type OutreachMessage = Tables['outreach_messages']['Row']
export type ContentCalendarRow = Tables['content_calendar']['Row']
export type Segment = Tables['segments']['Row']
export type SequenceStep = Tables['sequence_steps']['Row']
export type OutreachSequence = Tables['outreach_sequences']['Row']
export type SubscriptionPlan = Tables['subscription_plans']['Row']
export type UsageLimit = Tables['usage_limits']['Row']
export type Campaign = Tables['campaigns']['Row']
export type ChannelActivity = Tables['channel_activity']['Row']
export type LearningEvent = Tables['learning_events']['Row']
export type SequenceEnrollment = Tables['sequence_enrollments']['Row']
export type PerformanceMetric = Tables['performance_metrics']['Row']

// Insert types (for writing)
export type CompanyInsert = Tables['companies']['Insert']
export type LeadInsert = Tables['leads']['Insert']
export type ContactInsert = Tables['contacts']['Insert']
export type ApprovalInsert = Tables['approvals']['Insert']
export type AgentLogInsert = Tables['agent_logs']['Insert']
export type SocialPostInsert = Tables['social_posts']['Insert']
export type OutreachMessageInsert = Tables['outreach_messages']['Insert']
export type ContentCalendarInsert = Tables['content_calendar']['Insert']
export type ChannelActivityInsert = Tables['channel_activity']['Insert']

// JSONB column helpers
export type ComplianceConfig = {
  unsubscribe_url?: string
  physical_address?: string
  quiet_hours_start?: string
  quiet_hours_end?: string
  default_opt_in_source?: string
}

export type ScoreBreakdown = {
  icp_fit?: number
  title?: number
  size?: number
  mission?: number
  engagement?: number
  data_quality?: number
}

export type CampaignKpiTargets = {
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
