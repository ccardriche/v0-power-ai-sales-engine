import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/agents/supabase-admin'
import { loadSafety, verifyCron, isManualRun } from '@/lib/agents/safety'
import { generateJSON, buildSystemPrompt } from '@/lib/anthropic'
import { logAgent } from '@/lib/agents/log'
import { createClient } from '@/lib/supabase/server'

const AGENT_NAME = 'cold-email'

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
  
  // Get company with compliance config
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('name', 'Power AI Funds')
    .single()

  if (!company) {
    await logAgent(AGENT_NAME, 'error', 'no_company', 'Company not found')
    return NextResponse.json({ ok: false, reason: 'no_company' })
  }

  // Get high-scoring leads without sequence
  const { data: leads } = await supabase
    .from('leads')
    .select('*, contacts(*)')
    .eq('company_id', company.id)
    .eq('sequence_status', 'none')
    .gte('score', 60)
    .limit(safety.maxActionsPerRun)

  if (!leads || leads.length === 0) {
    await logAgent(AGENT_NAME, 'info', 'no_work', 'No qualified leads to email')
    return NextResponse.json({ ok: true, actions: 0 })
  }

  const system = buildSystemPrompt(company)
  const compliance = company.compliance_config || {}
  let actions = 0

  for (const lead of leads) {
    const contact = lead.contacts
    if (!contact?.email) continue

    const user = `Write a cold email for this lead:
Name: ${contact.first_name ?? ''} ${contact.last_name ?? ''}
Title: ${contact.job_title ?? 'Unknown'}
Company: ${contact.organization ?? 'Unknown'}
Lead Score: ${lead.score ?? 0}

Return ONLY JSON with keys: subject (compelling, under 60 chars), body (3-4 short paragraphs, warm, mission-aligned), cta (single soft ask).`

    const g = await generateJSON({ system, user })
    
    // Build email with compliance footer
    const unsubscribeUrl = compliance.unsubscribe_url || 'https://poweraifunds.com/unsubscribe'
    const address = compliance.physical_address || ''
    const footer = `\n\n---\nUnsubscribe: ${unsubscribeUrl}\n${address}`
    const fullBody = ((g.body as string) ?? '') + footer

    // Insert outreach message
    const { data: message } = await supabase
      .from('outreach_messages')
      .insert({
        company_id: company.id,
        lead_id: lead.id,
        channel: 'email',
        subject: (g.subject as string) ?? 'Quick question',
        body: fullBody,
        status: 'draft',
        approval_status: 'pending_approval',
      })
      .select()
      .single()

    // Update lead status
    await supabase
      .from('leads')
      .update({ sequence_status: 'queued' })
      .eq('id', lead.id)

    // Create approval record
    if (message) {
      await supabase.from('approvals').insert({
        company_id: company.id,
        channel: 'email',
        entity_type: 'outreach_message',
        entity_table: 'outreach_messages',
        entity_id: message.id,
        summary: `[Email] ${contact.first_name ?? 'Lead'} at ${contact.organization ?? 'Company'}: ${(g.subject as string) ?? 'Quick question'}`,
        status: 'pending_approval',
        requested_by: AGENT_NAME,
        source: AGENT_NAME,
      })
    }

    actions++
  }

  await logAgent(AGENT_NAME, 'info', 'run', `Drafted ${actions} cold emails.`, { actions })
  return NextResponse.json({ ok: true, actions })
}
