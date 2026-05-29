import { createClient } from '@/lib/supabase/server'
import { buildSystemPrompt } from '@/lib/anthropic'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { campaign_id, segment_id, count = 3 } = await req.json()
    
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

    // Get segment if provided
    let segmentInfo = ''
    if (segment_id) {
      const { data: segment } = await supabase
        .from('segments')
        .select('*')
        .eq('id', segment_id)
        .single()
      
      if (segment) {
        segmentInfo = `\nTarget Sub-segment: ${segment.name}\nDescription: ${segment.description || 'Not specified'}`
      }
    }

    const kpiTargets = campaign.kpi_targets || {}
    const channels = kpiTargets.channels || ['email']
    const sequenceLength = kpiTargets.sequence_length || 7
    const system = buildSystemPrompt(company)
    
    const userPrompt = `Campaign: ${campaign.name}
Target segment: ${kpiTargets.target_segment_name || 'Not specified'}${segmentInfo}
Industry: ${kpiTargets.industry || 'Not specified'}
Geography: ${kpiTargets.geography || 'Not specified'}
Role/title: ${kpiTargets.role_title || 'Not specified'}
Offer: ${kpiTargets.offer_promoted || 'Not specified'}
Channels: ${channels.join(', ')}
Sequence length: ${sequenceLength} steps

Generate ${count} different outreach sequence strategies. Each should have a unique approach (e.g., educational, pain-point focused, social proof led).

Return JSON: {
  "sequences": [
    {
      "name": "string (descriptive name)",
      "rationale": "string (why this approach works)",
      "steps": [
        {
          "step_index": 1,
          "channel": "email|sms|linkedin",
          "delay_hours": 0,
          "message_goal": "string",
          "subject_template": "string (for email only)",
          "prompt_template": "string (message template with {{placeholders}})",
          "personalization_angle": "string",
          "stop_condition": "string (when to stop sequence)",
          "compliance_notes": "string"
        }
      ]
    }
  ]
}

Each sequence should have 3-5 steps as a starting point. We'll expand them later.`

    const { text } = await generateText({
      model: anthropic('claude-sonnet-4-20250514'),
      system,
      prompt: userPrompt,
      maxTokens: 4000,
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
        action: 'generate_sequences',
        details: {
          campaign_id,
          sequences_count: result.sequences?.length || 0,
        },
      })

    // Log channel activity
    await supabase
      .from('channel_activity')
      .insert({
        company_id: campaign.company_id,
        channel: 'ai',
        action: `Generated ${count} sequence options for "${campaign.name}"`,
        dry_run: false,
      })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Sequence generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
