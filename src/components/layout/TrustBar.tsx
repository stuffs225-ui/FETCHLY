import { ShieldCheck, ExternalLink } from 'lucide-react'
import { useI18n } from '@/i18n'
import { getPublicCredentials } from '@/lib/repo'
import { useAsyncData } from '@/lib/useAsync'

/** Only real, configured credentials are ever shown — never a bracket placeholder or "pending" state, in line with not implying an unearned endorsement. */
export function TrustBar() {
  const { t, locale } = useI18n()
  const { data: credentials } = useAsyncData(getPublicCredentials, [])

  if (!credentials || credentials.length === 0) return null

  return (
    <section className="bg-navy py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-center gap-2.5 text-center">
          <ShieldCheck className="h-5 w-5 text-emerald" />
          <h3 className="text-lg font-bold text-white">{t.trustBar.title}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {credentials.map((c) => (
            <div key={c.id} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
              <p className="text-xs font-semibold text-white/60">{locale === 'ar' ? c.labelAr : c.labelEn}</p>
              <p className="mt-2 truncate font-mono text-sm text-white" title={c.number}>
                {c.number}
              </p>
              {c.verifyUrl && (
                <a href={c.verifyUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-white/80 hover:text-white hover:underline">
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
