import { Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const tiers = [
  {
    name: 'Standard',
    price: '12%',
    priceNote: 'service fee + shipping',
    features: ['Any product category', 'Standard 7–14 day delivery', 'Email support', 'Order tracking'],
    highlighted: false,
  },
  {
    name: 'Business',
    price: '9%',
    priceNote: '+ dedicated agent + NET30',
    features: ['Dedicated procurement agent', 'NET30 invoicing', 'Priority sourcing', 'Bulk order discounts'],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceNote: 'tailored to your volume',
    features: ['Custom SLAs', 'Multi-user team access', 'API access', 'Dedicated account manager'],
    highlighted: false,
  },
]

export default function PricingTeaser() {
  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Pricing</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">
            Transparent pricing. No surprises.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
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
              <div className="mt-4 flex items-baseline gap-2">
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
              <Button to={tier.name === 'Enterprise' ? '/pricing' : '/request'} variant={tier.highlighted ? 'primary' : 'secondary'} className="mt-8 w-full justify-center">
                {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
              </Button>
            </Card>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-text-secondary">
          Need the full breakdown? <Link to="/pricing" className="font-semibold text-primary hover:underline">View detailed pricing →</Link>
        </p>
      </div>
    </section>
  )
}
