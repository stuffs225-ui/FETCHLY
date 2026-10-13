import { useEffect, useMemo, useRef } from 'react'

function Stars() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let raf = 0
    const stars = Array.from({ length: 70 }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * 1.1 + 0.3, s: Math.random() * 0.9 + 0.3, p: Math.random() * 6.28,
    }))
    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    let last = 0
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw)
      if (!reduce && t - last < 60) return
      last = t
      ctx.clearRect(0, 0, w, h)
      for (const s of stars) {
        const a = 0.18 + 0.5 * (0.5 + 0.5 * Math.sin(t / 1000 * s.s + s.p))
        ctx.fillStyle = `rgba(255,236,244,${a})`
        ctx.beginPath()
        ctx.arc(s.x * w, s.y * h, s.r, 0, 6.283)
        ctx.fill()
      }
    }
    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])
  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />
}

/** Slow aurora + stars. When the two are together the whole room warms up. */
export function Background({ together }: { together: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-night" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_0%,#2a1745_0%,#1a1030_45%,#0d0a16_100%)]" />
      <div className="absolute -start-[20vw] top-[8vh] h-[60vh] w-[70vw] animate-drift-a rounded-full bg-[#5b2a86]/35 blur-[90px]" />
      <div className="absolute -end-[25vw] top-[35vh] h-[55vh] w-[70vw] animate-drift-b rounded-full bg-[#b23a6b]/25 blur-[100px]" />
      <div className="absolute bottom-[-10vh] start-[10vw] h-[45vh] w-[65vw] animate-drift-c rounded-full bg-[#2a4fa8]/20 blur-[100px]" />
      <Stars />
      <div
        className="absolute inset-0 transition-opacity duration-[2500ms] ease-out"
        style={{ opacity: together ? 1 : 0, background: 'radial-gradient(70% 55% at 50% 42%, rgba(255,107,139,.22), rgba(255,107,139,0) 70%)' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_50%,transparent_55%,rgba(0,0,0,.45)_100%)]" />
    </div>
  )
}

/** Falling petals — only while they are together. */
export function Petals() {
  const petals = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({
      left: `${(i * 97) % 100}%`,
      delay: `${-(i * 1.9)}s`,
      dur: `${11 + (i % 5) * 2}s`,
      size: 8 + (i % 4) * 3,
      hue: i % 2 ? '#ff9db8' : '#ffc4b3',
    })),
    [],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {petals.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 animate-petal rounded-[60%_40%_60%_40%] opacity-0"
          style={{ left: p.left, width: p.size, height: p.size * 1.3, background: p.hue, animationDelay: p.delay, animationDuration: p.dur, filter: 'blur(.4px)' }}
        />
      ))}
    </div>
  )
}
