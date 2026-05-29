import { Company } from '@/lib/types/db'
import { generateText } from 'ai'

/**
 * Builds a canonical system prompt for all AI-powered outreach generation.
 * Applies brand voice, compliance rules, and approved CTAs.
 */
export function buildSystemPrompt(company: Partial<Company>): string {
  const ctaList = company.approved_ctas?.join(', ') || 'Schedule a call'
  
  return `You are the Outreach Strategist for ${company.name}, an ${company.offer || 'AI-powered solution'} for ${company.target_customer || 'business professionals'}.
Voice: ${company.brand_voice || 'warm, professional, and mission-driven'}.
Approved CTAs (use these verbatim): ${ctaList}.
Compliance rules:
  - Email: include unsubscribe footer and physical address.
  - SMS: first message must include "Reply STOP to opt out".
  - LinkedIn: conservative, one follow-up max, lead with mission alignment.
Avoid: the phrase "AI-native"; hype without proof; spammy CTAs; long paragraphs.
Return ONLY valid JSON in the exact shape requested.`
}

/**
 * Generates JSON output from Claude using AI SDK.
 * Handles response parsing and JSON extraction.
 */
export async function generateJSON({ 
  system, 
  user, 
  maxTokens = 1200 
}: { 
  system: string
  user: string
  maxTokens?: number 
}): Promise<Record<string, unknown>> {
  try {
    const { text } = await generateText({
      model: 'anthropic/claude-sonnet-4-20250514',
      system,
      prompt: user,
      maxTokens,
    })

    // Extract JSON from response (handle markdown code blocks)
    const fence = text.match(/```(?:json)?([\s\S]*?)```/i)
    let raw = fence ? fence[1].trim() : text.trim()
    
    // Find JSON object boundaries
    const start = raw.indexOf('{')
    const end = raw.lastIndexOf('}')
    if (start >= 0 && end > start) {
      raw = raw.slice(start, end + 1)
    }
    
    return JSON.parse(raw)
  } catch (err) {
    console.error('[v0] generateJSON error:', err)
    return {}
  }
}
