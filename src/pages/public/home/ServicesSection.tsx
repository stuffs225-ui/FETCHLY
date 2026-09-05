import { User, Building2, FlaskConical, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CardHover } from '@/components/ui/Card'

const services = [
  {
    icon: User,
    title: 'Individual Orders',
    tagline: 'Any product, any size',
    desc: 'From a single gadget to a full household setup — we source and ship it to you personally, hassle-free.',
    color: 'text-primary bg-primary-glow',
  },
  {
    icon: Building2,
    title: 'Corporate Procurement',
    tagline: 'Bulk sourcing, NET terms, dedicated agent',
    desc: 'Scalable procurement for offices, retailers & enterprises — with invoicing, NET30 terms and a dedicated account manager.',
    color: 'text-gold bg-gold/10',
  },
  {
    icon: FlaskConical,
    title: 'Specialized Sourcing',
    tagline: 'Medical, industrial, restricted categories',
    desc: 'Complex, regulated or hard-to-find items — medical devices, industrial equipment — handled with full compliance.',
    color: 'text-success bg-success/10',
  },
]

export default function ServicesSection() {
  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Services</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">Built for Every Kind of Buyer</h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {services.map((s) => (
            <CardHover key={s.title} className="group flex flex-col p-8">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon className="h-6.5 w-6.5" />
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-text">{s.title}</h3>
              <p className="mt-1 text-sm font-medium text-primary">{s.tagline}</p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-text-secondary">{s.desc}</p>
              <Link to="/request" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-text transition-colors group-hover:text-primary">
                Get Started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </CardHover>
          ))}
        </div>
      </div>
    </section>
  )
}
