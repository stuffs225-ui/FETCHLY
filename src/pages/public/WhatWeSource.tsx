import { Factory, Wrench, Package, Stethoscope, Cpu, Droplet, PackagePlus } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { DirArrow } from '@/components/ui/DirArrow'
import { usePageTitle } from '@/lib/usePageTitle'

const icons = [Factory, Wrench, Package, Stethoscope, Cpu, Droplet]

export default function WhatWeSource() {
  const { t } = useI18n()
  usePageTitle('ماذا نوفر | قطع غيار، معدات صناعية وطبية ومنتجات متخصصة', 'What We Source | Spare Parts, Industrial & Medical Equipment')

  return (
    <>
      <section className="border-b border-border py-16 text-center">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">{t.whatWeSourcePage.hero.eyebrow}</span>
          <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{t.whatWeSourcePage.hero.title}</h1>
          <p className="mt-5 text-lg text-text-muted">{t.whatWeSourcePage.hero.sub}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="divide-y divide-border border-t border-border">
            {t.whatWeSourcePage.categories.map((cat, i) => {
              const Icon = icons[i % icons.length]
              return (
                <div key={cat.title} className="flex flex-col gap-3 py-6 sm:flex-row sm:items-start sm:gap-8">
                  <div className="flex items-center gap-3 sm:w-72 sm:shrink-0">
                    <Icon className="h-5 w-5 shrink-0 text-primary" />
                    <h3 className="text-base font-bold text-text">{cat.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-text-muted sm:flex-1">{cat.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-8 flex flex-col items-start gap-2 border-t border-dashed border-primary/30 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <PackagePlus className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <h3 className="text-base font-bold text-text">{t.whatWeSourcePage.otherTitle}</h3>
                <p className="mt-0.5 text-sm text-text-muted">{t.whatWeSourcePage.otherDesc}</p>
              </div>
            </div>
            <Button to="/request" variant="secondary" size="sm" className="shrink-0">
              {t.nav.requestQuote} <DirArrow />
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
