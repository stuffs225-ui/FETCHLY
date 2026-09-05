import { useState } from 'react'
import { Building2, Mail, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { Drawer } from '@/components/ui/Drawer'
import { customers, requests, orders, payments, type Customer } from '@/lib/mockData'
import { formatDate } from '@/lib/utils'

export default function Customers() {
  const [active, setActive] = useState<Customer | null>(null)

  const columns: Column<Customer>[] = [
    { key: 'name', header: 'Name', sortValue: (c) => c.name },
    { key: 'email', header: 'Email' },
    { key: 'type', header: 'Type', render: (c) => <Badge>{c.type}</Badge> },
    { key: 'country', header: 'Country' },
    { key: 'requestsCount', header: 'Requests', sortValue: (c) => c.requestsCount },
    { key: 'ordersCount', header: 'Orders', sortValue: (c) => c.ordersCount },
    { key: 'totalSpend', header: 'Total Spend', render: (c) => `$${c.totalSpend.toLocaleString()}`, sortValue: (c) => c.totalSpend },
  ]

  const customerRequests = active ? requests.filter((r) => r.customer === active.name) : []
  const customerOrders = active ? orders.filter((o) => o.customer === active.name) : []
  const customerPayments = active ? payments.filter((p) => p.customer === active.name) : []

  return (
    <div className="space-y-5">
      <DataTable columns={columns} data={customers} rowKey={(c) => c.id} onRowClick={setActive} pageSize={10} />

      <Drawer open={!!active} onClose={() => setActive(null)} title={active?.name ?? ''} widthClass="max-w-2xl">
        {active && (
          <div className="space-y-6">
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold font-display text-base font-bold text-white">
                  {active.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="font-semibold text-text">{active.name}</p>
                  <Badge>{active.type}</Badge>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-text-secondary">
                <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {active.email}</p>
                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {active.country}</p>
                <p className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> Customer since {formatDate(active.joined)}</p>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                <div>
                  <p className="font-mono text-lg font-bold text-text">{active.requestsCount}</p>
                  <p className="text-[11px] text-text-secondary">Requests</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-bold text-text">{active.ordersCount}</p>
                  <p className="text-[11px] text-text-secondary">Orders</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-bold text-text">${active.totalSpend.toLocaleString()}</p>
                  <p className="text-[11px] text-text-secondary">Total Spend</p>
                </div>
              </div>
            </Card>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Requests</h4>
              <div className="space-y-2">
                {customerRequests.length === 0 && <p className="text-sm text-text-secondary">No requests yet.</p>}
                {customerRequests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm">
                    <div>
                      <p className="font-mono text-xs text-text-secondary">{r.id}</p>
                      <p className="text-text">{r.product}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Orders</h4>
              <div className="space-y-2">
                {customerOrders.length === 0 && <p className="text-sm text-text-secondary">No orders yet.</p>}
                {customerOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm">
                    <div>
                      <p className="font-mono text-xs text-text-secondary">{o.id}</p>
                      <p className="text-text">{o.product}</p>
                    </div>
                    <span className="font-mono text-text">${o.total.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Payments</h4>
              <div className="space-y-2">
                {customerPayments.length === 0 && <p className="text-sm text-text-secondary">No payments yet.</p>}
                {customerPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm">
                    <div>
                      <p className="font-mono text-xs text-text-secondary">{p.id}</p>
                      <p className="text-text">{p.method}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-text">${p.amount.toLocaleString()}</span>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
