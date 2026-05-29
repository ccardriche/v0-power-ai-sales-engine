import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/agents/supabase-admin'
import { loadSafety, verifyCron, isManualRun } from '@/lib/agents/safety'
import { generateJSON, buildSystemPrompt } from '@/lib/anthropic'
import { logAgent } from '@/lib/agents/log'
import { createClient } from '@/lib/supabase/server'

const AGENT_NAME = 'linkedin'

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

  // Get new contacts with LinkedIn URLs
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', company.id)
    .eq('status', 'new')
    .not('linkedin_url', 'is', null)
    .limit(safety.maxActionsPerRun)

  if (!contacts || contacts.length === 0) {
    await logAgent(AGENT_NAME, 'info', 'no_work', 'No new LinkedIn contacts to reach')
    return NextResponse.json({ ok: true, actions: 0 })
  }

  const system = buildSystemPrompt(company)
  let actions = 0
  const errors: string[] = []

  for (const contact of contacts) {
    try {
      const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || ''
      const userPrompt = `Write a LinkedIn connection request and one follow-up for this person:
Name: ${fullName}
Title: ${contact.job_title ?? 'professional'}
Company: ${contact.organization ?? ''}
LinkedIn: ${contact.linkedin_url ?? ''}

Requirements:
- Connection note: max 300 characters, warm, lead with mission alignment
- Follow-up: sent 3 days after acceptance, max 500 characters, value-first
- Conservative tone, no pushy sales language

Return ONLY JSON with keys: connection_note (max 300 chars), follow_up (max 500 chars), rationale.`

      const g = await generateJSON({ system, user: userPrompt })
      
      // Combine note + follow-up in body
      const note = ((g.connection_note as string) ?? '').slice(0, 300)
      const followUp = ((g.follow_up as string) ?? '').slice(0, 500)
      const body = `${note}\n\n---\nFollow-up (3 days after acceptance):\n${followUp}`

      // Insert outreach message
      const { data: message, error: insertErr } = await supabase
        .from('outreach_messages')
        .insert({
          company_id: company.id,
          channel: 'linkedin',
          body,
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
        channel: 'linkedin',
        entity_type: 'outreach_message',
        entity_table: 'outreach_messages',
        entity_id: message.id,
        summary: `[LinkedIn] ${fullName} at ${contact.organization ?? 'Company'}`,
        status: 'pending_approval',
        requested_by: AGENT_NAME,
        source: AGENT_NAME,
      })
      if (apprErr) throw apprErr

      // Update contact status
      await supabase
        .from('contacts')
        .update({ status: 'outreach_pending' })
        .eq('id', contact.id)

      actions++
    } catch (e) {
      const msg = (e as Error).message
      errors.push(`contact ${contact.id}: ${msg}`)
      await logAgent(AGENT_NAME, 'error', 'row_failed', `Contact ${contact.id} failed: ${msg}`)
    }
  }

  await logAgent(AGENT_NAME, errors.length ? 'warn' : 'info', 'run', `Drafted ${actions} LinkedIn messages (errors: ${errors.length})`, { actions, errors: errors.length })
  return NextResponse.json({ ok: errors.length === 0, actions, errors: errors.length })
}
