'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, Play, Loader2, Bot, Zap, Mail, MessageSquare, Linkedin, BarChart3, Brain, Bell, Shield, ArrowRight, Edit2 } from 'lucide-react'
import { toast } from 'sonner'
import { AgentEditDialog } from '@/components/agent-edit-dialog'
import { getAgentConfiguration } from './actions'

const AGENT_METADATA = {
  'social-generate': { name: 'Social Generate', icon: Zap, description: 'Draft social posts from content calendar', color: 'brand-teal' },
  'social-schedule': { name: 'Social Schedule', icon: Zap, description: 'Queue approved posts to Buffer', color: 'brand-teal' },
  'cold-email': { name: 'Cold Email', icon: Mail, description: 'Draft emails for qualified leads', color: 'brand-navy' },
  'sms': { name: 'SMS', icon: MessageSquare, description: 'Draft SMS for opted-in leads', color: 'brand-navy' },
  'linkedin': { name: 'LinkedIn', icon: Linkedin, description: 'Draft connection requests', color: 'brand-navy' },
  'ads': { name: 'Ads', icon: BarChart3, description: 'Create ad concepts from top content', color: 'brand-gold' },
  'crm-memory': { name: 'CRM Memory', icon: Brain, description: 'Score and enrich leads', color: 'brand-teal' },
  'lead-generator': { name: 'Lead Generator', icon: Zap, description: 'Source qualified leads daily', color: 'brand-teal' },
  'analytics': { name: 'Analytics', icon: BarChart3, description: 'Aggregate performance metrics', color: 'brand-gold' },
  'approval-reminders': { name: 'Approval Reminders', icon: Bell, description: 'Alert on stale approvals', color: 'brand-gold' },
}

type AgentName = keyof typeof AGENT_METADATA

export default function SettingsPage() {
  const [runningAgents, setRunningAgents] = useState<Set<string>>(new Set())
  const [agents, setAgents] = useState<Record<string, any>>({})
  const [editingAgent, setEditingAgent] = useState<AgentName | null>(null)
  const [isLoadingConfigs, setIsLoadingConfigs] = useState(true)

  useEffect(() => {
    loadAgentConfigs()
  }, [])

  const loadAgentConfigs = async () => {
    setIsLoadingConfigs(true)
    try {
      const agentNames = Object.keys(AGENT_METADATA) as AgentName[]
      const configs: Record<string, any> = {}

      for (const agentName of agentNames) {
        try {
          const config = await getAgentConfiguration(agentName)
          configs[agentName] = config
        } catch (err) {
          console.error(`Failed to load config for ${agentName}:`, err)
        }
      }

      setAgents(configs)
    } catch (err) {
      toast.error('Failed to load agent configurations')
    } finally {
      setIsLoadingConfigs(false)
    }
  }

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

  if (isLoadingConfigs) {
    return (
      <div className="p-8 space-y-8 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account, agents, and integrations.</p>
        </div>
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading agent configurations...</p>
          </CardContent>
        </Card>
      </div>
    )
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
            Configure agents, set schedules, and run manually for testing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(AGENT_METADATA).map(([agentId, meta]) => {
            const Icon = meta.icon
            const isRunning = runningAgents.has(agentId)
            const config = agents[agentId]
            const enabled = config?.enabled ?? false

            return (
              <div
                key={agentId}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  enabled ? 'bg-card hover:bg-muted/30' : 'bg-muted/30 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    meta.color === 'brand-teal' ? 'bg-brand-teal/10' :
                    meta.color === 'brand-navy' ? 'bg-brand-navy/10' :
                    'bg-brand-gold/10'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      meta.color === 'brand-teal' ? 'text-brand-teal' :
                      meta.color === 'brand-navy' ? 'text-brand-navy' :
                      'text-brand-gold'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{meta.name}</span>
                      {enabled && (
                        <Badge variant="secondary" className="text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200">
                          Active
                        </Badge>
                      )}
                      {!enabled && (
                        <Badge variant="secondary" className="text-xs font-medium bg-slate-100 text-slate-600 border-slate-300">
                          Disabled
                        </Badge>
                      )}
                      {config?.schedule_label && (
                        <Badge variant="outline" className="text-xs font-medium">
                          {config.schedule_label}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{meta.description}</p>
                    {config?.goal && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">Goal: {config.goal}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingAgent(agentId as AgentName)}
                    className="gap-2 font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRunAgent(agentId)}
                    disabled={isRunning || !enabled}
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
                        Run
                      </>
                    )}
                  </Button>
                </div>
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

      {/* Edit Agent Dialog */}
      {editingAgent && agents[editingAgent] && (
        <AgentEditDialog
          agent={{
            agent_name: editingAgent,
            ...agents[editingAgent],
          }}
          open={!!editingAgent}
          onOpenChange={(open) => !open && setEditingAgent(null)}
          onSave={loadAgentConfigs}
        />
      )}
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
