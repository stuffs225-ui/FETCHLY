import { ClipboardList, FileText, Globe2, PackageCheck } from 'lucide-react'
import { Card } from '@/components/ui/Card'

const steps = [
  {
    icon: ClipboardList,
    title: 'Submit Request',
    desc: 'Tell us what you need — a product link, description, or spec sheet. Any category, any quantity.',
  },
  {
    icon: FileText,
    title: 'Receive Quote',
    desc: 'Get a transparent, all-in quote within 24 hours — product cost, shipping, customs, no surprises.',
  },
  {
    icon: Globe2,
    title: 'We Source & Purchase',
    desc: 'Once approved, our agents purchase directly from verified US & UK suppliers on your behalf.',
  },
  {
    icon: PackageCheck,
    title: 'Delivered to Your Door',
    desc: 'We handle freight, customs clearance, and last-mile delivery — fully tracked, end to end.',
  },
]

export default function HowItWorksSection() {
  return (
    <section className="relative border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">The Process</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">How FETCHLY Works</h2>
          <p className="mt-4 text-text-secondary">From request to doorstep, in four transparent steps.</p>
        </div>

        <div className="relative mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute top-10 left-0 right-0 hidden h-px bg-gradient-to-r from-transparent via-border-light to-transparent lg:block" />
          {steps.map((step, i) => (
            <Card key={step.title} className="relative p-7 transition-all duration-300 hover:border-primary hover:shadow-[0_0_0_1px_rgba(79,110,247,0.3),0_16px_40px_-12px_rgba(79,110,247,0.35)]">
              <div className="absolute -top-3 -left-3 flex h-7 w-7 items-center justify-center rounded-full bg-gold font-mono text-xs font-bold text-bg">
                {i + 1}
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-glow shadow-[0_0_24px_rgba(79,110,247,0.25)]">
                <step.icon className="h-6.5 w-6.5 text-primary" />
              </div>
              <h3 className="mt-5 font-display text-lg font-bold text-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
