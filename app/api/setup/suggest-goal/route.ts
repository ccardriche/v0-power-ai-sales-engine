import { NextRequest, NextResponse } from 'next/server'
import { generateJSON } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'

const AGENT_DESCRIPTIONS: Record<string, string> = {
  'lead-generator': 'a daily lead sourcing tool',
  'cold-email': 'a cold email outreach system',
  'crm-memory': 'a lead scoring and CRM memory system',
  'linkedin': 'a LinkedIn outreach automation tool',
  'sms': 'an SMS outreach system',
  'social-generate': 'a social media content drafter',
  'social-schedule': 'a social media scheduling system',
  'ads': 'an ad campaign generator',
  'analytics': 'a performance analytics system',
  'approval-reminders': 'an approval workflow reminder system',
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { agent_name } = await request.json()

    // Get company info
    const { data: company } = await supabase
      .from('companies')
      .select('name, offer, target_customer, primary_sales_goal, brand_voice')
      .eq('id', user.id)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const agentDesc = AGENT_DESCRIPTIONS[agent_name] || agent_name

    const systemPrompt = `You are a go-to-market strategist. Given a company's profile and an agent type, suggest a specific, motivating goal for that agent that ties back to the company's sales objectives. Be practical and measurable. Use brand voice: ${company.brand_voice || 'professional and clear'}`

    const userPrompt = `Company: ${company.name}
Offering: ${company.offer}
Target customer: ${company.target_customer}
Primary sales goal: ${company.primary_sales_goal}
Agent: ${agentDesc}

Suggest ONE specific goal for this agent in 1-2 sentences. Be practical and measurable. Focus on business outcomes, not technical details.
Return ONLY the goal text, nothing else.`

    const result = await generateJSON({
      system: systemPrompt,
      user: userPrompt,
      maxTokens: 200,
    })

    // The result might be a string or nested object, extract the text
    let goal = ''
    if (typeof result === 'string') {
      goal = result
    } else if (result.goal) {
      goal = result.goal
    } else if (Object.keys(result).length > 0) {
      goal = String(Object.values(result)[0])
    }

    return NextResponse.json({ goal: goal || 'Help us reach our sales goals' })
  } catch (error) {
    console.error('Goal suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to suggest goal' },
      { status: 500 }
    )
  }
}
