import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Input'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { Drawer } from '@/components/ui/Drawer'
import { orders as initialOrders, shipments, type Order, type RequestStatus } from '@/lib/mockData'
import { formatDate } from '@/lib/utils'

const statusOptions: RequestStatus[] = ['paid', 'purchased', 'in_transit', 'customs', 'delivered', 'cancelled']

export default function Orders() {
  const [data, setData] = useState<Order[]>(initialOrders)
  const [active, setActive] = useState<Order | null>(null)

  const updateStatus = (id: string, status: RequestStatus) => {
    setData((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    setActive((prev) => (prev && prev.id === id ? { ...prev, status } : prev))
  }

  const columns: Column<Order>[] = [
    { key: 'id', header: 'Order #', render: (o) => <span className="font-mono text-xs">{o.id}</span>, sortValue: (o) => o.id },
    { key: 'requestId', header: 'Request #', render: (o) => <span className="font-mono text-xs text-text-secondary">{o.requestId}</span> },
    { key: 'customer', header: 'Customer' },
    { key: 'product', header: 'Product', className: 'max-w-[220px] truncate' },
    { key: 'total', header: 'Total', render: (o) => `$${o.total.toLocaleString()}`, sortValue: (o) => o.total },
    { key: 'paymentStatus', header: 'Payment', render: (o) => <StatusBadge status={o.paymentStatus} /> },
    { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} />, sortValue: (o) => o.status },
    { key: 'date', header: 'Date', render: (o) => formatDate(o.date), sortValue: (o) => o.date },
  ]

  const linkedShipment = active ? shipments.find((s) => s.orderId === active.id) : undefined

  return (
    <div className="space-y-5">
      <DataTable columns={columns} data={data} rowKey={(o) => o.id} onRowClick={setActive} pageSize={10} />

      <Drawer open={!!active} onClose={() => setActive(null)} title={active?.id ?? ''}>
        {active && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <StatusBadge status={active.status} className="text-sm" />
              <Select value={active.status} onChange={(e) => updateStatus(active.id, e.target.value as RequestStatus)} className="max-w-[200px]">
                {statusOptions.map((s) => (
                  <option key={s} value={s}>Update to: {s.replace('_', ' ')}</option>
                ))}
              </Select>
            </div>

            <Card className="space-y-3 p-5 text-sm">
              <div className="flex justify-between"><span className="text-text-secondary">Customer</span><span className="font-medium text-text">{active.customer}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Product</span><span className="font-medium text-text">{active.product}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Linked Request</span><span className="font-mono text-text">{active.requestId}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Order Total</span><span className="font-mono font-bold text-text">${active.total.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-text-secondary">Payment Status</span><StatusBadge status={active.paymentStatus} /></div>
              <div className="flex justify-between"><span className="text-text-secondary">Order Date</span><span className="text-text">{formatDate(active.date)}</span></div>
            </Card>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Shipment</h4>
              {linkedShipment ? (
                <Card className="space-y-2 p-4 text-sm">
                  <div className="flex justify-between"><span className="text-text-secondary">Tracking #</span><span className="font-mono text-text">{linkedShipment.tracking}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Carrier</span><span className="text-text">{linkedShipment.carrier}</span></div>
                  <div className="flex justify-between"><span className="text-text-secondary">Customs</span><StatusBadge status={linkedShipment.customsStatus} /></div>
                  <div className="flex justify-between"><span className="text-text-secondary">ETA</span><span className="text-text">{formatDate(linkedShipment.eta)}</span></div>
                </Card>
              ) : (
                <p className="text-sm text-text-secondary">No shipment created yet.</p>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
