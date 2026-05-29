import { createClient } from '@/lib/supabase/server'
import { KpiTile } from '@/components/kpi-tile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users, GitBranch, CheckSquare, TrendingUp, Calendar, Star, Bot, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

async function getCompanyId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data } = await supabase
    .from('companies')
    .select('id')
    .eq('name', 'Power AI Funds')
    .single()
  return data?.id
}

async function getLeadsThisWeek(supabase: Awaited<ReturnType<typeof createClient>>, companyId: string) {
  const { count } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  return count ?? 0
}

async function getActiveEnrollments(supabase: Awaited<ReturnType<typeof createClient>>, companyId: string) {
  const { count } = await supabase
    .from('sequence_enrollments')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'active')
  return count ?? 0
}

async function getPendingApprovals(supabase: Awaited<ReturnType<typeof createClient>>, companyId: string) {
  const { count } = await supabase
    .from('approvals')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('status', 'pending_approval')
  return count ?? 0
}

async function getReplyRate(supabase: Awaited<ReturnType<typeof createClient>>, companyId: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  
  const { data } = await supabase
    .from('learning_events')
    .select('event_type')
    .eq('company_id', companyId)
    .gte('created_at', thirtyDaysAgo)
    .in('event_type', ['sent', 'replied'])
  
  if (!data || data.length === 0) return 0
  
  const sent = data.filter(e => e.event_type === 'sent').length
  const replied = data.filter(e => e.event_type === 'replied').length
  
  if (sent === 0) return 0
  return Math.round((replied / sent) * 100)
}

async function getRecentActivity(supabase: Awaited<ReturnType<typeof createClient>>, companyId: string) {
  const { data } = await supabase
    .from('channel_activity')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(10)
  return data ?? []
}

async function getApprovedContentCount(supabase: Awaited<ReturnType<typeof createClient>>, companyId: string) {
  const { count } = await supabase
    .from('social_posts')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId)
    .eq('approval_status', 'approved')
    .eq('buffer_status', 'not_scheduled')
  return count ?? 0
}

async function getTopThemes(supabase: Awaited<ReturnType<typeof createClient>>, companyId: string) {
  const { data } = await supabase
    .from('performance_metrics')
    .select('*')
    .eq('company_id', companyId)
    .like('scope', 'rollup_theme:%')
    .order('engagements', { ascending: false })
    .limit(5)
  return data ?? []
}

async function getAgentStatus(supabase: Awaited<ReturnType<typeof createClient>>) {
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
  
  const results: { agent: string; action: string | null; message: string | null; level: string | null; created_at: string | null; dry_run: boolean | null }[] = []
  
  for (const agent of agents) {
    const { data } = await supabase
      .from('agent_logs')
      .select('agent, action, message, level, created_at, dry_run')
      .eq('agent', agent)
      .order('created_at', { ascending: false })
      .limit(1)
    
    const row = data?.[0]
    results.push(row ?? { agent, action: null, message: null, level: null, created_at: null, dry_run: null })
  }
  
  return results
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const companyId = await getCompanyId(supabase)

  if (!companyId) {
    return (
      <div className="p-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Company not found</h3>
            <p className="text-muted-foreground">Please contact support to set up your account.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const [
    leadsThisWeek,
    activeEnrollments,
    pendingApprovals,
    replyRate,
    recentActivity,
    approvedContentCount,
    topThemes,
    agentStatus,
  ] = await Promise.all([
    getLeadsThisWeek(supabase, companyId),
    getActiveEnrollments(supabase, companyId),
    getPendingApprovals(supabase, companyId),
    getReplyRate(supabase, companyId),
    getRecentActivity(supabase, companyId),
    getApprovedContentCount(supabase, companyId),
    getTopThemes(supabase, companyId),
    getAgentStatus(supabase),
  ])

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back. Here&apos;s your outreach at a glance.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
          <span>Live data</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiTile
          label="Leads this week"
          value={leadsThisWeek}
          icon={Users}
          accentColor="teal"
        />
        <KpiTile
          label="Active enrollments"
          value={activeEnrollments}
          icon={GitBranch}
          accentColor="navy"
        />
        <KpiTile
          label="Pending approvals"
          value={pendingApprovals}
          icon={CheckSquare}
          accentColor="gold"
        />
        <KpiTile
          label="Reply rate (30d)"
          value={`${replyRate}%`}
          icon={TrendingUp}
          accentColor="teal"
          trend={replyRate > 10 ? { value: 'Good', positive: true } : undefined}
        />
      </div>

      {/* Approved Content Ready */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-brand-teal/5 via-transparent to-brand-gold/5 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl gradient-teal flex items-center justify-center shadow-lg shadow-brand-teal/20">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Ready to schedule
                </p>
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  {approvedContentCount} approved posts
                </p>
              </div>
            </div>
            <Link 
              href="/approvals" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-teal text-white font-medium text-sm hover:bg-brand-teal/90 transition-colors shadow-lg shadow-brand-teal/20"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                      <TableHead className="font-semibold">Channel</TableHead>
                      <TableHead className="font-semibold">Action</TableHead>
                      <TableHead className="font-semibold">Mode</TableHead>
                      <TableHead className="font-semibold">Age</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((activity) => (
                      <TableRow key={activity.id} className="hover:bg-muted/30">
                        <TableCell>
                          <Badge variant="secondary" className="bg-brand-teal/10 text-brand-teal border-0 font-medium">
                            {activity.channel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium">{activity.action}</TableCell>
                        <TableCell>
                          {activity.dry_run ? (
                            <Badge variant="outline" className="text-brand-gold border-brand-gold/30 bg-brand-gold/5">
                              Dry run
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-600 border-0">Live</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState 
                icon={GitBranch}
                title="No activity yet"
                description="Run your first sequence to see results here."
              />
            )}
          </CardContent>
        </Card>

        {/* Top Performing Themes */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-brand-gold" />
              Top performing themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topThemes.length > 0 ? (
              <div className="space-y-3">
                {topThemes.map((theme, index) => (
                  <div 
                    key={theme.id} 
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-brand-navy text-white text-sm flex items-center justify-center font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">
                        {theme.scope?.replace('rollup_theme:', '') ?? theme.metric}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                      {theme.engagements?.toLocaleString() ?? 0} engagements
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={Star}
                title="No theme data yet"
                description="As your campaigns run, we'll surface what's working."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agent Status Panel */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-brand-teal" />
            Agent Status
          </CardTitle>
          <Link 
            href="/settings" 
            className="inline-flex items-center gap-1 text-sm text-brand-teal hover:text-brand-teal/80 font-medium transition-colors"
          >
            Manage agents
            <ArrowRight className="w-4 h-4" />
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {agentStatus.map((status) => (
              <div 
                key={status.agent}
                className="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold capitalize">
                    {status.agent.replace(/-/g, ' ')}
                  </span>
                  {status.level && (
                    <Badge 
                      variant={status.level === 'error' ? 'destructive' : status.level === 'warn' ? 'outline' : 'secondary'}
                      className={status.level === 'warn' ? 'text-brand-gold border-brand-gold/30 bg-brand-gold/5' : status.level === 'info' ? 'bg-brand-teal/10 text-brand-teal border-0' : ''}
                    >
                      {status.level}
                    </Badge>
                  )}
                </div>
                {status.created_at ? (
                  <>
                    <p className="text-xs text-muted-foreground truncate" title={status.message ?? ''}>
                      {status.message ?? status.action}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(status.created_at), { addSuffix: true })}
                      {status.dry_run && <span className="ml-1.5 text-brand-gold font-medium">(dry run)</span>}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Never run</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function EmptyState({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: typeof GitBranch
  title: string
  description: string 
}) {
  return (
    <div className="py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
        <Icon className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
