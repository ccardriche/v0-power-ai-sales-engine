import { createClient } from '@/lib/supabase/server'
import { buildSystemPrompt } from '@/lib/anthropic'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextResponse } from 'next/server'

interface StepDraft {
  step_index: number
  channel: 'email' | 'sms' | 'linkedin'
  delay_hours: number
  message_goal?: string
  subject_template: string
  prompt_template: string
  personalization_angle: string
  stop_condition: string
  compliance_notes: string
}

interface SequenceDraft {
  name: string
  rationale: string
  steps: StepDraft[]
}

export async function POST(req: Request) {
  try {
    const { sequence_draft, target_length = 7, company_id } = await req.json()
    
    if (!sequence_draft) {
      return NextResponse.json({ error: 'sequence_draft is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', company_id)
      .single()

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const draft = sequence_draft as SequenceDraft
    const currentSteps = draft.steps.length
    
    // If already within range, return as-is
    if (currentSteps >= 7 && currentSteps <= 10) {
      return NextResponse.json({ sequence: draft })
    }

    const system = buildSystemPrompt(company)
    
    const userPrompt = `I have an outreach sequence called "${draft.name}" with ${currentSteps} steps.
Rationale: ${draft.rationale}

Current steps:
${draft.steps.map((s, i) => `${i + 1}. [${s.channel}] ${s.message_goal || s.subject_template || 'Step'} (delay: ${s.delay_hours}h)`).join('\n')}

${currentSteps < 7 
  ? `Expand this sequence to ${target_length} steps (between 7-10). Add meaningful touchpoints that build on the existing flow.`
  : `This sequence has ${currentSteps} steps. Keep it as-is or slightly optimize, but stay within 7-10 steps.`
}

Maintain the same voice, channels, and overall strategy. Each new step should have a clear purpose.

Return the FULL sequence with all steps in JSON:
{
  "name": "${draft.name}",
  "rationale": "${draft.rationale}",
  "steps": [
    {
      "step_index": 1,
      "channel": "email|sms|linkedin",
      "delay_hours": 0,
      "message_goal": "string",
      "subject_template": "string",
      "prompt_template": "string",
      "personalization_angle": "string",
      "stop_condition": "string",
      "compliance_notes": "string"
    }
  ]
}`

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
        company_id: company_id,
        action: 'expand_sequence_steps',
        details: {
          sequence_name: draft.name,
          original_steps: currentSteps,
          expanded_steps: result.steps?.length || 0,
        },
      })

    return NextResponse.json({ sequence: result })
  } catch (error) {
    console.error('Step expansion error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Expansion failed' },
      { status: 500 }
    )
  }
}
