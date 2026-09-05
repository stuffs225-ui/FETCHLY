import { Compass } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DirArrow } from '@/components/ui/DirArrow'
import GlobeStage from '@/components/three/GlobeStage'
import { useI18n } from '@/i18n'
import { contentOverridesStore } from '@/lib/repo'
import { useCollectionVersion } from '@/lib/useCollection'

export default function Hero() {
  useCollectionVersion()
  const { t, locale } = useI18n()
  const overrides = contentOverridesStore.get()
  const headline = (locale === 'ar' ? overrides.heroHeadlineAr : overrides.heroHeadlineEn) || t.hero.headline
  const sub = (locale === 'ar' ? overrides.heroSubAr : overrides.heroSubEn) || t.hero.sub

  return (
    <section className="relative overflow-hidden pb-20 pt-16 sm:pb-28 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.4] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_20%,black,transparent)]" />
      <div className="pointer-events-none absolute -top-32 start-1/2 h-[36rem] w-[36rem] -translate-x-1/2 animate-drift rounded-full bg-gold/10 blur-[130px]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:px-8">
        <div className="text-center lg:text-start">
          <div className="animate-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-sm font-medium text-gold">
            <Compass className="h-3.5 w-3.5" />
            {t.hero.eyebrow}
          </div>

          <h1 className="animate-fade-up text-balance text-4xl font-extrabold leading-[1.2] tracking-tight text-text sm:text-5xl lg:text-[3.4rem]" style={{ animationDelay: '80ms' }}>
            {headline}
          </h1>

          <p className="animate-fade-up mx-auto mt-6 max-w-xl text-balance text-lg leading-relaxed text-text-muted lg:mx-0" style={{ animationDelay: '160ms' }}>
            {sub}
          </p>

          <div className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start" style={{ animationDelay: '240ms' }}>
            <Button to="/request" size="lg">
              {t.hero.ctaPrimary} <DirArrow />
            </Button>
            <Button to="/how-it-works" variant="secondary" size="lg">
              {t.hero.ctaSecondary}
            </Button>
          </div>
        </div>

        <div className="animate-fade-in relative mx-auto aspect-square w-full max-w-lg lg:max-w-none" style={{ animationDelay: '200ms' }}>
          <GlobeStage className="h-full w-full" />
        </div>
      </div>
    </section>
  )
}
