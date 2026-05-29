import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/agents/supabase-admin'
import { loadSafety, verifyCron, isManualRun } from '@/lib/agents/safety'
import { logAgent } from '@/lib/agents/log'
import { createClient } from '@/lib/supabase/server'

const AGENT_NAME = 'approval-reminders'
const STALE_THRESHOLD_HOURS = 2

export async function GET(req: Request) {
  // Auth check
  if (!isManualRun(req)) {
    const unauth = verifyCron(req)
    if (unauth) return unauth
  } else {
    const userSupabase = await createClient()
    const { data: { user } } = await userSupabase.auth.getUser()
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
    .select('id')
    .eq('name', 'Power AI Funds')
    .single()

  if (!company) {
    await logAgent(AGENT_NAME, 'error', 'no_company', 'Company not found')
    return NextResponse.json({ ok: false, reason: 'no_company' })
  }

  // Get pending approvals
  const { data: approvals } = await supabase
    .from('approvals')
    .select('id, channel, created_at')
    .eq('company_id', company.id)
    .eq('status', 'pending_approval')

  if (!approvals || approvals.length === 0) {
    await logAgent(AGENT_NAME, 'info', 'no_work', 'No pending approvals')
    return NextResponse.json({ ok: true, stale: 0 })
  }

  const now = Date.now()
  const staleThreshold = STALE_THRESHOLD_HOURS * 60 * 60 * 1000

  // Find stale approvals (older than threshold)
  const staleApprovals = approvals.filter(a => {
    const age = now - new Date(a.created_at).getTime()
    return age > staleThreshold
  })

  if (staleApprovals.length === 0) {
    await logAgent(AGENT_NAME, 'info', 'no_stale', `${approvals.length} pending, none stale`)
    return NextResponse.json({ ok: true, pending: approvals.length, stale: 0 })
  }

  // Group by channel
  const byChannel: Record<string, number> = {}
  let oldestAge = 0

  for (const approval of staleApprovals) {
    const channel = approval.channel ?? 'unknown'
    byChannel[channel] = (byChannel[channel] ?? 0) + 1
    
    const age = now - new Date(approval.created_at).getTime()
    if (age > oldestAge) oldestAge = age
  }

  const oldestHours = Math.round(oldestAge / (60 * 60 * 1000))
  const summary = Object.entries(byChannel)
    .map(([ch, count]) => `${ch}: ${count}`)
    .join(', ')

  // Log the reminder
  await logAgent(AGENT_NAME, 'warn', 'stale_approvals', 
    `${staleApprovals.length} approvals waiting >2h. Oldest: ${oldestHours}h. By channel: ${summary}`,
    { 
      total: approvals.length,
      stale: staleApprovals.length,
      oldestHours,
      byChannel,
    }
  )

  // TODO: When Slack/email integration is added, send notification here

  return NextResponse.json({ 
    ok: true, 
    pending: approvals.length,
    stale: staleApprovals.length,
    oldestHours,
    byChannel,
  })
}
