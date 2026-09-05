import { UserX, MousePointerClick, Globe2, FileCheck2 } from 'lucide-react'
import { useI18n } from '@/i18n'

const icons = [UserX, MousePointerClick, Globe2, FileCheck2]

export default function WhyUs() {
  const { t } = useI18n()

  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{t.whyUs.title}</h2>

        <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2">
          {t.whyUs.items.map((item, i) => {
            const Icon = icons[i % icons.length]
            return (
              <div key={item.title} className="flex items-start gap-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.75} />
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
