import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ar } from './ar'
import { en } from './en'
import type { Dict } from './ar'

export type Locale = 'ar' | 'en'

const dictionaries: Record<Locale, Dict> = { ar, en }
const STORAGE_KEY = 'gs_locale'

interface I18nContextValue {
  locale: Locale
  dir: 'rtl' | 'ltr'
  t: Dict
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
}

const I18nContext = createContext<I18nContextValue | null>(null)

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'ar'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'en' ? 'en' : 'ar'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)

  const dir = dictionaries[locale].meta.dir

  useEffect(() => {
    document.documentElement.lang = dictionaries[locale].meta.lang
    document.documentElement.dir = dir
    window.localStorage.setItem(STORAGE_KEY, locale)
  }, [locale, dir])

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      dir,
      t: dictionaries[locale],
      setLocale: setLocaleState,
      toggleLocale: () => setLocaleState((prev) => (prev === 'ar' ? 'en' : 'ar')),
    }),
    [locale, dir],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
