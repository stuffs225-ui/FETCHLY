import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff } from 'lucide-react'
import { HeartShape } from './Heart'
import { SchemaSetup } from './SchemaSetup'
import { api, ApiError } from '@/lib/api'
import { makeCopy } from '@/lib/copy'
import type { Profile, Who } from '@/lib/types'

type Slots = Record<Who, boolean>
type Fatal =
  | { kind: 'nodb'; detail?: string; unreachable: boolean; seen?: string[] }
  | { kind: 'schema'; sql: string; dashboard: string }

const SAVED = 'nabd_who'

function fatalFrom(e: unknown): Fatal | null {
  if (!(e instanceof ApiError) || e.status !== 503) return null
  if (e.message === 'schema_missing' && e.extra?.sql) return { kind: 'schema', sql: e.extra.sql, dashboard: e.extra.dashboard ?? 'https://supabase.com/dashboard' }
  return { kind: 'nodb', unreachable: e.message === 'db_unavailable', detail: e.detail, seen: e.seen }
}

/**
 * The one door. They pick who they are ("هي" or "هو"); the first time each
 * chooses a code, afterwards it is remembered on that phone. If the code is
 * ever needed again (new phone, cleared data) they just type it.
 */
export function Join({ onEnter }: { onEnter: (p: Profile) => void }) {
  const [slots, setSlots] = useState<Slots | null>(null)
  const [fatal, setFatal] = useState<Fatal | null>(null)
  const [who, setWho] = useState<Who | null>(() => {
    try { const v = localStorage.getItem(SAVED); return v === 'a' || v === 'b' ? v : null } catch { return null }
  })
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(0)

  useEffect(() => {
    api.get<Slots>('/join').then(setSlots).catch((e) => setFatal(fatalFrom(e)))
  }, [])

  const copy = makeCopy({ who: who ?? 'a', partner: who === 'b' ? 'a' : 'b' })
  const needsCode = who !== null && slots !== null && !slots[who]

  const choose = (w: Who) => {
    setWho(w)
    setPassword('')
    setError('')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!who || busy) return
    if (needsCode && password.length < 4) { setError(copy.join.short); setShake((s) => s + 1); return }
    setBusy(true)
    setError('')
    try {
      const p = await api.post<Profile>('/join', { who, password })
      try { localStorage.setItem(SAVED, who) } catch { /* ignore */ }
      onEnter(p)
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? copy.join.tooMany : copy.join.wrong)
      setShake((s) => s + 1)
      setBusy(false)
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 safe-top safe-bottom">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
        <motion.div animate={{ scale: [1, 1.06, 1, 1.03, 1] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', times: [0, 0.12, 0.3, 0.42, 1] }}>
          <HeartShape tone={who ?? 'a'} className="h-[80px] w-[89px]" />
        </motion.div>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.9 }} className="mt-9 text-3xl font-bold text-ink">نبضنا</motion.h1>

      {fatal?.kind === 'schema' && <SchemaSetup sql={fatal.sql} dashboard={fatal.dashboard} />}

      {fatal?.kind === 'nodb' && (
        <div className="mt-6 max-w-xs text-center">
          <p className="text-lg text-ink">{fatal.unreachable ? 'تعذّر الاتصال بقاعدة البيانات' : 'قاعدة البيانات غير مربوطة بعد'}</p>
          <p className="mt-1.5 text-sm text-mist">{fatal.unreachable ? fatal.detail : 'اربط قاعدة Postgres (Supabase أو Neon) بالمشروع من Vercel ← Storage، ثم Redeploy'}</p>
          {fatal.unreachable && /key role: (anon|authenticated)/.test(fatal.detail ?? '') && (
            <p className="mt-4 text-sm leading-7 text-accent-soft">المفتاح المخزّن باسم SUPABASE_SERVICE_ROLE_KEY هو مفتاح عام (anon) وليس مفتاح service_role السرّي.</p>
          )}
          {!fatal.unreachable && (
            <p dir="ltr" className="mt-5 text-center text-[11px] leading-5 text-mist/70">
              {fatal.seen?.length ? `Found: ${fatal.seen.join(', ')}` : 'No database-related environment variables found'}
            </p>
          )}
        </div>
      )}

      {!fatal && slots && (
        <AnimatePresence mode="wait">
          {who === null ? (
            <motion.div key="pick" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="mt-8 w-full max-w-xs">
              <p className="text-center text-lg text-ink">من أنت؟</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {([['a', 'أنا هي'], ['b', 'أنا هو']] as const).map(([k, label]) => (
                  <button key={k} onClick={() => choose(k)} className="glass flex flex-col items-center gap-3 rounded-2xl py-6 text-ink transition-transform active:scale-95">
                    <HeartShape tone={k} className="h-9 w-10" />
                    <span className="text-base font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.form key="code" onSubmit={submit} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="mt-8 w-full max-w-xs">
              <p className="text-center text-lg text-ink">{needsCode ? copy.join.chooseTitle : copy.join.enterTitle}</p>
              <p className="mt-1.5 text-center text-sm text-mist">{needsCode ? copy.join.chooseSub : copy.join.enterSub}</p>

              <motion.div key={shake} animate={shake ? { x: [0, -7, 7, -5, 5, 0] } : {}} transition={{ duration: 0.4 }} className="relative mt-5">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={copy.join.placeholder}
                  autoComplete={needsCode ? 'new-password' : 'current-password'}
                  autoFocus
                  className="glass w-full rounded-2xl px-5 py-3.5 pe-12 text-center text-ink outline-none transition-colors placeholder:text-mist/60 focus:border-accent/50"
                />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label="إظهار" className="absolute end-3 top-1/2 -translate-y-1/2 p-2 text-mist">
                  {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </motion.div>
              <p className="mt-3 h-5 text-center text-xs text-accent-soft">{error}</p>

              <button type="submit" disabled={!password || busy} className="mt-2 w-full rounded-2xl bg-accent py-3.5 text-base font-bold text-on-accent transition-all active:scale-[0.98] disabled:opacity-40">
                {copy.join.go}
              </button>
              <button type="button" onClick={() => { setWho(null); setPassword(''); setError('') }} className="mx-auto mt-3 flex items-center gap-1.5 px-3 py-2 text-sm text-mist">
                <ArrowRight className="h-4 w-4" /> لست أنا
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
