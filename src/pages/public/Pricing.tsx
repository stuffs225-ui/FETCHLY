import { Check, Minus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Accordion } from '@/components/ui/Accordion'
import { cn } from '@/lib/utils'

const tiers = [
  {
    name: 'Standard',
    price: '12%',
    priceNote: 'service fee + shipping',
    desc: 'For individuals sourcing one-off products.',
    features: ['Any product category', 'Standard 7–14 day delivery', 'Email support', 'Order tracking', 'Customs clearance included'],
    highlighted: false,
    cta: 'Get Started',
    ctaTo: '/request',
  },
  {
    name: 'Business',
    price: '9%',
    priceNote: '+ dedicated agent + NET30',
    desc: 'For companies with recurring procurement needs.',
    features: ['Everything in Standard', 'Dedicated procurement agent', 'NET30 invoicing terms', 'Priority sourcing & response', 'Bulk order discounts'],
    highlighted: true,
    cta: 'Get Started',
    ctaTo: '/request',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceNote: 'tailored to your volume',
    desc: 'For high-volume importers & regulated categories.',
    features: ['Everything in Business', 'Custom SLAs & compliance support', 'Multi-user team access', 'API access for order automation', 'Dedicated account manager'],
    highlighted: false,
    cta: 'Contact Sales',
    ctaTo: '/request',
  },
]

const comparisonRows: { label: string; standard: boolean | string; business: boolean | string; enterprise: boolean | string }[] = [
  { label: 'Service fee', standard: '12%', business: '9%', enterprise: 'Custom' },
  { label: 'Quote turnaround', standard: '24h', business: '12h', enterprise: '4h' },
  { label: 'Dedicated procurement agent', standard: false, business: true, enterprise: true },
  { label: 'NET30 invoicing', standard: false, business: true, enterprise: true },
  { label: 'Customs clearance included', standard: true, business: true, enterprise: true },
  { label: 'Bulk order discounts', standard: false, business: true, enterprise: true },
  { label: 'Multi-user team access', standard: false, business: false, enterprise: true },
  { label: 'API access', standard: false, business: false, enterprise: true },
  { label: 'Custom SLAs', standard: false, business: false, enterprise: true },
  { label: 'Support channel', standard: 'Email', business: 'Email + Phone', enterprise: 'Dedicated Manager' },
]

const faqs = [
  {
    q: 'Is the service fee the only cost?',
    a: 'No — your total quote also includes the product cost, international shipping, and customs duties. The service fee is FETCHLY\'s margin on top of the product cost, and everything is itemized transparently before you pay.',
  },
  {
    q: 'Can I switch tiers later?',
    a: 'Yes, you can upgrade from Standard to Business at any time — just contact your account team or submit a new request under Business terms.',
  },
  {
    q: 'What does NET30 mean?',
    a: 'NET30 lets approved Business and Enterprise accounts pay invoices within 30 days of delivery instead of upfront, improving cash flow for recurring procurement.',
  },
  {
    q: 'Are there any hidden fees?',
    a: 'None. Every quote shows product cost, service fee, shipping, and customs duties as separate line items before you approve payment.',
  },
]

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === 'string') return <span className="text-sm text-text">{value}</span>
  return value ? <Check className="mx-auto h-4.5 w-4.5 text-success" /> : <Minus className="mx-auto h-4.5 w-4.5 text-text-secondary/40" />
}

export default function Pricing() {
  return (
    <>
      <section className="border-b border-border py-20 text-center">
        <div className="mx-auto max-w-2xl px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Pricing</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
            Transparent pricing. No surprises.
          </h1>
          <p className="mt-5 text-lg text-text-secondary">
            Every quote breaks down product cost, fees, shipping, and customs — before you pay a cent.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={cn(
                  'relative flex flex-col p-8',
                  tier.highlighted && 'border-primary shadow-[0_0_0_1px_rgba(79,110,247,0.4),0_20px_50px_-12px_rgba(79,110,247,0.35)]',
                )}
              >
                {tier.highlighted && (
                  <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display text-lg font-bold text-text">{tier.name}</h3>
                <p className="mt-1 text-sm text-text-secondary">{tier.desc}</p>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-mono text-4xl font-bold text-text">{tier.price}</span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">{tier.priceNote}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-text-secondary">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button to={tier.ctaTo} variant={tier.highlighted ? 'primary' : 'secondary'} className="mt-8 w-full justify-center">
                  {tier.cta}
                </Button>
              </Card>
            ))}
          </div>

          <div className="mt-20">
            <h2 className="text-center font-display text-2xl font-extrabold tracking-tight text-text">Compare Plans</h2>
            <div className="mt-10 overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface/60">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-text-secondary">Feature</th>
                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-text-secondary">Standard</th>
                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-primary">Business</th>
                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-text-secondary">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr key={row.label} className="border-b border-border last:border-0">
                      <td className="px-5 py-4 font-medium text-text">{row.label}</td>
                      <td className="px-5 py-4 text-center"><Cell value={row.standard} /></td>
                      <td className="bg-primary/5 px-5 py-4 text-center"><Cell value={row.business} /></td>
                      <td className="px-5 py-4 text-center"><Cell value={row.enterprise} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-center font-display text-2xl font-extrabold tracking-tight text-text">Pricing FAQ</h2>
          <div className="mt-10">
            <Accordion items={faqs} />
          </div>
        </div>
      </section>
    </>
  )
}
