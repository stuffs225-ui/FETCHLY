import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { HeartShape } from './Heart'
import type { DistanceInfo, PState, Who } from '@/lib/types'
import { vibrate } from '@/lib/prefs'
import { heartbeatSound } from '@/lib/sound'

const BASE_BPM: Record<Who, number> = { a: 76, b: 66 }
const TOGETHER_BPM = 71.5

const frac = (x: number) => x - Math.floor(x)
/** "lub-dub": a strong first beat and a softer second one. */
function pulse(p: number) {
  const d1 = Math.min(p, 1 - p)
  const d2 = p - 0.27
  return Math.exp(-((d1 / 0.055) ** 2)) + 0.55 * Math.exp(-((d2 / 0.06) ** 2))
}

/** Real distance → gap between the hearts, on a log scale (30 m ≈ touching, 1000 km ≈ far apart). */
function gapFor(meters: number | null, together: boolean) {
  if (meters === null) return together ? 78 : 210
  const t = Math.min(1, Math.max(0, Math.log10(Math.max(meters, 30) / 30) / Math.log10(1_000_000 / 30)))
  return 26 + t * 210
}

interface Props {
  me: Who
  partnerState: PState
  connected: boolean
  serverNow: () => number
  rippleTick: number
  sound: boolean
  distance: DistanceInfo
  onTouchPartner: () => void
}

interface Ring { id: number; i: 0 | 1 }

/** Both of you touched the other's heart within a few seconds of each other. */
const TOGETHER_TOUCH_MS = 3500

/**
 * Two hearts. Their gap on screen is the real distance between you. Whenever
 * you are both here, they lock onto the server clock and beat as one.
 */
export function HeartStage({ me, partnerState, connected, serverNow, rippleTick, sound, distance, onTouchPartner }: Props) {
  const together = connected && partnerState === 'here'
  const partner: Who = me === 'a' ? 'b' : 'a'

  const heartEls = useRef<(HTMLDivElement | null)[]>([null, null])
  const glowEls = useRef<(HTMLDivElement | null)[]>([null, null])
  const sim = useRef({ phase: [0.05, 0.55], bpm: [BASE_BPM[me], BASE_BPM[partner]], excite: [0, 0], beats: [0, 0], last: 0 })
  const live = useRef({ together, partnerState, connected, sound, me, partner, serverNow })
  useEffect(() => {
    live.current = { together, partnerState, connected, sound, me, partner, serverNow }
  })

  const [rings, setRings] = useState<Ring[]>([])
  const ringSeq = useRef(0)
  const spawnRef = useRef<(i: 0 | 1) => void>(() => {})
  useEffect(() => {
    spawnRef.current = (i) => setRings((r) => [...r.slice(-4), { id: ++ringSeq.current, i }])
  }, [])

  const [waves, setWaves] = useState<number[]>([])
  const lastTouch = useRef({ mine: 0, theirs: 0 })
  const waveSeq = useRef(0)
  const mutual = () => {
    const id = ++waveSeq.current
    setWaves((w) => [...w.slice(-1), id])
    sim.current.excite[0] = 1
    sim.current.excite[1] = 1
    vibrate([30, 50, 30, 50, 80])
  }

  const wasTogether = useRef(false)
  useEffect(() => {
    if (together && !wasTogether.current) vibrate([30, 60, 45])
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
          // Once settled, steer both hearts onto the shared server phase.
          if (L.together && s.excite[i] < 0.02 && Math.abs(s.bpm[i] - TOGETHER_BPM) < 0.8) {
            let d = frac((t * TOGETHER_BPM) / 60) - frac(s.phase[i])
            d -= Math.round(d)
            s.phase[i] += d * Math.min(1, dt * 2.5)
          }
          const beat = Math.floor(s.phase[i])
          if (beat > s.beats[i]) {
            s.beats[i] = beat
            spawnRef.current(i)
            if (i === 0) {
              if (L.sound) heartbeatSound()
            }
          }
        }

        const f = alive ? pulse(frac(s.phase[i])) : 0
        // A heart that isn't here doesn't beat: it only breathes, slowly, like a held breath.
        const breath = alive || !L.connected ? 0 : 0.5 + 0.5 * Math.sin(now / 1300)
        const el = heartEls.current[i]
        if (el) el.style.transform = `scale(${1 + 0.1 * f + s.excite[i] * 0.04 + breath * 0.05})`
        const glow = glowEls.current[i]
        if (glow) glow.style.opacity = String((!alive ? 0.04 + breath * 0.1 : 0.1) + 0.2 * f)
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
    const t = Date.now()
    lastTouch.current.theirs = t
    if (t - lastTouch.current.mine < TOGETHER_TOUCH_MS) mutual()
  }, [rippleTick]) // eslint-disable-line react-hooks/exhaustive-deps

  const touchPartner = () => {
    if (!connected) return
    sim.current.excite[1] = 1
    spawnRef.current(1)
    vibrate(14)
    onTouchPartner()
    const t = Date.now()
    lastTouch.current.mine = t
    if (t - lastTouch.current.theirs < TOGETHER_TOUCH_MS) mutual()
  }

  const gap = gapFor(distance.meters, together)
  const u = { x: 0.55, y: -0.83 }
  const pos = { me: { x: -u.x * gap * 0.5, y: -u.y * gap * 0.5 }, partner: { x: u.x * gap * 0.5, y: u.y * gap * 0.5 } }
  const C = { x: 160, y: 200 }
  const spring = { type: 'spring' as const, stiffness: 28, damping: 14, mass: 1.3 }
  const partnerOpacity = partnerState === 'gone' ? 0.38 : partnerState === 'away' ? 0.7 : 1

  const heart = (i: 0 | 1, who: Who) => {
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
            className="absolute -inset-10 rounded-full"
            style={{ background: `radial-gradient(closest-side, var(--heart-${who}), transparent 75%)` }}
          />
          {rings.filter((r) => r.i === i).map((r) => (
            <motion.span
              key={r.id}
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border"
              style={{ borderColor: `var(--heart-${who})` }}
              initial={{ scale: 0.95, opacity: 0.35 }}
              animate={{ scale: 2.1, opacity: 0 }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              onAnimationComplete={() => setRings((rs) => rs.filter((x) => x.id !== r.id))}
            />
          ))}
          <div ref={(el) => { heartEls.current[i] = el }} className="relative will-change-transform" style={{ filter: 'drop-shadow(0 8px 18px rgba(0,0,0,.18))' }}>
            <HeartShape tone={who} className="h-[88px] w-[98px]" />
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="relative mx-auto h-[400px] w-[320px] select-none" dir="ltr">
      <svg className="absolute inset-0" viewBox="0 0 320 400" fill="none" aria-hidden>
        <motion.line
          stroke="var(--mist)"
          strokeWidth="1"
          strokeDasharray="1.5 7"
          strokeLinecap="round"
          initial={false}
          animate={{ x1: C.x + pos.me.x, y1: C.y + pos.me.y, x2: C.x + pos.partner.x, y2: C.y + pos.partner.y, opacity: gap > 90 ? 0.55 : 0 }}
          transition={spring}
        />
      </svg>

      {waves.map((id) => (
        <span key={id} className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0" aria-hidden>
          {[0, 1, 2].map((k) => (
            <span
              key={k}
              className="nb-wave absolute h-28 w-28 rounded-full border-2"
              style={{ borderColor: k === 1 ? 'var(--heart-b)' : k === 2 ? 'var(--heart-a)' : 'var(--accent)', animationDelay: `${k * 0.45}s` }}
              onAnimationEnd={() => { if (k === 2) setWaves((w) => w.filter((x) => x !== id)) }}
            />
          ))}
        </span>
      ))}

      {heart(0, me)}
      {heart(1, partner)}

      <motion.button
        type="button"
        aria-label="المس قلبه"
        onClick={touchPartner}
        className="absolute left-1/2 top-1/2 h-[100px] w-[110px] -translate-x-1/2 -translate-y-1/2 rounded-full outline-none"
        style={{ zIndex: 3, background: 'transparent' }}
        initial={false}
        animate={{ x: pos.partner.x, y: pos.partner.y }}
        transition={spring}
        whileTap={{ scale: 0.94 }}
      />
    </div>
  )
}
