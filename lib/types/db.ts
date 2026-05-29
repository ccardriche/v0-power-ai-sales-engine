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
  created_at: string
  updated_at: string
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
  status: 'pending_approval' | 'approved' | 'rejected'
  content: string | null
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
