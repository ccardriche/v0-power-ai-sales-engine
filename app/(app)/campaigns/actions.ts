'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type { CampaignKpiTargets } from '@/lib/types/db'

interface SequenceDraft {
  name: string
  rationale: string
  steps: StepDraft[]
}

interface StepDraft {
  step_index: number
  channel: 'email' | 'sms' | 'linkedin'
  delay_hours: number
  message_goal?: string
  subject_template: string
  prompt_template: string
  personalization_angle: string
  stop_condition: string
  compliance_notes: string
  variant?: string
}

async function getCompanyId() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('companies')
    .select('id')
    .eq('name', 'Power AI Funds')
    .single()
  return data?.id
}

export async function createCampaignDraft(formData: FormData) {
  const supabase = await createClient()
  const companyId = await getCompanyId()
  
  if (!companyId) {
    throw new Error('Company not found')
  }

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    redirect('/sign-in')
  }

  const kpiTargets: CampaignKpiTargets = {
    target_segment_id: formData.get('target_segment_id') as string || undefined,
    target_segment_name: formData.get('target_segment_name') as string || undefined,
    leads_needed: parseInt(formData.get('leads_needed') as string) || undefined,
    lead_pull_frequency: formData.get('lead_pull_frequency') as CampaignKpiTargets['lead_pull_frequency'],
    geography: formData.get('geography') as string || undefined,
    industry: formData.get('industry') as string || undefined,
    role_title: formData.get('role_title') as string || undefined,
    keywords: formData.get('keywords') as string || undefined,
    offer_promoted: formData.get('offer_promoted') as string || undefined,
    channels: JSON.parse(formData.get('channels') as string || '[]'),
    sequence_length: parseInt(formData.get('sequence_length') as string) || 7,
    approval_required: true,
  }

  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      company_id: companyId,
      name: formData.get('name') as string,
      status: 'draft',
      kpi_targets: kpiTargets,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create campaign: ${error.message}`)
  }

  return { campaignId: data.id }
}

export async function saveSubSegments(campaignId: string, subSegments: Array<{ name: string; description: string; icp_criteria: Record<string, unknown> }>) {
  const supabase = await createClient()
  const companyId = await getCompanyId()
  
  if (!companyId) {
    throw new Error('Company not found')
  }

  const segmentIds: string[] = []

  for (const segment of subSegments) {
    const { data, error } = await supabase
      .from('segments')
      .upsert({
        company_id: companyId,
        name: segment.name,
        description: segment.description,
        icp_criteria: segment.icp_criteria,
      }, { onConflict: 'company_id,name' })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to save segment:', error)
      continue
    }
    segmentIds.push(data.id)
  }

  // Update campaign with sub_segment_ids
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('kpi_targets')
    .eq('id', campaignId)
    .single()

  const updatedTargets = {
    ...(campaign?.kpi_targets || {}),
    sub_segment_ids: segmentIds,
  }

  await supabase
    .from('campaigns')
    .update({ kpi_targets: updatedTargets })
    .eq('id', campaignId)

  revalidatePath('/campaigns/new')
  return { segmentIds }
}

export async function finalizeCampaignDraft({
  campaignId,
  sequences,
}: {
  campaignId: string
  sequences: SequenceDraft[]
}) {
  const supabase = await createClient()
  const companyId = await getCompanyId()
  
  if (!companyId) {
    throw new Error('Company not found')
  }

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    redirect('/sign-in')
  }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('name')
    .eq('id', campaignId)
    .single()

  const campaignName = campaign?.name || 'Untitled Campaign'

  for (const sequence of sequences) {
    // 1. Insert outreach_sequences row
    const { data: seqData, error: seqError } = await supabase
      .from('outreach_sequences')
      .insert({
        company_id: companyId,
        campaign_id: campaignId,
        name: sequence.name,
        rationale: sequence.rationale,
        status: 'draft',
      })
      .select('id')
      .single()

    if (seqError) {
      throw new Error(`Failed to create sequence: ${seqError.message}`)
    }

    const sequenceId = seqData.id

    // 2. Insert sequence_steps rows
    for (const step of sequence.steps) {
      const { error: stepError } = await supabase
        .from('sequence_steps')
        .insert({
          sequence_id: sequenceId,
          step_index: step.step_index,
          channel: step.channel,
          delay_hours: step.delay_hours,
          subject_template: step.subject_template,
          prompt_template: step.prompt_template,
          personalization_angle: step.personalization_angle,
          stop_condition: step.stop_condition,
          compliance_notes: step.compliance_notes,
          variant: step.variant || 'A',
        })

      if (stepError) {
        console.error('Failed to create step:', stepError)
      }
    }

    // 3. Insert approvals row
    const firstChannel = sequence.steps[0]?.channel || 'email'
    const { error: approvalError } = await supabase
      .from('approvals')
      .insert({
        company_id: companyId,
        channel: firstChannel,
        entity_table: 'outreach_sequences',
        entity_id: sequenceId,
        summary: `${campaignName} sequence — ${sequence.steps.length} steps`,
        status: 'pending_approval',
        requested_by: user.user.email,
      })

    if (approvalError) {
      console.error('Failed to create approval:', approvalError)
    }

    // 4. Insert channel_activity row
    await supabase
      .from('channel_activity')
      .insert({
        company_id: companyId,
        channel: 'system',
        action: `Created sequence "${sequence.name}" with ${sequence.steps.length} steps`,
        dry_run: false,
      })
  }

  // 5. Insert agent_logs row
  await supabase
    .from('agent_logs')
    .insert({
      company_id: companyId,
      action: 'campaign_finalized',
      details: {
        campaign_id: campaignId,
        campaign_name: campaignName,
        sequences_count: sequences.length,
        total_steps: sequences.reduce((acc, s) => acc + s.steps.length, 0),
      },
    })

  // 6. Update campaign status
  await supabase
    .from('campaigns')
    .update({ status: 'pending_approval' })
    .eq('id', campaignId)

  revalidatePath('/approvals')
  revalidatePath('/campaigns')
  redirect('/approvals')
}
