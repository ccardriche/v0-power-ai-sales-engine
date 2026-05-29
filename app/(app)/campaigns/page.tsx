import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Megaphone, Plus, Calendar, Users } from 'lucide-react'
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

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_approval: 'bg-brand-gold/10 text-brand-gold border-brand-gold',
  active: 'bg-brand-teal/10 text-brand-teal border-brand-teal',
  paused: 'bg-orange-100 text-orange-700 border-orange-300',
  completed: 'bg-green-100 text-green-700 border-green-300',
}

export default async function CampaignsPage() {
  const campaigns = await getCampaigns()

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Campaign Builder</h1>
          <p className="text-muted-foreground mt-1">Create and manage multi-channel outreach campaigns.</p>
        </div>
        <Link href="/campaigns/new">
          <Button className="bg-brand-teal hover:bg-brand-teal/90">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </Link>
      </div>

      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign) => {
            const kpi = campaign.kpi_targets || {}
            return (
              <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                <Card className="hover:border-brand-teal/50 transition-colors cursor-pointer h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-semibold text-brand-navy">
                        {campaign.name}
                      </CardTitle>
                      <Badge variant="outline" className={statusColors[campaign.status] || ''}>
                        {campaign.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {kpi.offer_promoted || 'No offer description'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {kpi.channels && kpi.channels.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Megaphone className="w-3.5 h-3.5" />
                          <span>{kpi.channels.join(', ')}</span>
                        </div>
                      )}
                      {kpi.leads_needed && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{kpi.leads_needed} leads</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-brand-teal" />
              Your campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <Megaphone className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No campaigns yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ready to reach your ideal customers? Create your first campaign.
              </p>
              <Link href="/campaigns/new">
                <Button className="mt-4 bg-brand-teal hover:bg-brand-teal/90">
                  <Plus className="w-4 h-4 mr-2" />
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
