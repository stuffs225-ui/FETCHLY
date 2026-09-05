import { useNavigate } from 'react-router-dom'
import { ClipboardList, Package, DollarSign, MessageSquareText, Ship, PackageCheck, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { KpiCard } from '@/components/admin/KpiCard'
import { DonutChart } from '@/components/ui/DonutChart'
import { BarChart } from '@/components/ui/BarChart'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { requests, orders, quotes, shipments, type ProcurementRequest } from '@/lib/mockData'
import { formatDate } from '@/lib/utils'

const statusCounts = requests.reduce<Record<string, number>>((acc, r) => {
  acc[r.status] = (acc[r.status] ?? 0) + 1
  return acc
}, {})

const donutData = [
  { label: 'Submitted', value: statusCounts.submitted ?? 0, color: '#4F6EF7' },
  { label: 'Quoted', value: statusCounts.quoted ?? 0, color: '#F5A623' },
  { label: 'In Transit', value: statusCounts.in_transit ?? 0, color: '#a78bfa' },
  { label: 'Delivered', value: statusCounts.delivered ?? 0, color: '#22C55E' },
  { label: 'Other', value: (statusCounts.paid ?? 0) + (statusCounts.purchased ?? 0) + (statusCounts.customs ?? 0) + (statusCounts.cancelled ?? 0), color: '#8888A8' },
]

const revenueByMonth = [
  { label: 'Apr', value: 42000 },
  { label: 'May', value: 58000 },
  { label: 'Jun', value: 51000 },
  { label: 'Jul', value: 67000 },
  { label: 'Aug', value: 74000 },
  { label: 'Sep', value: 61000 },
]

const revenueMTD = orders.reduce((s, o) => s + o.total, 0)
const inTransitCount = requests.filter((r) => r.status === 'in_transit').length
const deliveredThisMonth = requests.filter((r) => r.status === 'delivered').length
const pendingQuotes = quotes.filter((q) => q.status === 'sent').length

const columns: Column<ProcurementRequest>[] = [
  { key: 'id', header: 'Request #', render: (r) => <span className="font-mono text-xs">{r.id}</span> },
  { key: 'customer', header: 'Customer' },
  { key: 'product', header: 'Product', className: 'max-w-[220px] truncate' },
  { key: 'source', header: 'Source', render: (r) => (r.source === 'USA' ? '🇺🇸 USA' : '🇬🇧 UK') },
  { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} /> },
  { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const recent = [...requests].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 10)
  const expiringQuotes = quotes.filter((q) => q.status === 'sent').length
  const heldCustoms = shipments.filter((s) => s.customsStatus === 'held').length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="Total Requests" value={requests.length.toString()} icon={ClipboardList} trend="+12%" accent="primary" />
        <KpiCard label="Active Orders" value={orders.filter((o) => o.status !== 'delivered').length.toString()} icon={Package} trend="+8%" accent="primary" />
        <KpiCard label="Revenue MTD" value={`$${(revenueMTD / 1000).toFixed(0)}k`} icon={DollarSign} trend="+21%" accent="gold" />
        <KpiCard label="Pending Quotes" value={pendingQuotes.toString()} icon={MessageSquareText} trend="-3%" trendUp={false} accent="primary" />
        <KpiCard label="In Transit" value={inTransitCount.toString()} icon={Ship} accent="primary" />
        <KpiCard label="Delivered This Month" value={deliveredThisMonth.toString()} icon={PackageCheck} trend="+15%" accent="success" />
      </div>

      {(expiringQuotes > 0 || heldCustoms > 0) && (
        <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 border-gold/30 bg-gold/5 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-gold">
            <AlertTriangle className="h-4 w-4" /> Alerts
          </div>
          {expiringQuotes > 0 && (
            <button onClick={() => navigate('/admin/quotes')} className="text-sm text-text-secondary hover:text-text hover:underline">
              ⚠️ {expiringQuotes} quotes expiring in 24h
            </button>
          )}
          {heldCustoms > 0 && (
            <button onClick={() => navigate('/admin/shipments')} className="text-sm text-text-secondary hover:text-text hover:underline">
              ⚠️ {heldCustoms} shipments held at customs
            </button>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-display text-base font-bold text-text">Requests by Status</h3>
          <div className="mt-6 flex justify-center">
            <DonutChart data={donutData} />
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-display text-base font-bold text-text">Revenue by Month</h3>
          <div className="mt-6">
            <BarChart data={revenueByMonth} />
          </div>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-text">Recent Requests</h3>
          <button onClick={() => navigate('/admin/requests')} className="text-sm font-medium text-primary hover:underline">
            View all →
          </button>
        </div>
        <DataTable columns={columns} data={recent} rowKey={(r) => r.id} onRowClick={() => navigate('/admin/requests')} pageSize={10} />
      </div>
    </div>
  )
}
