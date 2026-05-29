import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/agents/supabase-admin'
import { loadSafety, verifyCron, isManualRun } from '@/lib/agents/safety'
import { generateJSON, buildSystemPrompt } from '@/lib/anthropic'
import { logAgent } from '@/lib/agents/log'
import { createClient } from '@/lib/supabase/server'

const AGENT_NAME = 'sms'

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

  // Get SMS-opted leads with contact via FK
  const { data: leads } = await supabase
    .from('leads')
    .select(`
      *,
      contacts:contact_id ( first_name, last_name, job_title, organization, phone )
    `)
    .eq('company_id', company.id)
    .eq('sms_opt_in', true)
    .eq('sequence_status', 'none')
    .limit(safety.maxActionsPerRun)

  if (!leads || leads.length === 0) {
    await logAgent(AGENT_NAME, 'info', 'no_work', 'No SMS-opted leads to message')
    return NextResponse.json({ ok: true, actions: 0 })
  }

  const system = buildSystemPrompt(company)
  let actions = 0
  const errors: string[] = []

  for (const lead of leads) {
    try {
      const contact = lead.contacts as { first_name: string | null; last_name: string | null; job_title: string | null; organization: string | null; phone: string | null } | null
      if (!contact?.phone) continue

      const userPrompt = `Write an SMS message for this lead:
Name: ${contact.first_name ?? ''}
Title: ${contact.job_title ?? 'founder'}
Company: ${contact.organization ?? ''}

Requirements:
- Maximum 160 characters total (including opt-out)
- Warm, direct, mission-aligned
- Must leave room for: " Reply STOP to opt out"

Return ONLY JSON with keys: message (the SMS text, max 135 chars to leave room for opt-out).`

      const g = await generateJSON({ system, user: userPrompt })
      
      // Enforce opt-out compliance
      const baseMessage = ((g.message as string) ?? '').slice(0, 135)
      const fullMessage = `${baseMessage} Reply STOP to opt out`

      // Insert outreach message
      const { data: message, error: insertErr } = await supabase
        .from('outreach_messages')
        .insert({
          company_id: company.id,
          lead_id: lead.id,
          channel: 'sms',
          body: fullMessage,
          status: 'draft',
          approval_status: 'pending_approval',
        })
        .select()
        .single()

      if (insertErr) throw insertErr
      if (!message) throw new Error('No message returned')

      // Create approval record
      const { error: apprErr } = await supabase.from('approvals').insert({
        company_id: company.id,
        channel: 'sms',
        entity_type: 'outreach_message',
        entity_table: 'outreach_messages',
        entity_id: message.id,
        summary: `[SMS] ${contact.first_name ?? 'Lead'}: ${baseMessage.slice(0, 50)}...`,
        status: 'pending_approval',
        requested_by: AGENT_NAME,
        source: AGENT_NAME,
      })
      if (apprErr) throw apprErr

      // Update lead status
      await supabase
        .from('leads')
        .update({ sequence_status: 'queued' })
        .eq('id', lead.id)

      actions++
    } catch (e) {
      const msg = (e as Error).message
      errors.push(`lead ${lead.id}: ${msg}`)
      await logAgent(AGENT_NAME, 'error', 'row_failed', `Lead ${lead.id} failed: ${msg}`)
    }
  }

  await logAgent(AGENT_NAME, errors.length ? 'warn' : 'info', 'run', `Drafted ${actions} SMS messages (errors: ${errors.length})`, { actions, errors: errors.length })
  return NextResponse.json({ ok: errors.length === 0, actions, errors: errors.length })
}
