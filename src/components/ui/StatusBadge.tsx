import { cn } from '@/lib/utils'
import type { RequestStatus, QuotationStatus } from '@/lib/types'

type AnyStatus = RequestStatus | QuotationStatus

const config: Record<AnyStatus, { label: string; dot: string; text: string; bg: string }> = {
  new: { label: 'طلب جديد', dot: 'bg-sky-500', text: 'text-sky-700', bg: 'bg-sky-50' },
  in_review: { label: 'قيد المراجعة', dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
  pricing: { label: 'قيد التسعير', dot: 'bg-primary', text: 'text-primary', bg: 'bg-primary/10' },
  quote_sent: { label: 'تم إرسال عرض السعر', dot: 'bg-navy', text: 'text-navy', bg: 'bg-navy/10' },
  customer_interested: { label: 'العميل مهتم', dot: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50' },
  approved: { label: 'تمت الموافقة', dot: 'bg-emerald', text: 'text-emerald', bg: 'bg-emerald/10' },
  rejected: { label: 'مرفوض', dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
  closed: { label: 'مغلق', dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-100' },
  draft: { label: 'مسودة', dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-100' },
  sent: { label: 'مُرسل', dot: 'bg-navy', text: 'text-navy', bg: 'bg-navy/10' },
  accepted: { label: 'مقبول', dot: 'bg-emerald', text: 'text-emerald', bg: 'bg-emerald/10' },
  expired: { label: 'منتهي', dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
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
