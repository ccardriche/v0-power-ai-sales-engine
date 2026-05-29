import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/agents/supabase-admin'
import { loadSafety, verifyCron, isManualRun } from '@/lib/agents/safety'
import { logAgent } from '@/lib/agents/log'
import { createClient } from '@/lib/supabase/server'

const AGENT_NAME = 'analytics'

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

  // Get all non-draft social posts
  const { data: posts } = await supabase
    .from('social_posts')
    .select('content_theme, cta, impressions, clicks, engagements, likes')
    .eq('company_id', company.id)
    .neq('status', 'draft')

  if (!posts || posts.length === 0) {
    await logAgent(AGENT_NAME, 'info', 'no_work', 'No posts to analyze')
    return NextResponse.json({ ok: true, actions: 0 })
  }

  // Aggregate by content_theme
  const themeRollups: Record<string, { impressions: number; clicks: number; engagements: number; likes: number }> = {}
  const ctaRollups: Record<string, { impressions: number; clicks: number; engagements: number; likes: number }> = {}

  for (const post of posts) {
    const theme = post.content_theme ?? 'general'
    const cta = post.cta ?? 'none'

    if (!themeRollups[theme]) {
      themeRollups[theme] = { impressions: 0, clicks: 0, engagements: 0, likes: 0 }
    }
    themeRollups[theme].impressions += post.impressions ?? 0
    themeRollups[theme].clicks += post.clicks ?? 0
    themeRollups[theme].engagements += post.engagements ?? 0
    themeRollups[theme].likes += post.likes ?? 0

    if (!ctaRollups[cta]) {
      ctaRollups[cta] = { impressions: 0, clicks: 0, engagements: 0, likes: 0 }
    }
    ctaRollups[cta].impressions += post.impressions ?? 0
    ctaRollups[cta].clicks += post.clicks ?? 0
    ctaRollups[cta].engagements += post.engagements ?? 0
    ctaRollups[cta].likes += post.likes ?? 0
  }

  let actions = 0

  // Write theme rollups
  for (const [theme, data] of Object.entries(themeRollups)) {
    // Upsert by deleting existing and inserting new
    await supabase
      .from('performance_metrics')
      .delete()
      .eq('company_id', company.id)
      .eq('metric', `rollup_theme:${theme}`)

    await supabase.from('performance_metrics').insert({
      company_id: company.id,
      metric: `rollup_theme:${theme}`,
      scope: `rollup_theme:${theme}`,
      impressions: data.impressions,
      engagements: data.engagements,
    })
    actions++
  }

  // Write CTA rollups
  for (const [cta, data] of Object.entries(ctaRollups)) {
    await supabase
      .from('performance_metrics')
      .delete()
      .eq('company_id', company.id)
      .eq('metric', `rollup_cta:${cta}`)

    await supabase.from('performance_metrics').insert({
      company_id: company.id,
      metric: `rollup_cta:${cta}`,
      scope: `rollup_cta:${cta}`,
      impressions: data.impressions,
      engagements: data.engagements,
    })
    actions++
  }

  await logAgent(AGENT_NAME, 'info', 'run', `Updated ${actions} performance rollups.`, { 
    themes: Object.keys(themeRollups).length,
    ctas: Object.keys(ctaRollups).length,
  })
  return NextResponse.json({ ok: true, actions })
}
