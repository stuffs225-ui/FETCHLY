import { Quote } from 'lucide-react'
import { testimonials } from '@/lib/mockData'

export default function Testimonials() {
  return (
    <section className="border-t border-border bg-surface py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">Testimonials</span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-text sm:text-4xl">Trusted Across the Region</h2>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="flex flex-col rounded-xl border border-border-light bg-white/[0.03] p-7 backdrop-blur-sm transition-colors hover:border-primary/40"
            >
              <Quote className="h-7 w-7 text-primary/50" />
              <p className="mt-4 flex-1 text-sm leading-relaxed text-text">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-gold font-display text-sm font-bold text-white">
                  {t.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text">{t.name}</p>
                  <p className="text-xs text-text-secondary">{t.role}, {t.company}</p>
                </div>
                <span className="ml-auto text-lg">{t.country.split(' ')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
