'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Loader2, 
  Mail, 
  MessageSquare, 
  Linkedin,
  Sparkles,
  Plus,
  Trash2,
  GripVertical,
  Copy,
} from 'lucide-react'
import { createCampaignDraft, saveSubSegments, finalizeCampaignDraft } from '../actions'
import { toast } from 'sonner'

interface Segment {
  id: string
  name: string
}

interface SubSegment {
  name: string
  description: string
  icp_criteria: Record<string, unknown>
}

interface SequenceDraft {
  name: string
  rationale: string
  steps: StepDraft[]
  selected?: boolean
}

interface StepDraft {
  step_index: number
  channel: 'email' | 'sms' | 'linkedin'
  delay_hours: number
  message_goal?: string
  subject_template: string
  prompt_template: string
  personalization_angle: string
  stop_condition: string
  compliance_notes: string
  variant?: string
}

interface PlanData {
  leads_per_month: number
  leads_used: number
}

const STEPS = ['Define', 'Segment', 'Sequences', 'Steps', 'Review'] as const
type Step = typeof STEPS[number]

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  linkedin: Linkedin,
}

export default function NewCampaignPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Current step
  const [currentStep, setCurrentStep] = useState<Step>('Define')
  const [isLoading, setIsLoading] = useState(false)
  
  // Step A - Define campaign
  const [name, setName] = useState('')
  const [targetSegmentId, setTargetSegmentId] = useState('')
  const [targetSegmentName, setTargetSegmentName] = useState('')
  const [leadsNeeded, setLeadsNeeded] = useState(100)
  const [leadPullFrequency, setLeadPullFrequency] = useState<string>('one-time')
  const [geography, setGeography] = useState('')
  const [industry, setIndustry] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [keywords, setKeywords] = useState('')
  const [offerPromoted, setOfferPromoted] = useState('')
  const [channels, setChannels] = useState<string[]>(['email'])
  const [sequenceLength, setSequenceLength] = useState([7])
  
  // Data from API
  const [segments, setSegments] = useState<Segment[]>([])
  const [planData, setPlanData] = useState<PlanData>({ leads_per_month: 1000, leads_used: 0 })
  const [campaignId, setCampaignId] = useState<string | null>(searchParams.get('campaign_id'))
  const [companyId, setCompanyId] = useState<string | null>(null)
  
  // Step B - Segmentation
  const [segmentationResult, setSegmentationResult] = useState<{
    segment_summary: string
    sub_segments: SubSegment[]
    priority_reasoning: string
  } | null>(null)
  const [savedSubSegments, setSavedSubSegments] = useState<SubSegment[]>([])
  
  // Step C - Sequences
  const [generatedSequences, setGeneratedSequences] = useState<SequenceDraft[]>([])
  
  // Step D - Expanded steps
  const [expandedSequences, setExpandedSequences] = useState<SequenceDraft[]>([])
  
  // New segment modal
  const [newSegmentOpen, setNewSegmentOpen] = useState(false)
  const [newSegmentName, setNewSegmentName] = useState('')

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/campaign-data')
        const data = await res.json()
        setSegments(data.segments || [])
        setPlanData(data.plan || { leads_per_month: 1000, leads_used: 0 })
        setCompanyId(data.companyId)
      } catch (error) {
        console.error('Failed to load campaign data:', error)
      }
    }
    loadData()
  }, [])

  const toggleChannel = (channel: string) => {
    setChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    )
  }

  const handleStepASubmit = async () => {
    if (!name.trim()) {
      toast.error('Please enter a campaign name')
      return
    }
    if (channels.length === 0) {
      toast.error('Please select at least one channel')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.set('name', name)
      formData.set('target_segment_id', targetSegmentId)
      formData.set('target_segment_name', targetSegmentName || segments.find(s => s.id === targetSegmentId)?.name || '')
      formData.set('leads_needed', leadsNeeded.toString())
      formData.set('lead_pull_frequency', leadPullFrequency)
      formData.set('geography', geography)
      formData.set('industry', industry)
      formData.set('role_title', roleTitle)
      formData.set('keywords', keywords)
      formData.set('offer_promoted', offerPromoted)
      formData.set('channels', JSON.stringify(channels))
      formData.set('sequence_length', sequenceLength[0].toString())

      const result = await createCampaignDraft(formData)
      setCampaignId(result.campaignId)
      setCurrentStep('Segment')
      toast.success('Campaign draft saved')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save campaign')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateSegmentation = async () => {
    if (!campaignId) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/generate/segmentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign_id: campaignId }),
      })
      
      if (!res.ok) {
        throw new Error('Failed to generate segmentation')
      }

      const data = await res.json()
      setSegmentationResult(data)
      toast.success('Segmentation strategy generated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSubSegment = async (subSegment: SubSegment) => {
    setSavedSubSegments(prev => [...prev, subSegment])
    toast.success(`Saved "${subSegment.name}"`)
  }

  const handleRejectSubSegment = (subSegment: SubSegment) => {
    setSegmentationResult(prev => {
      if (!prev) return prev
      return {
        ...prev,
        sub_segments: prev.sub_segments.filter(s => s.name !== subSegment.name),
      }
    })
  }

  const handleSaveAllSegments = async () => {
    if (!campaignId || savedSubSegments.length === 0) return

    setIsLoading(true)
    try {
      await saveSubSegments(campaignId, savedSubSegments)
      setCurrentStep('Sequences')
      toast.success('Segments saved')
    } catch (error) {
      toast.error('Failed to save segments')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateSequences = async (count: number = 3) => {
    if (!campaignId) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/generate/sequences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          campaign_id: campaignId,
          count,
        }),
      })
      
      if (!res.ok) {
        throw new Error('Failed to generate sequences')
      }

      const data = await res.json()
      setGeneratedSequences(data.sequences.map((s: SequenceDraft) => ({ ...s, selected: false })))
      toast.success(`Generated ${count} sequence options`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Generation failed')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSequenceSelection = (index: number) => {
    setGeneratedSequences(prev => 
      prev.map((s, i) => i === index ? { ...s, selected: !s.selected } : s)
    )
  }

  const handleExpandSequences = async () => {
    const selectedSequences = generatedSequences.filter(s => s.selected)
    if (selectedSequences.length === 0) {
      toast.error('Please select at least one sequence')
      return
    }

    setIsLoading(true)
    try {
      const expanded: SequenceDraft[] = []
      
      for (const seq of selectedSequences) {
        const res = await fetch('/api/generate/sequence_steps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sequence_draft: seq,
            target_length: sequenceLength[0],
            company_id: companyId,
          }),
        })
        
        if (!res.ok) {
          throw new Error(`Failed to expand "${seq.name}"`)
        }

        const data = await res.json()
        expanded.push(data.sequence)
      }
      
      setExpandedSequences(expanded)
      setCurrentStep('Steps')
      toast.success('Sequences expanded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Expansion failed')
    } finally {
      setIsLoading(false)
    }
  }

  const updateStep = (seqIndex: number, stepIndex: number, field: keyof StepDraft, value: string | number) => {
    setExpandedSequences(prev => prev.map((seq, si) => {
      if (si !== seqIndex) return seq
      return {
        ...seq,
        steps: seq.steps.map((step, sti) => {
          if (sti !== stepIndex) return step
          return { ...step, [field]: value }
        }),
      }
    }))
  }

  const addStep = (seqIndex: number) => {
    setExpandedSequences(prev => prev.map((seq, si) => {
      if (si !== seqIndex) return seq
      const newStep: StepDraft = {
        step_index: seq.steps.length + 1,
        channel: 'email',
        delay_hours: 24,
        subject_template: '',
        prompt_template: '',
        personalization_angle: '',
        stop_condition: '',
        compliance_notes: '',
      }
      return { ...seq, steps: [...seq.steps, newStep] }
    }))
  }

  const duplicateStep = (seqIndex: number, stepIndex: number) => {
    setExpandedSequences(prev => prev.map((seq, si) => {
      if (si !== seqIndex) return seq
      const stepToCopy = seq.steps[stepIndex]
      const newStep: StepDraft = {
        ...stepToCopy,
        step_index: seq.steps.length + 1,
      }
      return { ...seq, steps: [...seq.steps, newStep] }
    }))
  }

  const addVariant = (seqIndex: number, stepIndex: number) => {
    setExpandedSequences(prev => prev.map((seq, si) => {
      if (si !== seqIndex) return seq
      const stepToCopy = seq.steps[stepIndex]
      const newStep: StepDraft = {
        ...stepToCopy,
        step_index: stepToCopy.step_index,
        variant: 'B',
      }
      const newSteps = [...seq.steps]
      newSteps.splice(stepIndex + 1, 0, newStep)
      return { ...seq, steps: newSteps }
    }))
  }

  const deleteStep = (seqIndex: number, stepIndex: number) => {
    setExpandedSequences(prev => prev.map((seq, si) => {
      if (si !== seqIndex) return seq
      return {
        ...seq,
        steps: seq.steps.filter((_, sti) => sti !== stepIndex),
      }
    }))
  }

  const handleFinalize = async () => {
    if (!campaignId || expandedSequences.length === 0) return

    setIsLoading(true)
    try {
      await finalizeCampaignDraft({
        campaignId,
        sequences: expandedSequences,
      })
      // Redirect happens in the action
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to finalize campaign')
      setIsLoading(false)
    }
  }

  const currentStepIndex = STEPS.indexOf(currentStep)
  const progressPercent = ((currentStepIndex + 1) / STEPS.length) * 100
  const availableLeads = planData.leads_per_month - planData.leads_used

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">New Campaign</h1>
          <p className="text-muted-foreground mt-1">Build your multi-channel outreach strategy step by step.</p>
        </div>
        <Button variant="ghost" onClick={() => router.push('/campaigns')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to campaigns
        </Button>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <Tabs value={currentStep} className="w-full">
          <TabsList className="w-full justify-start bg-transparent gap-2 p-0">
            {STEPS.map((step, index) => (
              <TabsTrigger
                key={step}
                value={step}
                disabled={index > currentStepIndex}
                className="data-[state=active]:bg-brand-teal data-[state=active]:text-white px-4 py-2"
                onClick={() => index <= currentStepIndex && setCurrentStep(step)}
              >
                {index < currentStepIndex ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : null}
                {step}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Progress value={progressPercent} className="h-1" />
      </div>

      {/* Step A - Define Campaign */}
      {currentStep === 'Define' && (
        <Card>
          <CardHeader>
            <CardTitle>Define your campaign</CardTitle>
            <CardDescription>Set the basic parameters for your outreach campaign.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Campaign name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Q1 Funding Sprint Outreach"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="segment">Target segment</Label>
                <div className="flex gap-2">
                  <Select value={targetSegmentId} onValueChange={setTargetSegmentId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments.map((seg) => (
                        <SelectItem key={seg.id} value={seg.id}>{seg.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Dialog open={newSegmentOpen} onOpenChange={setNewSegmentOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>New segment</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Segment name</Label>
                          <Input 
                            value={newSegmentName}
                            onChange={(e) => setNewSegmentName(e.target.value)}
                            placeholder="e.g., Series A Founders"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          onClick={() => {
                            setTargetSegmentName(newSegmentName)
                            setNewSegmentOpen(false)
                          }}
                          className="bg-brand-teal hover:bg-brand-teal/90"
                        >
                          Add segment
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Leads needed</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {availableLeads.toLocaleString()} of {planData.leads_per_month.toLocaleString()} available this period
                    </span>
                    <span className="font-medium">{leadsNeeded}</span>
                  </div>
                  <Progress value={(planData.leads_used / planData.leads_per_month) * 100} className="h-2" />
                  <Slider
                    value={[leadsNeeded]}
                    onValueChange={([v]) => setLeadsNeeded(v)}
                    max={Math.min(availableLeads, 1000)}
                    min={10}
                    step={10}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Lead pull frequency</Label>
                <Select value={leadPullFrequency} onValueChange={setLeadPullFrequency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="geography">Geography</Label>
                <Input
                  id="geography"
                  placeholder="e.g., United States, Europe"
                  value={geography}
                  onChange={(e) => setGeography(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="e.g., SaaS, FinTech"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role / Title</Label>
                <Input
                  id="role"
                  placeholder="e.g., Founder, CEO, CFO"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., fundraising, venture capital, seed round"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="offer">Offer promoted</Label>
                <Textarea
                  id="offer"
                  placeholder="Describe what you're offering to prospects..."
                  value={offerPromoted}
                  onChange={(e) => setOfferPromoted(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Channels</Label>
                <div className="flex gap-3">
                  {(['email', 'sms', 'linkedin'] as const).map((ch) => {
                    const Icon = channelIcons[ch]
                    const isSelected = channels.includes(ch)
                    return (
                      <Button
                        key={ch}
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                        className={isSelected ? 'bg-brand-teal hover:bg-brand-teal/90' : ''}
                        onClick={() => toggleChannel(ch)}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {ch.charAt(0).toUpperCase() + ch.slice(1)}
                      </Button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Sequence length: {sequenceLength[0]} steps</Label>
                <Slider
                  value={sequenceLength}
                  onValueChange={setSequenceLength}
                  min={7}
                  max={10}
                  step={1}
                />
              </div>

              <div className="flex items-center justify-between md:col-span-2 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-0.5">
                  <Label>Approval required</Label>
                  <p className="text-sm text-muted-foreground">All content must be approved before sending.</p>
                </div>
                <Switch checked={true} disabled />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleStepASubmit}
                disabled={isLoading}
                className="bg-brand-teal hover:bg-brand-teal/90"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Next: Generate segments
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step B - Segmentation */}
      {currentStep === 'Segment' && (
        <Card>
          <CardHeader>
            <CardTitle>Generate segmentation strategy</CardTitle>
            <CardDescription>Let AI identify sub-segments within your target audience.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!segmentationResult ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-brand-teal/10 mx-auto flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-brand-teal" />
                </div>
                <p className="text-muted-foreground mb-6">
                  Our AI will analyze your campaign parameters and suggest targeted sub-segments.
                </p>
                <Button 
                  onClick={handleGenerateSegmentation}
                  disabled={isLoading}
                  size="lg"
                  className="bg-brand-teal hover:bg-brand-teal/90"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Draft strategy with Claude
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Strategy summary</h4>
                  <p className="text-sm text-muted-foreground">{segmentationResult.segment_summary}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {segmentationResult.sub_segments.map((seg, index) => {
                    const isSaved = savedSubSegments.some(s => s.name === seg.name)
                    return (
                      <Card key={index} className={isSaved ? 'border-brand-teal' : ''}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-base">{seg.name}</CardTitle>
                            {isSaved && (
                              <Badge className="bg-brand-teal">Saved</Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">{seg.description}</p>
                          {!isSaved && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleSaveSubSegment(seg)}
                                className="bg-brand-teal hover:bg-brand-teal/90"
                              >
                                <Check className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRejectSubSegment(seg)}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Priority reasoning</h4>
                  <p className="text-sm text-muted-foreground">{segmentationResult.priority_reasoning}</p>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep('Define')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleSaveAllSegments}
                    disabled={isLoading || savedSubSegments.length === 0}
                    className="bg-brand-teal hover:bg-brand-teal/90"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Next: Generate sequences
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step C - Sequences */}
      {currentStep === 'Sequences' && (
        <Card>
          <CardHeader>
            <CardTitle>Generate sequence options</CardTitle>
            <CardDescription>AI will create multiple outreach strategies for you to choose from.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {generatedSequences.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-brand-teal/10 mx-auto flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-brand-teal" />
                </div>
                <p className="text-muted-foreground mb-6">
                  Generate different approaches to reach your audience.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button 
                    onClick={() => handleGenerateSequences(3)}
                    disabled={isLoading}
                    size="lg"
                    className="bg-brand-teal hover:bg-brand-teal/90"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Generate 3 sequences
                  </Button>
                  <Button 
                    onClick={() => handleGenerateSequences(4)}
                    disabled={isLoading}
                    variant="outline"
                  >
                    Generate 4
                  </Button>
                  <Button 
                    onClick={() => handleGenerateSequences(5)}
                    disabled={isLoading}
                    variant="outline"
                  >
                    Generate 5
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {generatedSequences.map((seq, index) => (
                    <Card 
                      key={index} 
                      className={`cursor-pointer transition-all ${seq.selected ? 'border-brand-teal ring-2 ring-brand-teal/20' : 'hover:border-brand-teal/50'}`}
                      onClick={() => toggleSequenceSelection(index)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-base">{seq.name}</CardTitle>
                          {seq.selected && (
                            <div className="w-6 h-6 rounded-full bg-brand-teal flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                        <CardDescription className="text-xs">{seq.rationale}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {seq.steps.map((step, stepIdx) => {
                            const Icon = channelIcons[step.channel]
                            return (
                              <div key={stepIdx} className="flex items-center gap-2 text-xs">
                                <Badge variant="outline" className="px-1.5 py-0">
                                  <Icon className="w-3 h-3" />
                                </Badge>
                                <span className="text-muted-foreground truncate">
                                  {step.message_goal || step.subject_template || `Step ${step.step_index}`}
                                </span>
                                {step.delay_hours > 0 && (
                                  <span className="text-muted-foreground ml-auto">+{step.delay_hours}h</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep('Segment')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button 
                    onClick={handleExpandSequences}
                    disabled={isLoading || !generatedSequences.some(s => s.selected)}
                    className="bg-brand-teal hover:bg-brand-teal/90"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Expand selected ({generatedSequences.filter(s => s.selected).length})
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step D - Edit Steps */}
      {currentStep === 'Steps' && (
        <div className="space-y-6">
          {expandedSequences.map((seq, seqIndex) => (
            <Card key={seqIndex}>
              <CardHeader>
                <CardTitle>{seq.name}</CardTitle>
                <CardDescription>{seq.rationale}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {seq.steps.map((step, stepIndex) => {
                  const Icon = channelIcons[step.channel]
                  return (
                    <Card key={stepIndex} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-2 pt-1">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                          <div className="w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center text-sm font-medium">
                            {step.step_index}
                            {step.variant && step.variant !== 'A' && (
                              <span className="text-xs">{step.variant}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs">Channel</Label>
                              <Select 
                                value={step.channel} 
                                onValueChange={(v) => updateStep(seqIndex, stepIndex, 'channel', v as 'email' | 'sms' | 'linkedin')}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="email">
                                    <div className="flex items-center gap-2">
                                      <Mail className="w-3 h-3" /> Email
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="sms">
                                    <div className="flex items-center gap-2">
                                      <MessageSquare className="w-3 h-3" /> SMS
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="linkedin">
                                    <div className="flex items-center gap-2">
                                      <Linkedin className="w-3 h-3" /> LinkedIn
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Delay (hours)</Label>
                              <Input
                                type="number"
                                value={step.delay_hours}
                                onChange={(e) => updateStep(seqIndex, stepIndex, 'delay_hours', parseInt(e.target.value) || 0)}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Subject template</Label>
                              <Input
                                value={step.subject_template}
                                onChange={(e) => updateStep(seqIndex, stepIndex, 'subject_template', e.target.value)}
                                placeholder="Email subject..."
                                className="h-9"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs">Prompt template</Label>
                            <Textarea
                              value={step.prompt_template}
                              onChange={(e) => updateStep(seqIndex, stepIndex, 'prompt_template', e.target.value)}
                              placeholder="Message content with {{placeholders}}..."
                              rows={2}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label className="text-xs">Personalization angle</Label>
                              <Input
                                value={step.personalization_angle}
                                onChange={(e) => updateStep(seqIndex, stepIndex, 'personalization_angle', e.target.value)}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Stop condition</Label>
                              <Input
                                value={step.stop_condition}
                                onChange={(e) => updateStep(seqIndex, stepIndex, 'stop_condition', e.target.value)}
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-xs">Compliance notes</Label>
                              <Input
                                value={step.compliance_notes}
                                onChange={(e) => updateStep(seqIndex, stepIndex, 'compliance_notes', e.target.value)}
                                className="h-9"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => duplicateStep(seqIndex, stepIndex)}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => addVariant(seqIndex, stepIndex)}
                          >
                            <span className="text-xs font-medium">A/B</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteStep(seqIndex, stepIndex)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => addStep(seqIndex)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add step
                </Button>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep('Sequences')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              onClick={() => setCurrentStep('Review')}
              className="bg-brand-teal hover:bg-brand-teal/90"
            >
              Next: Review
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step E - Review */}
      {currentStep === 'Review' && (
        <Card>
          <CardHeader>
            <CardTitle>Review and submit</CardTitle>
            <CardDescription>Confirm your campaign details before sending for approval.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-medium mb-2">Campaign</h4>
                <p className="text-2xl font-bold text-brand-navy">{name}</p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>Channels: {channels.join(', ')}</p>
                  <p>Leads: {leadsNeeded}</p>
                  <p>Frequency: {leadPullFrequency}</p>
                </div>
              </Card>
              <Card className="p-4">
                <h4 className="font-medium mb-2">Sequences</h4>
                <p className="text-2xl font-bold text-brand-navy">{expandedSequences.length}</p>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>Total steps: {expandedSequences.reduce((acc, s) => acc + s.steps.length, 0)}</p>
                </div>
              </Card>
            </div>

            <div className="space-y-4">
              {expandedSequences.map((seq, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{seq.name}</h4>
                    <Badge variant="outline">{seq.steps.length} steps</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{seq.rationale}</p>
                </Card>
              ))}
            </div>

            <div className="p-4 bg-brand-gold/10 border border-brand-gold/30 rounded-lg">
              <p className="text-sm">
                <strong>What happens next:</strong> Your sequences will be queued for approval. 
                Once approved, they can be scheduled to run automatically.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep('Steps')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button 
                onClick={handleFinalize}
                disabled={isLoading}
                size="lg"
                className="bg-brand-teal hover:bg-brand-teal/90"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Check className="w-4 h-4 mr-2" />
                )}
                Save + Queue for Approval
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
