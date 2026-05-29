'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, Play, Loader2, Bot, Zap, Mail, MessageSquare, Linkedin, BarChart3, Brain, Bell, Shield, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

const AGENTS = [
  { id: 'social-generate', name: 'Social Generate', icon: Zap, description: 'Draft social posts from content calendar', schedule: 'Daily 7am', color: 'brand-teal' },
  { id: 'social-schedule', name: 'Social Schedule', icon: Zap, description: 'Queue approved posts to Buffer', schedule: 'Daily 8am', color: 'brand-teal' },
  { id: 'cold-email', name: 'Cold Email', icon: Mail, description: 'Draft emails for qualified leads', schedule: 'Daily 9am', color: 'brand-navy' },
  { id: 'sms', name: 'SMS', icon: MessageSquare, description: 'Draft SMS for opted-in leads', schedule: 'Daily 10am', color: 'brand-navy' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, description: 'Draft connection requests', schedule: 'Daily 11am', color: 'brand-navy' },
  { id: 'ads', name: 'Ads', icon: BarChart3, description: 'Create ad concepts from top content', schedule: 'Weekly Mon 9am', color: 'brand-gold' },
  { id: 'crm-memory', name: 'CRM Memory', icon: Brain, description: 'Score and enrich leads', schedule: 'Hourly', color: 'brand-teal' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Aggregate performance metrics', schedule: 'Daily 6am', color: 'brand-gold' },
  { id: 'approval-reminders', name: 'Approval Reminders', icon: Bell, description: 'Alert on stale approvals', schedule: 'Every 30min', color: 'brand-gold' },
]

export default function SettingsPage() {
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set())

  const handleRunAgent = async (agentId: string) => {
    setRunningAgents(prev => new Set(prev).add(agentId))
    
    try {
      const res = await fetch(`/api/agents/${agentId}?manual=1`)
      const data = await res.json()
      
      if (data.ok) {
        toast.success(`${agentId} completed`, {
          description: data.actions !== undefined 
            ? `${data.actions} action${data.actions !== 1 ? 's' : ''} taken`
            : 'Agent ran successfully',
        })
      } else {
        toast.error(`${agentId} failed`, {
          description: data.reason || 'Unknown error',
        })
      }
    } catch (err) {
      toast.error(`${agentId} failed`, {
        description: err instanceof Error ? err.message : 'Network error',
      })
    } finally {
      setRunningAgents(prev => {
        const next = new Set(prev)
        next.delete(agentId)
        return next
      })
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account, agents, and integrations.</p>
      </div>

      {/* Agent Operator Panel */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-teal flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            Agent Operator
          </CardTitle>
          <CardDescription>
            Manually trigger agents for testing. In production, these run on schedule via Vercel Cron.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {AGENTS.map((agent) => {
            const Icon = agent.icon
            const isRunning = runningAgents.has(agent.id)
            
            return (
              <div 
                key={agent.id}
                className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    agent.color === 'brand-teal' ? 'bg-brand-teal/10' :
                    agent.color === 'brand-navy' ? 'bg-brand-navy/10' :
                    'bg-brand-gold/10'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      agent.color === 'brand-teal' ? 'text-brand-teal' :
                      agent.color === 'brand-navy' ? 'text-brand-navy' :
                      'text-brand-gold'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{agent.name}</span>
                      <Badge variant="secondary" className="text-xs font-medium bg-muted">
                        {agent.schedule}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{agent.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRunAgent(agent.id)}
                  disabled={isRunning}
                  className="gap-2 font-medium hover:bg-brand-teal hover:text-white hover:border-brand-teal transition-colors"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run now
                    </>
                  )}
                </Button>
              </div>
            )
          })}

          {/* Safety Controls */}
          <div className="mt-6 p-5 rounded-xl bg-muted/50 border">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-brand-navy" />
              <h4 className="font-semibold text-foreground">Safety Controls</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SafetyBadge label="AGENTS_ENABLED" value="false" />
              <SafetyBadge label="DRY_RUN" value="true" />
              <SafetyBadge label="APPROVAL_REQUIRED" value="true" />
              <SafetyBadge label="MAX_ACTIONS" value="25" />
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              All channel live flags (BUFFER_LIVE, SMARTLEAD_LIVE, etc.) are off. Agents draft content only.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* General Settings Placeholder */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
            General settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/50 mx-auto flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Coming soon</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Profile, team members, and integrations will live here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SafetyBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-card border">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Badge 
        variant="outline" 
        className={`text-xs font-mono ${
          value === 'true' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
          value === 'false' ? 'text-slate-500 border-slate-200 bg-slate-50' :
          'text-brand-navy border-brand-navy/20 bg-brand-navy/5'
        }`}
      >
        {value}
      </Badge>
    </div>
  )
}
