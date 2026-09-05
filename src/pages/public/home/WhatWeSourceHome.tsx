import { Factory, Wrench, Package, Stethoscope, Cpu, Droplet, PackagePlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { CardHover } from '@/components/ui/Card'

const icons = [Factory, Wrench, Package, Stethoscope, Cpu, Droplet]

export default function WhatWeSourceHome() {
  const { t } = useI18n()

  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{t.whatWeSourceHome.title}</h2>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {t.whatWeSourceHome.categories.map((cat, i) => {
            const Icon = icons[i % icons.length]
            return (
              <CardHover key={cat} className="flex flex-col items-center gap-3 p-6 text-center">
                <Icon className="h-6 w-6 text-primary" />
                <span className="text-sm font-semibold text-text">{cat}</span>
              </CardHover>
            )
          })}
        </div>

        <Link
          to="/request"
          className="mt-4 flex flex-col items-center gap-1.5 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center transition-colors hover:bg-primary/10 sm:flex-row sm:justify-center sm:gap-3"
        >
          <PackagePlus className="h-5 w-5 shrink-0 text-primary" />
          <span className="text-sm font-bold text-text">{t.whatWeSourceHome.otherTitle}</span>
          <span className="text-xs text-text-muted">{t.whatWeSourceHome.otherDesc}</span>
        </Link>
      </div>
    </section>
  )
}
