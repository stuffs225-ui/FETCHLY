import { useId } from 'react'

export const HEART_PATH =
  'M50 88 C18 62, 2 42, 2 26 C2 12, 13 2, 27 2 C37 2, 45 7, 50 15 C55 7, 63 2, 73 2 C87 2, 98 12, 98 26 C98 42, 82 62, 50 88 Z'

export type HeartTone = 'warm' | 'rose'

const stops: Record<HeartTone, [string, string, string]> = {
  warm: ['#ffc6a8', '#ff7a8a', '#d2457c'],
  rose: ['#ff9fc8', '#ff6aa8', '#8e4fe0'],
}

export function HeartShape({ tone, className }: { tone: HeartTone; className?: string }) {
  const id = useId()
  const [a, b, c] = stops[tone]
  return (
    <svg viewBox="0 0 100 90" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="0.55" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
        <radialGradient id={`${id}s`} cx="32%" cy="26%" r="40%">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={HEART_PATH} fill={`url(#${id})`} />
      <path d={HEART_PATH} fill={`url(#${id}s)`} />
    </svg>
  )
}
