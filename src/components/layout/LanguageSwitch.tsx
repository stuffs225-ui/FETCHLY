import { useI18n } from '@/i18n'
import { cn } from '@/lib/utils'

export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale } = useI18n()
  return (
    <div className={cn('inline-flex items-center gap-1 rounded-full border border-border-light bg-surface p-1 text-xs font-semibold', className)}>
      <button
        onClick={() => setLocale('ar')}
        className={cn('rounded-full px-2.5 py-1 transition-colors', locale === 'ar' ? 'bg-primary text-white' : 'text-text-muted hover:text-text')}
      >
        العربية
      </button>
      <button
        onClick={() => setLocale('en')}
        className={cn('rounded-full px-2.5 py-1 transition-colors', locale === 'en' ? 'bg-primary text-white' : 'text-text-muted hover:text-text')}
      >
        EN
      </button>
    </div>
  )
}
