import { useState } from 'react'
import { FileText, Paperclip, Building2, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react'
import { Drawer } from '@/components/ui/Drawer'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/StatusBadge'
import { FieldLabel, Select, Textarea, Input } from '@/components/ui/Input'
import { PIPELINE_STAGES, type ProcurementRequest, type RequestStatus } from '@/lib/mockData'
import { formatDate, cn } from '@/lib/utils'

const allStatuses: RequestStatus[] = ['submitted', 'quoted', 'paid', 'purchased', 'in_transit', 'customs', 'delivered', 'cancelled']

const attachments = ['product-photo-1.jpg', 'spec-sheet.pdf', 'reference-link.png']

export function RequestDetailDrawer({
  request,
  onClose,
  onUpdateStatus,
}: {
  request: ProcurementRequest | null
  onClose: () => void
  onUpdateStatus: (id: string, status: RequestStatus) => void
}) {
  const [notes, setNotes] = useState('Customer requested confirmation of authenticity before purchase.')
  const [showQuoteForm, setShowQuoteForm] = useState(false)
  const [quoteSent, setQuoteSent] = useState(false)
  const [productCost, setProductCost] = useState('1200')
  const [shipping, setShipping] = useState('180')
  const [customs, setCustoms] = useState('90')

  if (!request) return null

  const currentIndex = PIPELINE_STAGES.findIndex((s) => s.key === request.status)
  const serviceFeePct = 12
  const fee = Math.round(Number(productCost || 0) * (serviceFeePct / 100))
  const total = Number(productCost || 0) + fee + Number(shipping || 0) + Number(customs || 0)

  return (
    <Drawer open={!!request} onClose={onClose} title={request.id} widthClass="max-w-2xl">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <StatusBadge status={request.status} className="text-sm" />
          <Select
            value={request.status}
            onChange={(e) => onUpdateStatus(request.id, e.target.value as RequestStatus)}
            className="max-w-[220px]"
          >
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                Update to: {s.replace('_', ' ')}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Product</h4>
          <p className="mt-2 text-lg font-semibold text-text">{request.product}</p>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            <div>
              <p className="text-text-secondary">Category</p>
              <p className="mt-0.5 font-medium text-text">{request.category}</p>
            </div>
            <div>
              <p className="text-text-secondary">Source</p>
              <p className="mt-0.5 font-medium text-text">{request.source === 'USA' ? '🇺🇸 USA' : '🇬🇧 UK'}</p>
            </div>
            <div>
              <p className="text-text-secondary">Quantity</p>
              <p className="mt-0.5 font-medium text-text">{request.quantity}</p>
            </div>
            <div>
              <p className="text-text-secondary">Budget</p>
              <p className="mt-0.5 font-medium text-text">{request.budget}</p>
            </div>
            <div>
              <p className="text-text-secondary">Urgency</p>
              <p className="mt-0.5 font-medium text-text">{request.urgency}</p>
            </div>
            <div>
              <p className="text-text-secondary">Submitted</p>
              <p className="mt-0.5 font-medium text-text">{formatDate(request.date)}</p>
            </div>
          </div>
        </div>

        <Card className="p-5">
          <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Customer</h4>
          <p className="mt-2 text-base font-semibold text-text">{request.customer}</p>
          <div className="mt-3 space-y-2 text-sm text-text-secondary">
            {request.company && (
              <p className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> {request.company}</p>
            )}
            <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" /> {request.email}</p>
            <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" /> +971 5X XXX XXXX</p>
            <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {request.country}</p>
          </div>
        </Card>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Attachments</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {attachments.map((a) => (
              <span key={a} className="flex items-center gap-1.5 rounded-lg border border-border-light bg-surface px-3 py-1.5 text-xs text-text-secondary">
                <Paperclip className="h-3 w-3" /> {a}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Activity Log</h4>
          <ol className="space-y-4 border-l-2 border-border pl-5">
            {PIPELINE_STAGES.slice(0, currentIndex + 1).reverse().map((stage) => (
              <li key={stage.key} className="relative">
                <span className="absolute -left-[1.65rem] top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                </span>
                <p className="text-sm font-medium text-text">{stage.label}</p>
                <p className="text-xs text-text-secondary">{formatDate(request.date)} · by {request.agent}</p>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-[0.1em] text-text-secondary">Internal Notes</h4>
            <span className="text-[10px] text-text-secondary">Admin only</span>
          </div>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2" />
        </div>

        <div className="border-t border-border pt-6">
          {!showQuoteForm && !quoteSent && (
            <Button onClick={() => setShowQuoteForm(true)} className="w-full justify-center">
              <FileText className="h-4 w-4" /> Create Quote
            </Button>
          )}

          {showQuoteForm && !quoteSent && (
            <Card className="animate-fade-up space-y-4 p-5">
              <h4 className="font-display text-sm font-bold text-text">New Quote for {request.id}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Product Cost (USD)</FieldLabel>
                  <Input type="number" value={productCost} onChange={(e) => setProductCost(e.target.value)} />
                </div>
                <div>
                  <FieldLabel>Service Fee</FieldLabel>
                  <Input value={`${serviceFeePct}% ($${fee.toLocaleString()})`} readOnly className="bg-surface/50 text-text-secondary" />
                </div>
                <div>
                  <FieldLabel>Shipping Cost</FieldLabel>
                  <Input type="number" value={shipping} onChange={(e) => setShipping(e.target.value)} />
                </div>
                <div>
                  <FieldLabel>Customs Estimate</FieldLabel>
                  <Input type="number" value={customs} onChange={(e) => setCustoms(e.target.value)} />
                </div>
              </div>
              <div className={cn('flex items-center justify-between rounded-lg border border-primary/30 bg-primary-glow px-4 py-3')}>
                <span className="text-sm font-medium text-text-secondary">Total Quote</span>
                <span className="font-mono text-xl font-bold text-text">${total.toLocaleString()}</span>
              </div>
              <Button
                onClick={() => {
                  setQuoteSent(true)
                  onUpdateStatus(request.id, 'quoted')
                }}
                className="w-full justify-center"
              >
                Send Quote to Customer
              </Button>
            </Card>
          )}

          {quoteSent && (
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4" /> Quote sent to {request.customer}.
            </div>
          )}
        </div>
      </div>
    </Drawer>
  )
}
