import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Pencil, Send, Sparkles } from 'lucide-react'
import { BottleArt } from './BottleArt'
import { BottleReveal } from './BottleReveal'
import type { RevealState } from './BottleReveal'
import { WriteBottle } from './WriteBottle'
import { BottleLists } from './BottleLists'
import { Sky } from './Sky'
import { ThrowRitual } from './ThrowRitual'
import type { ThrowInfo } from './ThrowRitual'
import { api } from '@/lib/api'
import type { Bottle, SeaSummary, Who } from '@/lib/types'
import type { Copy } from '@/lib/copy'
import { moodColor } from '@/lib/moods'
import { dateText, num, skyNow } from '@/lib/time'
import { useShake } from '@/lib/shake'
import { useToast } from './toastContext'

type DrawResponse = { empty: true; lockedUntil: number | null } | { bottle: Bottle; fresh: boolean; waiting: number }

const SLOTS = [
  { left: '16%', top: '42%', delay: '0s', scale: 1 },
  { left: '60%', top: '36%', delay: '-1.8s', scale: 0.86 },
  { left: '38%', top: '54%', delay: '-3.2s', scale: 1.08 },
  { left: '78%', top: '52%', delay: '-4.4s', scale: 0.8 },
  { left: '4%', top: '62%', delay: '-2.6s', scale: 0.76 },
]

const SKY_TINT = {
  night: 'linear-gradient(to bottom, rgba(8,10,30,.5), transparent 72%)',
  dawn: 'linear-gradient(to bottom, rgba(255,170,130,.2), transparent 68%)',
  day: 'linear-gradient(to bottom, rgba(255,236,200,.1), transparent 62%)',
  dusk: 'linear-gradient(to bottom, rgba(200,110,130,.24), transparent 68%)',
} as const

const days = (d: number) => (d === 1 ? 'يوم' : d === 2 ? 'يومين' : d <= 10 ? `${num(d)} أيام` : `${num(d)} يومًا`)

/** The swell quickens while a bottle is on its way to you, then settles. */
function Waves({ rate }: { rate: number }) {
  const box = useRef<HTMLDivElement>(null)
  const cur = useRef(1)
  useEffect(() => {
    let raf = 0
    const step = () => {
      cur.current += (rate - cur.current) * 0.03
      box.current?.getAnimations({ subtree: true }).forEach((a) => { a.playbackRate = cur.current })
      if (Math.abs(rate - cur.current) > 0.01) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [rate])
  const wave = 'M0 40 C 150 10, 300 70, 450 40 S 750 10, 900 40 S 1200 70, 1350 40 S 1650 10, 1800 40 V 200 H 0 Z'
  return (
    <div ref={box} dir="ltr" className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] overflow-hidden" aria-hidden>
      {[
        { cls: 'animate-wave-slow opacity-60', top: '0%', fill: 'var(--sea-3)', w: '200%' },
        { cls: 'animate-wave opacity-80', top: '14%', fill: 'var(--sea-2)', w: '200%' },
        { cls: 'animate-wave-slow opacity-95', top: '30%', fill: 'var(--sea-1)', w: '200%' },
      ].map((l, i) => (
        <svg key={i} viewBox="0 0 1800 200" preserveAspectRatio="none" className={`absolute left-0 h-full ${l.cls}`} style={{ top: l.top, width: l.w }}>
          <path d={wave} fill={l.fill} />
        </svg>
      ))}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-night to-transparent" />
    </div>
  )
}

function ShootingStar() {
  const [gone, setGone] = useState(false)
  if (gone) return null
  return (
    <motion.div
      className="pointer-events-none absolute left-[72%] top-[10%] z-20 h-[2px] w-24 origin-right rounded-full bg-gradient-to-l from-white to-transparent"
      style={{ rotate: -32 }}
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{ x: -230, y: -145, opacity: [0, 1, 0] }}
      transition={{ duration: 1.3, ease: 'easeIn' }}
      onAnimationComplete={() => setGone(true)}
    />
  )
}

function Lantern({ left, top, delay }: { left: string; top: string; delay: number }) {
  return (
    <motion.div
      className="pointer-events-none absolute z-[5] h-5 w-4 rounded-[40%_40%_50%_50%]"
      style={{ left, top, background: 'radial-gradient(circle at 50% 40%, #fff3d2, var(--accent) 70%)', boxShadow: '0 0 22px 6px color-mix(in srgb, var(--accent) 55%, transparent)' }}
      animate={{ y: [0, -14, 0], opacity: [0.75, 1, 0.75] }}
      transition={{ duration: 5 + delay, repeat: Infinity, ease: 'easeInOut', delay }}
    />
  )
}

export function Sea({ me, waiting, copy, onWaiting, active, fxTick }: { me: Who; waiting: number; copy: Copy; onWaiting: (n: number) => void; active: boolean; fxTick: number }) {
  const toast = useToast()
  const [view, setView] = useState<'sea' | 'sky'>('sea')
  const [summary, setSummary] = useState<SeaSummary | null>(null)
  const [reveal, setReveal] = useState<RevealState | null>(null)
  const [writing, setWriting] = useState(false)
  const [list, setList] = useState(false)
  const [ritual, setRitual] = useState<ThrowInfo | null>(null)
  const [ownFx, setOwnFx] = useState(0)
  const [clock, setClock] = useState(() => Date.now())
  const busy = useRef(false)

  const refresh = useCallback(() => {
    api.get<SeaSummary>('/bottles/sea').then(setSummary).catch(() => {})
  }, [])
  useEffect(refresh, [refresh, waiting, fxTick])
  useEffect(() => {
    const id = setInterval(() => { setClock(Date.now()); refresh() }, 60_000)
    return () => clearInterval(id)
  }, [refresh])

  const draw = useCallback(async () => {
    if (busy.current) return
    busy.current = true
    setReveal({ phase: 'shaking' })
    const started = Date.now()
    try {
      const res = await api.post<DrawResponse>('/bottles/draw')
      await new Promise((r) => setTimeout(r, Math.max(0, 1500 - (Date.now() - started))))
      if ('empty' in res) setReveal({ phase: 'empty', lockedUntil: res.lockedUntil })
      else {
        setReveal({ phase: 'open', bottle: res.bottle, fresh: res.fresh })
        onWaiting(res.waiting)
        if (res.fresh) setOwnFx((n) => n + 1)
        refresh()
      }
    } catch {
      setReveal(null)
      toast(copy.toast.error)
    } finally {
      busy.current = false
    }
  }, [copy.toast.error, onWaiting, refresh, toast])

  const shake = useShake(active && view === 'sea' && !reveal && !writing && !list && !ritual, draw)
  const sky = skyNow(new Date(clock))
  const bottles = summary?.inbound.slice(0, SLOTS.length) ?? Array.from({ length: Math.min(waiting, SLOTS.length) }, (_, i) => ({ id: -i - 1, mood: null, author: me === 'a' ? 'b' : ('a' as Who) }))
  const lockedList = summary?.locked ?? []
  const sailing = (summary?.sailing ?? []).slice(0, 3)
  const lanterns = Math.min(summary?.lanterns ?? 0, 4)
  const quietDays = summary?.lastAt ? Math.floor((clock - summary.lastAt) / 86_400_000) : 0
  const fog = Math.min(0.55, Math.max(0, (quietDays - 3) / 7))
  const nextLock = lockedList.length ? Math.min(...lockedList.map((l) => l.unlockAt)) : null
  const sunX = 12 + sky.t * 76
  const sunY = 5 + 22 * (1 - Math.sin(Math.PI * sky.t))

  return (
    <div className="relative flex h-full flex-col items-center">
      <div className="relative w-full flex-1 overflow-hidden">
        {view === 'sky' ? (
          <Sky kept={summary?.kept ?? []} copy={copy} onPick={(b) => setReveal({ phase: 'open', bottle: b, fresh: false, reread: true })} />
        ) : (
          <>
            {/* the sky follows the real clock */}
            <div className="pointer-events-none absolute inset-0" style={{ background: SKY_TINT[sky.phase] }} aria-hidden />
            {sky.phase === 'night' && (
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[45%]" aria-hidden>
                {Array.from({ length: 16 }, (_, i) => (
                  <span key={i} className="absolute h-[2px] w-[2px] animate-breathe rounded-full bg-white/80" style={{ left: `${(i * 37 + 11) % 96}%`, top: `${(i * 53 + 7) % 90}%`, animationDelay: `${-i * 0.7}s` }} />
                ))}
              </div>
            )}
            <div
              className="pointer-events-none absolute h-11 w-11 rounded-full"
              style={{
                left: `${sunX}%`, top: `${sunY}%`,
                background: sky.day ? 'radial-gradient(circle at 40% 35%, #fff1c9, #f2c27a 70%)' : 'radial-gradient(circle at 35% 35%, #fbf3e6, #ead9c3 65%, #d9c3a8)',
                boxShadow: sky.day ? '0 0 60px 14px rgba(242,194,122,.35)' : '0 0 50px 8px rgba(234,217,195,.28)',
              }}
              aria-hidden
            />
            {fog > 0 && (
              <div className="pointer-events-none absolute inset-x-0 top-[28%] z-[4] h-[42%] blur-xl" style={{ background: `linear-gradient(transparent, rgba(190,198,215,${fog * 0.55}), transparent)` }} aria-hidden />
            )}

            <div className="absolute inset-x-0 top-[17%] px-6 text-center">
              {waiting > 0 ? (
                <p className="text-2xl font-bold text-ink">{copy.sea.waiting(waiting === 1 ? 'زجاجة' : waiting === 2 ? 'زجاجتان' : `${num(waiting)} ${waiting <= 10 ? 'زجاجات' : 'زجاجة'}`)}</p>
              ) : (
                <>
                  <p className="text-2xl font-bold text-ink">{copy.sea.calm}</p>
                  {fog > 0.05 && <p className="mt-2 text-sm text-mist">{copy.bottle.fog(days(quietDays))}</p>}
                  {nextLock && <p className="mt-2 text-sm text-accent-soft">{copy.bottle.lockedHint(dateText(nextLock))}</p>}
                </>
              )}
              {shake.needsPermission && waiting > 0 && (
                <button onClick={shake.askPermission} className="mt-2 text-sm text-accent-soft underline underline-offset-4">تفعيل الهزّ</button>
              )}
            </div>

            <Waves rate={waiting > 0 ? 2.6 : 1} />

            {/* my bottles, sailing towards the horizon */}
            {sailing.map((s, i) => (
              <div key={s.id} className="pointer-events-none absolute z-[6]" style={{ left: `${24 + i * 24}%`, top: `${59 + (i % 2) * 2}%` }} aria-label={copy.bottle.sailing}>
                <div className="animate-bob opacity-70" style={{ animationDelay: `${-i * 1.7}s`, animationDuration: '9s' }}>
                  <BottleArt tint={moodColor(s.mood)} glow={false} className="h-9 w-[18px]" />
                </div>
              </div>
            ))}

            {Array.from({ length: lanterns }, (_, i) => (
              <Lantern key={i} left={`${70 + i * 8}%`} top={`${24 + (i % 2) * 9}%`} delay={i * 0.8} />
            ))}

            {/* bottles floating towards me */}
            {bottles.map((b, i) => {
              const s = SLOTS[i]
              return (
                <motion.button
                  key={b.id}
                  type="button"
                  aria-label={copy.sea.open}
                  onClick={draw}
                  className="absolute z-10 outline-none"
                  style={{ left: s.left, top: s.top }}
                  initial={{ opacity: 0, scale: 0.4, y: 30 }}
                  animate={{ opacity: 1, scale: s.scale, y: 0 }}
                  transition={{ delay: 0.15 * i, type: 'spring', stiffness: 80, damping: 14 }}
                  whileTap={{ scale: s.scale * 0.88 }}
                >
                  <div className="animate-bob" style={{ animationDelay: s.delay, animationDuration: `${5 + i * 0.7}s` }}>
                    <BottleArt tint={moodColor(b.mood)} wax={`var(--heart-${b.author})`} className="h-24 w-12" />
                  </div>
                </motion.button>
              )
            })}

            {/* sealed until a date */}
            {lockedList.slice(0, 2).map((l, i) => (
              <motion.button
                key={l.id}
                type="button"
                onClick={() => toast(copy.bottle.lockedUntil(dateText(l.unlockAt)))}
                className="absolute z-10 outline-none"
                style={{ left: `${i === 0 ? 46 : 10}%`, top: `${i === 0 ? 70 : 74}%` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
              >
                <div className="relative animate-bob" style={{ animationDelay: `${-i * 2.1}s` }}>
                  {/* the closer the opening hour, the warmer it glows */}
                  {l.unlockAt - clock < 6 * 3_600_000 && (
                    <span className="pointer-events-none absolute -inset-6" style={{ opacity: 0.3 + 0.6 * (1 - Math.max(0, l.unlockAt - clock) / (6 * 3_600_000)) }}>
                      <span className="animate-breathe block h-full w-full rounded-full" style={{ background: 'radial-gradient(closest-side, var(--accent), transparent)' }} />
                    </span>
                  )}
                  <BottleArt tint={moodColor(l.mood)} wax="var(--accent)" glow={false} className="h-16 w-8" />
                  <Lock className="absolute start-1/2 top-[44%] h-3.5 w-3.5 -translate-x-1/2 text-white/90" />
                </div>
              </motion.button>
            ))}

            {fxTick > 0 && <ShootingStar key={`p${fxTick}`} />}
            {ownFx > 0 && <ShootingStar key={`o${ownFx}`} />}
          </>
        )}

        {/* sea / sky */}
        <div className="absolute inset-x-0 top-2 z-30 flex justify-center">
          <div className="glass flex rounded-full p-1 text-sm">
            {(['sea', 'sky'] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`rounded-full px-4 py-1.5 transition-colors ${view === v ? 'bg-mist/25 text-ink' : 'text-mist'}`}>
                {v === 'sea' ? copy.sky.sea : copy.sky.sky}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 pb-3">
        <div className="flex gap-3">
          <button
            onClick={draw}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-base font-bold text-on-accent transition-transform active:scale-[0.97]"
          >
            <Sparkles className="h-4.5 w-4.5" /> {copy.sea.open}
          </button>
          <button
            onClick={() => setWriting(true)}
            className="glass flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold text-ink transition-transform active:scale-[0.97]"
          >
            <Pencil className="h-4.5 w-4.5" /> {copy.sea.write}
          </button>
        </div>
        <div className="mt-3 flex justify-center text-sm text-mist">
          <button onClick={() => setList(true)} className="flex items-center gap-1.5 px-2 py-1.5 transition-colors hover:text-ink"><Send className="h-3.5 w-3.5 -scale-x-100" /> {copy.sea.mine}</button>
        </div>
      </div>

      <BottleReveal
        state={reveal}
        copy={copy}
        onClose={() => setReveal(null)}
        onReply={() => { setReveal(null); setWriting(true) }}
      />
      <WriteBottle open={writing} onClose={() => setWriting(false)} copy={copy} onThrown={(info) => { setRitual(info) }} />
      <ThrowRitual info={ritual} me={me} copy={copy} onDone={() => { setRitual(null); refresh() }} />
      <BottleLists open={list} onClose={() => setList(false)} copy={copy} />
    </div>
  )
}
