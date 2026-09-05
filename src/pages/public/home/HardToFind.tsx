import { Search } from 'lucide-react'
import { useI18n } from '@/i18n'

export default function HardToFind() {
  const { t } = useI18n()

  return (
    <section className="border-t border-border bg-surface/60 py-24">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="mb-14 text-center">
          <Search className="mx-auto h-8 w-8 text-gold" />
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{t.hardToFind.title}</h2>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {t.hardToFind.examples.map((ex) => (
            <div key={ex} className="flex items-start gap-3 rounded-xl border border-border bg-card px-5 py-4">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
              <span className="text-sm font-medium text-text">{ex}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
