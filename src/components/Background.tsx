import { useEffect, useState } from 'react'
import { skyNow } from '@/lib/time'

const WASH = {
  dawn: 'linear-gradient(180deg, rgba(255,176,140,.09), transparent 60%)',
  day: 'linear-gradient(180deg, rgba(255,244,214,.07), transparent 55%)',
  dusk: 'linear-gradient(180deg, rgba(228,118,104,.10), rgba(120,80,150,.05) 55%, transparent 80%)',
  night: 'linear-gradient(180deg, rgba(46,64,130,.12), transparent 65%)',
} as const

/** A quiet backdrop: flat colour with the faintest light from above, tinted by the real hour. When they are together it warms very slightly. */
export function Background({ together }: { together: boolean }) {
  const [phase, setPhase] = useState(() => skyNow().phase)
  useEffect(() => {
    const id = setInterval(() => setPhase(skyNow().phase), 60_000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-night" aria-hidden>
      {(Object.keys(WASH) as (keyof typeof WASH)[]).map((k) => (
        <div key={k} className="absolute inset-0 transition-opacity duration-[6000ms] ease-in-out" style={{ opacity: phase === k ? 1 : 0, background: WASH[k] }} />
      ))}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(90% 60% at 50% 0%, color-mix(in srgb, var(--accent) 7%, transparent), transparent 70%)' }} />
      <div
        className="absolute inset-0 transition-opacity duration-[3000ms] ease-out"
        style={{ opacity: together ? 1 : 0, background: 'radial-gradient(60% 45% at 50% 40%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 75%)' }}
      />
    </div>
  )
}
