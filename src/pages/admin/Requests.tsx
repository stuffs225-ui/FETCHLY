import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Input'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { requestsRepo } from '@/lib/repo'
import { formatDate } from '@/lib/utils'
import { REQUEST_STATUSES } from '@/lib/types'
import type { SourcingRequest } from '@/lib/types'
import { RequestDetailDrawer } from './requests/RequestDetailDrawer'

export default function Requests() {
  const { data, refetch } = requestsRepo.useList()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const active = data.find((r) => r.id === activeId) ?? null

  const filtered = useMemo(() => {
    return data.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (dateFrom && r.createdAt < dateFrom) return false
      if (dateTo && r.createdAt > `${dateTo}T23:59:59`) return false
      if (search && !`${r.requestNumber} ${r.name} ${r.company ?? ''} ${r.productName} ${r.email}`.toLowerCase().includes(search.toLowerCase())) return false
      return true
    })
  }, [data, search, statusFilter, dateFrom, dateTo])

  const columns: Column<SourcingRequest>[] = [
    { key: 'requestNumber', header: 'رقم الطلب', render: (r) => <span className="font-mono text-xs">{r.requestNumber}</span>, sortValue: (r) => r.requestNumber },
    { key: 'name', header: 'العميل', sortValue: (r) => r.name },
    { key: 'company', header: 'الشركة', render: (r) => r.company ?? '—' },
    { key: 'productName', header: 'المنتج', className: 'max-w-[200px] truncate' },
    { key: 'quantity', header: 'الكمية' },
    { key: 'email', header: 'البريد الإلكتروني', className: 'max-w-[160px] truncate' },
    { key: 'phone', header: 'الجوال' },
    { key: 'deliveryCity', header: 'مدينة التسليم', render: (r) => r.deliveryCity ?? '—' },
    { key: 'status', header: 'الحالة', render: (r) => <StatusBadge status={r.status} />, sortValue: (r) => r.status },
    { key: 'createdAt', header: 'التاريخ', render: (r) => formatDate(r.createdAt), sortValue: (r) => r.createdAt },
  ]

  return (
    <div className="space-y-5">
      <Card className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث برقم الطلب، الاسم، أو المنتج..." className="ps-9" />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-w-[170px]">
            <option value="all">كل الحالات</option>
            {REQUEST_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="max-w-[150px]" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="max-w-[150px]" />
        </div>
      </Card>

      <DataTable columns={columns} data={filtered} rowKey={(r) => r.id} onRowClick={(r) => setActiveId(r.id)} pageSize={10} emptyLabel="لا توجد طلبات مطابقة" />

      <RequestDetailDrawer request={active} onClose={() => setActiveId(null)} onUpdate={refetch} />
    </div>
  )
}
