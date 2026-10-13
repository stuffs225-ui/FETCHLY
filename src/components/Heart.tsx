import { useId } from 'react'

export const HEART_PATH =
  'M50 88 C18 62, 2 42, 2 26 C2 12, 13 2, 27 2 C37 2, 45 7, 50 15 C55 7, 63 2, 73 2 C87 2, 98 12, 98 26 C98 42, 82 62, 50 88 Z'

export type HeartTone = 'a' | 'b'

/** A flat, softly shaded heart in the current theme's colour for that person. */
export function HeartShape({ tone, className }: { tone: HeartTone; className?: string }) {
  const id = useId()
  const c = `var(--heart-${tone})`
  return (
    <svg viewBox="0 0 100 90" className={className} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" style={{ stopColor: `color-mix(in srgb, ${c}, white 14%)` }} />
          <stop offset="1" style={{ stopColor: `color-mix(in srgb, ${c}, black 10%)` }} />
        </linearGradient>
      </defs>
      <path d={HEART_PATH} fill={`url(#${id})`} />
    </svg>
  )
}
