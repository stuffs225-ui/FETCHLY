import { FileBadge2 } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { DirArrow } from '@/components/ui/DirArrow'

export default function TrustCta() {
  const { t } = useI18n()

  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <FileBadge2 className="mx-auto h-8 w-8 text-gold" />
        <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-text sm:text-3xl">{t.trustSection.title}</h2>
        <div className="mt-7">
          <Button to="/trust" variant="secondary">
            {t.trustSection.cta} <DirArrow />
          </Button>
        </div>
      </div>
    </section>
  )
}
