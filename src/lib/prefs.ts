import { useCallback, useState } from 'react'

const read = (key: string, fallback: boolean) => {
  try {
    const v = localStorage.getItem(key)
    return v === null ? fallback : v === '1'
  } catch {
    return fallback
  }
}

/** A boolean preference persisted per device. */
export function usePref(key: string, fallback = false) {
  const [value, setValue] = useState(() => read(key, fallback))
  const set = useCallback((v: boolean) => {
    setValue(v)
    try {
      localStorage.setItem(key, v ? '1' : '0')
    } catch { /* private mode */ }
  }, [key])
  return [value, set] as const
}

export const vibrate = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern)
  } catch { /* unsupported */ }
}
