import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { DirArrow } from '@/components/ui/DirArrow'

export default function HowItWorksHome() {
  const { t } = useI18n()

  return (
    <section className="border-t border-border py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{t.howItWorksHome.title}</h2>

        <div className="relative mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="absolute top-8 start-0 end-0 hidden h-px bg-gradient-to-r from-transparent via-border-light to-transparent sm:block" />
          {t.howItWorksHome.steps.map((step) => (
            <div key={step.num} className="relative text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/40 bg-ink font-mono text-xl font-bold text-gold">
                {step.num}
              </div>
              <h3 className="mt-5 text-lg font-bold text-text">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button to="/how-it-works" variant="secondary">
            {t.common.learnMore} <DirArrow />
          </Button>
        </div>
      </div>
    </section>
  )
}
