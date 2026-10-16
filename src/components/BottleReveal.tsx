import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Reply, X } from 'lucide-react'
import { BottleArt } from './BottleArt'
import { Seal } from './Seal'
import { SongCard } from './SongCard'
import { VoicePlayer } from './VoicePlayer'
import type { Bottle } from '@/lib/types'
import type { Copy } from '@/lib/copy'
import { moodColor } from '@/lib/moods'
import { ago, dateText, stampText } from '@/lib/time'
import { vibrate } from '@/lib/prefs'

export type RevealState =
  | { phase: 'shaking'; tint?: string | null }
  | { phase: 'open'; bottle: Bottle; fresh: boolean; reread?: boolean }
  | { phase: 'empty'; lockedUntil?: number | null }

/** Full-screen moment: the bottle rattles, the wax seal cracks, the note unrolls. */
export function BottleReveal({ state, copy, onClose, onReply }: { state: RevealState | null; copy: Copy; onClose: () => void; onReply: () => void }) {
  const openId = state?.phase === 'open' ? state.bottle.id : null
  const [unrolledId, setUnrolledId] = useState<number | null>(null)
  const unrolled = openId !== null && unrolledId === openId

  useEffect(() => {
    if (openId === null) return
    vibrate([20, 50, 20])
    const t = setTimeout(() => setUnrolledId(openId), 900)
    return () => clearTimeout(t)
  }, [openId])

  const words = state?.phase === 'open' && state.bottle.text ? state.bottle.text.split(/(\s+)/) : []
  const animateWords = words.length <= 80
  const open = state?.phase === 'open' ? state : null
  const mood = open?.bottle.mood ?? null
  const wax = open ? `var(--heart-${open.bottle.author})` : ''

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          className="fixed inset-0 z-[55] flex items-center justify-center overflow-y-auto bg-[var(--scrim)] px-6 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {state.phase === 'shaking' && (
            <motion.div
              animate={{ rotate: [0, -14, 12, -10, 9, -6, 4, 0], y: [0, -6, 4, -4, 2, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <BottleArt tint={state.tint} className="relative h-44 w-22" />
            </motion.div>
          )}

          {state.phase === 'empty' && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <BottleArt className="mx-auto h-28 w-14 opacity-60" glow={false} />
              <p className="mt-6 text-xl font-bold text-ink">{copy.sea.calm}</p>
              <p className="mt-1.5 text-sm text-mist">{state.lockedUntil ? copy.bottle.lockedHint(dateText(state.lockedUntil)) : copy.sea.empty}</p>
              <button onClick={onClose} className="glass mt-8 rounded-full px-7 py-2.5 text-sm text-ink active:scale-95">إغلاق</button>
            </motion.div>
          )}

          {open && (
            <motion.div
              className="relative my-auto w-full max-w-sm"
              initial={{ scale: 0.4, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 150, damping: 17 }}
            >
              {open.fresh && !open.reread && (
                <div className="pointer-events-none absolute start-1/2 -top-7 z-10 h-14 w-14 -translate-x-1/2" aria-hidden>
                  {[{ clip: 'inset(0 50% 0 0)', x: -22, r: -18 }, { clip: 'inset(0 0 0 50%)', x: 22, r: 18 }].map((h) => (
                    <motion.div
                      key={h.clip}
                      className="absolute inset-0"
                      style={{ clipPath: h.clip }}
                      initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                      animate={{ x: h.x, y: 26, rotate: h.r, opacity: 0 }}
                      transition={{ delay: 0.45, duration: 0.8, ease: 'easeIn' }}
                    >
                      <Seal color={wax} className="h-full w-full drop-shadow-[0_3px_6px_rgba(0,0,0,.3)]" />
                    </motion.div>
                  ))}
                </div>
              )}

              <div className="relative overflow-hidden rounded-[26px] border border-[#f5e4d0]/30 bg-[#f6ecdd] p-6 text-[#3b2433] shadow-[0_20px_50px_rgba(0,0,0,.25)]">
                <div className="mb-4 flex items-center justify-between gap-2 text-[11px] font-medium text-[#9b6b7e]">
                  <span className="flex items-center gap-1.5">
                    <span className="rounded-full bg-[#ff7a9c]/15 px-2.5 py-1 text-[#c0407f]">{open.reread ? copy.sea.old : open.fresh ? copy.sea.fresh : copy.sea.old}</span>
                    {mood && (
                      <span className="flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: `${moodColor(mood)}33`, color: '#3b2433' }}>
                        <span className="h-2 w-2 rounded-full" style={{ background: moodColor(mood) ?? undefined }} />
                        {copy.moods[mood]}
                      </span>
                    )}
                  </span>
                  <span>{ago(open.bottle.createdAt)}</span>
                </div>

                <motion.div
                  initial={false}
                  animate={{ height: unrolled ? 'auto' : 40, opacity: unrolled ? 1 : 0.2 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-3 overflow-hidden"
                >
                  {open.bottle.kind === 'voice' && open.bottle.audioUrl && (
                    <div className="rounded-2xl bg-[#3b2433] p-1"><VoicePlayer src={open.bottle.audioUrl} /></div>
                  )}
                  {open.bottle.photoUrl && (
                    <motion.img
                      src={open.bottle.photoUrl}
                      alt=""
                      initial={{ opacity: 0, rotate: -4, scale: 0.94 }}
                      animate={unrolled ? { opacity: 1, rotate: -1.5, scale: 1 } : {}}
                      transition={{ duration: 0.7, delay: 0.2 }}
                      className="mx-auto max-h-[42dvh] rounded-md border-[7px] border-b-[22px] border-white bg-white object-contain shadow-[0_8px_20px_rgba(0,0,0,.18)]"
                    />
                  )}
                  {open.bottle.text && (
                    <p className="whitespace-pre-wrap text-[19px] leading-[2] text-[#3b2433]">
                      {animateWords
                        ? words.map((w, i) => (
                            <motion.span key={i} initial={{ opacity: 0, filter: 'blur(4px)' }} animate={unrolled ? { opacity: 1, filter: 'blur(0px)' } : {}} transition={{ delay: 0.25 + i * 0.045, duration: 0.6 }}>
                              {w}
                            </motion.span>
                          ))
                        : open.bottle.text}
                    </p>
                  )}
                  {open.bottle.song && <SongCard song={open.bottle.song} copy={copy} />}
                  {open.bottle.stampMin !== null && (
                    <p className="pt-1 text-center text-[11px] leading-5 text-[#9b6b7e]">{stampText(open.bottle.stampMin, open.bottle.stampDist)}</p>
                  )}
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: unrolled ? 1 : 0 }} transition={{ delay: 0.6 }} className="relative mt-5 flex justify-center gap-3">
                <button onClick={onReply} className="flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-on-accent active:scale-95">
                  <Reply className="h-4 w-4" /> {copy.sea.reply}
                </button>
                <button onClick={onClose} aria-label="إغلاق" className="glass flex h-12 w-12 items-center justify-center rounded-full text-ink active:scale-95">
                  <X className="h-5 w-5" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
