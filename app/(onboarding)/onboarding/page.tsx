'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { X, Plus, Zap, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { saveOnboarding } from './actions'

const DEFAULT_CTAS = [
  'See how it works',
  'Watch the workflow',
  'Get the Funding Sprint Kit',
  'See your first funding matches',
  'Get the fundraising pipeline template',
]

const STEPS = [
  { id: 'identity', title: 'Identity', description: 'Tell us about your company' },
  { id: 'customer', title: 'Ideal Customer', description: 'Who are you trying to reach?' },
  { id: 'voice', title: 'Voice', description: 'How do you communicate?' },
  { id: 'compliance', title: 'Compliance', description: 'Keep your outreach compliant' },
]

interface FormData {
  // Identity
  name: string
  website: string
  offer: string
  // Customer
  target_customer: string
  icp_description: string
  primary_sales_goal: string
  // Voice
  brand_voice: string
  approved_ctas: string[]
  case_studies: string
  // Compliance
  unsubscribe_url: string
  physical_address: string
  quiet_hours_start: string
  quiet_hours_end: string
  default_opt_in_source: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [ctaInput, setCtaInput] = useState('')
  
  const [formData, setFormData] = useState<FormData>({
    name: 'Power AI Funds',
    website: '',
    offer: '',
    target_customer: '',
    icp_description: '',
    primary_sales_goal: '',
    brand_voice: '',
    approved_ctas: DEFAULT_CTAS,
    case_studies: '',
    unsubscribe_url: '',
    physical_address: '',
    quiet_hours_start: '08:00',
    quiet_hours_end: '21:00',
    default_opt_in_source: '',
  })

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addCta = () => {
    if (ctaInput.trim() && !formData.approved_ctas.includes(ctaInput.trim())) {
      updateField('approved_ctas', [...formData.approved_ctas, ctaInput.trim()])
      setCtaInput('')
    }
  }

  const removeCta = (cta: string) => {
    updateField('approved_ctas', formData.approved_ctas.filter(c => c !== cta))
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const result = await saveOnboarding(formData)
      if (result.success) {
        toast.success('Setup complete! Welcome to Power AI Sales Engine.')
        router.push('/dashboard')
        router.refresh()
      } else {
        toast.error(result.error || 'Something went wrong. Please try again.')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-brand-teal flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">Let&apos;s set up your sales engine</h1>
          <p className="text-muted-foreground mt-2">This takes about 3 minutes. You can always update these later.</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-brand-teal font-medium">Step {currentStep + 1} of {STEPS.length}</span>
            <span className="text-muted-foreground">{STEPS[currentStep].title}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep].title}</CardTitle>
            <CardDescription>{STEPS[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 0 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Company name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Power AI Funds"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={formData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://poweraifunds.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="offer">What do you offer?</Label>
                  <Textarea
                    id="offer"
                    value={formData.offer}
                    onChange={(e) => updateField('offer', e.target.value)}
                    placeholder="Describe your core offering in a few sentences..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="target_customer">Target customer</Label>
                  <Input
                    id="target_customer"
                    value={formData.target_customer}
                    onChange={(e) => updateField('target_customer', e.target.value)}
                    placeholder="e.g., Early-stage startup founders"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icp_description">Ideal customer profile (ICP)</Label>
                  <Textarea
                    id="icp_description"
                    value={formData.icp_description}
                    onChange={(e) => updateField('icp_description', e.target.value)}
                    placeholder="Describe your ideal customer in detail: industry, company size, pain points..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary_sales_goal">Primary sales goal</Label>
                  <Input
                    id="primary_sales_goal"
                    value={formData.primary_sales_goal}
                    onChange={(e) => updateField('primary_sales_goal', e.target.value)}
                    placeholder="e.g., Book discovery calls, grow newsletter list"
                  />
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="brand_voice">Brand voice</Label>
                  <Textarea
                    id="brand_voice"
                    value={formData.brand_voice}
                    onChange={(e) => updateField('brand_voice', e.target.value)}
                    placeholder="Describe how you sound: warm, professional, casual, technical, faith-friendly..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps us match your tone in AI-powered messages.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Approved CTAs</Label>
                  <div className="flex gap-2">
                    <Input
                      value={ctaInput}
                      onChange={(e) => setCtaInput(e.target.value)}
                      placeholder="Add a call-to-action"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCta())}
                    />
                    <Button type="button" variant="outline" onClick={addCta}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.approved_ctas.map((cta) => (
                      <Badge key={cta} variant="secondary" className="py-1.5 px-3">
                        {cta}
                        <button
                          type="button"
                          onClick={() => removeCta(cta)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="case_studies">Case studies or social proof</Label>
                  <Textarea
                    id="case_studies"
                    value={formData.case_studies}
                    onChange={(e) => updateField('case_studies', e.target.value)}
                    placeholder="Links to case studies, testimonials, or results you can reference..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="unsubscribe_url">Unsubscribe URL</Label>
                  <Input
                    id="unsubscribe_url"
                    type="url"
                    value={formData.unsubscribe_url}
                    onChange={(e) => updateField('unsubscribe_url', e.target.value)}
                    placeholder="https://yoursite.com/unsubscribe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="physical_address">Physical address</Label>
                  <Input
                    id="physical_address"
                    value={formData.physical_address}
                    onChange={(e) => updateField('physical_address', e.target.value)}
                    placeholder="123 Main St, City, State 12345"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for CAN-SPAM compliance.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quiet_hours_start">Quiet hours start</Label>
                    <Input
                      id="quiet_hours_start"
                      type="time"
                      value={formData.quiet_hours_start}
                      onChange={(e) => updateField('quiet_hours_start', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quiet_hours_end">Quiet hours end</Label>
                    <Input
                      id="quiet_hours_end"
                      type="time"
                      value={formData.quiet_hours_end}
                      onChange={(e) => updateField('quiet_hours_end', e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  We won&apos;t send messages during these hours (recipient&apos;s local time).
                </p>
                <div className="space-y-2">
                  <Label htmlFor="default_opt_in_source">Default opt-in source</Label>
                  <Input
                    id="default_opt_in_source"
                    value={formData.default_opt_in_source}
                    onChange={(e) => updateField('default_opt_in_source', e.target.value)}
                    placeholder="e.g., Website signup, Event registration"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} className="gap-2 bg-brand-teal hover:bg-brand-teal/90">
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading}
              className="gap-2 bg-brand-teal hover:bg-brand-teal/90"
            >
              {isLoading ? 'Saving...' : (
                <>
                  Complete setup
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
