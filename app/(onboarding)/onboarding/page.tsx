'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  X, Plus, Zap, ArrowRight, ArrowLeft, CheckCircle, Building2, Users, 
  Megaphone, Target, MessageSquare, Shield, Share2, Sparkles,
  Trash2, GripVertical
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { saveOnboarding } from './actions'

const STEPS = [
  { id: 'company', title: 'Company', description: 'Tell us about your business', icon: Building2 },
  { id: 'products', title: 'Products & Services', description: 'What do you sell?', icon: Sparkles },
  { id: 'customer', title: 'Ideal Customer', description: 'Who are you trying to reach?', icon: Users },
  { id: 'competitors', title: 'Competitive Edge', description: 'Stand out from the crowd', icon: Target },
  { id: 'voice', title: 'Brand Voice', description: 'How do you communicate?', icon: MessageSquare },
  { id: 'objections', title: 'Sales Playbook', description: 'Handle objections like a pro', icon: Megaphone },
  { id: 'channels', title: 'Channels & Social', description: 'Where do you connect?', icon: Share2 },
  { id: 'compliance', title: 'Compliance', description: 'Stay on the right side of the law', icon: Shield },
]

const INDUSTRIES = [
  'Technology / SaaS',
  'Financial Services',
  'Healthcare',
  'E-commerce / Retail',
  'Manufacturing',
  'Professional Services',
  'Real Estate',
  'Education',
  'Media / Entertainment',
  'Non-profit',
  'Other',
]

const COMPANY_SIZES = [
  'Solo founder',
  '2-10 employees',
  '11-50 employees',
  '51-200 employees',
  '201-500 employees',
  '500+ employees',
]

const PRICING_MODELS = [
  'Subscription / SaaS',
  'One-time purchase',
  'Usage-based',
  'Freemium',
  'Enterprise / Custom',
  'Retainer / Hourly',
  'Commission-based',
]

const DEAL_SIZES = [
  'Under $1,000',
  '$1,000 - $5,000',
  '$5,000 - $25,000',
  '$25,000 - $100,000',
  '$100,000+',
]

const SALES_CYCLES = [
  'Same day',
  '1-7 days',
  '1-4 weeks',
  '1-3 months',
  '3-6 months',
  '6+ months',
]

const TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern (ET)' },
  { value: 'America/Chicago', label: 'Central (CT)' },
  { value: 'America/Denver', label: 'Mountain (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific (PT)' },
  { value: 'America/Anchorage', label: 'Alaska (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (HT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central Europe (CET)' },
  { value: 'Asia/Tokyo', label: 'Japan (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
]

const DEFAULT_CTAS = [
  'See how it works',
  'Book a quick call',
  'Get the free guide',
  'Start your free trial',
  'Request a demo',
]

interface ProductService {
  name: string
  description: string
  price_range: string
  target_audience: string
}

interface Competitor {
  name: string
  website: string
  differentiator: string
}

interface ObjectionResponse {
  objection: string
  response: string
}

interface FormData {
  // Company
  name: string
  website: string
  industry: string
  company_size: string
  founding_year: string
  location: string
  timezone: string
  logo_url: string
  // Products & Services
  offer: string
  products_services: ProductService[]
  pricing_model: string
  average_deal_size: string
  sales_cycle_length: string
  // Customer
  target_customer: string
  icp_description: string
  primary_sales_goal: string
  pain_points_solved: string[]
  // Competitors
  competitors: Competitor[]
  unique_differentiators: string[]
  // Voice
  brand_voice: string
  approved_ctas: string[]
  case_studies: string
  content_themes: string[]
  // Objections
  objection_handling: ObjectionResponse[]
  // Channels
  communication_channels: string[]
  social_linkedin: string
  social_twitter: string
  social_facebook: string
  social_instagram: string
  social_youtube: string
  email_signature: string
  meeting_link: string
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
  
  // Input states for adding items
  const [ctaInput, setCtaInput] = useState('')
  const [painPointInput, setPainPointInput] = useState('')
  const [differentiatorInput, setDifferentiatorInput] = useState('')
  const [themeInput, setThemeInput] = useState('')
  const [channelInput, setChannelInput] = useState('')
  
  const [formData, setFormData] = useState<FormData>({
    // Company
    name: '',
    website: '',
    industry: '',
    company_size: '',
    founding_year: '',
    location: '',
    timezone: 'America/New_York',
    logo_url: '',
    // Products & Services
    offer: '',
    products_services: [{ name: '', description: '', price_range: '', target_audience: '' }],
    pricing_model: '',
    average_deal_size: '',
    sales_cycle_length: '',
    // Customer
    target_customer: '',
    icp_description: '',
    primary_sales_goal: '',
    pain_points_solved: [],
    // Competitors
    competitors: [{ name: '', website: '', differentiator: '' }],
    unique_differentiators: [],
    // Voice
    brand_voice: '',
    approved_ctas: DEFAULT_CTAS,
    case_studies: '',
    content_themes: [],
    // Objections
    objection_handling: [
      { objection: '', response: '' },
    ],
    // Channels
    communication_channels: ['email'],
    social_linkedin: '',
    social_twitter: '',
    social_facebook: '',
    social_instagram: '',
    social_youtube: '',
    email_signature: '',
    meeting_link: '',
    // Compliance
    unsubscribe_url: '',
    physical_address: '',
    quiet_hours_start: '08:00',
    quiet_hours_end: '21:00',
    default_opt_in_source: 'Website signup',
  })

  const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  // Array helpers
  const addToArray = useCallback((field: keyof FormData, value: string, inputSetter: (v: string) => void) => {
    if (value.trim()) {
      const currentArray = formData[field] as string[]
      if (!currentArray.includes(value.trim())) {
        updateField(field, [...currentArray, value.trim()] as FormData[typeof field])
        inputSetter('')
      }
    }
  }, [formData, updateField])

  const removeFromArray = useCallback((field: keyof FormData, value: string) => {
    const currentArray = formData[field] as string[]
    updateField(field, currentArray.filter(item => item !== value) as FormData[typeof field])
  }, [formData, updateField])

  // Product helpers
  const addProduct = () => {
    updateField('products_services', [
      ...formData.products_services,
      { name: '', description: '', price_range: '', target_audience: '' }
    ])
  }

  const updateProduct = (index: number, field: keyof ProductService, value: string) => {
    const updated = [...formData.products_services]
    updated[index] = { ...updated[index], [field]: value }
    updateField('products_services', updated)
  }

  const removeProduct = (index: number) => {
    if (formData.products_services.length > 1) {
      updateField('products_services', formData.products_services.filter((_, i) => i !== index))
    }
  }

  // Competitor helpers
  const addCompetitor = () => {
    updateField('competitors', [
      ...formData.competitors,
      { name: '', website: '', differentiator: '' }
    ])
  }

  const updateCompetitor = (index: number, field: keyof Competitor, value: string) => {
    const updated = [...formData.competitors]
    updated[index] = { ...updated[index], [field]: value }
    updateField('competitors', updated)
  }

  const removeCompetitor = (index: number) => {
    if (formData.competitors.length > 1) {
      updateField('competitors', formData.competitors.filter((_, i) => i !== index))
    }
  }

  // Objection helpers
  const addObjection = () => {
    updateField('objection_handling', [
      ...formData.objection_handling,
      { objection: '', response: '' }
    ])
  }

  const updateObjection = (index: number, field: keyof ObjectionResponse, value: string) => {
    const updated = [...formData.objection_handling]
    updated[index] = { ...updated[index], [field]: value }
    updateField('objection_handling', updated)
  }

  const removeObjection = (index: number) => {
    if (formData.objection_handling.length > 1) {
      updateField('objection_handling', formData.objection_handling.filter((_, i) => i !== index))
    }
  }

  // Channel toggle
  const toggleChannel = (channel: string) => {
    if (formData.communication_channels.includes(channel)) {
      updateField('communication_channels', formData.communication_channels.filter(c => c !== channel))
    } else {
      updateField('communication_channels', [...formData.communication_channels, channel])
    }
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
        toast.success('Setup complete! Welcome to your AI-powered sales engine.')
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
  const CurrentIcon = STEPS[currentStep].icon

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-brand-teal flex items-center justify-center">
              <Zap className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-brand-navy">Power AI Sales Engine</h1>
          <p className="text-muted-foreground mt-2">
            {"Let's get everything we need to market and sell for your business."}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Takes about 10 minutes. You can always update these later.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1 mb-6 overflow-x-auto pb-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = index === currentStep
            const isComplete = index < currentStep
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(index)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-brand-teal text-white' 
                    : isComplete 
                      ? 'bg-brand-teal/20 text-brand-teal'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{index + 1}</span>
              </button>
            )
          })}
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-brand-teal font-medium flex items-center gap-2">
              <CurrentIcon className="w-4 h-4" />
              Step {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-muted-foreground">{STEPS[currentStep].title}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CurrentIcon className="w-5 h-5 text-brand-teal" />
              {STEPS[currentStep].title}
            </CardTitle>
            <CardDescription>{STEPS[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Step 1: Company */}
            {currentStep === 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Company name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) => updateField('website', e.target.value)}
                      placeholder="https://acme.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={formData.industry} onValueChange={(v) => updateField('industry', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company_size">Company size</Label>
                    <Select value={formData.company_size} onValueChange={(v) => updateField('company_size', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {COMPANY_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="founding_year">Founded</Label>
                    <Input
                      id="founding_year"
                      type="number"
                      value={formData.founding_year}
                      onChange={(e) => updateField('founding_year', e.target.value)}
                      placeholder="2020"
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => updateField('location', e.target.value)}
                      placeholder="Austin, TX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={formData.timezone} onValueChange={(v) => updateField('timezone', v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logo_url">Logo URL (optional)</Label>
                  <Input
                    id="logo_url"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => updateField('logo_url', e.target.value)}
                    placeholder="https://acme.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in email signatures and social content
                  </p>
                </div>
              </>
            )}

            {/* Step 2: Products & Services */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="offer">What does your company do? *</Label>
                  <Textarea
                    id="offer"
                    value={formData.offer}
                    onChange={(e) => updateField('offer', e.target.value)}
                    placeholder="Describe your core offering in 2-3 sentences. What problem do you solve and for whom?"
                    rows={3}
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Products or Services</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addProduct}>
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                  
                  {formData.products_services.map((product, index) => (
                    <Card key={index} className="p-4 bg-muted/30">
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-muted-foreground mt-2.5 cursor-grab" />
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              value={product.name}
                              onChange={(e) => updateProduct(index, 'name', e.target.value)}
                              placeholder="Product/Service name"
                            />
                            <Input
                              value={product.price_range}
                              onChange={(e) => updateProduct(index, 'price_range', e.target.value)}
                              placeholder="Price range (e.g., $99/mo)"
                            />
                          </div>
                          <Textarea
                            value={product.description}
                            onChange={(e) => updateProduct(index, 'description', e.target.value)}
                            placeholder="Brief description and key benefits"
                            rows={2}
                          />
                          <Input
                            value={product.target_audience}
                            onChange={(e) => updateProduct(index, 'target_audience', e.target.value)}
                            placeholder="Target audience for this product"
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeProduct(index)}
                          disabled={formData.products_services.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pricing_model">Pricing model</Label>
                    <Select value={formData.pricing_model} onValueChange={(v) => updateField('pricing_model', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRICING_MODELS.map((model) => (
                          <SelectItem key={model} value={model}>{model}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="average_deal_size">Average deal size</Label>
                    <Select value={formData.average_deal_size} onValueChange={(v) => updateField('average_deal_size', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEAL_SIZES.map((size) => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sales_cycle_length">Sales cycle</Label>
                    <Select value={formData.sales_cycle_length} onValueChange={(v) => updateField('sales_cycle_length', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        {SALES_CYCLES.map((cycle) => (
                          <SelectItem key={cycle} value={cycle}>{cycle}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Ideal Customer */}
            {currentStep === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="target_customer">Who is your target customer? *</Label>
                  <Input
                    id="target_customer"
                    value={formData.target_customer}
                    onChange={(e) => updateField('target_customer', e.target.value)}
                    placeholder="e.g., Early-stage B2B SaaS founders raising their first round"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icp_description">Ideal Customer Profile (ICP)</Label>
                  <Textarea
                    id="icp_description"
                    value={formData.icp_description}
                    onChange={(e) => updateField('icp_description', e.target.value)}
                    placeholder="Describe your ideal customer in detail: their role, company type, challenges, goals, and what makes them a great fit for your solution..."
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    The more specific you are, the better we can target your outreach.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary_sales_goal">Primary sales goal</Label>
                  <Input
                    id="primary_sales_goal"
                    value={formData.primary_sales_goal}
                    onChange={(e) => updateField('primary_sales_goal', e.target.value)}
                    placeholder="e.g., Book 10 discovery calls per week"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Pain points you solve</Label>
                  <div className="flex gap-2">
                    <Input
                      value={painPointInput}
                      onChange={(e) => setPainPointInput(e.target.value)}
                      placeholder="Add a pain point"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('pain_points_solved', painPointInput, setPainPointInput))}
                    />
                    <Button type="button" variant="outline" onClick={() => addToArray('pain_points_solved', painPointInput, setPainPointInput)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.pain_points_solved.map((point) => (
                      <Badge key={point} variant="secondary" className="py-1.5 px-3">
                        {point}
                        <button type="button" onClick={() => removeFromArray('pain_points_solved', point)} className="ml-2 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {formData.pain_points_solved.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Examples: "Spending too much time on manual outreach", "Low response rates", "No clear sales process"
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Step 4: Competitive Edge */}
            {currentStep === 3 && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Key competitors</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addCompetitor}>
                      <Plus className="w-4 h-4 mr-1" /> Add competitor
                    </Button>
                  </div>
                  
                  {formData.competitors.map((competitor, index) => (
                    <Card key={index} className="p-4 bg-muted/30">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              value={competitor.name}
                              onChange={(e) => updateCompetitor(index, 'name', e.target.value)}
                              placeholder="Competitor name"
                            />
                            <Input
                              value={competitor.website}
                              onChange={(e) => updateCompetitor(index, 'website', e.target.value)}
                              placeholder="Website (optional)"
                            />
                          </div>
                          <Input
                            value={competitor.differentiator}
                            onChange={(e) => updateCompetitor(index, 'differentiator', e.target.value)}
                            placeholder="How are you different/better than them?"
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeCompetitor(index)}
                          disabled={formData.competitors.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                  <p className="text-xs text-muted-foreground">
                    Knowing your competition helps us position you effectively.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Your unique differentiators</Label>
                  <div className="flex gap-2">
                    <Input
                      value={differentiatorInput}
                      onChange={(e) => setDifferentiatorInput(e.target.value)}
                      placeholder="What makes you unique?"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('unique_differentiators', differentiatorInput, setDifferentiatorInput))}
                    />
                    <Button type="button" variant="outline" onClick={() => addToArray('unique_differentiators', differentiatorInput, setDifferentiatorInput)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.unique_differentiators.map((diff) => (
                      <Badge key={diff} variant="secondary" className="py-1.5 px-3 bg-brand-teal/10 text-brand-teal border-brand-teal/20">
                        {diff}
                        <button type="button" onClick={() => removeFromArray('unique_differentiators', diff)} className="ml-2 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {formData.unique_differentiators.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Examples: "Founded by industry veterans", "Only platform with X feature", "100% money-back guarantee"
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Step 5: Brand Voice */}
            {currentStep === 4 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="brand_voice">Brand voice & tone *</Label>
                  <Textarea
                    id="brand_voice"
                    value={formData.brand_voice}
                    onChange={(e) => updateField('brand_voice', e.target.value)}
                    placeholder="Describe how you want to sound in all communications. Are you formal or casual? Technical or approachable? Warm and friendly or direct and professional?"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    This helps our AI match your tone in all generated content.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Approved CTAs (calls-to-action)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={ctaInput}
                      onChange={(e) => setCtaInput(e.target.value)}
                      placeholder="Add a CTA"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('approved_ctas', ctaInput, setCtaInput))}
                    />
                    <Button type="button" variant="outline" onClick={() => addToArray('approved_ctas', ctaInput, setCtaInput)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.approved_ctas.map((cta) => (
                      <Badge key={cta} variant="secondary" className="py-1.5 px-3">
                        {cta}
                        <button type="button" onClick={() => removeFromArray('approved_ctas', cta)} className="ml-2 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Content themes</Label>
                  <div className="flex gap-2">
                    <Input
                      value={themeInput}
                      onChange={(e) => setThemeInput(e.target.value)}
                      placeholder="Add a theme"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('content_themes', themeInput, setThemeInput))}
                    />
                    <Button type="button" variant="outline" onClick={() => addToArray('content_themes', themeInput, setThemeInput)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.content_themes.map((theme) => (
                      <Badge key={theme} variant="outline" className="py-1.5 px-3">
                        {theme}
                        <button type="button" onClick={() => removeFromArray('content_themes', theme)} className="ml-2 hover:text-destructive">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  {formData.content_themes.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Topics you want to be known for. Examples: "Fundraising tips", "Product updates", "Industry insights"
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="case_studies">Case studies & social proof</Label>
                  <Textarea
                    id="case_studies"
                    value={formData.case_studies}
                    onChange={(e) => updateField('case_studies', e.target.value)}
                    placeholder="Share links to case studies, testimonials, notable clients, or impressive results we can reference in outreach..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Step 6: Sales Playbook (Objections) */}
            {currentStep === 5 && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  {"What objections do prospects commonly raise? We'll use your responses to help craft better follow-ups."}
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Common objections & responses</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addObjection}>
                      <Plus className="w-4 h-4 mr-1" /> Add objection
                    </Button>
                  </div>
                  
                  {formData.objection_handling.map((obj, index) => (
                    <Card key={index} className="p-4 bg-muted/30">
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-3">
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Objection</Label>
                            <Input
                              value={obj.objection}
                              onChange={(e) => updateObjection(index, 'objection', e.target.value)}
                              placeholder={`e.g., "It's too expensive" or "We already have a solution"`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Your response</Label>
                            <Textarea
                              value={obj.response}
                              onChange={(e) => updateObjection(index, 'response', e.target.value)}
                              placeholder="How do you typically address this objection?"
                              rows={2}
                            />
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeObjection(index)}
                          disabled={formData.objection_handling.length === 1}
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                <Card className="p-4 bg-brand-gold/10 border-brand-gold/20">
                  <p className="text-sm">
                    <strong>Tip:</strong> {"The best objection responses acknowledge the concern, then pivot to value. For example: \"I hear you — budget is always a consideration. Our clients typically see ROI within 60 days...\""}
                  </p>
                </Card>
              </>
            )}

            {/* Step 7: Channels & Social */}
            {currentStep === 6 && (
              <>
                <div className="space-y-2">
                  <Label>Communication channels</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Select the channels you want to use for outreach
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['email', 'linkedin', 'sms', 'phone', 'twitter'].map((channel) => (
                      <Badge 
                        key={channel}
                        variant={formData.communication_channels.includes(channel) ? 'default' : 'outline'}
                        className={`py-2 px-4 cursor-pointer transition-all ${
                          formData.communication_channels.includes(channel) 
                            ? 'bg-brand-teal hover:bg-brand-teal/90' 
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => toggleChannel(channel)}
                      >
                        {channel.charAt(0).toUpperCase() + channel.slice(1)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Social profiles</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="social_linkedin" className="text-xs text-muted-foreground">LinkedIn</Label>
                      <Input
                        id="social_linkedin"
                        value={formData.social_linkedin}
                        onChange={(e) => updateField('social_linkedin', e.target.value)}
                        placeholder="https://linkedin.com/company/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="social_twitter" className="text-xs text-muted-foreground">Twitter / X</Label>
                      <Input
                        id="social_twitter"
                        value={formData.social_twitter}
                        onChange={(e) => updateField('social_twitter', e.target.value)}
                        placeholder="https://twitter.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="social_facebook" className="text-xs text-muted-foreground">Facebook</Label>
                      <Input
                        id="social_facebook"
                        value={formData.social_facebook}
                        onChange={(e) => updateField('social_facebook', e.target.value)}
                        placeholder="https://facebook.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="social_instagram" className="text-xs text-muted-foreground">Instagram</Label>
                      <Input
                        id="social_instagram"
                        value={formData.social_instagram}
                        onChange={(e) => updateField('social_instagram', e.target.value)}
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="social_youtube" className="text-xs text-muted-foreground">YouTube</Label>
                      <Input
                        id="social_youtube"
                        value={formData.social_youtube}
                        onChange={(e) => updateField('social_youtube', e.target.value)}
                        placeholder="https://youtube.com/..."
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meeting_link">Meeting/calendar link</Label>
                    <Input
                      id="meeting_link"
                      type="url"
                      value={formData.meeting_link}
                      onChange={(e) => updateField('meeting_link', e.target.value)}
                      placeholder="https://calendly.com/..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_signature">Email signature</Label>
                  <Textarea
                    id="email_signature"
                    value={formData.email_signature}
                    onChange={(e) => updateField('email_signature', e.target.value)}
                    placeholder="Your name&#10;Title | Company&#10;phone | website"
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used at the end of all outbound emails
                  </p>
                </div>
              </>
            )}

            {/* Step 8: Compliance */}
            {currentStep === 7 && (
              <>
                <Card className="p-4 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900 mb-6">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {"These settings help keep your outreach compliant with CAN-SPAM, GDPR, and other regulations. We'll never send without your approval."}
                  </p>
                </Card>

                <div className="space-y-2">
                  <Label htmlFor="unsubscribe_url">Unsubscribe URL *</Label>
                  <Input
                    id="unsubscribe_url"
                    type="url"
                    value={formData.unsubscribe_url}
                    onChange={(e) => updateField('unsubscribe_url', e.target.value)}
                    placeholder="https://yoursite.com/unsubscribe"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for email compliance. All emails will include this link.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="physical_address">Physical address *</Label>
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
                  {"We won't send messages during these hours (recipient's local time)."}
                </p>

                <div className="space-y-2">
                  <Label htmlFor="default_opt_in_source">Default opt-in source</Label>
                  <Input
                    id="default_opt_in_source"
                    value={formData.default_opt_in_source}
                    onChange={(e) => updateField('default_opt_in_source', e.target.value)}
                    placeholder="e.g., Website signup, Event registration"
                  />
                  <p className="text-xs text-muted-foreground">
                    How did most of your contacts opt in to receive communications?
                  </p>
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
              disabled={isLoading || !formData.name}
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

        {/* Footer tagline */}
        <p className="text-center text-sm text-muted-foreground mt-8 italic">
          Remove gates. Build bridges. Carry fire.
        </p>
      </div>
    </div>
  )
}
