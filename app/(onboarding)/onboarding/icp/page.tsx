'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { saveICPStep, suggestSegments } from '../actions'

interface Segment {
  id?: string
  name: string
  description: string
  icp_criteria?: { [key: string]: unknown }
}

export default function ICPStep() {
  const [loading, setLoading] = useState(false)
  const [suggestingSegments, setSuggestingSegments] = useState(false)
  const [formData, setFormData] = useState({
    target_customer: '',
    icp_description: '',
  })
  const [segments, setSegments] = useState<Segment[]>([])

  const handleSuggestSegments = async () => {
    setSuggestingSegments(true)
    try {
      const suggested = await suggestSegments({
        target_customer: formData.target_customer,
        icp_description: formData.icp_description,
      })
      setSegments(suggested || [])
      toast.success('Segments suggested')
    } catch (error) {
      toast.error('Failed to suggest segments')
      console.error(error)
    } finally {
      setSuggestingSegments(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.target_customer || !formData.icp_description) {
      toast.error('Please fill in all fields')
      return
    }
    if (segments.length === 0) {
      toast.error('Add at least one segment before continuing')
      return
    }

    setLoading(true)
    try {
      await saveICPStep({ ...formData, segments })
      toast.success('ICP details saved')
    } catch (error) {
      toast.error('Failed to save ICP details')
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
              <CardTitle>Step 2 of 5 — Your ideal customer</CardTitle>
              <span className="text-sm text-muted-foreground">40%</span>
            </div>
            <Progress value={40} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="target">Who do you sell to?</Label>
              <Input
                id="target"
                placeholder="E.g., Small nonprofits and private K-12 schools"
                value={formData.target_customer}
                onChange={(e) => setFormData({ ...formData, target_customer: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icp">Describe your ideal buyer</Label>
              <Textarea
                id="icp"
                placeholder="2-3 sentences about the perfect customer for your product"
                value={formData.icp_description}
                onChange={(e) => setFormData({ ...formData, icp_description: e.target.value })}
                className="min-h-24"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Target segments (the Lead Generator will source daily)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestSegments}
                  disabled={suggestingSegments || !formData.target_customer}
                >
                  {suggestingSegments ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Suggesting...
                    </>
                  ) : (
                    'Suggest 5 with AI'
                  )}
                </Button>
              </div>

              {segments.length > 0 ? (
                <div className="space-y-3">
                  {segments.map((segment, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Input
                            value={segment.name}
                            onChange={(e) => {
                              const newSegments = [...segments]
                              newSegments[idx].name = e.target.value
                              setSegments(newSegments)
                            }}
                            placeholder="Segment name"
                            className="font-medium mb-2"
                          />
                          <Textarea
                            value={segment.description}
                            onChange={(e) => {
                              const newSegments = [...segments]
                              newSegments[idx].description = e.target.value
                              setSegments(newSegments)
                            }}
                            placeholder="Description"
                            className="min-h-16 text-sm"
                          />
                          {segment.icp_criteria && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {Object.entries(segment.icp_criteria).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {String(value)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSegments(segments.filter((_, i) => i !== idx))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Click "Suggest 5 with AI" or add segments manually
                </p>
              )}
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
