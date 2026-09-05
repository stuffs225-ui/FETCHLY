import { Globe2, UserX, MousePointerClick, FileCheck2, ShieldCheck, ScrollText, Mail } from 'lucide-react'
import { useI18n } from '@/i18n'

const icons = [Globe2, UserX, MousePointerClick, FileCheck2, ShieldCheck, ScrollText, Mail]

export default function WhyUs() {
  const { t } = useI18n()

  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{t.whyUs.title}</h2>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {t.whyUs.items.map((item, i) => {
            const Icon = icons[i % icons.length]
            return (
              <div key={item.title} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-gold/40">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10">
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <div>
                  <p className="font-bold text-text">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-text-muted">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
