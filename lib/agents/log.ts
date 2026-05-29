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
      details: data ?? null, // Also populate legacy column
    })
  } catch (err) {
    console.error('[v0] Failed to log agent action:', err)
  }
}

/**
 * Gets the most recent log entry for each agent.
 * Used by the dashboard status panel.
 */
export async function getLatestAgentLogs() {
  const agents = [
    'social-generate',
    'social-schedule', 
    'cold-email',
    'sms',
    'linkedin',
    'ads',
    'crm-memory',
    'analytics',
    'approval-reminders',
  ]
  
  const supabase = supabaseAdmin()
  const results: Record<string, {
    agent: string
    action: string
    message: string
    level: string
    created_at: string
    dry_run: boolean
  } | null> = {}
  
  for (const agent of agents) {
    const { data } = await supabase
      .from('agent_logs')
      .select('agent, action, message, level, created_at, dry_run')
      .eq('agent', agent)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    results[agent] = data
  }
  
  return results
}
