'use server'

import { createClient } from '@/lib/supabase/server'

interface OnboardingData {
  name: string
  website: string
  offer: string
  target_customer: string
  icp_description: string
  primary_sales_goal: string
  brand_voice: string
  approved_ctas: string[]
  case_studies: string
  unsubscribe_url: string
  physical_address: string
  quiet_hours_start: string
  quiet_hours_end: string
  default_opt_in_source: string
}

export async function saveOnboarding(data: OnboardingData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('companies')
    .update({
      name: data.name,
      website: data.website,
      offer: data.offer,
      target_customer: data.target_customer,
      icp_description: data.icp_description,
      primary_sales_goal: data.primary_sales_goal,
      brand_voice: data.brand_voice,
      approved_ctas: data.approved_ctas,
      case_studies: data.case_studies,
      compliance_config: {
        unsubscribe_url: data.unsubscribe_url,
        physical_address: data.physical_address,
        quiet_hours_start: data.quiet_hours_start,
        quiet_hours_end: data.quiet_hours_end,
        default_opt_in_source: data.default_opt_in_source,
      },
    })
    .eq('name', 'Power AI Funds')

  if (error) {
    console.error('Error saving onboarding data:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
