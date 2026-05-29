'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface ProductService {
  name: string
  description: string
  price_range: string
  target_audience: string
}

interface Competitor {
  name: string
  website: string
  differentiator: string
}

interface ObjectionResponse {
  objection: string
  response: string
}

interface OnboardingData {
  // Company
  name: string
  website: string
  industry: string
  company_size: string
  founding_year: string
  location: string
  timezone: string
  logo_url: string
  // Products & Services
  offer: string
  products_services: ProductService[]
  pricing_model: string
  average_deal_size: string
  sales_cycle_length: string
  // Customer
  target_customer: string
  icp_description: string
  primary_sales_goal: string
  pain_points_solved: string[]
  // Competitors
  competitors: Competitor[]
  unique_differentiators: string[]
  // Voice
  brand_voice: string
  approved_ctas: string[]
  case_studies: string
  content_themes: string[]
  // Objections
  objection_handling: ObjectionResponse[]
  // Channels
  communication_channels: string[]
  social_linkedin: string
  social_twitter: string
  social_facebook: string
  social_instagram: string
  social_youtube: string
  email_signature: string
  meeting_link: string
  // Compliance
  unsubscribe_url: string
  physical_address: string
  quiet_hours_start: string
  quiet_hours_end: string
  default_opt_in_source: string
}

export async function saveOnboarding(data: OnboardingData) {
  const supabase = await createClient()

  // First, check if the company exists
  const { data: existingCompany } = await supabase
    .from('companies')
    .select('id')
    .eq('name', 'Power AI Funds')
    .single()

  const companyData = {
    name: data.name || 'Power AI Funds',
    website: data.website || null,
    industry: data.industry || null,
    company_size: data.company_size || null,
    founding_year: data.founding_year ? parseInt(data.founding_year) : null,
    location: data.location || null,
    timezone: data.timezone || 'America/New_York',
    logo_url: data.logo_url || null,
    offer: data.offer || null,
    products_services: data.products_services.filter(p => p.name),
    pricing_model: data.pricing_model || null,
    average_deal_size: data.average_deal_size || null,
    sales_cycle_length: data.sales_cycle_length || null,
    target_customer: data.target_customer || null,
    icp_description: data.icp_description || null,
    primary_sales_goal: data.primary_sales_goal || null,
    pain_points_solved: data.pain_points_solved,
    competitors: data.competitors.filter(c => c.name),
    unique_differentiators: data.unique_differentiators,
    brand_voice: data.brand_voice || null,
    approved_ctas: data.approved_ctas,
    case_studies: data.case_studies || null,
    content_themes: data.content_themes,
    objection_handling: data.objection_handling.filter(o => o.objection),
    communication_channels: data.communication_channels,
    social_profiles: {
      linkedin: data.social_linkedin || null,
      twitter: data.social_twitter || null,
      facebook: data.social_facebook || null,
      instagram: data.social_instagram || null,
      youtube: data.social_youtube || null,
    },
    email_signature: data.email_signature || null,
    meeting_link: data.meeting_link || null,
    compliance_config: {
      unsubscribe_url: data.unsubscribe_url || null,
      physical_address: data.physical_address || null,
      quiet_hours_start: data.quiet_hours_start || '08:00',
      quiet_hours_end: data.quiet_hours_end || '21:00',
      default_opt_in_source: data.default_opt_in_source || null,
    },
    updated_at: new Date().toISOString(),
  }

  let error

  if (existingCompany) {
    // Update existing company
    const result = await supabase
      .from('companies')
      .update(companyData)
      .eq('id', existingCompany.id)
    error = result.error
  } else {
    // Insert new company (for new users)
    const result = await supabase
      .from('companies')
      .insert({
        ...companyData,
        id: '00000000-0000-0000-0000-000000000001', // Use fixed ID for now
      })
    error = result.error
  }

  if (error) {
    console.error('Error saving onboarding data:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
