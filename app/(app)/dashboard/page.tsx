import { createClient } from '@/lib/supabase/server'
import { KpiTile } from '@/components/kpi-tile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users, GitBranch, CheckSquare, TrendingUp, Calendar, Star } from 'lucide-react'
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
    .limit(20)
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

export default async function DashboardPage() {
  const supabase = await createClient()
  const companyId = await getCompanyId(supabase)

  if (!companyId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Company not found. Please contact support.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch all data in parallel
  const [
    leadsThisWeek,
    activeEnrollments,
    pendingApprovals,
    replyRate,
    recentActivity,
    approvedContentCount,
    topThemes,
  ] = await Promise.all([
    getLeadsThisWeek(supabase, companyId),
    getActiveEnrollments(supabase, companyId),
    getPendingApprovals(supabase, companyId),
    getReplyRate(supabase, companyId),
    getRecentActivity(supabase, companyId),
    getApprovedContentCount(supabase, companyId),
    getTopThemes(supabase, companyId),
  ])

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back. Here&apos;s what&apos;s happening with your outreach.</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          label="Leads scored this week"
          value={leadsThisWeek}
          icon={Users}
        />
        <KpiTile
          label="Active enrollments"
          value={activeEnrollments}
          icon={GitBranch}
        />
        <KpiTile
          label="Pending approvals"
          value={pendingApprovals}
          icon={CheckSquare}
        />
        <KpiTile
          label="Reply rate (30d)"
          value={`${replyRate}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Approved Content Ready */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-teal" />
            Approved content ready to schedule
          </CardTitle>
          <Link 
            href="/approvals" 
            className="text-sm text-brand-teal hover:text-brand-teal/80 font-medium"
          >
            View all →
          </Link>
        </CardHeader>
        <CardContent>
          {approvedContentCount > 0 ? (
            <p className="text-3xl font-bold text-brand-navy">{approvedContentCount} posts</p>
          ) : (
            <p className="text-muted-foreground">No approved content waiting. Head to Approvals to review drafts.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Channel</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Age</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <Badge variant="secondary" className="bg-brand-teal/10 text-brand-teal">
                          {activity.channel}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{activity.action}</TableCell>
                      <TableCell>
                        {activity.dry_run ? (
                          <Badge variant="outline" className="text-brand-gold border-brand-gold">
                            Dry run
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Live</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No activity yet. Run your first sequence to see results here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Themes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-brand-gold" />
              Top performing themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topThemes.length > 0 ? (
              <div className="space-y-4">
                {topThemes.map((theme, index) => (
                  <div key={theme.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium">
                        {theme.scope?.replace('rollup_theme:', '') ?? theme.metric}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {theme.engagements?.toLocaleString() ?? 0} engagements
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">No theme data yet. As your campaigns run, we&apos;ll surface what&apos;s working.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
