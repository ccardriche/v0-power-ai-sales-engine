'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { saveCompanyStep } from '../actions'

export default function CompanyStep() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    offer: '',
    primary_sales_goal: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error('Company name is required')
      return
    }

    setLoading(true)
    try {
      await saveCompanyStep(formData)
      toast.success('Company details saved')
    } catch (error) {
      toast.error('Failed to save company details')
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
              <CardTitle>Step 1 of 5 — Your company</CardTitle>
              <span className="text-sm text-muted-foreground">20%</span>
            </div>
            <Progress value={20} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Company name *</Label>
              <Input
                id="name"
                placeholder="e.g., Acme Sales"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://example.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="offer">What do you sell? *</Label>
              <Textarea
                id="offer"
                placeholder="Describe your offering in one sentence. E.g., 'We help founders raise capital through AI-powered lead generation'"
                value={formData.offer}
                onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                required
                className="min-h-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">What's your primary sales goal?</Label>
              <Select value={formData.primary_sales_goal} onValueChange={(value) => setFormData({ ...formData, primary_sales_goal: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book_demos">Book demos</SelectItem>
                  <SelectItem value="trial_signups">Drive trial signups</SelectItem>
                  <SelectItem value="build_pipeline">Build pipeline</SelectItem>
                  <SelectItem value="generate_awareness">Generate awareness</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3">
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
