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
  accentColor?: 'teal' | 'gold' | 'navy'
}

export function KpiTile({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  className,
  accentColor = 'teal' 
}: KpiTileProps) {
  const accentClasses = {
    teal: {
      bg: 'bg-brand-teal/10',
      icon: 'text-brand-teal',
      gradient: 'from-brand-teal/20 to-transparent',
    },
    gold: {
      bg: 'bg-brand-gold/10',
      icon: 'text-brand-gold',
      gradient: 'from-brand-gold/20 to-transparent',
    },
    navy: {
      bg: 'bg-brand-navy/10',
      icon: 'text-brand-navy',
      gradient: 'from-brand-navy/20 to-transparent',
    },
  }

  const accent = accentClasses[accentColor]

  return (
    <Card className={cn(
      'relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 card-hover',
      className
    )}>
      {/* Subtle gradient accent */}
      <div className={cn(
        'absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl rounded-full blur-2xl opacity-50',
        accent.gradient
      )} />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              {label}
            </p>
            <p className="text-4xl font-bold text-foreground tracking-tight">
              {value}
            </p>
            {trend && (
              <div className={cn(
                'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold',
                trend.positive 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'bg-slate-100 text-slate-600'
              )}>
                {trend.positive && <span>↑</span>}
                {trend.value}
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center',
              accent.bg
            )}>
              <Icon className={cn('w-6 h-6', accent.icon)} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
