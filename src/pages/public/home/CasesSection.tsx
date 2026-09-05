import { useI18n } from '@/i18n'
import { getPublicCases } from '@/lib/repo'
import { useAsyncData } from '@/lib/useAsync'
import { Card } from '@/components/ui/Card'

export default function CasesSection() {
  const { t, locale } = useI18n()
  const { data: cases } = useAsyncData(getPublicCases, [])

  if (!cases || cases.length === 0) return null

  return (
    <section className="border-t border-border bg-surface/60 py-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{t.cases.title}</h2>

        <div className="mt-14 flex flex-wrap justify-center gap-6">
          {cases.map((c) => (
            <Card key={c.id} className="w-full p-6 sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]">
              <h3 className="text-lg font-bold text-text">{locale === 'ar' ? c.titleAr : c.titleEn}</h3>
              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-text-muted">{t.cases.sourceLabel}</dt>
                  <dd className="font-medium text-text">{locale === 'ar' ? c.sourceAr : c.sourceEn}</dd>
                </div>
                {(locale === 'ar' ? c.challengeAr : c.challengeEn) && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-text-muted">{t.cases.challengeLabel}</dt>
                    <dd className="text-end font-medium text-text">{locale === 'ar' ? c.challengeAr : c.challengeEn}</dd>
                  </div>
                )}
                {(locale === 'ar' ? c.solutionAr : c.solutionEn) && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-text-muted">{t.cases.solutionLabel}</dt>
                    <dd className="text-end font-medium text-text">{locale === 'ar' ? c.solutionAr : c.solutionEn}</dd>
                  </div>
                )}
              </dl>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
