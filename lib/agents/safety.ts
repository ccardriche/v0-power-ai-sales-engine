/**
 * Central safety guards used by every agent.
 * Controls kill switches, dry run mode, and per-channel live flags.
 */

export function loadSafety() {
  return {
    agentsEnabled: process.env.AGENTS_ENABLED === 'true',
    dryRun: (process.env.DRY_RUN ?? 'true') === 'true',
    approvalRequired: (process.env.APPROVAL_REQUIRED ?? 'true') === 'true',
    maxActionsPerRun: Number(process.env.GLOBAL_MAX_ACTIONS_PER_RUN ?? 25),
  }
}

/**
 * Verifies the request is from Vercel Cron using the CRON_SECRET.
 * Returns a 401 Response if unauthorized, null if authorized.
 */
export function verifyCron(req: Request): Response | null {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  return null
}

/**
 * Checks if a manual run is allowed (user is authenticated).
 * Used when bypassing cron secret for manual agent triggers.
 */
export function isManualRun(req: Request): boolean {
  const url = new URL(req.url)
  return url.searchParams.get('manual') === '1'
}

/**
 * Asserts that live sending is allowed for a specific channel.
 * Throws an error if any safety condition is not met.
 */
export function assertLiveAllowed(flagName: string): void {
  const s = loadSafety()
  if (!s.agentsEnabled) throw new Error('AGENTS_ENABLED=false')
  if (s.dryRun) throw new Error('DRY_RUN=true (simulate only)')
  if (process.env[flagName] !== 'true') {
    throw new Error(`${flagName}=false (per-channel live disabled)`)
  }
}

/**
 * Per-channel live flags.
 * All default to false in v1 — agents draft only.
 */
export const CHANNEL_FLAGS = {
  buffer: 'BUFFER_LIVE',
  email: 'SMARTLEAD_LIVE',
  sms: 'TWILIO_LIVE',
  linkedin: 'HEYREACH_LIVE',
  ads: 'META_ADS_LIVE',
} as const
