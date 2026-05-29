import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import type { Company } from './types/db'

/**
 * Builds a canonical system prompt for all AI-powered outreach generation.
 * Applies brand voice, compliance rules, and approved CTAs.
 */
export function buildSystemPrompt(company: Partial<Company>): string {
  const ctas = company.approved_ctas as string[] | null
  const ctaList = ctas?.join(', ') || 'See how it works'
  
  return `You are the Outreach Strategist for ${company.name}, an ${company.offer ?? 'AI-powered solution'} for ${company.target_customer ?? 'business professionals'}.
Voice: ${company.brand_voice ?? 'warm, founder-led, mission-driven, clear, practical, faith-friendly'}.
Approved CTAs (use these verbatim): ${ctaList}.
Compliance rules:
  - Email: include unsubscribe footer and physical address.
  - SMS: first message must include "Reply STOP to opt out".
  - LinkedIn: conservative, one follow-up max, lead with mission alignment.
Avoid: the phrase "AI-native"; hype without proof; spammy CTAs; long paragraphs.
Return ONLY valid JSON in the exact shape requested.`
}

/**
 * Generates JSON output from Claude using AI SDK with direct Anthropic provider.
 * Throws on failure so errors are surfaced properly.
 */
export async function generateJSON({
  system,
  user,
  maxTokens = 1200,
}: {
  system: string
  user: string
  maxTokens?: number
}): Promise<Record<string, unknown>> {
  const { text } = await generateText({
    model: anthropic('claude-sonnet-4-20250514'),
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

  try {
    return JSON.parse(raw)
  } catch (err) {
    throw new Error(
      `generateJSON failed to parse model output: ${(err as Error).message}\nRaw: ${raw.slice(0, 200)}`
    )
  }
}
