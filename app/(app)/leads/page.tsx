import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users } from 'lucide-react'

export default function LeadsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Leads</h1>
        <p className="text-muted-foreground mt-1">View and manage all your leads in one place.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-teal" />
            All leads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No leads yet — head to Imports to drop a CSV.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Once imported, leads will be scored and ready for outreach.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
