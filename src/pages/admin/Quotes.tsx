import { useMemo, useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Input, Select, Textarea } from '@/components/ui/Input'
import { DataTable, type Column } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/StatusBadge'
import { requests, quotes as initialQuotes, type Quote } from '@/lib/mockData'
import { formatDate } from '@/lib/utils'

const tierFees: Record<string, number> = { Standard: 12, Business: 9, Enterprise: 6 }

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>(initialQuotes)
  const [linkedRequestId, setLinkedRequestId] = useState(requests[0].id)
  const [tier, setTier] = useState('Standard')
  const [productCost, setProductCost] = useState('1200')
  const [shipping, setShipping] = useState('180')
  const [customs, setCustoms] = useState('90')
  const [validUntil, setValidUntil] = useState('2026-09-20')
  const [customerNotes, setCustomerNotes] = useState('')
  const [sentFlash, setSentFlash] = useState(false)

  const linkedRequest = requests.find((r) => r.id === linkedRequestId)!
  const serviceFeePct = tierFees[tier]
  const fee = Math.round(Number(productCost || 0) * (serviceFeePct / 100))
  const subtotal = Number(productCost || 0) + Number(shipping || 0) + Number(customs || 0)
  const total = subtotal + fee

  const sendQuote = () => {
    const newQuote: Quote = {
      id: `QT-2026-${5100 + quotes.length + 1}`,
      requestId: linkedRequestId,
      customer: linkedRequest.customer,
      productCost: Number(productCost || 0),
      serviceFeePct,
      shipping: Number(shipping || 0),
      customs: Number(customs || 0),
      total,
      validUntil,
      status: 'sent',
    }
    setQuotes((prev) => [newQuote, ...prev])
    setSentFlash(true)
    setTimeout(() => setSentFlash(false), 3000)
  }

  const columns: Column<Quote>[] = [
    { key: 'id', header: 'Quote #', render: (q) => <span className="font-mono text-xs">{q.id}</span>, sortValue: (q) => q.id },
    { key: 'requestId', header: 'Request #', render: (q) => <span className="font-mono text-xs text-text-secondary">{q.requestId}</span> },
    { key: 'customer', header: 'Customer' },
    { key: 'total', header: 'Total', render: (q) => `$${q.total.toLocaleString()}`, sortValue: (q) => q.total },
    { key: 'validUntil', header: 'Valid Until', render: (q) => formatDate(q.validUntil) },
    { key: 'status', header: 'Status', render: (q) => <StatusBadge status={q.status} /> },
  ]

  const sorted = useMemo(() => quotes, [quotes])

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h3 className="font-display text-base font-bold text-text">Create Quote</h3>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel>Linked Request</FieldLabel>
                <Select value={linkedRequestId} onChange={(e) => setLinkedRequestId(e.target.value)}>
                  {requests.slice(0, 20).map((r) => (
                    <option key={r.id} value={r.id}>{r.id} — {r.customer}</option>
                  ))}
                </Select>
              </div>
              <div>
                <FieldLabel>Pricing Tier</FieldLabel>
                <Select value={tier} onChange={(e) => setTier(e.target.value)}>
                  <option>Standard</option>
                  <option>Business</option>
                  <option>Enterprise</option>
                </Select>
              </div>
              <div>
                <FieldLabel>Product Cost (USD)</FieldLabel>
                <Input type="number" value={productCost} onChange={(e) => setProductCost(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Service Fee % (auto)</FieldLabel>
                <Input readOnly value={`${serviceFeePct}%`} className="bg-surface/50 text-text-secondary" />
              </div>
              <div>
                <FieldLabel>Shipping Cost Estimate</FieldLabel>
                <Input type="number" value={shipping} onChange={(e) => setShipping(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Customs Estimate</FieldLabel>
                <Input type="number" value={customs} onChange={(e) => setCustoms(e.target.value)} />
              </div>
              <div>
                <FieldLabel>Valid Until</FieldLabel>
                <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
            </div>
            <div>
              <FieldLabel>Notes to Customer</FieldLabel>
              <Textarea value={customerNotes} onChange={(e) => setCustomerNotes(e.target.value)} placeholder="Add any notes visible to the customer..." />
            </div>
          </div>

          <div>
            <Card className="sticky top-6 space-y-3 border-primary/30 bg-primary-glow p-5">
              <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Quote Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text-secondary">Product Cost</span><span className="font-mono text-text">${Number(productCost || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Service Fee ({serviceFeePct}%)</span><span className="font-mono text-text">${fee.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Shipping</span><span className="font-mono text-text">${Number(shipping || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-text-secondary">Customs</span><span className="font-mono text-text">${Number(customs || 0).toLocaleString()}</span></div>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
                <span className="text-text">Total</span>
                <span className="font-mono text-text">${total.toLocaleString()}</span>
              </div>
              <Button onClick={sendQuote} className="w-full justify-center">
                <Send className="h-4 w-4" /> Send Quote to Customer
              </Button>
              {sentFlash && (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-xs text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Quote sent to {linkedRequest.customer}
                </div>
              )}
            </Card>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="mb-4 font-display text-base font-bold text-text">All Quotes</h3>
        <DataTable columns={columns} data={sorted} rowKey={(q) => q.id} pageSize={8} />
      </div>
    </div>
  )
}
