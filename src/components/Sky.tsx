import { motion } from 'framer-motion'
import type { Bottle } from '@/lib/types'
import type { Copy } from '@/lib/copy'
import { moodColor } from '@/lib/moods'
import { num } from '@/lib/time'

const frac = (x: number) => x - Math.floor(x)

/** Every bottle you have opened becomes a star here; touch one to read it again. */
export function Sky({ kept, copy, onPick }: { kept: Bottle[]; copy: Copy; onPick: (b: Bottle) => void }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[linear-gradient(to_bottom,#0b1020,#1b2040_65%,#2b2542)]">
      {kept.length === 0 ? (
        <p className="absolute inset-x-8 top-[38%] text-center text-base leading-8 text-white/70">{copy.sky.empty}</p>
      ) : (
        <>
          <p className="absolute inset-x-0 top-14 text-center text-sm text-white/60">{copy.sky.stars(`${num(kept.length)} ${kept.length === 1 ? 'نجمة' : kept.length === 2 ? 'نجمتان' : kept.length <= 10 ? 'نجوم' : 'نجمة'}`)}</p>
          {kept.map((b, i) => {
            const color = moodColor(b.mood) ?? '#f5e6c8'
            const size = Math.max(22, 40 - i * 1.2)
            return (
              <button
                key={b.id}
                onClick={() => onPick(b)}
                aria-label="نجمة"
                className="absolute -translate-x-1/2 -translate-y-1/2 outline-none active:scale-125"
                style={{ left: `${frac((i + 1) * 0.618 + 0.07) * 82 + 9}%`, top: `${frac((i + 1) * 0.382 + 0.21) * 56 + 18}%` }}
              >
                <motion.svg
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: [0.65, 1, 0.65], scale: [1, 1.14, 1] }}
                  transition={{ duration: 3 + (i % 4) * 0.8, repeat: Infinity, delay: (i % 7) * 0.35 }} width={size} height={size} viewBox="0 0 40 40" style={{ filter: `drop-shadow(0 0 7px ${color})` }}>
                  <path d="M20 2 C21.5 12 28 18.5 38 20 C28 21.5 21.5 28 20 38 C18.5 28 12 21.5 2 20 C12 18.5 18.5 12 20 2 Z" fill={color} />
                </motion.svg>
              </button>
            )
          })}
        </>
      )}
    </div>
  )
}
