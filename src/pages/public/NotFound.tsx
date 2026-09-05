import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  const { t } = useI18n()
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <span className="font-mono text-sm font-medium text-primary">404</span>
      <h1 className="mt-3 text-4xl font-extrabold text-text">{t.notFound.title}</h1>
      <p className="mt-3 max-w-sm text-text-muted">{t.notFound.body}</p>
      <Button to="/" className="mt-8">
        {t.common.backHome}
      </Button>
    </section>
  )
}
