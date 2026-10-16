import { useId } from 'react'

/** A corked glass bottle with a rolled note inside. `tint` colours the glass (the mood); `wax` is the sender's seal. */
export function BottleArt({ className, glow = true, tint, wax }: { className?: string; glow?: boolean; tint?: string | null; wax?: string | null }) {
  const id = useId()
  const t = tint ?? '#c9958f'
  return (
    <svg viewBox="0 0 60 120" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={tint ?? '#cfd8e3'} stopOpacity={tint ? 0.62 : 0.5} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="1" stopColor={tint ?? '#e7d3d0'} stopOpacity={tint ? 0.5 : 0.45} />
        </linearGradient>
        {glow && (
          <filter id={`${id}f`} x="-60%" y="-30%" width="220%" height="160%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        )}
      </defs>
      {glow && <path d="M22 26 H38 V38 C50 46 54 58 54 76 V98 C54 108 48 114 38 114 H22 C12 114 6 108 6 98 V76 C6 58 10 46 22 38 Z" fill={t} opacity={tint ? 0.4 : 0.2} filter={`url(#${id}f)`} />}
      <rect x="23" y="8" width="14" height="14" rx="3" fill="#d9a46e" />
      <rect x="23" y="8" width="14" height="5" rx="2.5" fill="#efc48f" />
      <path d="M22 22 H38 V38 C50 46 54 58 54 76 V98 C54 108 48 114 38 114 H22 C12 114 6 108 6 98 V76 C6 58 10 46 22 38 Z" fill={`url(#${id}g)`} stroke="rgba(255,255,255,.55)" strokeWidth="1.2" />
      <rect x="20" y="62" width="20" height="38" rx="9" fill="#fff4e6" transform="rotate(-12 30 80)" opacity="0.95" />
      <path d="M24 70 H35 M24 76 H36 M25 82 H33" stroke="#c9a2a0" strokeWidth="1.3" strokeLinecap="round" transform="rotate(-12 30 80)" />
      <path d="M13 56 C13 66 13 78 14 92" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" fill="none" />
      {wax && (
        <g>
          <circle cx="30" cy="30" r="7.5" style={{ fill: wax }} />
          <circle cx="30" cy="30" r="7.5" fill="none" stroke="rgba(0,0,0,.22)" strokeWidth="1" />
          <path d="M30 34.5 C26 31.8 24.8 30.2 24.8 28.8 C24.8 27.6 25.7 26.8 26.8 26.8 C27.7 26.8 28.5 27.2 30 28.4 C31.5 27.2 32.3 26.8 33.2 26.8 C34.3 26.8 35.2 27.6 35.2 28.8 C35.2 30.2 34 31.8 30 34.5 Z" fill="rgba(255,255,255,.55)" />
        </g>
      )}
    </svg>
  )
}
