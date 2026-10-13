import { useCallback, useEffect, useState } from 'react'

export type ThemeKey = 'night' | 'paper' | 'blue'

export const THEMES: { key: ThemeKey; label: string; base: string; a: string; b: string }[] = [
  { key: 'night', label: 'ليل هادئ', base: '#15171c', a: '#c9958f', b: '#8f9bb3' },
  { key: 'paper', label: 'ورق دافئ', base: '#f4efe8', a: '#c4756a', b: '#8493ad' },
  { key: 'blue', label: 'أزرق ناعم', base: '#101823', a: '#d6a08c', b: '#8fa8c4' },
]

const KEY = 'nabd_theme'

function apply(key: ThemeKey) {
  document.documentElement.dataset.theme = key
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEMES.find((t) => t.key === key)!.base)
}

export function initTheme() {
  let key: ThemeKey = 'night'
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'paper' || saved === 'blue' || saved === 'night') key = saved
  } catch { /* private mode */ }
  apply(key)
  return key
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeKey>(() => (document.documentElement.dataset.theme as ThemeKey) || 'night')
  useEffect(() => apply(theme), [theme])
  const choose = useCallback((k: ThemeKey) => {
    setTheme(k)
    try { localStorage.setItem(KEY, k) } catch { /* ignore */ }
  }, [])
  return [theme, choose] as const
}
