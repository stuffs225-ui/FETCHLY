import { Image, Link2, Hash, MessageSquareText } from 'lucide-react'
import { useI18n } from '@/i18n'

const icons = [Image, Link2, Hash, MessageSquareText]

export default function SendAnyway() {
  const { t } = useI18n()

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <h2 className="text-balance text-center text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{t.sendAnyway.title}</h2>

        <div className="mt-12 grid grid-cols-2 divide-border border-border sm:grid-cols-4 sm:divide-x sm:divide-x-reverse">
          {t.sendAnyway.cards.map((card, i) => {
            const Icon = icons[i]
            return (
              <div key={card.q} className="flex flex-col items-center gap-2 border-b border-border px-4 py-6 text-center sm:border-b-0 sm:py-0">
                <Icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                <p className="text-base font-bold text-text">{card.q}</p>
                <p className="text-sm text-text-muted">{card.a}</p>
              </div>
            )
          })}
        </div>

        <p className="mt-12 text-center text-lg font-bold text-primary">{t.sendAnyway.closing}</p>
      </div>
    </section>
  )
}
