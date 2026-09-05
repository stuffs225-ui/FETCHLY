import { ShieldCheck, ExternalLink } from 'lucide-react'
import { useI18n } from '@/i18n'
import { credentialsRepo } from '@/lib/repo'
import { useCollectionVersion } from '@/lib/useCollection'

export function TrustBar() {
  useCollectionVersion()
  const { t, locale } = useI18n()
  const credentials = credentialsRepo.list().filter((c) => c.visible)

  return (
    <section className="border-t border-border bg-[#0d1420] py-14">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-9 flex items-center justify-center gap-2.5 text-center">
          <ShieldCheck className="h-5 w-5 text-emerald" />
          <h3 className="text-lg font-bold text-text">{t.trustBar.title}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {credentials.map((c) => (
            <div key={c.id} className="rounded-xl border border-border-light bg-white/[0.02] p-4 text-center">
              <p className="text-xs font-semibold text-text-muted">{locale === 'ar' ? c.labelAr : c.labelEn}</p>
              <p className="mt-2 truncate font-mono text-sm text-text" title={c.number}>
                {c.number || t.common.pendingConfig}
              </p>
              {c.verifyUrl && (
                <a href={c.verifyUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-gold hover:underline">
                  {t.common.verify} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
