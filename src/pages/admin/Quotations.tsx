import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { quotationsRepo } from '@/lib/repo'
import { formatDate, formatMoney } from '@/lib/utils'
import type { Quotation } from '@/lib/types'

export default function Quotations() {
  const navigate = useNavigate()
  const { data } = quotationsRepo.useList()

  const total = (q: Quotation) => {
    const subtotal = q.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0)
    return q.vatEnabled ? subtotal * (1 + q.vatRate / 100) : subtotal
  }

  const columns: Column<Quotation>[] = [
    { key: 'quotationNumber', header: 'رقم العرض', render: (q) => <span className="font-mono text-xs">{q.quotationNumber}</span>, sortValue: (q) => q.quotationNumber },
    { key: 'customerName', header: 'العميل' },
    { key: 'total', header: 'الإجمالي', render: (q) => formatMoney(total(q), q.currency, 'ar'), sortValue: (q) => total(q) },
    { key: 'validUntilDate', header: 'صالح حتى', render: (q) => formatDate(q.validUntilDate), sortValue: (q) => q.validUntilDate },
    { key: 'status', header: 'الحالة', render: (q) => <StatusBadge status={q.status} />, sortValue: (q) => q.status },
    { key: 'createdAt', header: 'التاريخ', render: (q) => formatDate(q.createdAt), sortValue: (q) => q.createdAt },
  ]

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button onClick={() => navigate('/admin/quotations/new')}>
          <Plus className="h-4 w-4" /> عرض سعر جديد
        </Button>
      </div>
      <DataTable columns={columns} data={data} rowKey={(q) => q.id} onRowClick={(q) => navigate(`/admin/quotations/${q.id}`)} pageSize={10} emptyLabel="لا توجد عروض أسعار بعد" />
    </div>
  )
}
