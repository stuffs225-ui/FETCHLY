import { useI18n } from '@/i18n'
import { RequestForm } from '@/components/RequestForm'
import { usePageTitle } from '@/lib/usePageTitle'

export default function RequestPage() {
  const { t } = useI18n()
  usePageTitle('اطلب عرض سعر | أرسل ما لديك ونكمل الباقي', 'Request a Quote | Send What You Have, We Handle the Rest')

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gold">{t.nav.requestQuote}</span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{t.requestSection.title}</h1>
        <p className="mt-4 text-text-muted">{t.requestSection.sub}</p>
      </div>
      <div className="mt-12 px-6 lg:px-8">
        <RequestForm />
      </div>
    </section>
  )
}
