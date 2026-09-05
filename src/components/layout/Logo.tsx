import { Link } from 'react-router-dom'
import { useI18n } from '@/i18n'
import { companySettingsStore } from '@/lib/repo'
import { useCollectionVersion } from '@/lib/useCollection'
import { cn } from '@/lib/utils'

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  useCollectionVersion()
  const { locale } = useI18n()
  const settings = companySettingsStore.get()
  const name = locale === 'ar' ? settings.companyNameAr : settings.companyNameEn
  const logo = locale === 'ar' ? settings.logoArDataUrl || settings.logoDataUrl : settings.logoDataUrl

  return (
    <Link to="/" className={cn('flex items-center gap-2.5', className)}>
      {logo ? (
        <img src={logo} alt={name} className="h-9 w-auto object-contain" />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-gold/40 bg-gradient-to-br from-navy to-ink">
          <span className="font-bold text-gold">{name.replace('[', '').charAt(0)}</span>
        </span>
      )}
      <span className={cn('text-lg font-extrabold tracking-tight', dark ? 'text-text-ink' : 'text-text')}>{name}</span>
    </Link>
  )
}
