import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload } from 'lucide-react'

export default function ImportsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Imports</h1>
        <p className="text-muted-foreground mt-1">Import leads from CSVs, integrations, or other sources.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-teal" />
            Import history
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Upload className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No imports yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Drop a CSV here or connect an integration to bring in leads.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
