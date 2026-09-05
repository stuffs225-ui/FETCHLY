import { cn } from '@/lib/utils'
import type { RequestStatus, QuotationStatus } from '@/lib/types'

type AnyStatus = RequestStatus | QuotationStatus

const config: Record<AnyStatus, { label: string; dot: string; text: string; bg: string }> = {
  new: { label: 'طلب جديد', dot: 'bg-sky-400', text: 'text-sky-300', bg: 'bg-sky-400/10' },
  in_review: { label: 'قيد المراجعة', dot: 'bg-amber-400', text: 'text-amber-300', bg: 'bg-amber-400/10' },
  pricing: { label: 'قيد التسعير', dot: 'bg-gold', text: 'text-gold', bg: 'bg-gold/10' },
  quote_sent: { label: 'تم إرسال عرض السعر', dot: 'bg-navy-light', text: 'text-[#9db3e8]', bg: 'bg-navy-light/20' },
  customer_interested: { label: 'العميل مهتم', dot: 'bg-purple-400', text: 'text-purple-300', bg: 'bg-purple-400/10' },
  approved: { label: 'تمت الموافقة', dot: 'bg-emerald', text: 'text-emerald', bg: 'bg-emerald/10' },
  rejected: { label: 'مرفوض', dot: 'bg-red-400', text: 'text-red-300', bg: 'bg-red-400/10' },
  closed: { label: 'مغلق', dot: 'bg-gray-400', text: 'text-gray-300', bg: 'bg-gray-400/10' },
  draft: { label: 'مسودة', dot: 'bg-gray-400', text: 'text-gray-300', bg: 'bg-gray-400/10' },
  sent: { label: 'مُرسل', dot: 'bg-navy-light', text: 'text-[#9db3e8]', bg: 'bg-navy-light/20' },
  accepted: { label: 'مقبول', dot: 'bg-emerald', text: 'text-emerald', bg: 'bg-emerald/10' },
  expired: { label: 'منتهي', dot: 'bg-red-400', text: 'text-red-300', bg: 'bg-red-400/10' },
}

export function StatusBadge({ status, className }: { status: AnyStatus; className?: string }) {
  const c = config[status] ?? config.new
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium', c.bg, c.text, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', c.dot)} />
      {c.label}
    </span>
  )
}
