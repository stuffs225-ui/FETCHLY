import { useEffect } from 'react'
import { useI18n } from '@/i18n'

/** Sets document.title per route/locale — this SPA has no SSR, so this is the load-bearing per-page SEO signal. */
export function usePageTitle(titleAr: string, titleEn: string) {
  const { locale } = useI18n()
  useEffect(() => {
    document.title = locale === 'ar' ? titleAr : titleEn
  }, [locale, titleAr, titleEn])
}
