import { cn } from '@/lib/utils'
import type { RequestStatus } from '@/lib/mockData'

const config: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  draft: { label: 'Draft', dot: 'bg-gray-400', text: 'text-gray-300', bg: 'bg-gray-400/10' },
  submitted: { label: 'Submitted', dot: 'bg-primary', text: 'text-primary', bg: 'bg-primary/10' },
  quoted: { label: 'Quoted', dot: 'bg-amber-400', text: 'text-amber-300', bg: 'bg-amber-400/10' },
  paid: { label: 'Paid', dot: 'bg-success', text: 'text-success', bg: 'bg-success/10' },
  purchased: { label: 'Purchased', dot: 'bg-cyan-400', text: 'text-cyan-300', bg: 'bg-cyan-400/10' },
  in_transit: { label: 'In Transit', dot: 'bg-purple-400', text: 'text-purple-300', bg: 'bg-purple-400/10' },
  customs: { label: 'Customs', dot: 'bg-orange-400', text: 'text-orange-300', bg: 'bg-orange-400/10' },
  delivered: { label: 'Delivered', dot: 'bg-emerald-400', text: 'text-emerald-300', bg: 'bg-emerald-400/10' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-400', text: 'text-red-300', bg: 'bg-red-400/10' },
  pending: { label: 'Pending', dot: 'bg-amber-400', text: 'text-amber-300', bg: 'bg-amber-400/10' },
  confirmed: { label: 'Confirmed', dot: 'bg-success', text: 'text-success', bg: 'bg-success/10' },
  cleared: { label: 'Cleared', dot: 'bg-success', text: 'text-success', bg: 'bg-success/10' },
  held: { label: 'Held', dot: 'bg-red-400', text: 'text-red-300', bg: 'bg-red-400/10' },
  sent: { label: 'Sent', dot: 'bg-primary', text: 'text-primary', bg: 'bg-primary/10' },
  accepted: { label: 'Accepted', dot: 'bg-success', text: 'text-success', bg: 'bg-success/10' },
  expired: { label: 'Expired', dot: 'bg-red-400', text: 'text-red-300', bg: 'bg-red-400/10' },
  partial: { label: 'Partial', dot: 'bg-amber-400', text: 'text-amber-300', bg: 'bg-amber-400/10' },
}

export function StatusBadge({ status, className }: { status: RequestStatus | string; className?: string }) {
  const c = config[status] ?? config.draft
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        c.bg,
        c.text,
        className,
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  )
}
