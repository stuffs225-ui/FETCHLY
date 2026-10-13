import { useId } from 'react'

/** A corked glass bottle with a rolled note inside. */
export function BottleArt({ className, glow = true }: { className?: string; glow?: boolean }) {
  const id = useId()
  return (
    <svg viewBox="0 0 60 120" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#bfe6ff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ffc6dc" stopOpacity="0.5" />
        </linearGradient>
        {glow && (
          <filter id={`${id}f`} x="-60%" y="-30%" width="220%" height="160%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        )}
      </defs>
      {glow && <path d="M22 26 H38 V38 C50 46 54 58 54 76 V98 C54 108 48 114 38 114 H22 C12 114 6 108 6 98 V76 C6 58 10 46 22 38 Z" fill="#ff9cc0" opacity="0.35" filter={`url(#${id}f)`} />}
      <rect x="23" y="8" width="14" height="14" rx="3" fill="#d9a46e" />
      <rect x="23" y="8" width="14" height="5" rx="2.5" fill="#efc48f" />
      <path d="M22 22 H38 V38 C50 46 54 58 54 76 V98 C54 108 48 114 38 114 H22 C12 114 6 108 6 98 V76 C6 58 10 46 22 38 Z" fill={`url(#${id}g)`} stroke="rgba(255,255,255,.55)" strokeWidth="1.2" />
      <rect x="20" y="62" width="20" height="38" rx="9" fill="#fff4e6" transform="rotate(-12 30 80)" opacity="0.95" />
      <path d="M24 70 H35 M24 76 H36 M25 82 H33" stroke="#e3a3b8" strokeWidth="1.3" strokeLinecap="round" transform="rotate(-12 30 80)" />
      <path d="M13 56 C13 66 13 78 14 92" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}
