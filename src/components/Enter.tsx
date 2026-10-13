import { useState } from 'react'
import { motion } from 'framer-motion'
import { HeartShape } from './Heart'
import { api, ApiError } from '@/lib/api'
import type { Profile, Who } from '@/lib/types'

const SAVED = 'nabd_who'

/** The door. Intentionally generic: names appear only after the right phrase is given. */
export function Enter({ onEnter }: { onEnter: (p: Profile) => void }) {
  const [who, setWho] = useState<Who>(() => {
    try { return localStorage.getItem(SAVED) === 'b' ? 'b' : 'a' } catch { return 'a' }
  })
  const [phrase, setPhrase] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(0)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phrase || busy) return
    setBusy(true)
    setError('')
    try {
      const p = await api.post<Profile>('/enter', { passphrase: phrase, who })
      try { localStorage.setItem(SAVED, who) } catch { /* ignore */ }
      onEnter(p)
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? 'محاولات كثيرة، انتظر قليلًا ثم جرّب' : 'ليست هذه الكلمة… جرّب مرة ثانية')
      setShake((s) => s + 1)
      setBusy(false)
    }
  }

  return (
    <div className="relative flex h-full flex-col items-center justify-center px-8 safe-top safe-bottom">
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }} className="relative">
        <div className="absolute -inset-14 animate-breathe rounded-full bg-rose/25 blur-3xl" />
        <motion.div animate={{ scale: [1, 1.08, 1, 1.04, 1] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.12, 0.3, 0.42, 1] }}>
          <HeartShape tone="warm" className="relative h-[90px] w-[100px] drop-shadow-[0_8px_30px_rgba(255,90,140,.5)]" />
        </motion.div>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 1 }} className="mt-10 text-4xl font-bold tracking-tight text-ink">نبضنا</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 1 }} className="mt-2 text-sm text-mist">مكان صغير لا يدخله أحد غيرنا</motion.p>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-10 w-full max-w-xs"
      >
        <div className="glass mb-4 grid grid-cols-2 rounded-full p-1">
          {([['a', 'أنا هو'], ['b', 'أنا هي']] as const).map(([k, label]) => (
            <button key={k} type="button" onClick={() => setWho(k)} className="relative rounded-full py-2.5 text-sm font-medium text-ink">
              {who === k && <motion.span layoutId="who" className="absolute inset-0 rounded-full bg-white/12" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />}
              <span className="relative">{label}</span>
            </button>
          ))}
        </div>

        <motion.div key={shake} animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}} transition={{ duration: 0.45 }}>
          <input
            type="password"
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="الكلمة السرّية بيننا"
            autoComplete="current-password"
            autoFocus
            className="glass w-full rounded-full px-6 py-3.5 text-center text-ink outline-none transition-colors placeholder:text-mist/60 focus:border-rose/50"
          />
        </motion.div>
        <p className="mt-3 h-5 text-center text-xs text-rose-soft">{error}</p>

        <button
          type="submit"
          disabled={!phrase || busy}
          className="mt-3 w-full rounded-full bg-gradient-to-br from-coral to-rose py-3.5 text-base font-bold text-night shadow-[0_12px_40px_rgba(255,107,139,.38)] transition-all active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
        >
          ادخل
        </button>
      </motion.form>
    </div>
  )
}
