'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateAgentConfiguration(
  agentName: string,
  data: {
    enabled: boolean
    goal: string
    schedule_cron: string
    schedule_label: string
    settings?: Record<string, unknown>
  }
) {
  const supabase = await createClient()

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  // Get user's company (for now, default to Power AI Funds for v1)
  // In v3, this will be scoped by RLS policies
  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .eq('name', 'Power AI Funds')
    .single()

  if (!companies) {
    throw new Error('Company not found')
  }

  // Update agent configuration
  const { error } = await supabase
    .from('agent_configurations')
    .update({
      enabled: data.enabled,
      goal: data.goal,
      schedule_cron: data.schedule_cron,
      schedule_label: data.schedule_label,
      settings: data.settings || {},
      updated_at: new Date().toISOString(),
    })
    .eq('company_id', companies.id)
    .eq('agent_name', agentName)

  if (error) {
    throw new Error(`Failed to update agent: ${error.message}`)
  }

  revalidatePath('/settings')
  return { success: true }
}

export async function getAgentConfiguration(agentName: string) {
  const supabase = await createClient()

  // Get the current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  // Get user's company
  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .eq('name', 'Power AI Funds')
    .single()

  if (!companies) {
    throw new Error('Company not found')
  }

  // Get agent configuration
  const { data, error } = await supabase
    .from('agent_configurations')
    .select('*')
    .eq('company_id', companies.id)
    .eq('agent_name', agentName)
    .single()

  if (error) {
    throw new Error(`Failed to fetch agent: ${error.message}`)
  }

  return data
}
