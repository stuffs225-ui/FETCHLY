import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export function KpiCard({ label, value, icon: Icon, accent = 'gold' }: { label: string; value: string; icon: LucideIcon; accent?: 'gold' | 'emerald' | 'navy' }) {
  const accentClasses = { gold: 'bg-gold/10 text-gold', emerald: 'bg-emerald/10 text-emerald', navy: 'bg-navy-light/20 text-[#9db3e8]' }[accent]
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
