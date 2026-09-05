import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp = true,
  accent = 'primary',
}: {
  label: string
  value: string
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  accent?: 'primary' | 'gold' | 'success'
}) {
  const accentClasses = {
    primary: 'bg-primary-glow text-primary',
    gold: 'bg-gold/10 text-gold',
    success: 'bg-success/10 text-success',
  }[accent]

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', accentClasses)}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className={cn('flex items-center gap-1 text-xs font-semibold', trendUp ? 'text-success' : 'text-danger')}>
            {trendUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 font-mono text-2xl font-bold text-text">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-text-secondary">{label}</p>
    </Card>
  )
}
