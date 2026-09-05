import { useState } from 'react'
import { Ship, PackageSearch } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Input, Select } from '@/components/ui/Input'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { orders, shipments as initialShipments, type Shipment } from '@/lib/mockData'
import { formatDate } from '@/lib/utils'

const carriers = ['DHL Express', 'FedEx International', 'UPS Worldwide', 'Aramex']

export default function Shipments() {
  const [data, setData] = useState<Shipment[]>(initialShipments)
  const [orderId, setOrderId] = useState(orders[0]?.id ?? '')
  const [tracking, setTracking] = useState('')
  const [carrier, setCarrier] = useState(carriers[0])
  const [eta, setEta] = useState('2026-09-25')

  const createShipment = () => {
    if (!tracking) return
    const newShipment: Shipment = {
      id: `SHP-2026-${9000 + data.length + 1}`,
      orderId,
      tracking,
      carrier,
      customsStatus: 'pending',
      eta,
      status: 'in_transit',
    }
    setData((prev) => [newShipment, ...prev])
    setTracking('')
  }

  const updateCustoms = (id: string, customsStatus: Shipment['customsStatus']) => {
    setData((prev) => prev.map((s) => (s.id === id ? { ...s, customsStatus } : s)))
  }

  const columns: Column<Shipment>[] = [
    { key: 'id', header: 'Shipment #', render: (s) => <span className="font-mono text-xs">{s.id}</span> },
    { key: 'orderId', header: 'Order #', render: (s) => <span className="font-mono text-xs text-text-secondary">{s.orderId}</span> },
    { key: 'tracking', header: 'Tracking #', render: (s) => <span className="font-mono text-xs">{s.tracking}</span> },
    { key: 'carrier', header: 'Carrier' },
    {
      key: 'customsStatus',
      header: 'Customs',
      render: (s) => (
        <Select
          value={s.customsStatus}
          onChange={(e) => updateCustoms(s.id, e.target.value as Shipment['customsStatus'])}
          className="max-w-[130px] py-1.5 text-xs"
        >
          <option value="pending">Pending</option>
          <option value="cleared">Cleared</option>
          <option value="held">Held</option>
        </Select>
      ),
    },
    { key: 'eta', header: 'ETA', render: (s) => formatDate(s.eta) },
    { key: 'status', header: 'Status', render: (s) => <StatusBadge status={s.status} /> },
  ]

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-text">
          <Ship className="h-4.5 w-4.5 text-primary" /> Create Shipment
        </h3>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <FieldLabel>Order</FieldLabel>
            <Select value={orderId} onChange={(e) => setOrderId(e.target.value)}>
              {orders.slice(0, 25).map((o) => (
                <option key={o.id} value={o.id}>{o.id} — {o.customer}</option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel>Tracking Number</FieldLabel>
            <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="1Z999AA10123456784" />
          </div>
          <div>
            <FieldLabel>Carrier</FieldLabel>
            <Select value={carrier} onChange={(e) => setCarrier(e.target.value)}>
              {carriers.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <FieldLabel>Estimated Delivery</FieldLabel>
            <Input type="date" value={eta} onChange={(e) => setEta(e.target.value)} />
          </div>
        </div>
        <Button onClick={createShipment} className="mt-6">
          <PackageSearch className="h-4 w-4" /> Create Shipment
        </Button>
      </Card>

      <div>
        <h3 className="mb-4 font-display text-base font-bold text-text">All Shipments</h3>
        <DataTable columns={columns} data={data} rowKey={(s) => s.id} pageSize={8} />
      </div>
    </div>
  )
}
