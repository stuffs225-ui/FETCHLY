import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Plus, Trash2, Eye, Download, Send, Copy, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FieldLabel, Input, Select, Textarea } from '@/components/ui/Input'
import { StatusBadge } from '@/components/ui/StatusBadge'
import {
  quotationsRepo, requestsRepo, savedProductsRepo, savedTermsRepo,
  getCompanySettings, quotationsForRequest, sendQuotation, reviseQuotation,
  getQuotationEmailPreview, quotationPdfUrl,
} from '@/lib/repo'
import { useAsyncData } from '@/lib/useAsync'
import { uid, formatDate, formatMoney } from '@/lib/utils'
import type { Quotation, QuotationItem, SourcingRequest, CompanySettings } from '@/lib/types'

function addDays(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function blankQuotationPayload(request: SourcingRequest | null, company: CompanySettings): Partial<Quotation> {
  return {
    requestId: request?.id ?? '',
    validUntilDays: 15,
    validUntilDate: addDays(15),
    currency: company.defaultCurrency,
    language: 'ar',
    customerName: request?.name ?? '',
    customerCompany: request?.company,
    customerEmail: request?.email ?? '',
    customerPhone: request?.phone ?? '',
    customerCity: request?.city ?? '',
    items: request
      ? [{ id: uid('item'), name: request.productName, description: request.description ?? '', quantity: request.quantity, unitPrice: 0 }]
      : [{ id: uid('item'), name: '', description: '', quantity: 1, unitPrice: 0 }],
    vatEnabled: true,
    vatRate: company.defaultVatRate,
    leadTime: '',
    paymentTerms: '',
    deliveryLocation: '',
    warranty: '',
    notes: '',
    termsAndConditions: '',
  }
}

function downloadUrl(url: string, fileName: string) {
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export default function QuotationEditor() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const requestId = searchParams.get('requestId')
  const isNew = id === 'new' || !id

  const { data: company } = useAsyncData(getCompanySettings, [])
  const { data: savedProducts, refetch: refetchSavedProducts } = savedProductsRepo.useList()
  const { data: savedTerms } = savedTermsRepo.useList()

  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [request, setRequest] = useState<SourcingRequest | null>(null)
  const [revisions, setRevisions] = useState<Quotation[]>([])
  const [saved, setSaved] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendPanel, setSendPanel] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')

  // Load an existing quotation.
  useEffect(() => {
    if (isNew || !id) return
    let cancelled = false
    quotationsRepo.get(id).then(async (existing) => {
      if (cancelled) return
      setQuotation(existing)
      if (existing.requestId) {
        const [req, related] = await Promise.all([
          requestsRepo.get(existing.requestId).catch(() => null),
          quotationsForRequest(existing.requestId).catch(() => []),
        ])
        if (cancelled) return
        setRequest(req)
        setRevisions(related.filter((q) => q.baseNumber === existing.baseNumber).sort((a, b) => a.revision - b.revision))
      }
    })
    return () => {
      cancelled = true
    }
  }, [isNew, id])

  // Create a brand-new draft on the server as soon as we land on /new, so it gets a real
  // quotation number immediately instead of faking one client-side.
  useEffect(() => {
    if (!isNew || !company || quotation) return
    let cancelled = false
    ;(async () => {
      const req = requestId ? await requestsRepo.get(requestId).catch(() => null) : null
      if (cancelled) return
      setRequest(req)
      const created = await quotationsRepo.create(blankQuotationPayload(req, company))
      if (cancelled) return
      setQuotation(created)
      navigate(`/admin/quotations/${created.id}`, { replace: true })
    })()
    return () => {
      cancelled = true
    }
  }, [isNew, company, quotation, requestId, navigate])

  useEffect(() => {
    if (quotation) document.title = `${quotation.quotationNumber} — عرض سعر`
  }, [quotation])

  const subtotal = useMemo(() => quotation?.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0) ?? 0, [quotation])
  const vat = quotation?.vatEnabled ? subtotal * (quotation.vatRate / 100) : 0
  const grandTotal = subtotal + vat

  if (!quotation) {
    return <p className="text-sm text-text-muted">جارٍ التحميل...</p>
  }

  const update = <K extends keyof Quotation>(key: K, value: Quotation[K]) => setQuotation((q) => q && { ...q, [key]: value })

  const updateItem = (itemId: string, patch: Partial<QuotationItem>) => {
    setQuotation((q) => q && { ...q, items: q.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) })
  }
  const addItem = () => setQuotation((q) => q && { ...q, items: [...q.items, { id: uid('item'), name: '', description: '', quantity: 1, unitPrice: 0 }] })
  const removeItem = (itemId: string) => setQuotation((q) => q && { ...q, items: q.items.filter((i) => i.id !== itemId) })

  const applySavedProduct = (itemId: string, name: string) => {
    const match = savedProducts.find((p) => p.name === name)
    if (match) {
      updateItem(itemId, { name: match.name, description: match.description ?? '', unitPrice: match.lastPrice })
    } else {
      updateItem(itemId, { name })
    }
  }

  const setValidUntil = (days: 7 | 15 | 30 | 'custom') => {
    if (days === 'custom') {
      update('validUntilDays', 'custom')
    } else {
      update('validUntilDays', days)
      update('validUntilDate', addDays(days))
    }
  }

  const persist = async (): Promise<Quotation> => {
    const updated = await quotationsRepo.update(quotation.id, quotation)
    setQuotation(updated)
    for (const item of updated.items) {
      if (!item.name.trim()) continue
      const existing = savedProducts.find((p) => p.name === item.name)
      if (existing) {
        await savedProductsRepo.update(existing.id, { ...existing, description: item.description, lastPrice: item.unitPrice, currency: updated.currency, lastQuotedAt: new Date().toISOString() })
      } else {
        await savedProductsRepo.create({ name: item.name, description: item.description, lastPrice: item.unitPrice, currency: updated.currency, lastQuotedAt: new Date().toISOString() })
      }
    }
    refetchSavedProducts()
    return updated
  }

  const handleSaveDraft = async () => {
    await persist()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handlePreview = async () => {
    await persist()
    window.open(quotationPdfUrl(quotation.id), '_blank')
  }

  const handleDownload = async () => {
    await persist()
    downloadUrl(quotationPdfUrl(quotation.id), `${quotation.quotationNumber}.pdf`)
  }

  const openSendPanel = async () => {
    await persist()
    const rendered = await getQuotationEmailPreview(quotation.id)
    setEmailSubject(rendered.subject)
    setEmailBody(rendered.body)
    setSendPanel(true)
  }

  const handleSend = async () => {
    setSending(true)
    try {
      await persist()
      const sent = await sendQuotation(quotation.id, { subject: emailSubject, body: emailBody })
      setQuotation(sent)
      if (request) setRequest({ ...request, status: 'quote_sent' })
      downloadUrl(quotationPdfUrl(quotation.id), `${quotation.quotationNumber}.pdf`)
      setSendPanel(false)
    } finally {
      setSending(false)
    }
  }

  const handleCreateRevision = async () => {
    await persist()
    const revised = await reviseQuotation(quotation.id)
    navigate(`/admin/quotations/${revised.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/quotations')} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-light hover:bg-black/5">
            <ArrowRight className="h-4 w-4 rtl:hidden" />
            <ArrowLeft className="h-4 w-4 ltr:hidden" />
          </button>
          <div>
            <h2 className="font-mono text-lg font-bold text-text">{quotation.quotationNumber}</h2>
            {request && <p className="text-xs text-text-muted">مرتبط بالطلب {request.requestNumber}</p>}
          </div>
          <StatusBadge status={quotation.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handleSaveDraft}>
            {saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : null} حفظ
          </Button>
          <Button variant="secondary" size="sm" onClick={handlePreview}>
            <Eye className="h-3.5 w-3.5" /> معاينة PDF
          </Button>
          <Button variant="secondary" size="sm" onClick={handleDownload}>
            <Download className="h-3.5 w-3.5" /> تحميل PDF
          </Button>
          {quotation.status !== 'draft' && (
            <Button variant="secondary" size="sm" onClick={handleCreateRevision}>
              <Copy className="h-3.5 w-3.5" /> إنشاء نسخة معدّلة
            </Button>
          )}
          <Button size="sm" onClick={openSendPanel}>
            <Send className="h-3.5 w-3.5" /> إرسال للعميل
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-primary">بيانات العرض</h3>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel>رقم العرض</FieldLabel>
                <p className="rounded-lg border border-border-light bg-surface px-3 py-2 font-mono text-sm text-text-muted">{quotation.quotationNumber}</p>
              </div>
              <div>
                <FieldLabel>لغة العرض</FieldLabel>
                <Select value={quotation.language} onChange={(e) => update('language', e.target.value as Quotation['language'])}>
                  <option value="ar">العربية</option>
                  <option value="en">English</option>
                </Select>
              </div>
              <div>
                <FieldLabel>العملة</FieldLabel>
                <Select value={quotation.currency} onChange={(e) => update('currency', e.target.value as Quotation['currency'])}>
                  <option value="SAR">SAR — ريال سعودي</option>
                  <option value="USD">USD — دولار أمريكي</option>
                  <option value="GBP">GBP — جنيه إسترليني</option>
                  <option value="EUR">EUR — يورو</option>
                </Select>
              </div>
              <div>
                <FieldLabel>صالح حتى</FieldLabel>
                <div className="flex gap-2">
                  {[7, 15, 30].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setValidUntil(d as 7 | 15 | 30)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${quotation.validUntilDays === d ? 'border-primary bg-primary/10 text-primary' : 'border-border-light text-text-muted'}`}
                    >
                      {d} يوم
                    </button>
                  ))}
                  <Input type="date" value={quotation.validUntilDate} onChange={(e) => { update('validUntilDate', e.target.value); update('validUntilDays', 'custom') }} className="max-w-[160px]" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold text-primary">بيانات العميل</h3>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel>الاسم</FieldLabel>
                <Input value={quotation.customerName} onChange={(e) => update('customerName', e.target.value)} />
              </div>
              <div>
                <FieldLabel>الشركة</FieldLabel>
                <Input value={quotation.customerCompany ?? ''} onChange={(e) => update('customerCompany', e.target.value)} />
              </div>
              <div>
                <FieldLabel>البريد الإلكتروني</FieldLabel>
                <Input dir="ltr" value={quotation.customerEmail} onChange={(e) => update('customerEmail', e.target.value)} />
              </div>
              <div>
                <FieldLabel>الجوال</FieldLabel>
                <Input dir="ltr" value={quotation.customerPhone} onChange={(e) => update('customerPhone', e.target.value)} />
              </div>
              <div>
                <FieldLabel>المدينة</FieldLabel>
                <Input value={quotation.customerCity} onChange={(e) => update('customerCity', e.target.value)} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary">البنود</h3>
              <Button size="sm" variant="secondary" onClick={addItem}>
                <Plus className="h-3.5 w-3.5" /> إضافة بند
              </Button>
            </div>
            <div className="mt-4 space-y-4">
              {quotation.items.map((item) => (
                <div key={item.id} className="grid grid-cols-1 gap-3 rounded-lg border border-border-light p-4 sm:grid-cols-12">
                  <div className="sm:col-span-4">
                    <FieldLabel>البند</FieldLabel>
                    <Input list="saved-products" value={item.name} onChange={(e) => applySavedProduct(item.id, e.target.value)} />
                  </div>
                  <div className="sm:col-span-3">
                    <FieldLabel>الوصف</FieldLabel>
                    <Input value={item.description ?? ''} onChange={(e) => updateItem(item.id, { description: e.target.value })} />
                  </div>
                  <div className="sm:col-span-1">
                    <FieldLabel>الكمية</FieldLabel>
                    <Input type="number" min={1} value={item.quantity} onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) || 1 })} />
                  </div>
                  <div className="sm:col-span-2">
                    <FieldLabel>سعر الوحدة</FieldLabel>
                    <Input type="number" min={0} value={item.unitPrice} onChange={(e) => updateItem(item.id, { unitPrice: Number(e.target.value) || 0 })} />
                  </div>
                  <div className="flex items-end justify-between gap-2 sm:col-span-2">
                    <div>
                      <FieldLabel>الإجمالي</FieldLabel>
                      <p className="pt-2 font-mono font-bold text-text">{formatMoney(item.quantity * item.unitPrice, quotation.currency, 'ar')}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-danger/10 hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <datalist id="saved-products">
              {savedProducts.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-bold text-primary">الشروط التجارية</h3>
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <FieldLabel>مدة التوريد</FieldLabel>
                <Input value={quotation.leadTime ?? ''} onChange={(e) => update('leadTime', e.target.value)} placeholder="مثال: 4-6 أسابيع من تأكيد الطلب" />
              </div>
              <div>
                <FieldLabel>موقع التسليم</FieldLabel>
                <Input value={quotation.deliveryLocation ?? ''} onChange={(e) => update('deliveryLocation', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>شروط الدفع</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {savedTerms.filter((t) => t.kind === 'payment').map((term) => (
                    <button key={term.id} type="button" onClick={() => update('paymentTerms', term.value)} className="rounded-full border border-border-light px-3 py-1 text-xs text-text-muted hover:border-primary/40">
                      {term.label}
                    </button>
                  ))}
                </div>
                <Textarea className="mt-2" value={quotation.paymentTerms ?? ''} onChange={(e) => update('paymentTerms', e.target.value)} />
              </div>
              <div>
                <FieldLabel>الضمان (اختياري)</FieldLabel>
                <Input value={quotation.warranty ?? ''} onChange={(e) => update('warranty', e.target.value)} />
              </div>
              <div>
                <FieldLabel>تطبيق ضريبة القيمة المضافة؟</FieldLabel>
                <div className="flex gap-2">
                  <button type="button" onClick={() => update('vatEnabled', true)} className={`rounded-lg border px-4 py-1.5 text-sm font-semibold ${quotation.vatEnabled ? 'border-primary bg-primary/10 text-primary' : 'border-border-light text-text-muted'}`}>نعم</button>
                  <button type="button" onClick={() => update('vatEnabled', false)} className={`rounded-lg border px-4 py-1.5 text-sm font-semibold ${!quotation.vatEnabled ? 'border-primary bg-primary/10 text-primary' : 'border-border-light text-text-muted'}`}>لا</button>
                  {quotation.vatEnabled && (
                    <Input type="number" value={quotation.vatRate} onChange={(e) => update('vatRate', Number(e.target.value) || 0)} className="max-w-[90px]" />
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>ملاحظات للعميل</FieldLabel>
                <Textarea value={quotation.notes ?? ''} onChange={(e) => update('notes', e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <FieldLabel>الشروط والأحكام</FieldLabel>
                <div className="flex flex-wrap gap-2">
                  {savedTerms.filter((t) => t.kind === 'tc').map((term) => (
                    <button key={term.id} type="button" onClick={() => update('termsAndConditions', term.value)} className="rounded-full border border-border-light px-3 py-1 text-xs text-text-muted hover:border-primary/40">
                      {term.label}
                    </button>
                  ))}
                </div>
                <Textarea className="mt-2" value={quotation.termsAndConditions ?? ''} onChange={(e) => update('termsAndConditions', e.target.value)} />
              </div>
            </div>
          </Card>

          {revisions.length > 1 && (
            <Card className="p-6">
              <h3 className="text-sm font-bold text-primary">النسخ السابقة</h3>
              <div className="mt-3 space-y-2">
                {revisions.map((r) => (
                  <button key={r.id} onClick={() => navigate(`/admin/quotations/${r.id}`)} className={`flex w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm ${r.id === quotation.id ? 'border-primary bg-primary/5' : 'border-border-light'}`}>
                    <span className="font-mono">{r.quotationNumber}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={r.status} />
                      <span className="text-xs text-text-muted">{formatDate(r.createdAt, 'ar')}</span>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-6 space-y-3 border-primary/30 bg-primary/5 p-6">
            <h4 className="text-xs font-semibold text-text-muted">ملخص العرض</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-text-muted">الإجمالي الفرعي</span><span className="font-mono text-text">{formatMoney(subtotal, quotation.currency, 'ar')}</span></div>
              {quotation.vatEnabled && (
                <div className="flex justify-between"><span className="text-text-muted">ضريبة القيمة المضافة ({quotation.vatRate}%)</span><span className="font-mono text-text">{formatMoney(vat, quotation.currency, 'ar')}</span></div>
              )}
            </div>
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
              <span className="text-text">الإجمالي الكلي</span>
              <span className="font-mono text-text">{formatMoney(grandTotal, quotation.currency, 'ar')}</span>
            </div>
          </Card>

          {sendPanel && (
            <Card className="mt-6 space-y-3 p-6">
              <h4 className="text-sm font-bold text-primary">إرسال عرض السعر</h4>
              <div>
                <FieldLabel>إلى</FieldLabel>
                <Input dir="ltr" value={quotation.customerEmail} readOnly className="bg-surface/50" />
              </div>
              <div>
                <FieldLabel>الموضوع</FieldLabel>
                <Input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
              </div>
              <div>
                <FieldLabel>نص الرسالة</FieldLabel>
                <Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="min-h-[140px]" />
              </div>
              <p className="text-xs text-text-muted">سيتم إرفاق ملف PDF الخاص بالعرض تلقائيًا.</p>
              <Button onClick={handleSend} disabled={sending} className="w-full justify-center">
                {sending ? 'جاري الإرسال...' : 'تأكيد الإرسال'}
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
