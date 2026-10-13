import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { HeartShape } from './Heart'
import { LinkCard } from './LinkCard'
import { SchemaSetup } from './SchemaSetup'
import { api, ApiError } from '@/lib/api'
import { makeCopy } from '@/lib/copy'
import type { Profile, Who } from '@/lib/types'

type Stage = { name: 'loading' } | { name: 'setup'; links: Record<Who, string>; base: string | null } | { name: 'nodb'; detail?: string; unreachable?: boolean; seen?: string[] } | { name: 'schema'; sql: string; dashboard: string } | { name: 'nolink' } | { name: 'invalid' } | { name: 'form'; who: Who; needsPassword: boolean }

function dbStage(e: unknown): Stage | null {
  if (!(e instanceof ApiError) || e.status !== 503) return null
  if (e.message === 'schema_missing' && e.extra?.sql) return { name: 'schema', sql: e.extra.sql, dashboard: e.extra.dashboard ?? 'https://supabase.com/dashboard' }
  return { name: 'nodb', unreachable: e.message === 'db_unavailable', detail: e.detail, seen: e.seen }
}

/**
 * The door. It opens only from a person's private link (?k=…). The first time
 * they pick a password; any later time (new phone, cleared data) they type it.
 */
export function Join({ onEnter }: { onEnter: (p: Profile) => void }) {
  const token = new URLSearchParams(location.search).get('k')
  const [stage, setStage] = useState<Stage>({ name: 'loading' })
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [shake, setShake] = useState(0)

  useEffect(() => {
    if (!token) {
      // No private link: if nobody has set up yet, show both links (first run only); otherwise a quiet "use your link" note.
      api.get<{ links: Record<Who, string>; base: string | null }>('/setup')
        .then((r) => setStage({ name: 'setup', links: r.links, base: r.base }))
        .catch((e) => setStage(dbStage(e) ?? { name: 'nolink' }))
      return
    }
    api.get<{ who: Who; needsPassword: boolean }>(`/join?k=${encodeURIComponent(token)}`)
      .then((r) => setStage({ name: 'form', who: r.who, needsPassword: r.needsPassword }))
      .catch((e) => setStage(dbStage(e) ?? { name: 'invalid' }))
  }, [token])

  const who: Who = stage.name === 'form' ? stage.who : 'a'
  const copy = makeCopy({ who, partner: who === 'a' ? 'b' : 'a' })

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (stage.name !== 'form' || busy) return
    if (stage.needsPassword && password.length < 4) { setError(copy.join.short); setShake((s) => s + 1); return }
    setBusy(true)
    setError('')
    try {
      const p = await api.post<Profile>('/join', { k: token, password })
      history.replaceState(null, '', '/')
      onEnter(p)
    } catch (err) {
      setError(err instanceof ApiError && err.status === 429 ? copy.join.tooMany : copy.join.wrong)
      setShake((s) => s + 1)
      setBusy(false)
    }
  }

  const message = stage.name === 'nodb' ? (stage.unreachable ? ['تعذّر الاتصال بقاعدة البيانات', stage.detail ?? ''] : ['قاعدة البيانات غير مربوطة بعد', 'اربط قاعدة Postgres (Supabase أو Neon) بالمشروع من Vercel ← Storage، ثم Redeploy']) : stage.name === 'nolink' ? [copy.join.needLink, copy.join.needLinkSub] : stage.name === 'invalid' ? [copy.join.invalid, copy.join.needLinkSub] : null

  return (
    <div className="flex h-full flex-col items-center justify-center px-8 safe-top safe-bottom">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}>
        <motion.div animate={{ scale: [1, 1.06, 1, 1.03, 1] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', times: [0, 0.12, 0.3, 0.42, 1] }}>
          <HeartShape tone={who} className="h-[80px] w-[89px]" />
        </motion.div>
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.9 }} className="mt-9 text-3xl font-bold text-ink">نبضنا</motion.h1>

      {message && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 text-center">
          <p className="text-lg text-ink">{message[0]}</p>
          <p className="mt-1.5 text-sm text-mist">{message[1]}</p>
        </motion.div>
      )}

      {stage.name === 'nodb' && stage.unreachable && /key role: (anon|authenticated)/.test(stage.detail ?? '') && (
        <p className="mt-4 max-w-xs text-center text-sm leading-7 text-accent-soft">
          المفتاح المخزّن في Vercel باسم SUPABASE_SERVICE_ROLE_KEY هو مفتاح عام (anon) وليس مفتاح service_role السرّي.
        </p>
      )}

      {stage.name === 'schema' && <SchemaSetup sql={stage.sql} dashboard={stage.dashboard} />}

      {stage.name === 'nodb' && !stage.unreachable && (
        <p dir="ltr" className="mt-5 max-w-xs text-center text-[11px] leading-5 text-mist/70">
          {stage.seen?.length ? `Found: ${stage.seen.join(', ')}` : 'No database-related environment variables found'}
        </p>
      )}

      {stage.name === 'setup' && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.9 }} className="mt-7 w-full max-w-sm space-y-3">
          <p className="text-center text-lg text-ink">جاهز! خطوتان فقط</p>
          <a href={`/?k=${stage.links.b}`} className="block rounded-2xl bg-accent py-3.5 text-center text-base font-bold text-on-accent active:scale-[0.98]">
            ١) افتح رابطك أنت واختر كلمة سرّ
          </a>
          <LinkCard receiver="a" keyValue={stage.links.a} base={stage.base} title="٢) انسخ رابطها وأرسله لها" />
          <p className="px-2 text-center text-xs leading-6 text-mist">بعد أن تفتح رابطك وتختار كلمة السرّ، تختفي هذه الصفحة، ولن يُعرض الرابطان لأحد بعدها.</p>
        </motion.div>
      )}

      {stage.name === 'form' && (
        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.9 }} className="mt-8 w-full max-w-xs">
          <p className="text-center text-lg text-ink">{stage.needsPassword ? copy.join.chooseTitle : copy.join.enterTitle}</p>
          <p className="mt-1.5 text-center text-sm text-mist">{stage.needsPassword ? copy.join.chooseSub : copy.join.enterSub}</p>

          <motion.div key={shake} animate={shake ? { x: [0, -7, 7, -5, 5, 0] } : {}} transition={{ duration: 0.4 }} className="relative mt-5">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={copy.join.placeholder}
              autoComplete={stage.needsPassword ? 'new-password' : 'current-password'}
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
        </motion.form>
      )}
    </div>
  )
}
