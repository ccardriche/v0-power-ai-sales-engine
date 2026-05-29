import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/agents/supabase-admin'
import { loadSafety, verifyCron, isManualRun } from '@/lib/agents/safety'
import { logAgent } from '@/lib/agents/log'
import { createClient } from '@/lib/supabase/server'

const AGENT_NAME = 'crm-memory'

/**
 * Lead scoring rules (no Claude needed):
 * - ICP fit: 25 points
 * - Title match: 20 points
 * - Company size match: 15 points
 * - Mission alignment: 8 points
 * - Engagement signals: 15 points
 * - Data quality: 10 points
 * - Max: 93 points (rounded to 100 scale)
 */
function scoreLeadSync(lead: Record<string, unknown>, contact: Record<string, unknown>, company: Record<string, unknown>): { score: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {}
  
  // ICP fit (25 points) - check if job title/industry matches target customer
  const targetCustomer = ((company.target_customer as string) ?? '').toLowerCase()
  const jobTitle = ((contact.job_title as string) ?? '').toLowerCase()
  const org = ((contact.organization as string) ?? '').toLowerCase()
  
  if (targetCustomer && (jobTitle.includes('founder') || jobTitle.includes('ceo') || jobTitle.includes('cto'))) {
    breakdown.icp_fit = 25
  } else if (jobTitle.includes('director') || jobTitle.includes('vp') || jobTitle.includes('head')) {
    breakdown.icp_fit = 18
  } else if (jobTitle.includes('manager')) {
    breakdown.icp_fit = 12
  } else {
    breakdown.icp_fit = 5
  }

  // Title match (20 points)
  if (jobTitle.includes('founder') || jobTitle.includes('ceo')) {
    breakdown.title_match = 20
  } else if (jobTitle.includes('cto') || jobTitle.includes('coo') || jobTitle.includes('cfo')) {
    breakdown.title_match = 16
  } else if (jobTitle.includes('vp') || jobTitle.includes('director')) {
    breakdown.title_match = 12
  } else if (jobTitle.includes('manager') || jobTitle.includes('lead')) {
    breakdown.title_match = 8
  } else {
    breakdown.title_match = 3
  }

  // Company size match (15 points) - assume startups are ideal
  if (org.includes('startup') || org.includes('ventures') || org.includes('labs')) {
    breakdown.company_size = 15
  } else if (org.length > 0) {
    breakdown.company_size = 10
  } else {
    breakdown.company_size = 5
  }

  // Mission alignment (8 points) - placeholder, would need more data
  breakdown.mission_alignment = org.length > 0 ? 6 : 3

  // Engagement signals (15 points) - based on lead source
  const source = ((lead.source as string) ?? '').toLowerCase()
  if (source.includes('referral') || source.includes('inbound')) {
    breakdown.engagement = 15
  } else if (source.includes('event') || source.includes('webinar')) {
    breakdown.engagement = 12
  } else if (source.includes('linkedin') || source.includes('social')) {
    breakdown.engagement = 8
  } else {
    breakdown.engagement = 4
  }

  // Data quality (10 points)
  let dataQuality = 0
  if (contact.email) dataQuality += 3
  if (contact.phone) dataQuality += 2
  if (contact.linkedin_url) dataQuality += 2
  if (contact.job_title) dataQuality += 2
  if (contact.organization) dataQuality += 1
  breakdown.data_quality = dataQuality

  // Calculate total (max ~93, scale to 100)
  const total = Object.values(breakdown).reduce((a, b) => a + b, 0)
  const score = Math.min(100, Math.round(total * 1.08))

  return { score, breakdown }
}

export async function GET(req: Request) {
  // Auth check
  if (!isManualRun(req)) {
    const unauth = verifyCron(req)
    if (unauth) return unauth
  } else {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })
  }

  const safety = loadSafety()
  if (!safety.agentsEnabled) {
    await logAgent(AGENT_NAME, 'warn', 'kill_switch', 'AGENTS_ENABLED=false')
    return NextResponse.json({ ok: false, reason: 'kill_switch' })
  }

  const supabase = supabaseAdmin()
  
  // Get company
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('name', 'Power AI Funds')
    .single()

  if (!company) {
    await logAgent(AGENT_NAME, 'error', 'no_company', 'Company not found')
    return NextResponse.json({ ok: false, reason: 'no_company' })
  }

  // Get unscored leads
  const { data: leads } = await supabase
    .from('leads')
    .select('*, contacts(*)')
    .eq('company_id', company.id)
    .eq('crm_status', 'none')
    .limit(safety.maxActionsPerRun)

  if (!leads || leads.length === 0) {
    await logAgent(AGENT_NAME, 'info', 'no_work', 'No leads to score')
    return NextResponse.json({ ok: true, actions: 0 })
  }

  let actions = 0

  for (const lead of leads) {
    const contact = lead.contacts ?? {}
    const { score, breakdown } = scoreLeadSync(lead, contact, company)

    await supabase
      .from('leads')
      .update({
        score,
        score_breakdown: breakdown,
        crm_status: 'scored',
      })
      .eq('id', lead.id)

    actions++
  }

  await logAgent(AGENT_NAME, 'info', 'run', `Scored ${actions} leads.`, { actions })
  return NextResponse.json({ ok: true, actions })
}
