import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/agents/supabase-admin'
import { loadSafety, verifyCron, isManualRun } from '@/lib/agents/safety'
import { generateJSON, buildSystemPrompt } from '@/lib/anthropic'
import { logAgent } from '@/lib/agents/log'
import { createClient } from '@/lib/supabase/server'

const AGENT_NAME = 'ads'

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

  // Get top performing social posts
  const { data: posts } = await supabase
    .from('social_posts')
    .select('*')
    .eq('company_id', company.id)
    .neq('status', 'draft')
    .order('engagements', { ascending: false })
    .limit(5)

  if (!posts || posts.length === 0) {
    await logAgent(AGENT_NAME, 'info', 'no_work', 'No posts with engagement data')
    return NextResponse.json({ ok: true, actions: 0 })
  }

  // Score posts: impressions + 10×likes + 25×clicks
  const scoredPosts = posts.map(p => ({
    ...p,
    score: (p.impressions ?? 0) + 10 * (p.likes ?? 0) + 25 * (p.clicks ?? 0),
  })).sort((a, b) => b.score - a.score).slice(0, 5)

  const topContent = scoredPosts.map(p => 
    `- "${(p.hook ?? p.content ?? '').slice(0, 100)}..." (score: ${p.score})`
  ).join('\n')

  const system = buildSystemPrompt(company)
  const user = `Based on these top-performing social posts, create 3 ad concepts:

Top Posts:
${topContent}

For each concept, return:
- headline (max 40 chars)
- primary_text (max 125 chars)
- description (max 30 chars)
- cta_button (one of: Learn More, Sign Up, Get Started, Contact Us)
- rationale (why this will convert)

Return ONLY JSON with key "concepts" containing an array of 3 concept objects.`

  const g = await generateJSON({ system, user })
  const concepts = Array.isArray(g.concepts) ? g.concepts : []

  if (concepts.length === 0) {
    await logAgent(AGENT_NAME, 'warn', 'no_concepts', 'Claude returned no ad concepts')
    return NextResponse.json({ ok: true, actions: 0 })
  }

  // Create campaign with concepts
  const { data: campaign } = await supabase
    .from('campaigns')
    .insert({
      company_id: company.id,
      name: `Ads Campaign - ${new Date().toISOString().split('T')[0]}`,
      status: 'draft',
      budget: 0, // Budget forced to 0
      kpi_targets: {
        type: 'ads',
        concepts,
        source_posts: scoredPosts.map(p => p.id),
      },
    })
    .select()
    .single()

  // Create approval record
  if (campaign) {
    await supabase.from('approvals').insert({
      company_id: company.id,
      channel: 'ads',
      entity_type: 'campaign',
      entity_table: 'campaigns',
      entity_id: campaign.id,
      summary: `[Ads] ${concepts.length} concepts based on top-performing content`,
      status: 'pending_approval',
      requested_by: AGENT_NAME,
      source: AGENT_NAME,
    })
  }

  await logAgent(AGENT_NAME, 'info', 'run', `Created ad campaign with ${concepts.length} concepts.`, { 
    concepts: concepts.length,
    campaign_id: campaign?.id,
  })
  return NextResponse.json({ ok: true, actions: 1, concepts: concepts.length })
}
