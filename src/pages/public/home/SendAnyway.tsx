import { Image, Link2, Hash, MessageSquareText } from 'lucide-react'
import { useI18n } from '@/i18n'

const icons = [Image, Link2, Hash, MessageSquareText]

export default function SendAnyway() {
  const { t } = useI18n()

  return (
    <section className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy/20 via-transparent to-transparent" />
      <div className="relative mx-auto max-w-6xl px-6 lg:px-8">
        <h2 className="text-balance text-center text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{t.sendAnyway.title}</h2>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.sendAnyway.cards.map((card, i) => {
            const Icon = icons[i]
            return (
              <div
                key={card.q}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-7 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/50"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-navy/30 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <p className="mt-5 text-lg font-bold text-text">{card.q}</p>
                <p className="mt-1.5 text-sm font-medium text-primary">{card.a}</p>
              </div>
            )
          })}
        </div>

        <p className="mt-14 text-center text-2xl font-extrabold text-primary">{t.sendAnyway.closing}</p>
      </div>
    </section>
  )
}
