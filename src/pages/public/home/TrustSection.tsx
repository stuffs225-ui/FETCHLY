import { BadgeCheck } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { DirArrow } from '@/components/ui/DirArrow'
import { credentialsRepo } from '@/lib/repo'
import { useCollectionVersion } from '@/lib/useCollection'

/** Real Saudi trust indicators — the whole section stays hidden until at least one credential has real data configured in Admin. Never shows a placeholder or "pending" state publicly. */
export default function TrustSection() {
  useCollectionVersion()
  const { t, locale } = useI18n()
  const credentials = credentialsRepo.list().filter((c) => c.visible && c.number && c.number.trim() !== '')

  if (credentials.length === 0) return null

  return (
    <section className="border-y border-border bg-surface py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-text">
            <BadgeCheck className="h-4.5 w-4.5 text-emerald" />
            {t.trustStrip.title}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {credentials.map((c) => (
              <span key={c.id} className="text-xs font-medium text-text-muted">
                {locale === 'ar' ? c.labelAr : c.labelEn}
              </span>
            ))}
          </div>
          <Button to="/trust" variant="secondary" size="sm">
            {t.trustSection.cta} <DirArrow />
          </Button>
        </div>
      </div>
    </section>
  )
}
