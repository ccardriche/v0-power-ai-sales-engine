'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, Play, Loader2, Bot, Zap, Mail, MessageSquare, Linkedin, BarChart3, Brain, Bell } from 'lucide-react'
import { toast } from 'sonner'

const AGENTS = [
  { id: 'social-generate', name: 'Social Generate', icon: Zap, description: 'Draft social posts from content calendar', schedule: 'Daily 7am' },
  { id: 'social-schedule', name: 'Social Schedule', icon: Zap, description: 'Queue approved posts to Buffer', schedule: 'Daily 8am' },
  { id: 'cold-email', name: 'Cold Email', icon: Mail, description: 'Draft emails for qualified leads', schedule: 'Daily 9am' },
  { id: 'sms', name: 'SMS', icon: MessageSquare, description: 'Draft SMS for opted-in leads', schedule: 'Daily 10am' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, description: 'Draft connection requests', schedule: 'Daily 11am' },
  { id: 'ads', name: 'Ads', icon: BarChart3, description: 'Create ad concepts from top content', schedule: 'Weekly Mon 9am' },
  { id: 'crm-memory', name: 'CRM Memory', icon: Brain, description: 'Score and enrich leads', schedule: 'Hourly' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Aggregate performance metrics', schedule: 'Daily 6am' },
  { id: 'approval-reminders', name: 'Approval Reminders', icon: Bell, description: 'Alert on stale approvals', schedule: 'Every 30min' },
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
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account, agents, and integrations.</p>
      </div>

      {/* Agent Operator Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5 text-brand-teal" />
            Agent Operator
          </CardTitle>
          <CardDescription>
            Manually trigger agents for testing. In production, these run on schedule via Vercel Cron.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {AGENTS.map((agent) => {
              const Icon = agent.icon
              const isRunning = runningAgents.has(agent.id)
              
              return (
                <div 
                  key={agent.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-navy/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-brand-navy" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{agent.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {agent.schedule}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{agent.description}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRunAgent(agent.id)}
                    disabled={isRunning}
                    className="gap-2"
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
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-medium text-sm mb-2">Safety Controls</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">AGENTS_ENABLED:</span>
                <Badge variant="outline" className="ml-2">false</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">DRY_RUN:</span>
                <Badge variant="outline" className="ml-2">true</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">APPROVAL_REQUIRED:</span>
                <Badge variant="outline" className="ml-2">true</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">MAX_ACTIONS:</span>
                <Badge variant="outline" className="ml-2">25</Badge>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              All channel live flags (BUFFER_LIVE, SMARTLEAD_LIVE, etc.) are off. Agents draft content only.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* General Settings Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-teal" />
            General settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">More settings coming soon.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Profile, team members, and integrations will live here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
