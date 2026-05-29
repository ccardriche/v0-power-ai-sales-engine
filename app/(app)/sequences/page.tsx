import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GitBranch } from 'lucide-react'

export default function SequencesPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Sequences</h1>
        <p className="text-muted-foreground mt-1">Build automated outreach sequences that warm up leads over time.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-brand-teal" />
            Your sequences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <GitBranch className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No sequences created yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Sequences help you nurture leads with personalized, AI-powered touchpoints.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
