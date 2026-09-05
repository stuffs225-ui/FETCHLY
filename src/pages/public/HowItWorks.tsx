import { ClipboardList, FileText, Globe2, PackageCheck, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Accordion } from '@/components/ui/Accordion'

const steps = [
  {
    icon: ClipboardList,
    title: 'Submit Your Request',
    time: 'Takes 2 minutes',
    desc: 'Share a product link, description, spec sheet, or photos of what you need. Tell us the category, quantity, and your budget range. Whether it\'s a single item or a bulk corporate order, we take requests of any size and complexity.',
    points: ['No account required to submit', 'Attach images or spec documents', 'Set urgency: Standard, Express or Urgent'],
  },
  {
    icon: FileText,
    title: 'Receive a Transparent Quote',
    time: 'Within 24 hours',
    desc: 'Our sourcing team researches suppliers, negotiates pricing, and prepares a complete quote — product cost, our service fee, estimated shipping, and customs duties, all itemized with no hidden charges.',
    points: ['FX rates locked at the moment of quoting', 'Quote valid for 5 business days', 'Free to request, no obligation to accept'],
  },
  {
    icon: Globe2,
    title: 'We Source & Purchase',
    time: '1–3 business days after approval',
    desc: 'Once you approve the quote and complete payment, our procurement agents purchase directly from verified suppliers in the US and UK. For specialized or regulated items, we handle compliance documentation on your behalf.',
    points: ['Verified supplier network only', 'Dedicated agent assigned to your order', 'Real-time updates as we purchase'],
  },
  {
    icon: PackageCheck,
    title: 'Delivered to Your Door',
    time: '4–14 days depending on urgency',
    desc: 'We consolidate, freight, and clear customs on your behalf, then hand off to trusted last-mile couriers. Track every stage — from warehouse to your doorstep — through your tracking portal.',
    points: ['Full customs clearance included', 'Live tracking at every stage', 'Signature confirmation on delivery'],
  },
]

const faqs = [
  {
    q: 'What can I request?',
    a: 'Almost anything available for purchase in the US or UK — electronics, medical equipment, industrial machinery, automotive parts, personal care items, food & supplements, clothing, and more. If a category is restricted or requires special compliance, our team will advise you during the quote stage.',
  },
  {
    q: 'How long does it take?',
    a: 'Quotes are delivered within 24 hours of submission. Once approved and paid, delivery typically takes 1–3 days (Urgent), 4–7 days (Express), or 7–14 days (Standard), depending on the shipping method and destination country.',
  },
  {
    q: 'How are fees calculated?',
    a: 'Our service fee is a percentage of the product cost — 12% on the Standard tier, 9% on Business (with NET30 terms), or a custom rate for Enterprise accounts. Shipping and customs duties are calculated separately and shown transparently in your quote.',
  },
  {
    q: 'Do you handle customs?',
    a: 'Yes — customs clearance is included in every order. We manage all import documentation, duties, and taxes so you never have to deal with customs brokers or surprise fees.',
  },
  {
    q: 'What payment methods?',
    a: 'We accept wire transfer, major credit cards, and PayPal for individual orders. Business and Enterprise accounts can also apply for NET30 invoicing terms.',
  },
  {
    q: 'Can I track my order?',
    a: 'Yes. Every order includes a unique tracking number you can use on our Track Order page to see real-time status — from quote acceptance through customs clearance to final delivery.',
  },
  {
    q: 'What if the product is unavailable?',
    a: "If a requested product becomes unavailable or is discontinued, your agent will contact you with verified alternatives before any purchase is made. You're never charged for a product we can't source.",
  },
  {
    q: 'Do you serve B2B?',
    a: 'Yes — our Business and Enterprise tiers are built specifically for corporate procurement, including bulk sourcing, dedicated account managers, NET30 invoicing, and custom SLAs for high-volume buyers.',
  },
]

export default function HowItWorks() {
  return (
    <>
      <section className="border-b border-border py-20 text-center">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">How It Works</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-text sm:text-5xl">
            From Request to Doorstep
          </h1>
          <p className="mt-5 text-lg text-text-secondary">
            A transparent, four-step process built for speed, precision, and peace of mind.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="relative space-y-14 border-l-2 border-border pl-10 sm:pl-14">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="absolute -left-[3.15rem] top-0 flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary bg-bg shadow-[0_0_20px_rgba(79,110,247,0.4)] sm:-left-[4.15rem]">
                  <step.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gold">Step {i + 1} · {step.time}</span>
                <h3 className="mt-1.5 font-display text-2xl font-bold text-text">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-text-secondary">{step.desc}</p>
                <ul className="mt-4 space-y-2">
                  {step.points.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button to="/request" size="lg">
              Submit a Request <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-center font-display text-3xl font-extrabold tracking-tight text-text">Frequently Asked Questions</h2>
          <div className="mt-10">
            <Accordion items={faqs} />
          </div>
        </div>
      </section>
    </>
  )
}
