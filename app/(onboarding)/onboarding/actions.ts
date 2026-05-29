'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { generateJSON } from '@/lib/anthropic'

// Get authenticated user's company
async function getCompany() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', user.id)
    .single()

  return company
}

// Step 1: Save company identity
export async function saveCompanyStep(data: {
  name: string
  website?: string
  offer?: string
  primary_sales_goal?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('companies')
    .update({
      name: data.name,
      website: data.website || null,
      offer: data.offer || null,
      primary_sales_goal: data.primary_sales_goal || null,
      onboarding_step: 'icp',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) throw error
  revalidatePath('/onboarding')
  redirect('/onboarding/icp')
}

// Step 2: Save ICP and segments
interface SegmentData {
  name: string
  description: string
  icp_criteria?: Record<string, unknown>
}

export async function saveICPStep(data: {
  target_customer: string
  icp_description: string
  segments: SegmentData[]
}) {
  const company = await getCompany()
  const supabase = await createClient()

  // Save ICP info
  const { error: updateError } = await supabase
    .from('companies')
    .update({
      target_customer: data.target_customer,
      icp_description: data.icp_description,
      onboarding_step: 'voice',
      updated_at: new Date().toISOString(),
    })
    .eq('id', company.id)

  if (updateError) throw updateError

  // Upsert segments
  for (const segment of data.segments) {
    const { error: segmentError } = await supabase
      .from('segments')
      .upsert({
        company_id: company.id,
        name: segment.name,
        description: segment.description,
        icp_criteria: segment.icp_criteria || {},
        status: 'active',
        source: 'ai-suggested',
      }, {
        onConflict: 'company_id,name',
      })

    if (segmentError) throw segmentError
  }

  revalidatePath('/onboarding')
  redirect('/onboarding/voice')
}

// Suggest segments using AI
export async function suggestSegments(data: {
  target_customer: string
  icp_description: string
}) {
  const company = await getCompany()

  const systemPrompt = `You are a business strategist. Given a company's offer, target customer, and ICP, propose exactly 5 distinct ICP sub-segments. Each should be specific and actionable.`

  const userPrompt = `Company offer: ${company.offer}
Target customer: ${data.target_customer}
ICP Description: ${data.icp_description}

Return ONLY valid JSON in this format:
{
  "segments": [
    {
      "name": "Segment name",
      "description": "2-3 sentence description",
      "icp_criteria": {
        "org_type": "e.g., nonprofit",
        "title_includes": "e.g., CFO",
        "size": "1-50",
        "geography": "e.g., US East",
        "mission_keywords": "e.g., education, impact"
      }
    }
  ]
}
`

  const result = await generateJSON({
    system: systemPrompt,
    user: userPrompt,
    maxTokens: 1500,
  })

  return result.segments || []
}

// Step 3: Save brand voice
export async function saveVoiceStep(data: {
  brand_voice: string
  approved_ctas: string[]
  case_studies: string
}) {
  const company = await getCompany()
  const supabase = await createClient()

  const { error } = await supabase
    .from('companies')
    .update({
      brand_voice: data.brand_voice,
      approved_ctas: data.approved_ctas,
      case_studies: data.case_studies || null,
      onboarding_step: 'compliance',
      updated_at: new Date().toISOString(),
    })
    .eq('id', company.id)

  if (error) throw error
  revalidatePath('/onboarding')
  redirect('/onboarding/compliance')
}

// Step 4: Save compliance settings
export async function saveComplianceStep(data: {
  unsubscribe_url: string
  physical_address: string
  quiet_hours_start: string
  quiet_hours_end: string
  default_opt_in_source?: string
  default_sender_name?: string
  default_reply_email?: string
}) {
  const company = await getCompany()
  const supabase = await createClient()

  const { error } = await supabase
    .from('companies')
    .update({
      compliance_config: {
        unsubscribe_url: data.unsubscribe_url,
        physical_address: data.physical_address,
        quiet_hours_start: data.quiet_hours_start,
        quiet_hours_end: data.quiet_hours_end,
        default_opt_in_source: data.default_opt_in_source || null,
        default_sender_name: data.default_sender_name || null,
        default_reply_email: data.default_reply_email || null,
      },
      onboarding_step: 'agents',
      updated_at: new Date().toISOString(),
    })
    .eq('id', company.id)

  if (error) throw error
  revalidatePath('/onboarding')
  redirect('/onboarding/agents')
}

// Fetch agent configurations for the user's company
export async function fetchAgentConfigurations() {
  const company = await getCompany()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('agent_configurations')
    .select('*')
    .eq('company_id', company.id)

  if (error) throw error
  return data || []
}

// Step 5: Finish onboarding with agent settings
interface AgentConfig {
  agent_name: string
  enabled: boolean
}

export async function finishOnboarding(agents: AgentConfig[]) {
  const company = await getCompany()
  const supabase = await createClient()

  // Update all agent configurations
  for (const agent of agents) {
    const { error } = await supabase
      .from('agent_configurations')
      .update({ enabled: agent.enabled })
      .eq('company_id', company.id)
      .eq('agent_name', agent.agent_name)

    if (error) throw error
  }

  // Mark onboarding as complete
  const { error: updateError } = await supabase
    .from('companies')
    .update({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      onboarding_step: 'done',
      updated_at: new Date().toISOString(),
    })
    .eq('id', company.id)

  if (updateError) throw updateError

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
