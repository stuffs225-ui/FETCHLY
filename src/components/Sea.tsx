import { useCallback, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Sparkles, Archive, Send } from 'lucide-react'
import { BottleArt } from './BottleArt'
import { BottleReveal } from './BottleReveal'
import type { RevealState } from './BottleReveal'
import { WriteBottle } from './WriteBottle'
import { BottleLists } from './BottleLists'
import { api } from '@/lib/api'
import type { Bottle } from '@/lib/types'
import type { Copy } from '@/lib/copy'
import { num } from '@/lib/time'
import { useShake } from '@/lib/shake'
import { useToast } from './toastContext'

type DrawResponse = { empty: true } | { bottle: Bottle; fresh: boolean; waiting: number }

const SLOTS = [
  { left: '16%', top: '42%', delay: '0s', scale: 1 },
  { left: '60%', top: '36%', delay: '-1.8s', scale: 0.86 },
  { left: '38%', top: '54%', delay: '-3.2s', scale: 1.08 },
  { left: '78%', top: '52%', delay: '-4.4s', scale: 0.8 },
  { left: '4%', top: '62%', delay: '-2.6s', scale: 0.76 },
]

function Waves() {
  const wave = 'M0 40 C 150 10, 300 70, 450 40 S 750 10, 900 40 S 1200 70, 1350 40 S 1650 10, 1800 40 V 200 H 0 Z'
  return (
    <div dir="ltr" className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] overflow-hidden" aria-hidden>
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

export function Sea({ waiting, copy, onWaiting, active }: { waiting: number; copy: Copy; onWaiting: (n: number) => void; active: boolean }) {
  const toast = useToast()
  const [reveal, setReveal] = useState<RevealState | null>(null)
  const [writing, setWriting] = useState(false)
  const [list, setList] = useState<'mine' | 'kept' | null>(null)
  const [flying, setFlying] = useState(0)
  const busy = useRef(false)

  const draw = useCallback(async () => {
    if (busy.current) return
    busy.current = true
    setReveal({ phase: 'shaking' })
    const started = Date.now()
    try {
      const res = await api.post<DrawResponse>('/bottles/draw')
      await new Promise((r) => setTimeout(r, Math.max(0, 1500 - (Date.now() - started))))
      if ('empty' in res) setReveal({ phase: 'empty' })
      else {
        setReveal({ phase: 'open', bottle: res.bottle, fresh: res.fresh })
        onWaiting(res.waiting)
      }
    } catch {
      setReveal(null)
      toast(copy.toast.error)
    } finally {
      busy.current = false
    }
  }, [copy.toast.error, onWaiting, toast])

  const shake = useShake(active && !reveal && !writing && list === null, draw)
  const shown = Math.min(waiting, SLOTS.length)

  return (
    <div className="relative flex h-full flex-col items-center">
      <div className="relative w-full flex-1 overflow-hidden">
        {/* moon */}
        <div className="absolute end-[12%] top-[3%] h-12 w-12 rounded-full bg-[#ead9c3] opacity-90" />

        <div className="absolute inset-x-0 top-[17%] px-6 text-center">
          {waiting > 0 ? (
            <>
              <p className="text-2xl font-bold text-ink">{copy.sea.waiting(waiting === 1 ? 'زجاجة' : waiting === 2 ? 'زجاجتان' : `${num(waiting)} ${waiting <= 10 ? 'زجاجات' : 'زجاجة'}`)}</p>
              {shake.needsPermission && (
                <button onClick={shake.askPermission} className="mt-2 text-sm text-accent-soft underline underline-offset-4">تفعيل الهزّ</button>
              )}
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-ink">{copy.sea.calm}</p>
            </>
          )}
        </div>

        <Waves />

        {SLOTS.slice(0, shown).map((s, i) => (
          <motion.button
            key={i}
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
              <BottleArt className="h-24 w-12" />
            </div>
          </motion.button>
        ))}

        {/* the bottle that has just been thrown */}
        {flying > 0 && (
          <motion.div
            key={flying}
            className="pointer-events-none absolute bottom-[22%] start-1/2 z-20"
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1.1 }}
            animate={{ opacity: [1, 1, 0], x: [0, -90, -170], y: [0, -170, -60], rotate: [0, -200, -330], scale: [1.1, 0.9, 0.5] }}
            transition={{ duration: 2.2, ease: 'easeOut' }}
            onAnimationComplete={() => setFlying(0)}
          >
            <BottleArt className="h-24 w-12" />
          </motion.div>
        )}
      </div>

      <div className="relative z-10 w-full max-w-md px-6 pb-3">
        <div className="flex gap-3">
          <button
            onClick={draw}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-base font-bold text-night transition-transform active:scale-[0.97]"
          >
            <Sparkles className="h-4.5 w-4.5" /> {copy.sea.open}
          </button>
          <button
            onClick={() => setWriting(true)}
            className="glass flex flex-1 items-center justify-center gap-2 rounded-full py-4 text-base font-bold text-ink transition-transform active:scale-[0.97]"
          >
            <Pencil className="h-4.5 w-4.5" /> {copy.sea.write}
          </button>
        </div>
        <div className="mt-3 flex justify-center gap-6 text-sm text-mist">
          <button onClick={() => setList('mine')} className="flex items-center gap-1.5 px-2 py-1.5 transition-colors hover:text-ink"><Send className="h-3.5 w-3.5 -scale-x-100" /> {copy.sea.mine}</button>
          <button onClick={() => setList('kept')} className="flex items-center gap-1.5 px-2 py-1.5 transition-colors hover:text-ink"><Archive className="h-3.5 w-3.5" /> {copy.sea.kept}</button>
        </div>
      </div>

      <BottleReveal
        state={reveal}
        copy={copy}
        onClose={() => setReveal(null)}
        onReply={() => { setReveal(null); setWriting(true) }}
      />
      <WriteBottle open={writing} onClose={() => setWriting(false)} copy={copy} onThrown={() => setFlying((v) => v + 1)} />
      <BottleLists mode={list} onClose={() => setList(null)} copy={copy} />
    </div>
  )
}
