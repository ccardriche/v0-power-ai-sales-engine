import { NextRequest, NextResponse } from 'next/server'
import { generateJSON } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { target_customer, icp_description } = await request.json()

    // Get company info
    const { data: company } = await supabase
      .from('companies')
      .select('name, offer')
      .eq('id', user.id)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const systemPrompt = `You are a business strategist. Given a company's offer, target customer, and ICP, propose exactly 5 distinct ICP sub-segments that are specific and actionable for lead sourcing.`

    const userPrompt = `Company: ${company.name}
Offer: ${company.offer}
Target customer: ${target_customer}
ICP Description: ${icp_description}

Return ONLY valid JSON in this exact format:
{
  "segments": [
    {
      "name": "Specific segment name",
      "description": "2-3 sentences describing this segment",
      "icp_criteria": {
        "org_type": "e.g., nonprofit, startup, enterprise",
        "title_includes": "e.g., CFO, CRO, VP Sales",
        "size": "e.g., 1-50, 51-500",
        "geography": "e.g., US East, Europe, APAC",
        "mission_keywords": "e.g., climate, education, healthcare"
      }
    }
  ]
}
`

    const result = await generateJSON({
      system: systemPrompt,
      user: userPrompt,
      maxTokens: 2000,
    })

    return NextResponse.json(result.segments || [])
  } catch (error) {
    console.error('Segment suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to suggest segments' },
      { status: 500 }
    )
  }
}
