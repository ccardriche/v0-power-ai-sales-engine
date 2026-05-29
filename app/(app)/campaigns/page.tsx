import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Megaphone } from 'lucide-react'

export default function CampaignsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Campaign Builder</h1>
        <p className="text-muted-foreground mt-1">Create and manage multi-channel outreach campaigns.</p>
      </div>

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
              Start with importing leads, then build your first campaign.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
