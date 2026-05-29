import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/agents/supabase-admin'
import { loadSafety, verifyCron, isManualRun } from '@/lib/agents/safety'
import { generateJSON, buildSystemPrompt } from '@/lib/anthropic'
import { logAgent } from '@/lib/agents/log'
import { createClient } from '@/lib/supabase/server'

const AGENT_NAME = 'social-generate'

export async function GET(req: Request) {
  // Auth check: cron secret OR manual run with authenticated user
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
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('*')
    .eq('name', 'Power AI Funds')
    .single()

  if (companyError || !company) {
    await logAgent(AGENT_NAME, 'error', 'no_company', 'Company not found')
    return NextResponse.json({ ok: false, reason: 'no_company' })
  }

  // Get calendar items that need content
  const { data: rows } = await supabase
    .from('content_calendar')
    .select('*')
    .eq('company_id', company.id)
    .eq('status', 'needs_content')
    .limit(safety.maxActionsPerRun)

  if (!rows || rows.length === 0) {
    await logAgent(AGENT_NAME, 'info', 'no_work', 'No calendar items need content')
    return NextResponse.json({ ok: true, actions: 0 })
  }

  const system = buildSystemPrompt(company)
  let actions = 0
  const errors: string[] = []

  for (const row of rows) {
    try {
      const userPrompt = `Create one social post.
Week: ${row.week ?? 'N/A'} Day: ${row.day ?? 'N/A'}
Platform: ${row.platform ?? 'linkedin'}
Theme: ${row.content_theme ?? row.title ?? 'general'}
Goal: ${row.post_goal ?? 'engagement'}
Audience: ${row.audience ?? company.target_customer ?? 'founders'}
Preferred CTA: ${row.cta ?? ''}
Seed copy: ${row.source_copy ?? ''}
Return ONLY JSON with keys: hook, caption, image_prompt, video_prompt, cta, hashtags (array of 5), rationale.`

      const g = await generateJSON({ system, user: userPrompt })
      
      const tags = Array.isArray(g.hashtags) ? (g.hashtags as string[]).join(' ') : ''
      const captionText = ((g.caption as string) ?? '') + (tags ? `\n\n${tags}` : '')

      // Insert social post (content column, not caption)
      const { data: post, error: insertErr } = await supabase
        .from('social_posts')
        .insert({
          company_id: company.id,
          calendar_id: row.id,
          platform: row.platform ?? 'linkedin',
          week: row.week,
          day: row.day,
          content_theme: row.content_theme ?? row.title,
          post_goal: row.post_goal,
          audience: row.audience,
          hook: (g.hook as string) ?? '',
          content: captionText,
          image_prompt: (g.image_prompt as string) ?? '',
          video_prompt: (g.video_prompt as string) ?? '',
          cta: (g.cta as string) ?? row.cta ?? '',
          rationale: (g.rationale as string) ?? '',
          approval_status: 'pending_approval',
          buffer_status: 'not_scheduled',
          status: 'draft',
          source: AGENT_NAME,
        })
        .select()
        .single()

      if (insertErr) throw insertErr
      if (!post) throw new Error('No post returned')

      // Create approval record
      const { error: apprErr } = await supabase.from('approvals').insert({
        company_id: company.id,
        channel: 'social',
        entity_type: 'social_post',
        entity_table: 'social_posts',
        entity_id: post.id,
        summary: `[${row.content_theme ?? row.title} · W${row.week ?? '?'} ${row.day ?? ''} · ${row.platform ?? 'linkedin'}] ${(g.hook as string) ?? ''}`,
        status: 'pending_approval',
        requested_by: AGENT_NAME,
        source: AGENT_NAME,
      })
      if (apprErr) throw apprErr

      // Update calendar item
      await supabase
        .from('content_calendar')
        .update({ status: 'pending_approval', approval_status: 'pending_approval' })
        .eq('id', row.id)

      actions++
    } catch (e) {
      const msg = (e as Error).message
      errors.push(`row ${row.id}: ${msg}`)
      await logAgent(AGENT_NAME, 'error', 'row_failed', `Row ${row.id} failed: ${msg}`)
    }
  }

  await logAgent(AGENT_NAME, errors.length ? 'warn' : 'info', 'run', `Drafted ${actions} (errors: ${errors.length})`, { actions, errors: errors.length })
  return NextResponse.json({ ok: errors.length === 0, actions, errors: errors.length })
}
