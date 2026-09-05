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
    <section className="relative overflow-hidden py-16 sm:py-20">
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[3fr_2fr] lg:gap-10 lg:px-8">
        <div className="text-center lg:text-start">
          <h1 className="text-balance text-4xl font-extrabold leading-[1.2] tracking-tight text-text sm:text-5xl">
            {headline}
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-balance text-lg leading-relaxed text-text-muted lg:mx-0">
            {sub}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
            <Button to="/request" size="lg">
              {t.hero.ctaPrimary} <DirArrow />
            </Button>
            <Button to="/how-it-works" variant="secondary" size="lg">
              {t.hero.ctaSecondary}
            </Button>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-sm font-medium text-text-muted lg:justify-start">
            {t.hero.tags.map((tag, i) => (
              <span key={tag} className="flex items-center gap-2">
                {i > 0 && <span className="text-border-light">•</span>}
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-sm rounded-2xl bg-navy p-4">
          <div className="aspect-square w-full">
            <GlobeStage className="h-full w-full" />
          </div>
        </div>
      </div>
    </section>
  )
}
