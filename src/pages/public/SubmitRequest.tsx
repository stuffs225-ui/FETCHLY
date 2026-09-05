import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ChevronLeft, ChevronRight, Link2, UploadCloud, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { FieldLabel, Input, Textarea, Select } from '@/components/ui/Input'
import { Progress } from '@/components/ui/Progress'
import { cn } from '@/lib/utils'

const categories = ['Electronics', 'Medical', 'Industrial', 'Automotive', 'Personal Care', 'Food & Supplements', 'Clothing', 'Other']
const urgencyOptions = [
  { key: 'Standard', label: 'Standard', sub: '7–14 days' },
  { key: 'Express', label: 'Express', sub: '4–7 days' },
  { key: 'Urgent', label: 'Urgent', sub: '1–3 days' },
]
const deliveryCountries = ['Saudi Arabia', 'UAE', 'Qatar', 'Kuwait', 'Jordan', 'Egypt', 'Bahrain', 'Oman', 'Lebanon', 'Iraq']

interface FormState {
  source: 'USA' | 'UK'
  productUrl: string
  description: string
  category: string
  quantity: string
  brand: string
  budget: string
  urgency: string
  instructions: string
  files: string[]
  fullName: string
  companyName: string
  email: string
  phone: string
  accountType: 'Individual' | 'Business'
  deliveryCountry: string
  address: string
}

const initialState: FormState = {
  source: 'USA',
  productUrl: '',
  description: '',
  category: categories[0],
  quantity: '1',
  brand: '',
  budget: '500',
  urgency: 'Standard',
  instructions: '',
  files: [],
  fullName: '',
  companyName: '',
  email: '',
  phone: '',
  accountType: 'Individual',
  deliveryCountry: deliveryCountries[0],
  address: '',
}

const stepLabels = ['Product Details', 'Budget & Urgency', 'Your Information']

export default function SubmitRequest() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormState>(initialState)
  const [submitted, setSubmitted] = useState(false)
  const [requestId] = useState(() => `REQ-2026-${Math.floor(10000 + Math.random() * 89999)}`)
  const [copied, setCopied] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))

  const next = () => setStep((s) => Math.min(3, s + 1))
  const back = () => setStep((s) => Math.max(1, s - 1))

  const handleSubmit = () => setSubmitted(true)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    const names = Array.from(e.dataTransfer.files).map((f) => f.name)
    update('files', [...form.files, ...names])
  }

  const copyId = () => {
    navigator.clipboard?.writeText(requestId).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (submitted) {
    return (
      <section className="flex min-h-[85vh] items-center justify-center px-6 py-20">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-11 w-11 animate-fade-up text-success" />
          </div>
          <h1 className="mt-8 font-display text-3xl font-extrabold tracking-tight text-text">Request Received!</h1>
          <p className="mt-3 text-text-secondary">Our sourcing team will send you a quote within 24 hours.</p>

          <Card className="mt-8 flex items-center justify-between gap-3 p-5">
            <div className="text-left">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary">Request Number</p>
              <p className="mt-1 font-mono text-xl font-bold text-primary">{requestId}</p>
            </div>
            <button
              onClick={copyId}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-light transition-colors hover:bg-white/5"
            >
              {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 text-text-secondary" />}
            </button>
          </Card>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/track" className="flex-1 justify-center">Track Now</Button>
            <Button to="/" variant="secondary" className="flex-1 justify-center">Back to Home</Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <div className="text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Submit a Request</span>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
          Tell Us What You Need
        </h1>
      </div>

      <div className="mt-10">
        <div className="mb-2 flex justify-between text-xs font-medium text-text-secondary">
          {stepLabels.map((label, i) => (
            <span key={label} className={cn(i + 1 <= step && 'text-primary')}>
              {i + 1}. {label}
            </span>
          ))}
        </div>
        <Progress value={(step / 3) * 100} />
      </div>

      <Card className="mt-8 p-6 sm:p-8">
        {step === 1 && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <FieldLabel>Source Country</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                {(['USA', 'UK'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => update('source', c)}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-semibold transition-all',
                      form.source === c
                        ? 'border-primary bg-primary-glow text-text shadow-[0_0_0_1px_rgba(79,110,247,0.4)]'
                        : 'border-border-light text-text-secondary hover:border-primary/40',
                    )}
                  >
                    {c === 'USA' ? '🇺🇸' : '🇬🇧'} {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Product URL (optional)</FieldLabel>
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                <Input
                  value={form.productUrl}
                  onChange={(e) => update('productUrl', e.target.value)}
                  placeholder="https://www.amazon.com/..."
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <FieldLabel>Product Name / Description</FieldLabel>
              <Textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                placeholder="Describe the product, size, color, model number..."
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <FieldLabel>Category</FieldLabel>
                <Select value={form.category} onChange={(e) => update('category', e.target.value)}>
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div>
                <FieldLabel>Quantity</FieldLabel>
                <Input type="number" min={1} value={form.quantity} onChange={(e) => update('quantity', e.target.value)} />
              </div>
            </div>

            <div>
              <FieldLabel>Preferred Brand (optional)</FieldLabel>
              <Input value={form.brand} onChange={(e) => update('brand', e.target.value)} placeholder="e.g. Sony, Dell, Nike" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-up">
            <div>
              <FieldLabel>Budget Range (USD)</FieldLabel>
              <input
                type="range"
                min={50}
                max={20000}
                step={50}
                value={form.budget}
                onChange={(e) => update('budget', e.target.value)}
                className="w-full accent-primary"
              />
              <div className="mt-3 flex items-center gap-3">
                <span className="text-text-secondary">$</span>
                <Input type="number" value={form.budget} onChange={(e) => update('budget', e.target.value)} className="max-w-[160px]" />
              </div>
            </div>

            <div>
              <FieldLabel>Urgency</FieldLabel>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {urgencyOptions.map((u) => (
                  <button
                    key={u.key}
                    onClick={() => update('urgency', u.key)}
                    className={cn(
                      'rounded-lg border px-4 py-3 text-left transition-all',
                      form.urgency === u.key
                        ? 'border-primary bg-primary-glow shadow-[0_0_0_1px_rgba(79,110,247,0.4)]'
                        : 'border-border-light hover:border-primary/40',
                    )}
                  >
                    <div className="text-sm font-semibold text-text">{u.label}</div>
                    <div className="text-xs text-text-secondary">{u.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Special Instructions</FieldLabel>
              <Textarea
                value={form.instructions}
                onChange={(e) => update('instructions', e.target.value)}
                placeholder="Any specific requirements, certifications, or notes for our sourcing team..."
              />
            </div>

            <div>
              <FieldLabel>Attachments</FieldLabel>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors',
                  dragOver ? 'border-primary bg-primary-glow' : 'border-border-light',
                )}
              >
                <UploadCloud className="h-8 w-8 text-text-secondary" />
                <p className="text-sm text-text-secondary">Drag &amp; drop product images or specs here</p>
                <p className="text-xs text-text-secondary/70">or click to browse (mock upload)</p>
                {form.files.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {form.files.map((f, i) => (
                      <span key={i} className="rounded-md bg-white/5 px-2.5 py-1 text-xs text-text-secondary">
                        {f}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => update('files', [...form.files, `spec-sheet-${form.files.length + 1}.pdf`])}
                  className="mt-2 text-xs font-semibold text-primary hover:underline"
                >
                  + Add sample file
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-up">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <FieldLabel>Full Name</FieldLabel>
                <Input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="Faisal Al-Rashid" />
              </div>
              <div>
                <FieldLabel>Company Name (optional)</FieldLabel>
                <Input value={form.companyName} onChange={(e) => update('companyName', e.target.value)} placeholder="Al Noor Trading LLC" />
              </div>
              <div>
                <FieldLabel>Email</FieldLabel>
                <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@company.com" />
              </div>
              <div>
                <FieldLabel>Phone</FieldLabel>
                <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+966 5X XXX XXXX" />
              </div>
            </div>

            <div>
              <FieldLabel>Account Type</FieldLabel>
              <div className="grid grid-cols-2 gap-3">
                {(['Individual', 'Business'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => update('accountType', t)}
                    className={cn(
                      'rounded-lg border py-3 text-sm font-semibold transition-all',
                      form.accountType === t
                        ? 'border-primary bg-primary-glow text-text shadow-[0_0_0_1px_rgba(79,110,247,0.4)]'
                        : 'border-border-light text-text-secondary hover:border-primary/40',
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel>Country of Delivery</FieldLabel>
              <Select value={form.deliveryCountry} onChange={(e) => update('deliveryCountry', e.target.value)}>
                {deliveryCountries.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </div>

            <div>
              <FieldLabel>Delivery Address</FieldLabel>
              <Textarea value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Street, city, postal code..." />
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <Button variant="ghost" onClick={back} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {step < 3 ? (
            <Button onClick={next}>
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>Submit Request →</Button>
          )}
        </div>
      </Card>

      <p className="mt-6 text-center text-xs text-text-secondary">
        Already have a request? <Link to="/track" className="font-semibold text-primary hover:underline">Track it here</Link>
      </p>
    </section>
  )
}
