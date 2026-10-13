import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Reply, X } from 'lucide-react'
import { BottleArt } from './BottleArt'
import { VoicePlayer } from './VoicePlayer'
import type { Bottle } from '@/lib/types'
import type { Copy } from '@/lib/copy'
import { ago } from '@/lib/time'
import { vibrate } from '@/lib/prefs'

export type RevealState =
  | { phase: 'shaking' }
  | { phase: 'open'; bottle: Bottle; fresh: boolean }
  | { phase: 'empty' }

/** Full-screen moment: the bottle rattles, the cork pops, the note unrolls. */
export function BottleReveal({ state, copy, onClose, onReply }: { state: RevealState | null; copy: Copy; onClose: () => void; onReply: () => void }) {
  const [unrolled, setUnrolled] = useState(false)
  const phase = state?.phase

  useEffect(() => {
    setUnrolled(false)
    if (phase === 'open') {
      vibrate([20, 50, 20])
      const t = setTimeout(() => setUnrolled(true), 650)
      return () => clearTimeout(t)
    }
  }, [phase, state && 'bottle' in state ? state.bottle.id : 0])

  const words = state?.phase === 'open' && state.bottle.text ? state.bottle.text.split(/(\s+)/) : []
  const animateWords = words.length <= 80

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          className="fixed inset-0 z-[55] flex items-center justify-center bg-[var(--scrim)] px-6 "
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
              <BottleArt className="relative h-44 w-22" />
            </motion.div>
          )}

          {state.phase === 'empty' && (
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <BottleArt className="mx-auto h-28 w-14 opacity-60" glow={false} />
              <p className="mt-6 text-xl font-bold text-ink">{copy.sea.calm}</p>
              <p className="mt-1.5 text-sm text-mist">{copy.sea.empty}</p>
              <button onClick={onClose} className="glass mt-8 rounded-full px-7 py-2.5 text-sm text-ink active:scale-95">إغلاق</button>
            </motion.div>
          )}

          {state.phase === 'open' && (
            <motion.div
              className="relative w-full max-w-sm"
              initial={{ scale: 0.4, opacity: 0, y: 60 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 150, damping: 17 }}
            >
              <div className="relative overflow-hidden rounded-[26px] border border-[#f5e4d0]/30 bg-[#f6ecdd] p-6 text-[#3b2433] shadow-[0_20px_50px_rgba(0,0,0,.25)]">
                <div className="mb-4 flex items-center justify-between text-[11px] font-medium text-[#9b6b7e]">
                  <span className="rounded-full bg-[#ff7a9c]/15 px-2.5 py-1 text-[#c0407f]">{state.fresh ? copy.sea.fresh : copy.sea.old}</span>
                  <span>{ago(state.bottle.createdAt)}</span>
                </div>

                <motion.div
                  initial={false}
                  animate={{ height: unrolled ? 'auto' : 40, opacity: unrolled ? 1 : 0.2 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  {state.bottle.kind === 'voice' && state.bottle.audioUrl && (
                    <div className="mb-3 rounded-2xl bg-[#3b2433] p-1"><VoicePlayer src={state.bottle.audioUrl} /></div>
                  )}
                  {state.bottle.text && (
                    <p className="whitespace-pre-wrap text-[19px] leading-[2] text-[#3b2433]">
                      {animateWords
                        ? words.map((w, i) => (
                            <motion.span key={i} initial={{ opacity: 0, filter: 'blur(4px)' }} animate={unrolled ? { opacity: 1, filter: 'blur(0px)' } : {}} transition={{ delay: 0.25 + i * 0.045, duration: 0.6 }}>
                              {w}
                            </motion.span>
                          ))
                        : state.bottle.text}
                    </p>
                  )}
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: unrolled ? 1 : 0 }} transition={{ delay: 0.6 }} className="relative mt-5 flex justify-center gap-3">
                <button onClick={onReply} className="flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 text-sm font-bold text-night active:scale-95">
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
