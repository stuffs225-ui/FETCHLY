import {
  Wrench, Factory, Stethoscope, ScanEye, Zap, Cpu, Hammer, FlaskConical, ShieldAlert, Car, Boxes, PackagePlus,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { CardHover } from '@/components/ui/Card'

const icons = [Wrench, Factory, Stethoscope, ScanEye, Zap, Cpu, Hammer, FlaskConical, ShieldAlert, Car, Boxes]

export default function WhatWeSourceHome() {
  const { t } = useI18n()

  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{t.whatWeSourceHome.title}</h2>
          <p className="mt-3 text-sm text-text-muted">{t.whatWeSourceHome.disclaimer}</p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {t.whatWeSourceHome.categories.map((cat, i) => {
            const Icon = icons[i % icons.length]
            return (
              <CardHover key={cat} className="flex flex-col items-center gap-3 p-6 text-center">
                <Icon className="h-6 w-6 text-gold" />
                <span className="text-sm font-semibold text-text">{cat}</span>
              </CardHover>
            )
          })}

          <Link
            to="/request"
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gold/40 bg-gold/5 p-6 text-center transition-colors hover:bg-gold/10"
          >
            <PackagePlus className="h-6 w-6 text-gold" />
            <span className="text-sm font-bold text-text">{t.whatWeSourceHome.otherTitle}</span>
            <span className="text-xs text-text-muted">{t.whatWeSourceHome.otherDesc}</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
