import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Megaphone, Plus, Calendar, Users, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

async function getCampaigns() {
  const supabase = await createClient()
  
  const { data: company } = await supabase
    .from('companies')
    .select('id')
    .eq('name', 'Power AI Funds')
    .single()

  if (!company) return []

  const { data } = await supabase
    .from('campaigns')
    .select('*')
    .eq('company_id', company.id)
    .order('created_at', { ascending: false })

  return data ?? []
}

const statusConfig: Record<string, { bg: string; text: string; border: string }> = {
  draft: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
  pending_approval: { bg: 'bg-brand-gold/5', text: 'text-brand-gold', border: 'border-brand-gold/30' },
  active: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
  paused: { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200' },
  completed: { bg: 'bg-brand-teal/5', text: 'text-brand-teal', border: 'border-brand-teal/30' },
}

export default async function CampaignsPage() {
  const campaigns = await getCampaigns()

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Campaign Builder</h1>
          <p className="text-muted-foreground mt-1">Create and manage multi-channel outreach campaigns.</p>
        </div>
        <Link href="/campaigns/new">
          <Button className="gradient-teal hover:opacity-90 text-white font-semibold shadow-lg shadow-brand-teal/20 gap-2">
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map((campaign) => {
            const kpi = campaign.kpi_targets || {}
            const status = statusConfig[campaign.status] || statusConfig.draft
            return (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer h-full card-hover group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <CardTitle className="text-base font-semibold text-foreground group-hover:text-brand-teal transition-colors">
                        {campaign.name}
                      </CardTitle>
                      <Badge 
                        variant="outline" 
                        className={`${status.bg} ${status.text} ${status.border} text-xs font-medium capitalize`}
                      >
                        {campaign.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2 text-sm">
                      {kpi.offer_promoted || 'No offer description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {kpi.channels && kpi.channels.length > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Megaphone className="w-4 h-4" />
                          <span>{kpi.channels.join(', ')}</span>
                        </div>
                      )}
                      {kpi.leads_needed && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4" />
                          <span>{kpi.leads_needed} leads</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-brand-teal group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-brand-teal" />
              Your campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-brand-teal/10 mx-auto flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-brand-teal" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                Ready to reach your ideal customers? Create your first campaign.
              </p>
              <Link href="/campaigns/new">
                <Button className="gradient-teal hover:opacity-90 text-white font-semibold shadow-lg shadow-brand-teal/20 gap-2">
                  <Plus className="w-4 h-4" />
                  Create your first campaign
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
