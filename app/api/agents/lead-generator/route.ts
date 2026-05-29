import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { logAgent } from '@/lib/agents/log'
import { loadSafety } from '@/lib/agents/safety'

const CRON_SECRET = process.env.CRON_SECRET || ''

/**
 * Lead Generator Agent
 * Runs daily to source verified leads against company segments.
 * Feeds the rest of the pipeline.
 */
export async function POST(request: NextRequest) {
  try {
    // Cron auth
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.endsWith(CRON_SECRET)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseAdmin = await createClient()
    const { body } = await request.json().catch(() => ({ body: {} }))
    const companyId = body?.company_id || '00000000-0000-0000-0000-000000000001'

    // Load safety flags
    const safety = await loadSafety()
    if (!safety.agents_enabled) {
      await logAgent({
        agentName: 'lead-generator',
        level: 'warn',
        action: 'skipped',
        message: 'Agents disabled globally (AGENTS_ENABLED=false)',
        companyId,
      })
      return NextResponse.json({ ok: true, reason: 'disabled_globally' })
    }

    // Get company
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get agent configuration
    const { data: config } = await supabaseAdmin
      .from('agent_configurations')
      .select('*')
      .eq('company_id', companyId)
      .eq('agent_name', 'lead-generator')
      .single()

    if (!config?.enabled) {
      await logAgent({
        agentName: 'lead-generator',
        level: 'info',
        action: 'skipped',
        message: 'Agent disabled for this company',
        companyId,
      })
      return NextResponse.json({ ok: true, reason: 'disabled' })
    }

    const settings = config.settings as any
    const goal = config.goal || 'Source qualified leads from target segments'

    // Fetch company's active segments
    const { data: segments } = await supabaseAdmin
      .from('segments')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .order('created_at')
      .limit(5)

    if (!segments || segments.length === 0) {
      await logAgent({
        agentName: 'lead-generator',
        level: 'warn',
        action: 'skipped',
        message: 'No active segments configured',
        companyId,
      })
      return NextResponse.json({ ok: true, sourced: 0, reason: 'no_segments' })
    }

    // Plan daily allocation across segments
    const dailyTarget = settings.daily_target || 50
    const strategy = settings.segment_strategy || 'balanced'
    let allocation: Record<string, number> = {}

    if (strategy === 'balanced') {
      const perSegment = Math.floor(dailyTarget / segments.length)
      segments.forEach((seg) => {
        allocation[seg.id] = perSegment
      })
    } else if (strategy === 'priority_first') {
      allocation[segments[0]!.id] = Math.floor(dailyTarget * 0.4)
      allocation[segments[1]?.id || segments[0]!.id] = Math.floor(dailyTarget * 0.25)
      allocation[segments[2]?.id || segments[0]!.id] = Math.floor(dailyTarget * 0.15)
      // Remaining split among rest
      const remaining = dailyTarget - Object.values(allocation).reduce((a, b) => a + b, 0)
      segments.slice(3).forEach((seg, idx) => {
        allocation[seg.id] = Math.floor(remaining / Math.max(1, segments.length - 3))
      })
    }

    // Check quota
    const { data: usage } = await supabaseAdmin
      .from('usage_limits')
      .select('leads_used')
      .eq('company_id', companyId)
      .single()

    const { data: plan } = await supabaseAdmin
      .from('subscription_plans')
      .select('leads_per_month')
      .eq('company_id', companyId)
      .eq('status', 'active')
      .single()

    if (usage && plan && usage.leads_used >= plan.leads_per_month) {
      await logAgent({
        agentName: 'lead-generator',
        level: 'warn',
        action: 'quota_exceeded',
        message: `Leads quota exceeded (${usage.leads_used}/${plan.leads_per_month})`,
        companyId,
      })
      return NextResponse.json({
        ok: true,
        sourced: 0,
        reason: 'quota_exceeded',
      })
    }

    // Source leads for each segment
    let totalSourced = 0
    let totalVerified = 0
    let totalInserted = 0
    const bySegment: Record<string, number> = {}

    for (const segment of segments) {
      const targetCount = allocation[segment.id] || 0
      if (targetCount === 0) continue

      try {
        // Stub: sourceLeadsForSegment returns empty array in v1
        // When config.settings.provider is apollo and integration exists, this will be real
        const leads = await sourceLeadsForSegment({
          company,
          segment,
          count: targetCount,
          settings,
        })

        totalSourced += leads.length

        // Verify emails
        const verified = await verifyLeads(leads, settings)
        totalVerified += verified.length

        // Upsert organizations and contacts
        for (const lead of verified) {
          try {
            // Create/update organization
            const { data: org } = await supabaseAdmin
              .from('organizations')
              .upsert(
                {
                  company_id: companyId,
                  name: lead.organization || 'Unknown',
                },
                { onConflict: 'company_id,name' }
              )
              .select()
              .single()

            // Create/update contact
            const { data: contact } = await supabaseAdmin
              .from('contacts')
              .upsert(
                {
                  company_id: companyId,
                  email: lead.email,
                  first_name: lead.first_name,
                  last_name: lead.last_name,
                  job_title: lead.title,
                  organization: lead.organization,
                  phone: lead.phone,
                  linkedin_url: lead.linkedin_url,
                  status: 'new',
                },
                { onConflict: 'company_id,email' }
              )
              .select()
              .single()

            if (!contact) continue

            // Insert lead
            const { error: leadError } = await supabaseAdmin
              .from('leads')
              .insert({
                company_id: companyId,
                contact_id: contact.id,
                source: 'lead-generator',
                sequence_status: 'none',
                status: 'new',
                score: null,
              })

            if (!leadError) {
              totalInserted++

              // Link lead to segment
              await supabaseAdmin
                .from('lead_segments')
                .insert({
                  lead_id: contact.id,
                  segment_id: segment.id,
                })
                .then(() => {})
                .catch(() => {})
            }
          } catch (err) {
            console.error('[v0] Error upserting lead:', err)
          }
        }

        bySegment[segment.name] = totalInserted
      } catch (err) {
        console.error('[v0] Error processing segment:', err)
        await logAgent({
          agentName: 'lead-generator',
          level: 'error',
          action: 'segment_failed',
          message: `Failed to process segment ${segment.name}`,
          companyId,
        })
      }
    }

    // Update quota
    if (totalInserted > 0 && usage) {
      await supabaseAdmin
        .from('usage_limits')
        .update({ leads_used: usage.leads_used + totalInserted })
        .eq('company_id', companyId)
        .then(() => {})
        .catch(() => {})
    }

    // Update agent configuration stats
    await supabaseAdmin
      .from('agent_configurations')
      .update({
        last_run_at: new Date().toISOString(),
        last_status: totalInserted > 0 ? 'success' : 'no_leads',
        last_actions: totalInserted,
        last_message: `Sourced ${totalSourced}, verified ${totalVerified}, inserted ${totalInserted}`,
      })
      .eq('company_id', companyId)
      .eq('agent_name', 'lead-generator')
      .then(() => {})
      .catch(() => {})

    // Log final result
    await logAgent({
      agentName: 'lead-generator',
      level: 'info',
      action: 'completed',
      message: `Goal: ${goal}. Sourced ${totalSourced}, verified ${totalVerified}, inserted ${totalInserted}.`,
      companyId,
    })

    return NextResponse.json({
      ok: true,
      sourced: totalSourced,
      verified: totalVerified,
      inserted: totalInserted,
      by_segment: bySegment,
    })
  } catch (error) {
    console.error('[v0] Lead generator agent error:', error)
    return NextResponse.json(
      { error: 'Agent execution failed' },
      { status: 500 }
    )
  }
}

// Stub: Returns empty array in v1
async function sourceLeadsForSegment({
  company,
  segment,
  count,
  settings,
}: {
  company: any
  segment: any
  count: number
  settings: any
}): Promise<any[]> {
  const provider = settings.provider || 'apollo'

  // In v1, no providers are wired
  console.log(`[v0] Lead sourcing stubbed for ${provider}: would fetch ${count} leads for segment ${segment.name}`)
  return []
}

// Stub: Returns empty array in v1
async function verifyLeads(leads: any[], settings: any): Promise<any[]> {
  const verification = settings.verification || 'none'
  console.log(`[v0] Email verification stubbed for ${verification}: ${leads.length} leads`)
  return leads.map((lead) => ({
    ...lead,
    email_verification_status: 'unverified',
  }))
}
