'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { saveComplianceStep } from '../actions'

export default function ComplianceStep() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    unsubscribe_url: '',
    physical_address: '',
    quiet_hours_start: '08:00',
    quiet_hours_end: '21:00',
    default_opt_in_source: '',
    default_sender_name: '',
    default_reply_email: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.unsubscribe_url || !formData.physical_address) {
      toast.error('Unsubscribe URL and physical address are required')
      return
    }

    setLoading(true)
    try {
      await saveComplianceStep(formData)
      toast.success('Compliance settings saved')
    } catch (error) {
      toast.error('Failed to save compliance settings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle>Step 4 of 5 — Compliance</CardTitle>
              <span className="text-sm text-muted-foreground">80%</span>
            </div>
            <Progress value={80} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="unsubscribe">Unsubscribe URL *</Label>
              <Input
                id="unsubscribe"
                placeholder="https://example.com/unsubscribe"
                value={formData.unsubscribe_url}
                onChange={(e) => setFormData({ ...formData, unsubscribe_url: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Physical address (CAN-SPAM) *</Label>
              <Textarea
                id="address"
                placeholder="123 Main St, City, State 12345"
                value={formData.physical_address}
                onChange={(e) => setFormData({ ...formData, physical_address: e.target.value })}
                required
                className="min-h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet_start">Quiet hours start</Label>
                <Input
                  id="quiet_start"
                  type="time"
                  value={formData.quiet_hours_start}
                  onChange={(e) => setFormData({ ...formData, quiet_hours_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet_end">Quiet hours end</Label>
                <Input
                  id="quiet_end"
                  type="time"
                  value={formData.quiet_hours_end}
                  onChange={(e) => setFormData({ ...formData, quiet_hours_end: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="opt_in">Where did contacts opt in?</Label>
              <Input
                id="opt_in"
                placeholder="E.g., Form, webinar, partnership"
                value={formData.default_opt_in_source}
                onChange={(e) => setFormData({ ...formData, default_opt_in_source: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender">Default sender name</Label>
              <Input
                id="sender"
                placeholder="Your name or company name"
                value={formData.default_sender_name}
                onChange={(e) => setFormData({ ...formData, default_sender_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reply_email">Default reply email</Label>
              <Input
                id="reply_email"
                type="email"
                placeholder="you@company.com"
                value={formData.default_reply_email}
                onChange={(e) => setFormData({ ...formData, default_reply_email: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline">
                ← Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-brand-teal hover:bg-brand-teal/90"
              >
                {loading ? 'Saving...' : 'Continue →'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
