import { useState } from 'react'
import { ChevronDown, CheckCircle2, Copy, Check } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FieldLabel, Input, Select, Textarea } from '@/components/ui/Input'
import { FileDropzone, type PendingFile } from '@/components/ui/FileDropzone'
import { requestsRepo, nextRequestNumber, logAudit, companySettingsStore, emailSettingsStore } from '@/lib/repo'
import { renderTemplate, sendEmail } from '@/lib/emailService'
import { putAttachment } from '@/lib/attachments'
import { uid } from '@/lib/utils'
import type { SourcingRequest, SourcePreference, Urgency } from '@/lib/types'
import { cn } from '@/lib/utils'

interface FormState {
  name: string
  company: string
  email: string
  phone: string
  city: string
  productName: string
  quantity: string
  brand: string
  model: string
  partNumber: string
  productUrl: string
  description: string
  sourcePreference: SourcePreference
  deliveryCity: string
  requiredDate: string
  urgency: Urgency
}

const initial: FormState = {
  name: '',
  company: '',
  email: '',
  phone: '',
  city: '',
  productName: '',
  quantity: '1',
  brand: '',
  model: '',
  partNumber: '',
  productUrl: '',
  description: '',
  sourcePreference: 'best',
  deliveryCity: '',
  requiredDate: '',
  urgency: 'normal',
}

export function RequestForm() {
  const { t, locale } = useI18n()
  const [form, setForm] = useState<FormState>(initial)
  const [files, setFiles] = useState<PendingFile[]>([])
  const [consent, setConsent] = useState(false)
  const [showMoreProduct, setShowMoreProduct] = useState(false)
  const [showDelivery, setShowDelivery] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'consent' | 'files', string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ requestNumber: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  const validate = (): boolean => {
    const e: typeof errors = {}
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!form.name.trim()) e.name = t.requestForm.errors.required
    if (!form.email.trim() || !emailRe.test(form.email)) e.email = t.requestForm.errors.email
    if (!form.phone.trim()) e.phone = t.requestForm.errors.phone
    if (!form.city.trim()) e.city = t.requestForm.errors.required
    if (!form.productName.trim()) e.productName = t.requestForm.errors.productName
    if (!consent) e.consent = t.requestForm.errors.consent
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      document.getElementById('request-form-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    setSubmitting(true)

    const requestId = uid('req')
    const attachmentIds: string[] = []
    for (const pf of files) {
      const attId = uid('att')
      await putAttachment({
        id: attId,
        requestId,
        fileName: pf.file.name,
        mimeType: pf.file.type,
        size: pf.file.size,
        blob: pf.file,
        createdAt: new Date().toISOString(),
      })
      attachmentIds.push(attId)
    }

    const requestNumber = nextRequestNumber()
    const record: SourcingRequest = {
      id: requestId,
      requestNumber,
      createdAt: new Date().toISOString(),
      locale,
      status: 'new',
      name: form.name.trim(),
      company: form.company.trim() || undefined,
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      productName: form.productName.trim(),
      quantity: Number(form.quantity) || 1,
      brand: form.brand.trim() || undefined,
      model: form.model.trim() || undefined,
      partNumber: form.partNumber.trim() || undefined,
      productUrl: form.productUrl.trim() || undefined,
      description: form.description.trim() || undefined,
      sourcePreference: form.sourcePreference,
      deliveryCity: form.deliveryCity.trim() || undefined,
      requiredDate: form.requiredDate || undefined,
      urgency: form.urgency,
      attachmentIds,
      consentAt: new Date().toISOString(),
    }
    requestsRepo.upsert(record)
    logAudit({ entityType: 'request', entityId: record.id, action: 'تم إنشاء الطلب', actor: 'العميل' })

    const emailSettings = emailSettingsStore.get()
    const company = companySettingsStore.get()
    const template = locale === 'ar' ? emailSettings.ackTemplateAr : emailSettings.ackTemplateEn
    const rendered = renderTemplate(template.subject, template.body, { name: record.name, requestNumber })
    await sendEmail({ to: record.email, subject: rendered.subject, body: rendered.body, kind: 'acknowledgement', relatedId: record.id })
    await sendEmail({
      to: emailSettings.internalNotificationEmails,
      subject: `طلب جديد — ${requestNumber}`,
      body: `طلب جديد من ${record.name} (${record.email}).\nالمنتج: ${record.productName}\nالكمية: ${record.quantity}\nالمدينة: ${record.city}`,
      kind: 'acknowledgement',
      relatedId: record.id,
    })
    void company

    setSubmitting(false)
    setResult({ requestNumber })
  }

  if (result) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald/10">
          <CheckCircle2 className="h-9 w-9 text-emerald" />
        </div>
        <h3 className="mt-6 text-2xl font-extrabold text-text">{t.requestForm.success.title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-text-muted">{t.requestForm.success.body}</p>

        <div className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-border-light bg-surface p-4">
          <div className="text-start">
            <p className="text-[11px] font-semibold text-text-muted">{t.requestForm.success.requestNumberLabel}</p>
            <p className="mt-1 font-mono text-lg font-bold text-gold">{result.requestNumber}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(result.requestNumber).catch(() => {})
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-light hover:bg-white/5"
          >
            {copied ? <Check className="h-4 w-4 text-emerald" /> : <Copy className="h-4 w-4 text-text-muted" />}
          </button>
        </div>
        <p className="mt-4 text-xs text-text-muted">{t.requestForm.success.emailNote}</p>

        <Button
          variant="secondary"
          className="mt-8 w-full justify-center"
          onClick={() => {
            setForm(initial)
            setFiles([])
            setConsent(false)
            setResult(null)
          }}
        >
          {t.requestForm.success.newRequest}
        </Button>
      </Card>
    )
  }

  return (
    <Card id="request-form-top" className="mx-auto max-w-3xl p-6 sm:p-8">
      <div className="space-y-8">
        {/* Contact */}
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gold">{t.requestForm.step1}</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <FieldLabel>{t.requestForm.fields.name}</FieldLabel>
              <Input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder={t.requestForm.placeholders.name} />
              {errors.name && <p className="mt-1 text-xs text-danger">{errors.name}</p>}
            </div>
            <div>
              <FieldLabel>{t.requestForm.fields.companyOptional}</FieldLabel>
              <Input value={form.company} onChange={(e) => update('company', e.target.value)} placeholder={t.requestForm.placeholders.company} />
            </div>
            <div>
              <FieldLabel>{t.requestForm.fields.email}</FieldLabel>
              <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder={t.requestForm.placeholders.email} dir="ltr" />
              {errors.email && <p className="mt-1 text-xs text-danger">{errors.email}</p>}
            </div>
            <div>
              <FieldLabel>{t.requestForm.fields.phone}</FieldLabel>
              <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder={t.requestForm.placeholders.phone} dir="ltr" />
              {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone}</p>}
            </div>
            <div>
              <FieldLabel>{t.requestForm.fields.city}</FieldLabel>
              <Input value={form.city} onChange={(e) => update('city', e.target.value)} placeholder={t.requestForm.placeholders.city} />
              {errors.city && <p className="mt-1 text-xs text-danger">{errors.city}</p>}
            </div>
          </div>
        </div>

        {/* Product */}
        <div className="border-t border-border pt-8">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gold">{t.requestForm.step2}</h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <FieldLabel>{t.requestForm.fields.productName}</FieldLabel>
              <Input value={form.productName} onChange={(e) => update('productName', e.target.value)} placeholder={t.requestForm.placeholders.productName} />
              {errors.productName && <p className="mt-1 text-xs text-danger">{errors.productName}</p>}
            </div>
            <div>
              <FieldLabel>{t.requestForm.fields.quantity}</FieldLabel>
              <Input type="number" min={1} value={form.quantity} onChange={(e) => update('quantity', e.target.value)} />
            </div>
          </div>

          <div className="mt-4">
            <FieldLabel>{t.requestForm.fields.description}</FieldLabel>
            <Textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder={t.requestForm.placeholders.description} />
          </div>

          <button
            type="button"
            onClick={() => setShowMoreProduct((v) => !v)}
            className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-gold"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', showMoreProduct && 'rotate-180')} />
            {t.requestForm.fields.brand} / {t.requestForm.fields.model} / {t.requestForm.fields.partNumber} / {t.requestForm.fields.productUrl}
          </button>

          <div className={cn('grid overflow-hidden transition-all duration-300', showMoreProduct ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
            <div className="grid grid-cols-1 gap-5 overflow-hidden sm:grid-cols-2">
              <div>
                <FieldLabel>{t.requestForm.fields.brand}</FieldLabel>
                <Input value={form.brand} onChange={(e) => update('brand', e.target.value)} />
              </div>
              <div>
                <FieldLabel>{t.requestForm.fields.model}</FieldLabel>
                <Input value={form.model} onChange={(e) => update('model', e.target.value)} />
              </div>
              <div>
                <FieldLabel>{t.requestForm.fields.partNumber}</FieldLabel>
                <Input value={form.partNumber} onChange={(e) => update('partNumber', e.target.value)} placeholder={t.requestForm.placeholders.partNumber} dir="ltr" />
              </div>
              <div>
                <FieldLabel>{t.requestForm.fields.productUrl}</FieldLabel>
                <Input value={form.productUrl} onChange={(e) => update('productUrl', e.target.value)} placeholder={t.requestForm.placeholders.productUrl} dir="ltr" />
              </div>
            </div>
          </div>

          <div className="mt-5">
            <FieldLabel>{t.requestForm.fields.sourcePreference}</FieldLabel>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(t.requestForm.sourceOptions) as SourcePreference[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => update('sourcePreference', key)}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                    form.sourcePreference === key ? 'border-gold bg-gold/10 text-gold' : 'border-border-light text-text-muted hover:border-gold/40',
                  )}
                >
                  {t.requestForm.sourceOptions[key]}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <FieldLabel>{t.requestForm.fields.attachments}</FieldLabel>
            <FileDropzone files={files} onChange={setFiles} error={errors.files} />
          </div>
        </div>

        {/* Delivery */}
        <div className="border-t border-border pt-8">
          <button type="button" onClick={() => setShowDelivery((v) => !v)} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gold">
            <ChevronDown className={cn('h-4 w-4 transition-transform', showDelivery && 'rotate-180')} />
            {t.requestForm.step3} ({t.common.optional})
          </button>
          <div className={cn('grid overflow-hidden transition-all duration-300', showDelivery ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
            <div className="grid grid-cols-1 gap-5 overflow-hidden sm:grid-cols-3">
              <div>
                <FieldLabel>{t.requestForm.fields.deliveryCity}</FieldLabel>
                <Input value={form.deliveryCity} onChange={(e) => update('deliveryCity', e.target.value)} />
              </div>
              <div>
                <FieldLabel>{t.requestForm.fields.requiredDate}</FieldLabel>
                <Input type="date" value={form.requiredDate} onChange={(e) => update('requiredDate', e.target.value)} />
              </div>
              <div>
                <FieldLabel>{t.requestForm.fields.urgency}</FieldLabel>
                <Select value={form.urgency} onChange={(e) => update('urgency', e.target.value as Urgency)}>
                  {(Object.keys(t.requestForm.urgencyOptions) as Urgency[]).map((key) => (
                    <option key={key} value={key}>
                      {t.requestForm.urgencyOptions[key]}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Consent + submit */}
        <div className="border-t border-border pt-6">
          <label className="flex cursor-pointer items-start gap-3">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 h-4 w-4 accent-gold" />
            <span className="text-sm text-text-muted">
              {t.requestForm.consent}{' '}
              <a href="/legal/privacy" className="font-semibold text-gold hover:underline">
                {t.requestForm.privacyLink}
              </a>
            </span>
          </label>
          {errors.consent && <p className="mt-1 text-xs text-danger">{errors.consent}</p>}

          <Button onClick={handleSubmit} disabled={submitting} className="mt-6 w-full justify-center" size="lg">
            {submitting ? t.requestForm.submitting : t.requestForm.submit}
          </Button>
        </div>
      </div>
    </Card>
  )
}
