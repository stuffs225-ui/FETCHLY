import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export function KpiCard({ label, value, icon: Icon, accent = 'primary' }: { label: string; value: string; icon: LucideIcon; accent?: 'primary' | 'emerald' | 'navy' }) {
  const accentClasses = { primary: 'bg-primary/10 text-primary', emerald: 'bg-emerald/10 text-emerald', navy: 'bg-navy/10 text-navy' }[accent]
  return (
    <Card className="p-5">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', accentClasses)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-4 font-mono text-2xl font-bold text-text">{value}</p>
      <p className="mt-1 text-xs font-medium text-text-muted">{label}</p>
    </Card>
  )
}
