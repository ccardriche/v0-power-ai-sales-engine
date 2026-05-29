import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account, team, and integrations.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-teal" />
            General settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">Settings coming soon.</p>
            <p className="text-sm text-muted-foreground mt-1">
              You&apos;ll be able to manage your profile, team members, and integrations here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
