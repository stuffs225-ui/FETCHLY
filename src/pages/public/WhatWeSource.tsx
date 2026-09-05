import {
  Wrench, Factory, Stethoscope, ScanEye, Zap, Cpu, Hammer, FlaskConical, ShieldAlert, Car, Boxes, PackagePlus,
} from 'lucide-react'
import { useI18n } from '@/i18n'
import { CardHover } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DirArrow } from '@/components/ui/DirArrow'
import { usePageTitle } from '@/lib/usePageTitle'

const icons = [Wrench, Factory, Stethoscope, ScanEye, Zap, Cpu, Hammer, FlaskConical, ShieldAlert, Car, Boxes]

export default function WhatWeSource() {
  const { t } = useI18n()
  usePageTitle('ماذا نوفر | قطع غيار، معدات صناعية وطبية ومنتجات متخصصة', 'What We Source | Spare Parts, Industrial & Medical Equipment')

  return (
    <>
      <section className="border-b border-border py-20 text-center">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">{t.whatWeSourcePage.hero.eyebrow}</span>
          <h1 className="mt-3 text-balance text-4xl font-extrabold tracking-tight text-text sm:text-5xl">{t.whatWeSourcePage.hero.title}</h1>
          <p className="mt-5 text-lg text-text-muted">{t.whatWeSourcePage.hero.sub}</p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {t.whatWeSourcePage.categories.map((cat, i) => {
              const Icon = icons[i % icons.length]
              return (
                <CardHover key={cat.title} className="p-7">
                  <Icon className="h-6 w-6 text-gold" />
                  <h3 className="mt-4 text-lg font-bold text-text">{cat.title}</h3>
                  <p className="mt-1.5 text-sm text-text-muted">{cat.desc}</p>
                </CardHover>
              )
            })}

            <div className="flex flex-col items-start justify-center gap-2 rounded-2xl border border-dashed border-gold/40 bg-gold/5 p-7">
              <PackagePlus className="h-6 w-6 text-gold" />
              <h3 className="text-lg font-bold text-text">{t.whatWeSourcePage.otherTitle}</h3>
              <p className="text-sm text-text-muted">{t.whatWeSourcePage.otherDesc}</p>
              <Button to="/request" variant="secondary" size="sm" className="mt-2">
                {t.nav.requestQuote} <DirArrow />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
