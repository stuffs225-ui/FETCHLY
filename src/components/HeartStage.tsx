import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HeartShape } from './Heart'
import type { HeartTone } from './Heart'
import type { PState, Who } from '@/lib/types'
import { vibrate } from '@/lib/prefs'
import { heartbeatSound } from '@/lib/sound'

const BASE_BPM: Record<Who, number> = { a: 66, b: 77 }
const TOGETHER_BPM = 71.5
const TONE: Record<Who, HeartTone> = { a: 'warm', b: 'rose' }

const frac = (x: number) => x - Math.floor(x)
/** "lub-dub": a strong first beat and a softer second one. */
function pulse(p: number) {
  const d1 = Math.min(p, 1 - p)
  const d2 = p - 0.27
  return Math.exp(-((d1 / 0.055) ** 2)) + 0.55 * Math.exp(-((d2 / 0.06) ** 2))
}

interface Props {
  me: Who
  meName: string
  partnerName: string
  partnerState: PState
  connected: boolean
  serverNow: () => number
  rippleTick: number
  haptics: boolean
  sound: boolean
  onTouchPartner: () => void
}

interface Ring { id: number; i: 0 | 1 }

/**
 * Two hearts. Alone they float apart and beat at their own pace; when both are
 * here they drift together, lock onto the server clock and become one beat.
 */
export function HeartStage({ me, meName, partnerName, partnerState, connected, serverNow, rippleTick, haptics, sound, onTouchPartner }: Props) {
  const together = connected && partnerState === 'here'
  const partner: Who = me === 'a' ? 'b' : 'a'

  const heartEls = useRef<(HTMLDivElement | null)[]>([null, null])
  const glowEls = useRef<(HTMLDivElement | null)[]>([null, null])
  const sim = useRef({ phase: [0.05, 0.55], bpm: [BASE_BPM[me], BASE_BPM[partner]], excite: [0, 0], beats: [0, 0], last: 0 })
  const live = useRef({ together, partnerState, connected, haptics, sound, me, partner, serverNow })
  live.current = { together, partnerState, connected, haptics, sound, me, partner, serverNow }

  const [rings, setRings] = useState<Ring[]>([])
  const ringSeq = useRef(0)
  const spawnRing = (i: 0 | 1) => setRings((r) => [...r.slice(-5), { id: ++ringSeq.current, i }])
  const spawnRef = useRef(spawnRing)
  spawnRef.current = spawnRing

  const [bloom, setBloom] = useState(0)
  const wasTogether = useRef(false)
  useEffect(() => {
    if (together && !wasTogether.current) {
      setBloom((b) => b + 1)
      vibrate([30, 60, 45])
    }
    wasTogether.current = together
  }, [together])

  // The animation loop writes straight to the DOM — no React renders per frame.
  useEffect(() => {
    let raf = 0
    const s = sim.current
    s.last = performance.now()
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - s.last) / 1000, 0.1)
      s.last = now
      const L = live.current
      const t = L.serverNow() / 1000
      const breathe = (i: number) => Math.sin(t / 7.5 + i * 2.1) * 2.2

      for (const i of [0, 1] as const) {
        const who = i === 0 ? L.me : L.partner
        const alive = i === 0 ? L.connected : L.partnerState !== 'gone' && L.connected
        s.excite[i] = Math.max(0, s.excite[i] - dt / 7)

        let target = L.together ? TOGETHER_BPM : BASE_BPM[who] + breathe(i)
        if (i === 1 && L.partnerState === 'away') target = 54
        target += s.excite[i] * 26
        s.bpm[i] += (target - s.bpm[i]) * Math.min(1, dt * 2.2)

        if (alive) {
          s.phase[i] += (dt * s.bpm[i]) / 60
          // Once everything has settled, steer both hearts onto the shared server phase.
          if (L.together && s.excite[i] < 0.02 && Math.abs(s.bpm[i] - TOGETHER_BPM) < 0.8) {
            let d = frac(t * TOGETHER_BPM / 60) - frac(s.phase[i])
            d -= Math.round(d)
            s.phase[i] += d * Math.min(1, dt * 2.5)
          }
          const beat = Math.floor(s.phase[i])
          if (beat > s.beats[i]) {
            s.beats[i] = beat
            const strong = i === 1 || L.together
            if (strong || i === 0) spawnRef.current(i)
            if (i === 0) {
              if (L.sound) heartbeatSound()
              if (L.haptics && L.together) vibrate([14, 70, 22])
            }
          }
        }

        const f = alive ? pulse(frac(s.phase[i])) : 0
        const el = heartEls.current[i]
        if (el) el.style.transform = `scale(${1 + 0.14 * f + s.excite[i] * 0.04})`
        const glow = glowEls.current[i]
        if (glow) {
          const base = !alive ? 0.12 : i === 1 && L.partnerState === 'away' ? 0.3 : 0.45
          glow.style.opacity = String(base + 0.55 * f)
          glow.style.transform = `scale(${0.9 + 0.35 * f})`
        }
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // The other person touched my heart.
  useEffect(() => {
    if (rippleTick === 0) return
    sim.current.excite[0] = 1
    spawnRef.current(0)
    vibrate([20, 40, 20, 40, 30])
  }, [rippleTick])

  const touchPartner = () => {
    if (!connected) return
    sim.current.excite[1] = 1
    spawnRing(1)
    vibrate(14)
    onTouchPartner()
  }

  const spring = { type: 'spring' as const, stiffness: 34, damping: 13, mass: 1.2 }
  const pos = together
    ? { me: { x: 30, y: 0, scale: 1.18 }, partner: { x: -30, y: 0, scale: 1.18 } }
    : { me: { x: -62, y: 96, scale: 0.8 }, partner: { x: 62, y: -92, scale: 0.8 } }
  // RTL: slot "me" sits on the right visually; keep the heart geometry LTR so x offsets read as drawn.
  const partnerOpacity = partnerState === 'gone' ? 0.34 : partnerState === 'away' ? 0.7 : 1

  const heart = (i: 0 | 1, who: Who, name: string) => {
    const target = i === 0 ? pos.me : pos.partner
    return (
      <motion.div
        key={i}
        className="absolute start-1/2 top-1/2 h-0 w-0"
        style={{ zIndex: i === 1 ? 2 : 1 }}
        initial={false}
        animate={{ ...target, opacity: i === 1 ? partnerOpacity : 1 }}
        transition={{ ...spring, opacity: { duration: 1.4 } }}
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            ref={(el) => { glowEls.current[i] = el }}
            className="absolute -inset-16 rounded-full"
            style={{ background: `radial-gradient(closest-side, ${i === 0 ? 'rgba(255,140,120,.55)' : 'rgba(255,100,170,.5)'}, transparent 72%)` }}
          />
          {rings.filter((r) => r.i === i).map((r) => (
            <motion.span
              key={r.id}
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{ borderColor: i === 0 ? 'rgba(255,170,140,.7)' : 'rgba(255,130,190,.7)' }}
              initial={{ scale: 0.9, opacity: 0.7 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 1.9, ease: 'easeOut' }}
              onAnimationComplete={() => setRings((rs) => rs.filter((x) => x.id !== r.id))}
            />
          ))}
          <div
            ref={(el) => { heartEls.current[i] = el }}
            className="relative will-change-transform"
            style={{ filter: 'drop-shadow(0 6px 22px rgba(255,90,140,.35))' }}
          >
            <HeartShape tone={TONE[who]} className="h-[98px] w-[110px]" />
          </div>
        </div>
        <AnimatePresence>
          {!together && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-1/2 top-[62px] -translate-x-1/2 whitespace-nowrap text-xs font-medium text-mist"
            >
              {name}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <div className="relative mx-auto h-[400px] w-[320px] select-none" dir="ltr">
      {/* faint thread between the two hearts */}
      <svg className="absolute inset-0" viewBox="0 0 320 400" fill="none" aria-hidden>
        <motion.path
          d="M98 296 C 130 230, 190 170, 222 108"
          stroke="rgba(255,200,215,.35)"
          strokeWidth="1.2"
          strokeDasharray="2 7"
          strokeLinecap="round"
          initial={false}
          animate={{ opacity: together ? 0 : 0.8 }}
          transition={{ duration: 1.2 }}
        />
      </svg>

      <AnimatePresence>
        {bloom > 0 && together && (
          <motion.div
            key={bloom}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ background: 'radial-gradient(closest-side, rgba(255,210,225,.65), rgba(255,120,160,.25) 45%, transparent 72%)' }}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 0], scale: [0.4, 1.1, 1.5] }}
            transition={{ duration: 2.4, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {heart(0, me, meName)}
      {heart(1, partner, partnerName)}

      {/* touch target on the partner's heart */}
      <motion.button
        type="button"
        aria-label={`المس قلب ${partnerName}`}
        onClick={touchPartner}
        className="absolute left-1/2 top-1/2 h-[104px] w-[116px] -translate-x-1/2 -translate-y-1/2 rounded-full outline-none"
        style={{ zIndex: 3, background: 'transparent' }}
        initial={false}
        animate={{ x: pos.partner.x, y: pos.partner.y }}
        transition={spring}
        whileTap={{ scale: 0.92 }}
      />
    </div>
  )
}
