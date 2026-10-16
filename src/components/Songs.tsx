import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ExternalLink, Headphones, Heart, Music, Plus, SkipForward, Trash2, X } from 'lucide-react'
import { HeartShape } from './Heart'
import { AddSong } from './AddSong'
import { Thumb } from './Thumb'
import { useToast } from './toastContext'
import { api } from '@/lib/api'
import type { Copy } from '@/lib/copy'
import { ago } from '@/lib/time'
import type { Listen, Song, SongsInfo, Who } from '@/lib/types'
import { loadYouTube, watchUrl, YT_STATE } from '@/lib/youtube'
import type { YTPlayer } from '@/lib/youtube'

interface Props {
  me: Who
  copy: Copy
  songsInfo: SongsInfo
  listen: Listen | null
  serverNow: () => number
}

/**
 * The shared list of songs, with the YouTube player right here. In a "listening
 * together" session both phones derive the same position from the server clock,
 * so they stay in step even if one of them joins late or buffers.
 */
export function Songs({ me, copy, songsInfo, listen, serverNow }: Props) {
  const toast = useToast()
  const [songs, setSongs] = useState<Song[] | null>(null)
  const [current, setCurrent] = useState<Song | null>(null)
  const [adding, setAdding] = useState(false)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [needTap, setNeedTap] = useState(false)
  const [failed, setFailed] = useState<{ id: string; start: number } | null>(null)

  const wrap = useRef<HTMLDivElement>(null)
  const player = useRef<YTPlayer | null>(null)
  const guard = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const wasTogether = useRef(false)
  const live = useRef({ songs, current, listen })
  useEffect(() => {
    live.current = { songs, current, listen }
  })

  const refresh = useCallback(() => {
    api.get<Song[]>('/songs').then(setSongs).catch(() => setSongs((s) => s ?? []))
  }, [])
  useEffect(refresh, [refresh, songsInfo.lastId, songsInfo.n])

  const session = listen && listen.status === 'playing' ? listen : null
  const sessionRef = useRef(session)
  useEffect(() => {
    sessionRef.current = session
  })

  /** After asking the player to start, check it really did (autoplay can be refused) and offer a tap if not. */
  const armGuard = useCallback(() => {
    clearTimeout(guard.current)
    guard.current = setTimeout(() => {
      const st = player.current?.getPlayerState()
      if (st !== YT_STATE.PLAYING && st !== YT_STATE.BUFFERING) setNeedTap(true)
    }, 2200)
  }, [])

  const playSolo = useCallback((s: Song) => {
    setFailed(null)
    setNeedTap(false)
    setCurrent(s)
    player.current?.loadVideoById({ videoId: s.ytId, startSeconds: s.start })
    armGuard()
  }, [armGuard])

  // Create the player once.
  useEffect(() => {
    let dead = false
    const host = document.createElement('div')
    wrap.current?.appendChild(host)
    loadYouTube()
      .then((YT) => {
        if (dead) return
        player.current = new YT.Player(host, {
          width: '100%',
          height: '100%',
          host: 'https://www.youtube-nocookie.com',
          playerVars: { playsinline: 1, rel: 0, modestbranding: 1, origin: location.origin },
          events: {
            onReady: () => !dead && setReady(true),
            onStateChange: (e: { data: number }) => {
              if (dead) return
              setPlaying(e.data === YT_STATE.PLAYING)
              if (e.data === YT_STATE.PLAYING) {
                clearTimeout(guard.current)
                setNeedTap(false)
              }
              if (e.data === YT_STATE.ENDED) onEnded()
            },
            onError: () => {
              if (dead) return
              clearTimeout(guard.current)
              const l = live.current
              const target = sessionRef.current ?? (l.current ? { ytId: l.current.ytId, startSec: l.current.start } : null)
              if (target) setFailed({ id: target.ytId, start: 'startSec' in target ? target.startSec : 0 })
              toast(copy.toast.ytBlocked)
            },
          },
        })
      })
      .catch(() => !dead && toast(copy.toast.ytBlocked))

    const onEnded = () => {
      if (sessionRef.current) {
        api.post('/listen/stop').catch(() => {})
        return
      }
      const { songs: list, current: cur } = live.current
      if (!list || !cur) return
      const next = list[list.findIndex((x) => x.id === cur.id) + 1]
      if (next) playSolo(next)
    }

    return () => {
      dead = true
      clearTimeout(guard.current)
      player.current?.destroy()
      player.current = null
      host.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Listening together: everyone follows the same clock.
  useEffect(() => {
    if (!session || !ready || session.startAt === undefined) return
    const startAt = session.startAt
    const expected = () => session.startSec + Math.max(0, (serverNow() - startAt) / 1000)
    let begun = false
    setFailed(null)
    setCurrent(live.current.songs?.find((s) => s.id === session.songId) ?? null)
    const begin = () => {
      begun = true
      player.current?.loadVideoById({ videoId: session.ytId, startSeconds: expected() })
      armGuard()
    }
    const t = setTimeout(begin, Math.max(0, startAt - serverNow()))
    const drift = setInterval(() => {
      const p = player.current
      if (!begun || !p || p.getPlayerState() !== YT_STATE.PLAYING) return
      if (Math.abs(p.getCurrentTime() - expected()) > 2.5) p.seekTo(expected(), true)
    }, 6000)
    return () => {
      clearTimeout(t)
      clearInterval(drift)
    }
  }, [session?.startAt, session?.ytId, ready, serverNow, armGuard]) // eslint-disable-line react-hooks/exhaustive-deps

  // The shared session ended (by either of us).
  useEffect(() => {
    if (session) {
      wasTogether.current = true
    } else if (wasTogether.current) {
      wasTogether.current = false
      player.current?.pauseVideo()
      toast(copy.toast.listenEnded)
    }
  }, [session, copy, toast])

  const tapToPlay = () => {
    const s = sessionRef.current
    setNeedTap(false)
    if (s?.startAt !== undefined) {
      const pos = s.startSec + Math.max(0, (serverNow() - s.startAt) / 1000)
      player.current?.loadVideoById({ videoId: s.ytId, startSeconds: pos })
    } else {
      player.current?.playVideo()
    }
    armGuard()
  }

  const proposeTogether = async (s: Song) => {
    await api.post('/listen', { songId: s.id }).catch(() => toast(copy.toast.error))
  }
  const stopTogether = () => api.post('/listen/stop').catch(() => {})

  const toggleHeart = async (s: Song) => {
    const on = s.reaction !== 'heart'
    setSongs((list) => list?.map((x) => (x.id === s.id ? { ...x, reaction: on ? 'heart' : null } : x)) ?? null)
    api.post(`/songs/${s.id}/react`, { on }).catch(refresh)
  }

  const remove = async (s: Song) => {
    setSongs((list) => list?.filter((x) => x.id !== s.id) ?? null)
    if (current?.id === s.id) {
      player.current?.pauseVideo()
      setCurrent(null)
    }
    api.del(`/songs/${s.id}`).catch(refresh)
  }

  const invitedByMe = listen?.status === 'invite' && listen.host === me
  const inviteSong = invitedByMe ? songs?.find((s) => s.id === listen.songId) : undefined
  const shown = session ? (songs?.find((s) => s.id === session.songId) ?? current) : current
  const failedUrl = failed ? watchUrl(failed.id, Math.floor(failed.start)) : null
  const other: Who = me === 'a' ? 'b' : 'a'

  const list = useMemo(() => songs ?? [], [songs])

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-1">
        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-glass-line bg-black/40">
          <div ref={wrap} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" />
          {!shown && !session && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-night/70 text-mist">
              <Music className="h-7 w-7" />
              <span className="text-sm">{copy.songs.pickOne}</span>
            </div>
          )}
          {needTap && (
            <button onClick={tapToPlay} className="absolute inset-0 flex items-center justify-center bg-black/55 text-lg font-bold text-white">
              {copy.songs.tapToPlay}
            </button>
          )}
          {failedUrl && (
            <a href={failedUrl} target="_blank" rel="noopener noreferrer" className="absolute inset-0 flex items-center justify-center gap-2 bg-black/70 text-sm text-white">
              <ExternalLink className="h-4 w-4" /> {copy.songs.openYt}
            </a>
          )}
        </div>

        <div className="mt-2.5 flex min-h-[44px] items-center gap-2">
          <AnimatePresence mode="wait" initial={false}>
            {session ? (
              <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 items-center gap-2.5">
                <span className="flex -space-x-2.5">
                  <HeartShape tone={me} className="h-5 w-[22px]" />
                  <HeartShape tone={other} className="h-5 w-[22px]" />
                </span>
                <span className="flex-1 truncate text-sm text-ink">{copy.songs.playingTogether}</span>
                <button onClick={stopTogether} className="rounded-xl border border-glass-line px-3.5 py-2 text-sm text-ink active:scale-95">{copy.songs.stop}</button>
              </motion.div>
            ) : invitedByMe ? (
              <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 items-center gap-2.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
                <span className="flex-1 truncate text-sm text-mist">{copy.songs.waiting}{inviteSong ? ` · ${inviteSong.title}` : ''}</span>
                <button onClick={stopTogether} className="rounded-xl border border-glass-line px-3.5 py-2 text-sm text-ink active:scale-95">{copy.songs.cancel}</button>
              </motion.div>
            ) : (
              <motion.div key="n" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-1 items-center gap-2">
                <p className="line-clamp-1 flex-1 text-sm text-ink">{shown?.title ?? ''}</p>
                {shown && (
                  <>
                    <button onClick={() => proposeTogether(shown)} aria-label={copy.songs.together} className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-sm font-bold text-on-accent active:scale-95">
                      <Headphones className="h-4 w-4" /> {copy.songs.together}
                    </button>
                    {list.findIndex((s) => s.id === shown.id) < list.length - 1 && (
                      <button onClick={() => playSolo(list[list.findIndex((s) => s.id === shown.id) + 1])} aria-label={copy.songs.next} className="rounded-xl border border-glass-line p-2.5 text-ink active:scale-95">
                        <SkipForward className="h-4 w-4" />
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between px-5">
        <span className="text-sm text-mist">{list.length > 0 ? `${copy.songs.title} · ${list.length}` : ''}</span>
        <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-sm font-bold text-on-accent active:scale-95">
          <Plus className="h-4 w-4" /> {copy.songs.add}
        </button>
      </div>

      <ul className="scroll-soft mt-2 flex-1 space-y-2 overflow-y-auto px-5 pb-3">
        {songs !== null && list.length === 0 && <li className="py-10 text-center text-sm text-mist">{copy.songs.empty}</li>}
        <AnimatePresence initial={false}>
          {list.map((s) => {
            const mine = s.author === me
            const active = shown?.id === s.id
            return (
              <motion.li
                layout
                key={s.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className={`flex items-center gap-3 rounded-2xl border p-2 ${active ? 'border-accent/50 bg-accent/10' : 'border-glass-line bg-glass'}`}
              >
                <button
                  onClick={() => !session && playSolo(s)}
                  disabled={Boolean(session)}
                  className="flex min-w-0 flex-1 items-center gap-3 text-start disabled:opacity-60"
                >
                  <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-xl bg-mist/20">
                    <Thumb id={s.ytId} className="h-full w-full" />
                    <span className="absolute start-1 top-1"><HeartShape tone={s.author} className="h-3.5 w-4" /></span>
                    {active && playing && <span className="absolute inset-0 flex items-end justify-center gap-[3px] bg-black/35 pb-2">{[0, 1, 2].map((i) => <span key={i} className="w-[3px] animate-bob rounded-full bg-white" style={{ height: 10 + i * 4, animationDelay: `${i * -0.4}s` }} />)}</span>}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-sm font-medium leading-5 text-ink">{s.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-mist">{[s.channel, ago(s.createdAt)].filter(Boolean).join(' · ')}</span>
                    {s.note && <span className="mt-0.5 block truncate text-xs text-accent-soft">{s.note}</span>}
                  </span>
                </button>
                {mine ? (
                  <span className="flex flex-col items-center gap-1">
                    {s.reaction === 'heart' && <Heart className="h-4 w-4 fill-accent text-accent" />}
                    <button onClick={() => remove(s)} aria-label="حذف" className="rounded-full p-2 text-mist active:scale-90"><Trash2 className="h-4 w-4" /></button>
                  </span>
                ) : (
                  <button onClick={() => toggleHeart(s)} aria-label="قلب" className="rounded-full p-2.5 active:scale-90">
                    <Heart className={`h-5 w-5 transition-colors ${s.reaction === 'heart' ? 'fill-accent text-accent' : 'text-mist'}`} />
                  </button>
                )}
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>

      <AddSong open={adding} onClose={() => setAdding(false)} copy={copy} onAdded={refresh} />
    </div>
  )
}

export function InviteBanner({ listen, copy, onJoin, onLater }: { listen: Listen; copy: Copy; onJoin: () => void; onLater: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-4 mb-2 flex items-center gap-3 rounded-2xl border border-accent/40 bg-dusk p-2.5"
    >
      <Thumb id={listen.ytId} className="aspect-video w-20 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-accent-soft">{copy.toast.invite}</p>
        <p className="truncate text-sm text-ink">{listen.title}</p>
      </div>
      <button onClick={onJoin} className="rounded-xl bg-accent px-3.5 py-2 text-sm font-bold text-on-accent active:scale-95">{copy.songs.join}</button>
      <button onClick={onLater} aria-label={copy.songs.later} className="rounded-full p-1.5 text-mist active:scale-90"><X className="h-4 w-4" /></button>
    </motion.div>
  )
}
