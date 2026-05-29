import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare } from 'lucide-react'

export default function ApprovalsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and approve AI-generated content before it goes live.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-teal" />
            Pending approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No content waiting for approval right now.</p>
            <p className="text-sm text-muted-foreground mt-1">
              When sequences generate messages, they&apos;ll appear here for your review.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
