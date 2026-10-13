import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, MapPin, Settings as SettingsIcon } from 'lucide-react'
import { Background } from '@/components/Background'
import { Join } from '@/components/Join'
import { HeartStage } from '@/components/HeartStage'
import { Sea } from '@/components/Sea'
import { Settings } from '@/components/Settings'
import { BottleArt } from '@/components/BottleArt'
import { ToastProvider, useToast } from '@/components/Toast'
import { api, ApiError } from '@/lib/api'
import { makeCopy } from '@/lib/copy'
import type { Copy } from '@/lib/copy'
import { useLive } from '@/lib/live'
import { useLocationShare } from '@/lib/location'
import { usePref } from '@/lib/prefs'
import { useTheme } from '@/lib/theme'
import { ago, dist, num, spent } from '@/lib/time'
import type { DistanceInfo, Profile, PState } from '@/lib/types'

type Tab = 'heart' | 'sea'

function distanceLine(copy: Copy, d: DistanceInfo, partner: PState, partnerAt: number | null) {
  if (d.meters === null) return null
  const text = dist(d.meters)
  if (partner === 'here') return copy.distance.title(text)
  return copy.distance.lastKnown(text, ago(partnerAt))
}

function tierLine(copy: Copy, d: DistanceInfo, together: boolean) {
  if (d.meters === null || !together) return null
  if (d.meters < 150 && d.precise) return copy.distance.vclose
  if (d.meters < 2000) return copy.distance.close
  if (d.meters < 30_000) return copy.distance.area
  return copy.distance.far
}

function statusFor(copy: Copy, connected: boolean, state: PState, lastSeen: number | null) {
  if (!connected) return { title: copy.status.connecting, sub: '' }
  if (state === 'here') return { title: copy.status.together, sub: copy.status.togetherSub }
  if (state === 'away') return { title: copy.status.away, sub: copy.status.awaySub }
  return { title: copy.status.alone, sub: copy.status.aloneSub(ago(lastSeen)) }
}

function Home({ profile, onTogether }: { profile: Profile; onTogether: (v: boolean) => void }) {
  const toast = useToast()
  const copy = useMemo(() => makeCopy(profile), [profile])
  const [tab, setTab] = useState<Tab>('heart')
  const [settings, setSettings] = useState(false)
  const [rippleTick, setRippleTick] = useState(0)
  const [haptics, setHaptics] = usePref('nabd_haptics', false)
  const [sound, setSound] = usePref('nabd_sound', false)
  const [touched, setTouched] = usePref('nabd_touched', false)
  const [theme, setTheme] = useTheme()
  const loc = useLocationShare()
  const [, setNow] = useState(0)

  const { state, serverNow, sendRipple, setWaiting } = useLive({
    onRipple: () => { setRippleTick((t) => t + 1); toast(copy.toast.touched) },
    onOpened: () => toast(copy.toast.opened),
    onNewBottle: () => toast(copy.toast.newBottle),
    onPartnerState: (next, prev) => {
      if (next === 'here' && prev !== 'here') toast(copy.toast.partnerHere)
      else if (next === 'gone' && prev === 'here') toast(copy.toast.partnerLeft)
    },
  })

  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const together = state.connected && state.partner.state === 'here'
  useEffect(() => onTogether(together), [together, onTogether])

  const status = statusFor(copy, state.connected, state.partner.state, state.partner.lastSeen)
  const partnerAt = state.distance.at[profile.partner]
  const myAt = state.distance.at[profile.who]
  const dLine = distanceLine(copy, state.distance, state.partner.state, partnerAt)
  const tier = tierLine(copy, state.distance, together)
  const sharing = loc.status === 'on'

  // A gentle nudge when they are right next to each other.
  const nearNow = together && state.distance.meters !== null && state.distance.meters < 150 && state.distance.precise
  const wasNear = useMemo(() => ({ v: false }), [])
  useEffect(() => {
    if (nearNow && !wasNear.v) navigator.vibrate?.([60, 80, 60, 80, 120])
    wasNear.v = nearNow
  }, [nearNow, wasNear])

  return (
    <div className="relative z-10 mx-auto flex h-full w-full max-w-lg flex-col">
      <header className="flex items-center justify-between px-5 pb-1 safe-top">
        <div className="flex items-center gap-2.5">
          <span className={`h-2 w-2 rounded-full ${state.connected ? 'bg-emerald-400/80' : 'bg-amber-400/80'}`} />
          <span className="text-lg font-bold text-ink">نبضنا</span>
        </div>
        <button onClick={() => setSettings(true)} aria-label="الإعدادات" className="rounded-full p-2.5 text-mist transition-colors active:bg-glass">
          <SettingsIcon className="h-5 w-5" />
        </button>
      </header>

      <main className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {tab === 'heart' ? (
            <motion.section
              key="heart"
              className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto pb-2 scroll-soft"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <HeartStage
                me={profile.who}
                partnerState={state.partner.state}
                connected={state.connected}
                serverNow={serverNow}
                rippleTick={rippleTick}
                haptics={haptics}
                sound={sound}
                distance={state.distance}
                onTouchPartner={() => { sendRipple(); setTouched(true) }}
              />
              <div className="-mt-3 min-h-[132px] px-8 text-center">
                <AnimatePresence mode="wait">
                  <motion.div key={status.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
                    <h1 className="text-2xl font-bold leading-tight text-ink">{status.title}</h1>
                    <p className="mt-1.5 text-sm text-mist">{status.sub}</p>
                  </motion.div>
                </AnimatePresence>

                {dLine && (
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[15px] text-ink">
                    <MapPin className="h-4 w-4 text-accent-soft" /> {dLine}
                  </p>
                )}
                {tier && <p className="mt-1 text-xs text-accent-soft">{tier}</p>}
                {!dLine && sharing && myAt && state.distance.at[profile.partner] === null && <p className="mt-3 text-xs text-mist">{copy.distance.waitingOther}</p>}
                {state.distance.closestToday !== null && dLine && state.distance.meters !== null && state.distance.meters > state.distance.closestToday + 50 && <p className="mt-1.5 text-xs text-mist/80">{copy.distance.closest(dist(state.distance.closestToday))}</p>}

                {state.together.total >= 60 && <p className="mt-3 text-xs text-mist/70">معًا اليوم {spent(state.together.today)}</p>}
                {!touched && state.partner.state !== 'gone' && <p className="mt-2 text-xs text-accent-soft/90">{copy.touchHint}</p>}
              </div>

              {loc.status === 'ask' && (
                <div className="glass mx-6 mb-4 rounded-2xl p-4 text-center">
                  <p className="text-[15px] font-medium text-ink">{copy.distance.askTitle}</p>
                  <p className="mt-1 text-xs leading-6 text-mist">{copy.distance.askBody}</p>
                  <div className="mt-3 flex justify-center gap-2">
                    <button onClick={loc.enable} className="rounded-xl bg-accent px-5 py-2 text-sm font-bold text-on-accent active:scale-95">{copy.distance.askYes}</button>
                    <button onClick={loc.dismiss} className="rounded-xl px-4 py-2 text-sm text-mist active:scale-95">{copy.distance.askNo}</button>
                  </div>
                </div>
              )}
              {loc.status === 'denied' && <p className="mx-8 mb-3 text-center text-xs leading-6 text-mist">{copy.distance.denied}</p>}
            </motion.section>
          ) : (
            <motion.section
              key="sea"
              className="absolute inset-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Sea waiting={state.waiting} copy={copy} onWaiting={setWaiting} active={tab === 'sea'} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <nav className="px-6 pt-1 safe-bottom">
        <div className="glass relative mx-auto grid max-w-xs grid-cols-2 rounded-2xl p-1.5">
          {([
            ['heart', 'نبضنا', <Heart key="h" className="h-[18px] w-[18px]" />],
            ['sea', 'البحر', <BottleArt key="b" className="h-[20px] w-[10px]" />],
          ] as const).map(([k, label, icon]) => (
            <button key={k} onClick={() => setTab(k)} className="relative flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-ink">
              {tab === k && <motion.span layoutId="tab" className="absolute inset-0 rounded-xl bg-mist/20" transition={{ type: 'spring', stiffness: 320, damping: 32 }} />}
              <span className="relative flex items-center gap-2">
                {icon}
                {label}
                {k === 'sea' && state.waiting > 0 && <span className="rounded-full bg-accent px-1.5 text-[11px] font-bold leading-5 text-on-accent">{num(state.waiting)}</span>}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <Settings open={settings} onClose={() => setSettings(false)} haptics={haptics} setHaptics={setHaptics} sound={sound} setSound={setSound} theme={theme} setTheme={setTheme} loc={loc} partner={profile.partner} />
    </div>
  )
}

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [booting, setBooting] = useState(true)
  const [together, setTogether] = useState(false)

  useEffect(() => {
    api.get<Profile>('/me')
      .then((p) => setProfile({ who: p.who, partner: p.partner }))
      .catch((e) => { if (!(e instanceof ApiError && e.status === 401)) console.error(e) })
      .finally(() => setBooting(false))
  }, [])

  return (
    <ToastProvider>
      <Background together={together && profile !== null} />
      {booting ? null : profile ? <Home profile={profile} onTogether={setTogether} /> : <Join onEnter={setProfile} />}
    </ToastProvider>
  )
}
