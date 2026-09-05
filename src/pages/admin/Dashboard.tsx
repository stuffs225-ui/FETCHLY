import { useNavigate } from 'react-router-dom'
import { Inbox, Search, Tags, MailCheck, ThumbsUp, ThumbsDown, Archive, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/admin/KpiCard'
import { DonutChart } from '@/components/ui/DonutChart'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { requestsRepo, quotationsRepo } from '@/lib/repo'
import { formatDate, formatMoney } from '@/lib/utils'
import type { SourcingRequest } from '@/lib/types'

const columns: Column<SourcingRequest>[] = [
  { key: 'requestNumber', header: 'رقم الطلب', render: (r) => <span className="font-mono text-xs">{r.requestNumber}</span> },
  { key: 'name', header: 'العميل' },
  { key: 'productName', header: 'المنتج', className: 'max-w-[200px] truncate' },
  { key: 'phone', header: 'الجوال' },
  { key: 'status', header: 'الحالة', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'createdAt', header: 'التاريخ', render: (r) => formatDate(r.createdAt) },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: requests } = requestsRepo.useList()
  const { data: quotations } = quotationsRepo.useList()

  const count = (status: SourcingRequest['status']) => requests.filter((r) => r.status === status).length

  const now = new Date()
  const thisMonth = requests.filter((r) => {
    const d = new Date(r.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const quotationsThisMonth = quotations.filter((q) => {
    const d = new Date(q.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const totalQuoteValue = (q: (typeof quotations)[number]) => {
    const subtotal = q.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    return q.vatEnabled ? subtotal * (1 + q.vatRate / 100) : subtotal
  }
  const totalQuotationValue = quotations.reduce((s, q) => s + totalQuoteValue(q), 0)
  const acceptedQuotationValue = quotations.filter((q) => q.status === 'accepted').reduce((s, q) => s + totalQuoteValue(q), 0)
  const sentCount = quotations.filter((q) => ['sent', 'accepted', 'rejected'].includes(q.status)).length
  const winRate = sentCount > 0 ? Math.round((quotations.filter((q) => q.status === 'accepted').length / sentCount) * 100) : 0
  const avgQuoteValue = quotations.length > 0 ? totalQuotationValue / quotations.length : 0

  const expiringQuotes = quotations.filter((q) => {
    if (q.status !== 'sent') return false
    const days = (new Date(q.validUntilDate).getTime() - Date.now()) / 86400000
    return days >= 0 && days <= 2
  })

  const recent = [...requests].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)).slice(0, 8)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-7">
        <KpiCard label="طلبات جديدة" value={count('new').toString()} icon={Inbox} />
        <KpiCard label="قيد المراجعة" value={count('in_review').toString()} icon={Search} />
        <KpiCard label="قيد التسعير" value={count('pricing').toString()} icon={Tags} />
        <KpiCard label="تم إرسال العرض" value={count('quote_sent').toString()} icon={MailCheck} accent="navy" />
        <KpiCard label="تمت الموافقة" value={count('approved').toString()} icon={ThumbsUp} accent="emerald" />
        <KpiCard label="مرفوضة" value={count('rejected').toString()} icon={ThumbsDown} />
        <KpiCard label="مغلقة" value={count('closed').toString()} icon={Archive} />
      </div>

      {expiringQuotes.length > 0 && (
        <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <AlertTriangle className="h-4 w-4" /> تنبيهات
          </div>
          <button onClick={() => navigate('/admin/quotations')} className="text-sm text-text-muted hover:text-text hover:underline">
            {expiringQuotes.length} عروض أسعار تنتهي صلاحيتها خلال 48 ساعة
          </button>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-base font-bold text-text">توزيع الطلبات حسب الحالة</h3>
          <div className="mt-6 flex justify-center">
            <DonutChart
              data={[
                { label: 'جديد', value: count('new'), color: '#38bdf8' },
                { label: 'قيد المراجعة', value: count('in_review'), color: '#fbbf24' },
                { label: 'قيد التسعير', value: count('pricing'), color: '#0e4a78' },
                { label: 'تم الإرسال', value: count('quote_sent'), color: '#2b3f68' },
                { label: 'موافقة', value: count('approved'), color: '#1e9e6b' },
                { label: 'أخرى', value: count('customer_interested') + count('rejected') + count('closed'), color: '#5b6270' },
              ]}
            />
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5">
            <p className="text-xs text-text-muted">طلبات هذا الشهر</p>
            <p className="mt-2 font-mono text-2xl font-bold text-text">{thisMonth.length}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-text-muted">عروض هذا الشهر</p>
            <p className="mt-2 font-mono text-2xl font-bold text-text">{quotationsThisMonth.length}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-text-muted">إجمالي قيمة العروض</p>
            <p className="mt-2 font-mono text-xl font-bold text-text">{formatMoney(totalQuotationValue, 'SAR', 'ar')}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-text-muted">قيمة العروض المقبولة</p>
            <p className="mt-2 font-mono text-xl font-bold text-emerald">{formatMoney(acceptedQuotationValue, 'SAR', 'ar')}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-text-muted">معدل الفوز</p>
            <p className="mt-2 font-mono text-2xl font-bold text-text">{winRate}%</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-text-muted">متوسط قيمة العرض</p>
            <p className="mt-2 font-mono text-xl font-bold text-text">{formatMoney(avgQuoteValue, 'SAR', 'ar')}</p>
          </Card>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-bold text-text">أحدث الطلبات</h3>
          <button onClick={() => navigate('/admin/requests')} className="text-sm font-medium text-primary hover:underline">
            عرض الكل ←
          </button>
        </div>
        <DataTable columns={columns} data={recent} rowKey={(r) => r.id} onRowClick={() => navigate('/admin/requests')} pageSize={8} />
      </div>
    </div>
  )
}
