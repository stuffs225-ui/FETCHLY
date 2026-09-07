import { Link } from 'react-router-dom'
import { Globe2 } from 'lucide-react'
import { useI18n } from '@/i18n'
import { getPublicCompany } from '@/lib/repo'
import { useAsyncData } from '@/lib/useAsync'
import { cn } from '@/lib/utils'

export function Logo({ className, dark }: { className?: string; dark?: boolean }) {
  const { locale } = useI18n()
  const { data: settings } = useAsyncData(getPublicCompany, [])
  const name = (locale === 'ar' ? settings?.companyNameAr : settings?.companyNameEn)?.trim() ?? ''
  const logo = locale === 'ar' ? settings?.logoArDataUrl || settings?.logoDataUrl : settings?.logoDataUrl

  return (
    <Link to="/" className={cn('flex min-w-0 items-center gap-2.5', className)}>
      {logo ? (
        <img src={logo} alt={name || 'logo'} className="h-9 w-auto shrink-0 object-contain" />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy">
          {name ? <span className="font-bold text-white">{name.charAt(0)}</span> : <Globe2 className="h-4.5 w-4.5 text-white" />}
        </span>
      )}
      {name && (
        <span className={cn('truncate text-base font-extrabold tracking-tight sm:text-lg', dark ? 'text-white' : 'text-text')}>
          {name}
        </span>
      )}
    </Link>
  )
}
