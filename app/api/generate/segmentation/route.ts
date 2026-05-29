import { createClient } from '@/lib/supabase/server'
import { buildSystemPrompt } from '@/lib/anthropic'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { campaign_id } = await req.json()
    
    if (!campaign_id) {
      return NextResponse.json({ error: 'campaign_id is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get campaign data
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaign_id)
      .single()

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', campaign.company_id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const kpiTargets = campaign.kpi_targets || {}
    const system = buildSystemPrompt(company)
    const userPrompt = `Campaign: ${campaign.name}
Target segment: ${kpiTargets.target_segment_name || 'Not specified'}
Industry: ${kpiTargets.industry || 'Not specified'}
Geography: ${kpiTargets.geography || 'Not specified'}
Role/title: ${kpiTargets.role_title || 'Not specified'}
Keywords: ${kpiTargets.keywords || 'Not specified'}
Offer: ${kpiTargets.offer_promoted || 'Not specified'}

Identify 2–4 sub-segments within this target that should be approached differently.
Return JSON: { "segment_summary": "string", "sub_segments": [{ "name": "string", "description": "string", "icp_criteria": { "key": "value" } }], "priority_reasoning": "string" }`

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      system,
      prompt: userPrompt,
      maxTokens: 1500,
    })

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 })
    }

    const result = JSON.parse(jsonMatch[0])

    // Log to agent_logs
    await supabase
      .from('agent_logs')
      .insert({
        company_id: campaign.company_id,
        action: 'generate_segmentation',
        details: {
          campaign_id,
          sub_segments_count: result.sub_segments?.length || 0,
        },
      })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Segmentation generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
