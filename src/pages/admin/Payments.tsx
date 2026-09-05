import { useState } from 'react'
import { CheckCircle2, PlusCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Input, Select } from '@/components/ui/Input'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { orders, payments as initialPayments, type Payment } from '@/lib/mockData'
import { formatDate } from '@/lib/utils'

const methods: Payment['method'][] = ['Wire Transfer', 'Credit Card', 'PayPal', 'NET30 Invoice']

export default function Payments() {
  const [data, setData] = useState<Payment[]>(initialPayments)
  const [orderId, setOrderId] = useState(orders[0]?.id ?? '')
  const [amount, setAmount] = useState('1000')
  const [method, setMethod] = useState<Payment['method']>('Wire Transfer')

  const pending = data.filter((p) => p.status === 'pending')

  const confirmPayment = (id: string) => {
    setData((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'confirmed' } : p)))
  }

  const addManualPayment = () => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    const newPayment: Payment = {
      id: `PAY-2026-${7000 + data.length + 1}`,
      orderId,
      customer: order.customer,
      amount: Number(amount || 0),
      method,
      status: 'confirmed',
      date: new Date().toISOString().slice(0, 10),
    }
    setData((prev) => [newPayment, ...prev])
  }

  const columns: Column<Payment>[] = [
    { key: 'id', header: 'Payment #', render: (p) => <span className="font-mono text-xs">{p.id}</span> },
    { key: 'orderId', header: 'Order #', render: (p) => <span className="font-mono text-xs text-text-secondary">{p.orderId}</span> },
    { key: 'customer', header: 'Customer' },
    { key: 'amount', header: 'Amount', render: (p) => `$${p.amount.toLocaleString()}`, sortValue: (p) => p.amount },
    { key: 'method', header: 'Method' },
    { key: 'date', header: 'Date', render: (p) => formatDate(p.date), sortValue: (p) => p.date },
    { key: 'status', header: 'Status', render: (p) => <StatusBadge status={p.status} /> },
    {
      key: 'actions',
      header: '',
      render: (p) =>
        p.status === 'pending' ? (
          <Button size="sm" variant="secondary" onClick={() => confirmPayment(p.id)}>
            <CheckCircle2 className="h-3.5 w-3.5" /> Confirm
          </Button>
        ) : null,
    },
  ]

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <Card className="border-gold/30 bg-gold/5 p-4">
          <p className="text-sm font-medium text-gold">⚠️ {pending.length} payments awaiting confirmation</p>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="font-display text-base font-bold text-text">Manual Payment Entry</h3>
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
            <FieldLabel>Amount (USD)</FieldLabel>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <FieldLabel>Method</FieldLabel>
            <Select value={method} onChange={(e) => setMethod(e.target.value as Payment['method'])}>
              {methods.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={addManualPayment} className="w-full justify-center">
              <PlusCircle className="h-4 w-4" /> Add Payment
            </Button>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="mb-4 font-display text-base font-bold text-text">All Payments</h3>
        <DataTable columns={columns} data={data} rowKey={(p) => p.id} pageSize={8} />
      </div>
    </div>
  )
}
