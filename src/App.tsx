import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Settings as SettingsIcon } from 'lucide-react'
import { Background, Petals } from '@/components/Background'
import { Enter } from '@/components/Enter'
import { HeartStage } from '@/components/HeartStage'
import { Sea } from '@/components/Sea'
import { Settings } from '@/components/Settings'
import { Sheet } from '@/components/Sheet'
import { BottleArt } from '@/components/BottleArt'
import { ToastProvider, useToast } from '@/components/Toast'
import { api, ApiError } from '@/lib/api'
import { makeCopy } from '@/lib/copy'
import type { Copy } from '@/lib/copy'
import { useLive } from '@/lib/live'
import { usePref } from '@/lib/prefs'
import { ago, num, spent } from '@/lib/time'
import type { Profile } from '@/lib/types'

type Tab = 'heart' | 'sea'
const WELCOMED = 'nabd_welcomed'

function Home({ profile, setProfile, onLeave, onTogether }: { profile: Profile; setProfile: (p: Profile) => void; onLeave: () => void; onTogether: (v: boolean) => void }) {
  const toast = useToast()
  const copy = useMemo(() => makeCopy(profile), [profile])
  const [tab, setTab] = useState<Tab>('heart')
  const [settings, setSettings] = useState(false)
  const [rippleTick, setRippleTick] = useState(0)
  const [haptics, setHaptics] = usePref('nabd_haptics', false)
  const [sound, setSound] = usePref('nabd_sound', false)
  const [touched, setTouched] = usePref('nabd_touched', false)
  const [, setNow] = useState(0)
  const [welcome, setWelcome] = useState(() => {
    try {
      return profile.names[profile.who] === (profile.who === 'a' ? 'هو' : 'هي') && localStorage.getItem(WELCOMED) !== '1'
    } catch {
      return false
    }
  })

  const copyRef = useMemo(() => ({ current: copy }), [copy])
  const { state, serverNow, sendRipple, setWaiting } = useLive({
    onRipple: () => { setRippleTick((t) => t + 1); toast(copyRef.current.toast.touched) },
    onOpened: () => toast(copyRef.current.toast.opened),
    onNewBottle: () => toast(copyRef.current.toast.newBottle),
    onPartnerState: (next, prev) => {
      if (next === 'here' && prev !== 'here') toast(copyRef.current.toast.partnerHere)
      else if (next === 'gone' && prev === 'here') toast(copyRef.current.toast.partnerLeft)
    },
  })

  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const together = state.connected && state.partner.state === 'here'
  useEffect(() => onTogether(together), [together, onTogether])

  const status = statusFor(copy, state.connected, state.partner.state, state.partner.lastSeen)

  return (
    <div className="relative z-10 mx-auto flex h-full w-full max-w-lg flex-col">
      <header className="flex items-center justify-between px-5 pb-1 safe-top">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${state.connected ? 'animate-ping bg-emerald-300' : 'bg-amber-300'}`} />
            <span className={`relative inline-flex h-2 w-2 rounded-full ${state.connected ? 'bg-emerald-300' : 'bg-amber-300'}`} />
          </span>
          <span className="text-lg font-bold tracking-tight text-ink">نبضنا</span>
        </div>
        <button onClick={() => setSettings(true)} aria-label="الإعدادات" className="rounded-full p-2.5 text-mist transition-colors hover:bg-white/10 hover:text-ink">
          <SettingsIcon className="h-5 w-5" />
        </button>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {tab === 'heart' ? (
            <motion.section
              key="heart"
              className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto pb-2 scroll-soft"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeartStage
                me={profile.who}
                meName={profile.names[profile.who]}
                partnerName={profile.names[profile.partner]}
                partnerState={state.partner.state}
                connected={state.connected}
                serverNow={serverNow}
                rippleTick={rippleTick}
                haptics={haptics}
                sound={sound}
                onTouchPartner={() => { sendRipple(); setTouched(true) }}
              />
              <div className="-mt-2 min-h-[118px] px-8 text-center">
                <AnimatePresence mode="wait">
                  <motion.div key={status.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-[26px] font-bold leading-tight text-ink">{status.title}</h1>
                    <p className="mt-1.5 text-sm text-mist">{status.sub}</p>
                  </motion.div>
                </AnimatePresence>
                {state.together.total >= 60 && (
                  <p className="mt-4 text-xs text-mist/70">
                    معًا اليوم {spent(state.together.today)} · في المجموع {spent(state.together.total)}
                  </p>
                )}
                {!touched && state.partner.state !== 'gone' && <p className="mt-3 text-xs text-rose-soft/80">{copy.touchHint}</p>}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="sea"
              className="absolute inset-0"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Sea waiting={state.waiting} copy={copy} onWaiting={setWaiting} active={tab === 'sea'} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <nav className="px-6 pt-1 safe-bottom">
        <div className="glass relative mx-auto grid max-w-xs grid-cols-2 rounded-full p-1.5">
          {([
            ['heart', 'نبضنا', <Heart key="h" className="h-[18px] w-[18px]" />],
            ['sea', 'البحر', <BottleArt key="b" glow={false} className="h-[20px] w-[10px]" />],
          ] as const).map(([k, label, icon]) => (
            <button key={k} onClick={() => setTab(k)} className="relative flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-medium text-ink">
              {tab === k && <motion.span layoutId="tab" className="absolute inset-0 rounded-full bg-white/12 shadow-[0_0_30px_rgba(255,107,139,.2)]" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />}
              <span className="relative flex items-center gap-2">
                {icon}
                {label}
                {k === 'sea' && state.waiting > 0 && <span className="rounded-full bg-rose px-1.5 text-[11px] font-bold leading-5 text-night">{num(state.waiting)}</span>}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <Settings
        open={settings}
        onClose={() => setSettings(false)}
        profile={profile}
        copy={copy}
        onProfile={setProfile}
        onLeave={onLeave}
        haptics={haptics}
        setHaptics={setHaptics}
        sound={sound}
        setSound={setSound}
      />
      <WelcomeSheet open={welcome} profile={profile} onDone={(p) => { if (p) setProfile(p); try { localStorage.setItem(WELCOMED, '1') } catch { /* ignore */ } setWelcome(false) }} />
    </div>
  )
}

function statusFor(copy: Copy, connected: boolean, state: 'here' | 'away' | 'gone', lastSeen: number | null) {
  if (!connected) return { title: copy.status.connecting, sub: '' }
  if (state === 'here') return { title: copy.status.together, sub: copy.status.togetherSub }
  if (state === 'away') return { title: copy.status.away, sub: copy.status.awaySub }
  return { title: copy.status.alone, sub: copy.status.aloneSub(ago(lastSeen)) }
}

function WelcomeSheet({ open, profile, onDone }: { open: boolean; profile: Profile; onDone: (p?: Profile) => void }) {
  const [name, setName] = useState('')
  const save = async () => {
    const n = name.trim()
    if (!n) return onDone()
    try { onDone(await api.put<Profile>('/profile', { name: n })) } catch { onDone() }
  }
  return (
    <Sheet open={open} onClose={() => onDone()} title="أهلًا بك في نبضنا">
      <p className="text-sm leading-7 text-mist">كيف تحب أن يراك قلب {profile.names[profile.partner]}؟ اكتب اسمك أو لقبك الذي تحب.</p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && save()}
        maxLength={24}
        autoFocus
        placeholder="اسمك"
        className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3.5 text-center text-lg text-ink outline-none focus:border-rose/50"
      />
      <button onClick={save} className="mt-4 w-full rounded-full bg-gradient-to-br from-coral to-rose py-3.5 font-bold text-night shadow-[0_12px_40px_rgba(255,107,139,.38)] active:scale-[0.98]">
        متابعة
      </button>
    </Sheet>
  )
}

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [booting, setBooting] = useState(true)
  const [together, setTogether] = useState(false)
  const onTogether = useCallback((v: boolean) => setTogether(v), [])

  useEffect(() => {
    api.get<Profile>('/me')
      .then(setProfile)
      .catch((e) => { if (!(e instanceof ApiError && e.status === 401)) console.error(e) })
      .finally(() => setBooting(false))
  }, [])

  const leave = async () => {
    await api.post('/leave').catch(() => {})
    setProfile(null)
    setTogether(false)
  }

  return (
    <ToastProvider>
      <Background together={together && profile !== null} />
      {together && <Petals />}
      {booting ? null : profile ? (
        <Home profile={profile} setProfile={setProfile} onLeave={leave} onTogether={onTogether} />
      ) : (
        <Enter onEnter={setProfile} />
      )}
    </ToastProvider>
  )
}
