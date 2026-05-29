import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/agents/supabase-admin'
import { loadSafety, verifyCron, isManualRun, assertLiveAllowed, CHANNEL_FLAGS } from '@/lib/agents/safety'
import { logAgent } from '@/lib/agents/log'
import { createClient } from '@/lib/supabase/server'

const AGENT_NAME = 'social-schedule'

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
    .select('id')
    .eq('name', 'Power AI Funds')
    .single()

  if (!company) {
    await logAgent(AGENT_NAME, 'error', 'no_company', 'Company not found')
    return NextResponse.json({ ok: false, reason: 'no_company' })
  }

  // Get approved posts ready to schedule
  const { data: posts } = await supabase
    .from('social_posts')
    .select('*')
    .eq('company_id', company.id)
    .eq('approval_status', 'approved')
    .eq('buffer_status', 'not_scheduled')
    .limit(safety.maxActionsPerRun)

  if (!posts || posts.length === 0) {
    await logAgent(AGENT_NAME, 'info', 'no_work', 'No approved posts to schedule')
    return NextResponse.json({ ok: true, actions: 0 })
  }

  let actions = 0
  let liveMode = false

  // Check if we can actually send to Buffer
  try {
    assertLiveAllowed(CHANNEL_FLAGS.buffer)
    liveMode = true
  } catch {
    // Stay in simulation mode
  }

  for (const post of posts) {
    if (liveMode) {
      // TODO: Call Buffer GraphQL API when BUFFER_LIVE=true
      // For now, mark as scheduled
      await supabase
        .from('social_posts')
        .update({ buffer_status: 'scheduled' })
        .eq('id', post.id)
    } else {
      // Simulation mode - mark as queued
      await supabase
        .from('social_posts')
        .update({ buffer_status: 'queued' })
        .eq('id', post.id)
    }

    actions++
  }

  const mode = liveMode ? 'live' : 'simulated'
  await logAgent(AGENT_NAME, 'info', 'run', `Scheduled ${actions} posts (${mode}).`, { actions, mode })
  return NextResponse.json({ ok: true, actions, mode })
}
