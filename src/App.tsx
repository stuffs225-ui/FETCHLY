import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, MapPin, Music, Settings as SettingsIcon, X } from 'lucide-react'
import { Background } from '@/components/Background'
import { Join } from '@/components/Join'
import { HeartStage } from '@/components/HeartStage'
import { Sea } from '@/components/Sea'
import { Settings } from '@/components/Settings'
import { Songs, InviteBanner } from '@/components/Songs'
import { SchemaSetup } from '@/components/SchemaSetup'
import { BottleArt } from '@/components/BottleArt'
import { ToastProvider } from '@/components/Toast'
import { copyText } from '@/lib/share'
import { chime, unlockSound } from '@/lib/sound'
import { useToast } from '@/components/toastContext'
import { api, ApiError } from '@/lib/api'
import { makeCopy } from '@/lib/copy'
import type { Copy } from '@/lib/copy'
import { useLive } from '@/lib/live'
import { useLocationShare } from '@/lib/location'
import { usePref } from '@/lib/prefs'
import { useTheme } from '@/lib/theme'
import { ago, dist, num, spent } from '@/lib/time'
import type { DistanceInfo, Profile, PState } from '@/lib/types'

type Tab = 'heart' | 'songs' | 'sea'

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
  const [dismissed, setDismissed] = useState<number | null>(null)
  const [flash, setFlash] = useState(0)
  const [inviteSeen, setInviteSeen] = useState(() => {
    try { return Boolean(profile.invite) && localStorage.getItem(`nabd_inv_${profile.invite}`) === '1' } catch { return false }
  })
  const [inviteCopied, setInviteCopied] = useState(false)
  const toast = useToast()
  const copy = useMemo(() => makeCopy(profile), [profile])
  const [tab, setTabState] = useState<Tab>('heart')
  const [forcedFor, setForcedFor] = useState<number | null>(null)
  const [settings, setSettings] = useState(false)
  const [rippleTick, setRippleTick] = useState(0)
  const [sound, setSound] = usePref('nabd_sound', false)
  const [chimeOn, setChimeOn] = usePref('nabd_chime', false)
  const [theme, setTheme] = useTheme()
  const loc = useLocationShare()
  const [, setNow] = useState(0)

  const chimeRef = useRef(chimeOn)
  useEffect(() => {
    chimeRef.current = chimeOn
  })
  const { state, serverNow, sendRipple, setWaiting } = useLive({
    onRipple: () => { setRippleTick((t) => t + 1); setFlash((f) => f + 1); if (chimeRef.current) chime(); toast(copy.toast.touched) },
    onOpened: () => toast(copy.toast.opened),
    onNewBottle: () => { if (chimeRef.current) chime(); toast(copy.toast.newBottle) },
    onNewSong: (info) => { if (info.lastAuthor !== profile.who) { if (chimeRef.current) chime(); toast(copy.toast.newSong) } },
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

  // Sounds only start after a tap on iOS, so unlock on the first touch when the user turned them on.
  useEffect(() => {
    if (!sound && !chimeOn) return
    const unlock = () => unlockSound()
    window.addEventListener('pointerdown', unlock, { once: true })
    return () => window.removeEventListener('pointerdown', unlock)
  }, [sound, chimeOn])

  const listen = state.listen
  const invited = listen?.status === 'invite' && listen.host !== profile.who && dismissed !== listen.createdAt ? listen : null
  const inviteStamp = listen?.status === 'invite' && listen.host !== profile.who ? listen.createdAt : null
  useEffect(() => {
    if (inviteStamp === null) return
    toast(copy.toast.invite)
    if (chimeRef.current) chime()
  }, [inviteStamp]) // eslint-disable-line react-hooks/exhaustive-deps
  // When a shared session starts, bring the player into view (until the user picks a tab themselves).
  const sessionStart = listen?.status === 'playing' ? (listen.startAt ?? null) : null
  const shownTab: Tab = sessionStart !== null && forcedFor !== sessionStart ? 'songs' : tab
  const setTab = (t: Tab) => {
    setForcedFor(sessionStart)
    setTabState(t)
  }

  const joinListen = async () => {
    await api.post('/listen/join').catch(() => toast(copy.toast.error))
    setTab('songs')
  }

  // A gentle nudge when they are right next to each other.
  const nearNow = together && state.distance.meters !== null && state.distance.meters < 150 && state.distance.precise
  const wasNear = useRef(false)
  useEffect(() => {
    if (nearNow && !wasNear.current) navigator.vibrate?.([60, 80, 60, 80, 120])
    wasNear.current = nearNow
  }, [nearNow])

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

      <AnimatePresence>
        {invited && <InviteBanner key="invite" listen={invited} copy={copy} onJoin={joinListen} onLater={() => setDismissed(invited.createdAt)} />}
      </AnimatePresence>

      <main className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {shownTab === 'heart' ? (
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
                sound={sound}
                distance={state.distance}
                onTouchPartner={sendRipple}
              />
              <div className="-mt-3 min-h-[132px] px-8 text-center">
                <AnimatePresence mode="wait">
                  <motion.div key={status.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
                    <h1 className="text-2xl font-bold leading-tight text-ink">{status.title}</h1>
                    {status.sub && <p className="mt-1.5 text-sm text-mist">{status.sub}</p>}
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
                              </div>

              {profile.invite && !inviteSeen && (
                <div className="glass mx-6 mb-3 rounded-2xl p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-mist">{copy.join.invite}</p>
                      <p dir="ltr" className="mt-0.5 select-all text-start text-2xl font-bold tracking-[0.25em] text-ink">{profile.invite}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={async () => { if (profile.invite && (await copyText(profile.invite))) { setInviteCopied(true); setTimeout(() => setInviteCopied(false), 2000) } }} className="rounded-xl border border-glass-line px-3.5 py-2 text-sm text-ink active:scale-95">{inviteCopied ? 'تم' : 'نسخ'}</button>
                      <button onClick={() => { setInviteSeen(true); try { localStorage.setItem(`nabd_inv_${profile.invite}`, '1') } catch { /* ignore */ } }} aria-label="إخفاء" className="rounded-full p-2 text-mist active:scale-90"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              )}

              {loc.status === 'ask' && (
                <div className="glass mx-6 mb-4 rounded-2xl p-4 text-center">
                  <p className="text-[15px] font-medium text-ink">{copy.distance.askTitle}</p>
                  <div className="mt-3 flex justify-center gap-2">
                    <button onClick={loc.enable} className="rounded-xl bg-accent px-5 py-2 text-sm font-bold text-on-accent active:scale-95">{copy.distance.askYes}</button>
                    <button onClick={loc.dismiss} className="rounded-xl px-4 py-2 text-sm text-mist active:scale-95">{copy.distance.askNo}</button>
                  </div>
                </div>
              )}
              {loc.status === 'denied' && <p className="mx-8 mb-3 text-center text-xs leading-6 text-mist">{copy.distance.denied}</p>}
            </motion.section>
          ) : shownTab === 'songs' ? (
            <motion.section
              key="songs"
              className="absolute inset-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <Songs me={profile.who} copy={copy} songsInfo={state.songs} listen={state.listen} serverNow={serverNow} />
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
              <Sea waiting={state.waiting} copy={copy} onWaiting={setWaiting} active={shownTab === 'sea'} />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <nav className="px-6 pt-1 safe-bottom">
        <div className="glass relative mx-auto grid max-w-sm grid-cols-3 rounded-2xl p-1.5">
          {([
            ['heart', 'نبضنا', <Heart key="h" className="h-[18px] w-[18px]" />],
            ['songs', 'الأغاني', <Music key="m" className="h-[18px] w-[18px]" />],
            ['sea', 'البحر', <BottleArt key="b" className="h-[20px] w-[10px]" />],
          ] as const).map(([k, label, icon]) => (
            <button key={k} onClick={() => setTab(k)} className="relative flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium text-ink">
              {shownTab === k && <motion.span layoutId="tab" className="absolute inset-0 rounded-xl bg-mist/20" transition={{ type: 'spring', stiffness: 320, damping: 32 }} />}
              <span className="relative flex items-center gap-1.5">
                {icon}
                {label}
                {k === 'sea' && state.waiting > 0 && <span className="rounded-full bg-accent px-1.5 text-[11px] font-bold leading-5 text-on-accent">{num(state.waiting)}</span>}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <AnimatePresence>
        {flash > 0 && (
          <motion.div
            key={flash}
            className="pointer-events-none fixed inset-0 z-[70]"
            style={{ boxShadow: 'inset 0 0 90px 10px var(--accent)' }}
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            onAnimationComplete={() => setFlash((f) => (f === flash ? 0 : f))}
          />
        )}
      </AnimatePresence>

      {state.fatal && (
        <div className="fixed inset-0 z-[65] flex flex-col items-center justify-center overflow-y-auto bg-night px-8 py-10">
          <SchemaSetup sql={state.fatal.sql} dashboard={state.fatal.dashboard} />
        </div>
      )}

      <Settings open={settings} onClose={() => setSettings(false)} sound={sound} setSound={setSound} chimeOn={chimeOn} setChimeOn={setChimeOn} theme={theme} setTheme={setTheme} loc={loc} partner={profile.partner} />
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
