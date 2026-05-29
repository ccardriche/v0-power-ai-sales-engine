import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface KpiTileProps {
  label: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: string
    positive?: boolean
  }
  className?: string
}

export function KpiTile({ label, value, icon: Icon, trend, className }: KpiTileProps) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-brand-navy">{value}</p>
            {trend && (
              <p className={cn(
                'text-xs font-medium',
                trend.positive ? 'text-brand-teal' : 'text-muted-foreground'
              )}>
                {trend.value}
              </p>
            )}
          </div>
          {Icon && (
            <div className="w-10 h-10 rounded-lg bg-brand-teal/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-brand-teal" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
