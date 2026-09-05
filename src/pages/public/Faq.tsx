import { useI18n } from '@/i18n'
import { Accordion } from '@/components/ui/Accordion'
import { faqsRepo } from '@/lib/repo'
import { useCollectionVersion } from '@/lib/useCollection'
import { usePageTitle } from '@/lib/usePageTitle'

export default function Faq() {
  useCollectionVersion()
  const { t, locale } = useI18n()
  usePageTitle('الأسئلة الشائعة', 'Frequently Asked Questions')
  const overrides = faqsRepo.list().filter((f) => f.published)
  const items = overrides.length > 0
    ? overrides.map((f) => ({ q: locale === 'ar' ? f.qAr : f.qEn, a: locale === 'ar' ? f.aAr : f.aEn }))
    : t.faqPage.items

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">{t.faqPage.hero.eyebrow}</span>
        <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">{t.faqPage.hero.title}</h1>
      </div>
      <div className="mx-auto mt-14 max-w-3xl px-6 lg:px-8">
        <Accordion items={items} />
      </div>
    </section>
  )
}
