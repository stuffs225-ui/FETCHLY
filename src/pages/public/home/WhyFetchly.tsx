import { ShieldCheck, Radar, FileCheck2, UserCog, TrendingUp, FileSpreadsheet } from 'lucide-react'

const items = [
  { icon: ShieldCheck, text: 'Verified US & UK supplier network' },
  { icon: Radar, text: 'Real-time shipment tracking' },
  { icon: FileCheck2, text: 'Customs clearance included' },
  { icon: UserCog, text: 'Dedicated procurement agent' },
  { icon: TrendingUp, text: 'Competitive FX rates locked at quote' },
  { icon: FileSpreadsheet, text: 'Full audit trail & invoicing' },
]

export default function WhyFetchly() {
  return (
    <section className="border-t border-border bg-surface py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Why FETCHLY</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">Built on Trust & Precision</h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.text} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-glow">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm font-medium text-text">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
