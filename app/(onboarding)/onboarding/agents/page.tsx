'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { finishOnboarding, fetchAgentConfigurations } from '../actions'
import { Loader2 } from 'lucide-react'

interface AgentConfig {
  agent_name: string
  enabled: boolean
  goal: string
  settings: Record<string, unknown>
}

const AGENT_GROUPS = {
  Pipeline: ['lead-generator', 'cold-email', 'crm-memory'],
  'Outreach amplifiers': ['linkedin', 'sms', 'social-generate', 'social-schedule'],
  'Operations & insights': ['ads', 'analytics', 'approval-reminders'],
}

const AGENT_INFO: Record<string, { label: string; subtitle: string }> = {
  'lead-generator': { label: 'Lead Generator', subtitle: 'Source verified leads daily from your ICP' },
  'cold-email': { label: 'Cold Email', subtitle: 'Send personalized outreach at scale' },
  'crm-memory': { label: 'CRM/Memory', subtitle: 'Score and enrich leads automatically' },
  linkedin: { label: 'LinkedIn', subtitle: 'Send connection requests and follow-ups' },
  sms: { label: 'SMS', subtitle: 'Send text reminders to opted-in leads' },
  'social-generate': { label: 'Social Drafter', subtitle: 'Draft social posts from top content' },
  'social-schedule': { label: 'Social Scheduler', subtitle: 'Schedule posts to Buffer or Metricool' },
  ads: { label: 'Ads', subtitle: 'Create ad concepts from performing content' },
  analytics: { label: 'Analytics', subtitle: 'Weekly performance reports' },
  'approval-reminders': { label: 'Approval Reminders', subtitle: 'Alert on stale approvals' },
}

export default function AgentsStep() {
  const [loading, setLoading] = useState(false)
  const [fetchingAgents, setFetchingAgents] = useState(true)
  const [agents, setAgents] = useState<AgentConfig[]>([])

  useEffect(() => {
    async function loadAgents() {
      try {
        const loaded = await fetchAgentConfigurations()
        setAgents(loaded)
      } catch (error) {
        toast.error('Failed to load agents')
        console.error(error)
      } finally {
        setFetchingAgents(false)
      }
    }
    loadAgents()
  }, [])

  const handleToggleAgent = (agentName: string, enabled: boolean) => {
    setAgents(agents.map((a) => (a.agent_name === agentName ? { ...a, enabled } : a)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await finishOnboarding(agents)
      toast.success('Onboarding complete!')
    } catch (error) {
      toast.error('Failed to finish onboarding')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (fetchingAgents) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl">
          <CardContent className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <CardTitle>Step 5 of 5 — Enable your agents</CardTitle>
              <span className="text-sm text-muted-foreground">100%</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>Cold Email is your spine.</strong> Enable Lead Generator + Cold Email + CRM/Memory first. Add the others as you&apos;re ready.
              </p>
            </div>

            {Object.entries(AGENT_GROUPS).map(([groupName, agentNames]) => (
              <div key={groupName} className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">{groupName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {agentNames.map((agentName) => {
                    const config = agents.find((a) => a.agent_name === agentName)
                    const info = AGENT_INFO[agentName]
                    if (!config) return null

                    return (
                      <Card key={agentName} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-medium">{info.label}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{info.subtitle}</p>
                            {config.goal && (
                              <p className="text-xs text-muted-foreground mt-2 italic">"{config.goal}"</p>
                            )}
                          </div>
                          <Switch
                            checked={config.enabled}
                            onCheckedChange={(enabled) => handleToggleAgent(agentName, enabled)}
                          />
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline">
                ← Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-brand-teal hover:bg-brand-teal/90"
              >
                {loading ? 'Finishing...' : 'Finish onboarding →'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
