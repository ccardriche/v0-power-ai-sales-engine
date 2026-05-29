'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { updateAgentConfiguration } from '@/app/(app)/settings/actions'

interface AgentEditDialogProps {
  agent: {
    agent_name: string
    enabled: boolean
    goal: string
    schedule_cron: string
    schedule_label: string
    settings?: Record<string, unknown>
  }
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: () => void
}

export function AgentEditDialog({ agent, open, onOpenChange, onSave }: AgentEditDialogProps) {
  const [enabled, setEnabled] = useState(agent.enabled)
  const [goal, setGoal] = useState(agent.goal)
  const [scheduleLabel, setScheduleLabel] = useState(agent.schedule_label)
  const [scheduleCron, setScheduleCron] = useState(agent.schedule_cron)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!goal.trim()) {
      toast.error('Please enter a goal for this agent')
      return
    }

    setIsSaving(true)
    try {
      await updateAgentConfiguration(agent.agent_name, {
        enabled,
        goal,
        schedule_cron: scheduleCron,
        schedule_label: scheduleLabel,
      })

      toast.success(`${agent.agent_name} updated successfully`)
      onOpenChange(false)
      onSave?.()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update agent'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Configure {agent.agent_name}</DialogTitle>
          <DialogDescription>
            Update the goal, schedule, and settings for this agent.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Enabled toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-semibold">Enabled</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Turn this agent on or off
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal" className="font-semibold">
              Goal
            </Label>
            <Textarea
              id="goal"
              placeholder="What should this agent accomplish? E.g., 'Source 50 new qualified leads daily'"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              This guides the agent's behavior and is used by Claude for suggestions.
            </p>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label htmlFor="schedule" className="font-semibold">
              Schedule Label
            </Label>
            <Input
              id="schedule"
              placeholder="E.g., Daily at 6am UTC"
              value={scheduleLabel}
              onChange={(e) => setScheduleLabel(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Human-readable label for when this agent runs
            </p>
          </div>

          {/* Cron */}
          <div className="space-y-2">
            <Label htmlFor="cron" className="font-semibold">
              Cron Schedule
            </Label>
            <Input
              id="cron"
              placeholder="E.g., 0 6 * * *"
              value={scheduleCron}
              onChange={(e) => setScheduleCron(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Cron expression. Visit{' '}
              <a
                href="https://crontab.guru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-teal hover:underline"
              >
                crontab.guru
              </a>{' '}
              for help.
            </p>
          </div>

          {/* Save button */}
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-brand-teal hover:bg-brand-teal/90 text-white gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
