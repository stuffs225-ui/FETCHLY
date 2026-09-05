import { useI18n } from '@/i18n'

export default function GlobalSourcing() {
  const { t } = useI18n()

  return (
    <section className="relative overflow-hidden border-t border-border bg-[#0d1420] py-24">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.25]" />
      <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{t.globalSourcing.title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-text-muted">{t.globalSourcing.message}</p>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {t.globalSourcing.markets.map((m) => (
            <span
              key={m}
              className="rounded-full border border-border-light bg-white/[0.03] px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-gold/40 hover:text-text"
            >
              {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
