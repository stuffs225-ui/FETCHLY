import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BottleArt } from './BottleArt'
import { Seal } from './Seal'
import type { Copy } from '@/lib/copy'
import { moodColor } from '@/lib/moods'
import { dateText } from '@/lib/time'
import type { Mood, Who } from '@/lib/types'

export interface ThrowInfo {
  preview: string
  mood: Mood | null
  mode: 'now' | 'drift' | 'at'
  at: number | null
  media: 'voice' | 'photo' | null
}

/** The little ceremony of sending: the note is rolled into a bottle, sealed in your colour, and sails away. */
export function ThrowRitual({ info, me, copy, onDone }: { info: ThrowInfo | null; me: Who; copy: Copy; onDone: () => void }) {
  return <AnimatePresence>{info && <RitualBody key="ritual" info={info} me={me} copy={copy} onDone={onDone} />}</AnimatePresence>
}

function RitualBody({ info, me, copy, onDone }: { info: ThrowInfo; me: Who; copy: Copy; onDone: () => void }) {
  const [step, setStep] = useState(0)
  const done = useRef(onDone)
  useEffect(() => { done.current = onDone })

  useEffect(() => {
    const timers = [900, 1900, 2800, 4600].map((ms, i) => setTimeout(() => (i === 3 ? done.current() : setStep(i + 1)), ms))
    return () => timers.forEach(clearTimeout)
  }, [])

  const tint = moodColor(info.mood)
  const wax = `var(--heart-${me})`
  const line = info.mode === 'drift' ? copy.bottle.ritualDrift : info.mode === 'at' && info.at ? copy.bottle.ritualAt(dateText(info.at)) : copy.bottle.ritualNow
  const paperText = info.preview || (info.media === 'voice' ? '🎙' : info.media === 'photo' ? '🖼' : '')

  return (
    <motion.div
      className="fixed inset-0 z-[58] flex flex-col items-center justify-center bg-[var(--scrim)] px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDone}
    >
      <div className="relative flex h-72 w-full max-w-xs items-center justify-center">
        {/* the written note */}
        <AnimatePresence>
          {step === 0 && (
            <motion.div
              key="paper"
              className="absolute w-60 rounded-2xl bg-[#f6ecdd] p-5 text-center text-[17px] leading-8 text-[#3b2433] shadow-[0_18px_40px_rgba(0,0,0,.28)]"
              initial={{ opacity: 0, y: 30, rotate: -3, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotate: -2, scale: 1 }}
              exit={{ opacity: 0, scaleY: 0.12, scaleX: 0.45, rotate: 8, y: 20 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="line-clamp-3">{paperText}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* the bottle: appears, gets sealed, sails off */}
        {step >= 1 && (
          <motion.div
            key="bottle"
            className="absolute"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={step >= 3 ? { opacity: [1, 1, 0], x: [0, -40, -120], y: [0, -50, -110], scale: [1, 0.7, 0.28], rotate: [0, -12, -24] } : { opacity: 1, scale: 1, y: 0 }}
            transition={step >= 3 ? { duration: 1.8, ease: 'easeIn' } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <BottleArt tint={tint} glow className="h-40 w-20" />
            {step >= 2 && (
              <motion.div
                className="absolute start-1/2 top-[8px] w-9 -translate-x-1/2"
                initial={{ scale: 2.6, opacity: 0, y: -26 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 14 }}
              >
                <Seal color={wax} className="w-full drop-shadow-[0_3px_6px_rgba(0,0,0,.35)]" />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {step >= 2 && (
          <motion.p key={line} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.5, duration: 0.8 }} className="mt-4 text-center text-base text-ink">
            {line}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
