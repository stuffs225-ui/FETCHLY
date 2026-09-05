import { useI18n } from '@/i18n'
import { RequestForm } from '@/components/RequestForm'

export default function RequestSection() {
  const { t } = useI18n()

  return (
    <section id="request" className="border-t border-border py-24">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{t.requestSection.title}</h2>
        <p className="mt-3 text-text-muted">{t.requestSection.sub}</p>
      </div>
      <div className="mt-12 px-6 lg:px-8">
        <RequestForm />
      </div>
    </section>
  )
}
