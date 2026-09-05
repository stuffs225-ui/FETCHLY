import { ExternalLink, FileText, ShieldCheck } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Card } from '@/components/ui/Card'
import { getPublicCredentials } from '@/lib/repo'
import { useAsyncData } from '@/lib/useAsync'
import { formatDate } from '@/lib/utils'
import { usePageTitle } from '@/lib/usePageTitle'

export default function Trust() {
  const { t, locale } = useI18n()
  usePageTitle('الموثوقية والامتثال | الوضوح يبدأ من بياناتنا', 'Trust & Compliance | Clarity Starts With Our Data')
  const p = t.trustPage
  const { data: credentials } = useAsyncData(getPublicCredentials, [])

  return (
    <>
      <section className="border-b border-border py-20 text-center">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-primary">{p.hero.eyebrow}</span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-text sm:text-5xl">{p.hero.title}</h1>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          {!credentials || credentials.length === 0 ? (
            <p className="text-center text-text-muted">{p.empty}</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {credentials.map((c) => (
                <Card key={c.id} className="p-6">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-5 w-5 text-emerald" />
                    <h3 className="font-bold text-text">{locale === 'ar' ? c.labelAr : c.labelEn}</h3>
                  </div>
                  <dl className="mt-4 space-y-2 text-sm">
                    {c.authority && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-text-muted">{p.fields.authority}</dt>
                        <dd className="text-text">{c.authority}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-3">
                      <dt className="text-text-muted">{p.fields.number}</dt>
                      <dd className="font-mono text-text">{c.number}</dd>
                    </div>
                    {c.issuedDate && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-text-muted">{p.fields.issued}</dt>
                        <dd className="text-text">{formatDate(c.issuedDate, locale)}</dd>
                      </div>
                    )}
                    {c.expiryDate && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-text-muted">{p.fields.expires}</dt>
                        <dd className="text-text">{formatDate(c.expiryDate, locale)}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="mt-4 flex items-center gap-4">
                    {c.verifyUrl && (
                      <a href={c.verifyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                        {p.fields.verify} <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {c.documentDataUrl && (
                      <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                        <FileText className="h-3 w-3" /> {p.fields.document}
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-border bg-surface/60 py-20">
        <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
          <h2 className="text-2xl font-extrabold text-text">{p.compliance.title}</h2>
          <p className="mt-4 text-sm leading-relaxed text-text-muted">{p.compliance.saber}</p>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">{p.compliance.sfda}</p>
        </div>
      </section>
    </>
  )
}
