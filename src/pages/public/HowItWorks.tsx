import { useI18n } from '@/i18n'
import { Accordion } from '@/components/ui/Accordion'
import { Button } from '@/components/ui/Button'
import { DirArrow } from '@/components/ui/DirArrow'
import { usePageTitle } from '@/lib/usePageTitle'

export default function HowItWorks() {
  const { t } = useI18n()
  const faqs = t.faqPage.items.slice(0, 4)
  usePageTitle('كيف نعمل | من احتياجك إلى عرض السعر', 'How It Works | From Your Requirement to a Quotation')

  return (
    <>
      <section className="border-b border-border py-20 text-center">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">{t.howItWorksPage.hero.eyebrow}</span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">{t.howItWorksPage.hero.title}</h1>
          <p className="mt-5 text-lg text-text-muted">{t.howItWorksPage.hero.sub}</p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="relative space-y-12 border-s-2 border-border ps-10 sm:ps-14">
            {t.howItWorksPage.steps.map((step) => (
              <div key={step.num} className="relative">
                <div className="absolute -start-[3.15rem] top-0 flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary bg-ink font-mono text-sm font-bold text-primary sm:-start-[4.15rem]">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-text">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-text-muted">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button to="/request" size="lg">
              {t.hero.ctaPrimary} <DirArrow />
            </Button>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface/60 py-20">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-text">{t.howItWorksPage.faqTitle}</h2>
          <div className="mt-10">
            <Accordion items={faqs} />
          </div>
        </div>
      </section>
    </>
  )
}
