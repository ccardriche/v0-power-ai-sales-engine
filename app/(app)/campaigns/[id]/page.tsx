import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, MessageSquare, Linkedin, Calendar, Users } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_approval: 'bg-brand-gold/10 text-brand-gold border-brand-gold',
  active: 'bg-brand-teal/10 text-brand-teal border-brand-teal',
  paused: 'bg-orange-100 text-orange-700 border-orange-300',
  completed: 'bg-green-100 text-green-700 border-green-300',
}

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  linkedin: Linkedin,
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !campaign) {
    notFound()
  }

  // Get sequences for this campaign
  const { data: sequences } = await supabase
    .from('outreach_sequences')
    .select(`
      *,
      sequence_steps(*)
    `)
    .eq('campaign_id', id)
    .order('created_at')

  const kpi = campaign.kpi_targets || {}

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/campaigns" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" />
            Back to campaigns
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-brand-navy">{campaign.name}</h1>
            <Badge variant="outline" className={statusColors[campaign.status] || ''}>
              {campaign.status.replace('_', ' ')}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Created {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
          </p>
        </div>
        {campaign.status === 'draft' && (
          <Link href={`/campaigns/new?campaign_id=${campaign.id}`}>
            <Button className="bg-brand-teal hover:bg-brand-teal/90">
              Continue editing
            </Button>
          </Link>
        )}
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Target leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-teal" />
              <span className="text-2xl font-bold text-brand-navy">{kpi.leads_needed || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{kpi.lead_pull_frequency || 'one-time'} pull</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {(kpi.channels || []).map((ch: string) => {
                const Icon = channelIcons[ch as keyof typeof channelIcons] || Mail
                return (
                  <Badge key={ch} variant="secondary" className="capitalize">
                    <Icon className="w-3 h-3 mr-1" />
                    {ch}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sequences</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-brand-navy">{sequences?.length || 0}</span>
            <p className="text-xs text-muted-foreground mt-1">
              {sequences?.reduce((acc, s) => acc + ((s.sequence_steps as unknown[])?.length || 0), 0) || 0} total steps
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {kpi.offer_promoted && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Offer</h4>
                <p>{kpi.offer_promoted}</p>
              </div>
            )}
            {kpi.industry && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Industry</h4>
                <p>{kpi.industry}</p>
              </div>
            )}
            {kpi.geography && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Geography</h4>
                <p>{kpi.geography}</p>
              </div>
            )}
            {kpi.role_title && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Target roles</h4>
                <p>{kpi.role_title}</p>
              </div>
            )}
            {kpi.keywords && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Keywords</h4>
                <p>{kpi.keywords}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sequences */}
      {sequences && sequences.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-brand-navy">Sequences</h2>
          {sequences.map((seq) => (
            <Card key={seq.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{seq.name}</CardTitle>
                  <Badge variant="outline">{seq.status}</Badge>
                </div>
                {seq.rationale && (
                  <CardDescription>{seq.rationale}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(seq.sequence_steps as Array<{
                    id: string
                    step_index: number
                    channel: 'email' | 'sms' | 'linkedin'
                    delay_hours: number
                    subject_template: string | null
                    variant: string | null
                  }>)?.map((step) => {
                    const Icon = channelIcons[step.channel] || Mail
                    return (
                      <div key={step.id} className="flex items-center gap-3 text-sm">
                        <div className="w-6 h-6 rounded-full bg-brand-navy text-white flex items-center justify-center text-xs">
                          {step.step_index}
                          {step.variant && step.variant !== 'A' && step.variant}
                        </div>
                        <Badge variant="outline" className="px-2">
                          <Icon className="w-3 h-3 mr-1" />
                          {step.channel}
                        </Badge>
                        <span className="text-muted-foreground flex-1 truncate">
                          {step.subject_template || 'No subject'}
                        </span>
                        {step.delay_hours > 0 && (
                          <span className="text-muted-foreground text-xs">+{step.delay_hours}h</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No sequences created yet.</p>
            {campaign.status === 'draft' && (
              <Link href={`/campaigns/new?campaign_id=${campaign.id}`}>
                <Button className="mt-4 bg-brand-teal hover:bg-brand-teal/90">
                  Continue building
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
