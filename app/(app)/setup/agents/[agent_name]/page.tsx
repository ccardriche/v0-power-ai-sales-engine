'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Define agent configuration schemas and info
const AGENT_INFO: Record<string, { label: string; description: string }> = {
  'lead-generator': {
    label: 'Lead Generator',
    description: 'Automatically source verified leads from your target segments daily.',
  },
  'cold-email': {
    label: 'Cold Email',
    description: 'Send personalized cold email outreach at scale with warmup compliance.',
  },
  // ... other agents
}

const SETTINGS_SCHEMA: Record<string, Array<{
  key: string
  label: string
  type: 'number' | 'string' | 'boolean' | 'select' | 'tags'
  options?: string[]
  help?: string
}>> = {
  'lead-generator': [
    { key: 'provider', label: 'Source provider', type: 'select', options: ['apollo', 'pdl', 'clay'] },
    { key: 'daily_target', label: 'Daily lead target', type: 'number', help: 'New verified leads per day' },
    { key: 'segment_strategy', label: 'Segment strategy', type: 'select', options: ['balanced', 'priority_first', 'round_robin'] },
    { key: 'require_email', label: 'Require verified email', type: 'boolean' },
    { key: 'require_linkedin', label: 'Require LinkedIn URL', type: 'boolean' },
  ],
  'cold-email': [
    { key: 'provider', label: 'Sender', type: 'select', options: ['smartlead', 'instantly'] },
    { key: 'daily_send_cap', label: 'Daily send cap per inbox', type: 'number' },
    { key: 'min_lead_score', label: 'Minimum lead score', type: 'number' },
  ],
}

interface AgentConfig {
  agent_name: string
  enabled: boolean
  goal: string
  settings: Record<string, unknown>
  schedule_cron: string
  schedule_label: string
  last_run_at: string | null
  last_status: string | null
  last_message: string | null
}

export default function AgentSetupPage({ params }: { params: { agent_name: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [suggestingGoal, setSuggestingGoal] = useState(false)
  const [config, setConfig] = useState<AgentConfig | null>(null)
  const [runLogs, setRunLogs] = useState<unknown[]>([])

  const agentInfo = AGENT_INFO[params.agent_name]
  const settingsSchema = SETTINGS_SCHEMA[params.agent_name] || []

  useEffect(() => {
    async function loadConfig() {
      try {
        // TODO: fetch from /api/setup/agents/[agent_name]
        setLoading(false)
      } catch (error) {
        toast.error('Failed to load agent configuration')
        console.error(error)
      }
    }
    loadConfig()
  }, [params.agent_name])

  const handleSuggestGoal = async () => {
    setSuggestingGoal(true)
    try {
      const res = await fetch('/api/setup/suggest-goal', {
        method: 'POST',
        body: JSON.stringify({ agent_name: params.agent_name }),
      })
      const data = await res.json()
      if (config) {
        setConfig({ ...config, goal: data.goal })
      }
    } catch (error) {
      toast.error('Failed to suggest goal')
      console.error(error)
    } finally {
      setSuggestingGoal(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // TODO: POST to /api/setup/agents/[agent_name]
      toast.success('Agent configuration saved')
    } catch (error) {
      toast.error('Failed to save configuration')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/setup/agents" className="flex items-center gap-2 text-brand-teal hover:text-brand-teal/80 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to agents
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hero Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-2xl">{agentInfo?.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{agentInfo?.description}</p>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <Label>Status</Label>
                  <Switch checked={config?.enabled || false} />
                </div>

                {config?.last_run_at && (
                  <div className="text-xs text-muted-foreground">
                    <p>Last run: {new Date(config.last_run_at).toLocaleString()}</p>
                    {config.last_status && <Badge variant="outline">{config.last_status}</Badge>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Config Tabs */}
          <Card className="lg:col-span-2">
            <Tabs defaultValue="goal" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
                <TabsTrigger value="goal" className="rounded-none border-b-2 data-[state=active]:border-brand-teal">
                  Goal
                </TabsTrigger>
                <TabsTrigger value="schedule" className="rounded-none border-b-2 data-[state=active]:border-brand-teal">
                  Schedule
                </TabsTrigger>
                <TabsTrigger value="settings" className="rounded-none border-b-2 data-[state=active]:border-brand-teal">
                  Settings
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-none border-b-2 data-[state=active]:border-brand-teal">
                  Run history
                </TabsTrigger>
              </TabsList>

              <TabsContent value="goal" className="space-y-4 p-6">
                <Label>Goal for this agent</Label>
                <Textarea
                  value={config?.goal || ''}
                  onChange={(e) => config && setConfig({ ...config, goal: e.target.value })}
                  placeholder="What should this agent focus on?"
                  className="min-h-24"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestGoal}
                  disabled={suggestingGoal}
                >
                  {suggestingGoal ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Suggesting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Suggest with AI
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4 p-6">
                <Label>Schedule preset</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily_6am">Daily at 6am</SelectItem>
                    <SelectItem value="daily_9am">Daily at 9am</SelectItem>
                    <SelectItem value="daily_12pm">Daily at 12pm</SelectItem>
                    <SelectItem value="weekly_mon">Weekly Monday 9am</SelectItem>
                  </SelectContent>
                </Select>
                <Label className="mt-4">Cron schedule</Label>
                <Input
                  value={config?.schedule_cron || ''}
                  onChange={(e) => config && setConfig({ ...config, schedule_cron: e.target.value })}
                  placeholder="0 6 * * *"
                />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4 p-6">
                {settingsSchema.map((setting) => (
                  <div key={setting.key} className="space-y-2">
                    <Label>{setting.label}</Label>
                    {setting.type === 'select' && (
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${setting.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {setting.options?.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {setting.type === 'boolean' && <Switch />}
                    {setting.type === 'number' && <Input type="number" />}
                    {setting.type === 'string' && <Input />}
                    {setting.help && <p className="text-xs text-muted-foreground">{setting.help}</p>}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="history" className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runLogs.length > 0 ? (
                      runLogs.map((log: any, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-sm">{new Date(log.created_at).toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={log.level === 'error' ? 'destructive' : 'secondary'}>
                              {log.level}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">{log.message}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No runs yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 p-6 border-t">
              <Button
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-brand-teal hover:bg-brand-teal/90"
              >
                {saving ? 'Saving...' : 'Save configuration'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
