import { useParams } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { legalDocs } from './legalContent'
import { getPublicCompany } from '@/lib/repo'
import { useAsyncData } from '@/lib/useAsync'
import { formatDate } from '@/lib/utils'
import NotFound from '@/pages/public/NotFound'
import { usePageTitle } from '@/lib/usePageTitle'

function fill(text: string, vars: Record<string, string>) {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
}

export default function LegalPage() {
  const { locale } = useI18n()
  const { slug } = useParams<{ slug: keyof typeof legalDocs }>()
  const doc = slug ? legalDocs[slug] : undefined
  const { data: settings } = useAsyncData(getPublicCompany, [])
  usePageTitle(doc?.titleAr ?? 'الصفحة غير موجودة', doc?.titleEn ?? 'Page Not Found')

  if (!doc) return <NotFound />

  const sections = locale === 'ar' ? doc.sectionsAr : doc.sectionsEn
  const vars = { company: (locale === 'ar' ? settings?.companyNameAr : settings?.companyNameEn) ?? '', email: settings?.businessEmail ?? '' }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{locale === 'ar' ? doc.titleAr : doc.titleEn}</h1>
        <p className="mt-2 text-sm text-text-muted">
          {locale === 'ar' ? 'آخر تحديث' : 'Last updated'}: {formatDate(new Date(), locale)}
        </p>

        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-lg font-bold text-text">{s.heading}</h2>
              <p className="mt-2 leading-relaxed text-text-muted">{fill(s.body, vars)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
