import { supabaseAdmin } from './supabase-admin'

type LogLevel = 'info' | 'warn' | 'error'

/**
 * Logs an agent action to the agent_logs table.
 * Used for tracking agent runs, debugging, and the status panel.
 */
export async function logAgent(
  agent: string,
  level: LogLevel,
  action: string,
  message: string,
  data?: Record<string, unknown>
) {
  const dryRun = (process.env.DRY_RUN ?? 'true') === 'true'
  
  try {
    await supabaseAdmin().from('agent_logs').insert({
      agent,
      level,
      action,
      message,
      dry_run: dryRun,
      data: data ?? null,
    })
  } catch (err) {
    console.error('[v0] Failed to log agent action:', err)
  }
}

/**
 * Gets the most recent log entry for each agent.
 * Uses a single query instead of N round-trips.
 */
export async function getLatestAgentLogs() {
  const supabase = supabaseAdmin()
  const { data } = await supabase
    .from('agent_logs')
    .select('agent, action, message, level, created_at, dry_run')
    .order('created_at', { ascending: false })
    .limit(200)

  // Dedupe to get latest per agent
  const latest: Record<string, NonNullable<typeof data>[number]> = {}
  for (const row of data ?? []) {
    if (row.agent && !latest[row.agent]) {
      latest[row.agent] = row
    }
  }
  return latest
}
