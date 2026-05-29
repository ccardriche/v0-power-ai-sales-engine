'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { InputTags } from '@/components/input-tags'
import { toast } from 'sonner'
import { saveVoiceStep } from '../actions'

export default function VoiceStep() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    brand_voice: 'warm, founder-led, mission-driven, clear, practical, faith-friendly. Never say "AI-native" — say "AI-powered". No hype. Short lines.',
    approved_ctas: ['See how it works', 'Watch the workflow', 'Get the Funding Sprint Kit', 'See your first funding matches', 'Get the fundraising pipeline template'],
    case_studies: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await saveVoiceStep(formData)
      toast.success('Voice and CTAs saved')
    } catch (error) {
      toast.error('Failed to save voice settings')
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
              <CardTitle>Step 3 of 5 — Brand voice</CardTitle>
              <span className="text-sm text-muted-foreground">60%</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="voice">How should the agents sound?</Label>
              <Textarea
                id="voice"
                value={formData.brand_voice}
                onChange={(e) => setFormData({ ...formData, brand_voice: e.target.value })}
                className="min-h-24"
              />
              <p className="text-xs text-muted-foreground">This guides AI tone in all outreach</p>
            </div>

            <div className="space-y-2">
              <Label>Approved CTAs (calls-to-action)</Label>
              <InputTags
                value={formData.approved_ctas}
                onChange={(tags) => setFormData({ ...formData, approved_ctas: tags })}
                placeholder="Add a CTA and press Enter"
              />
              <p className="text-xs text-muted-foreground">Agents will use only these CTAs in outreach</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="case_studies">Case studies (optional)</Label>
              <Textarea
                id="case_studies"
                placeholder="Paste 1-3 case study snippets the agents can quote"
                value={formData.case_studies}
                onChange={(e) => setFormData({ ...formData, case_studies: e.target.value })}
                className="min-h-20"
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
