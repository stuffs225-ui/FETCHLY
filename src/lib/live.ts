import { useCallback, useEffect, useRef, useState } from 'react'
import { api, ApiError } from './api'
import type { DistanceInfo, Listen, PState, Song, SongsInfo, Together } from './types'

export interface Fatal {
  sql: string
  dashboard: string
}

export interface LiveState {
  connected: boolean
  partner: { state: PState; lastSeen: number | null }
  together: Together
  waiting: number
  distance: DistanceInfo
  songs: SongsInfo
  listen: Listen | null
  /** The database needs its one-time setup SQL (again). */
  fatal: Fatal | null
}

interface Handlers {
  onRipple: () => void
  onOpened: () => void
  onNewBottle: () => void
  onNewSong: (info: SongsInfo) => void
  onPartnerState: (next: PState, prev: PState) => void
}

interface SyncResponse {
  serverTime: number
  partner: { state: PState; lastSeen: number | null }
  waiting: number
  events: string[]
  distance: DistanceInfo
  together: Together
  songs: SongsInfo
  listen: Listen | null
}

const FAST = 2500 // both here: feels live
const SLOW = 6000 // alone: keeps the cost down but still notices arrivals quickly

export type { Song }

/**
 * Presence by lightweight polling (works on serverless hosting where there are no
 * persistent sockets). Each poll also measures the clock offset to the server, so
 * both phones can still beat — and listen — on the exact same instant.
 */
export function useLive(handlers: Handlers) {
  const [state, setState] = useState<LiveState>({
    connected: false,
    partner: { state: 'gone', lastSeen: null },
    together: { total: 0, today: 0 },
    waiting: 0,
    distance: { meters: null, precise: false, at: { a: null, b: null }, closestToday: null },
    songs: { n: 0, lastId: 0, lastAuthor: null },
    listen: null,
    fatal: null,
  })
  const hRef = useRef(handlers)
  useEffect(() => {
    hRef.current = handlers
  })
  const offset = useRef(0)
  const waitingRef = useRef<number | null>(null)
  const partnerRef = useRef<PState | null>(null)
  const songRef = useRef<number | null>(null)

  const serverNow = useCallback(() => Date.now() + offset.current, [])

  useEffect(() => {
    let stopped = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let busy = false
    let nextDelay = SLOW
    const samples: { rtt: number; offset: number }[] = []

    const run = async () => {
      if (stopped || busy) return
      clearTimeout(timer)
      busy = true
      const visible = document.visibilityState === 'visible'
      const t0 = performance.now()
      const wall0 = Date.now()
      try {
        const r = await api.post<SyncResponse>('/sync', { visible })
        const rtt = performance.now() - t0
        samples.push({ rtt, offset: r.serverTime + rtt / 2 - (wall0 + rtt) })
        if (samples.length > 6) samples.shift()
        offset.current = samples.reduce((best, s) => (s.rtt < best.rtt ? s : best)).offset

        const prevPartner = partnerRef.current
        partnerRef.current = r.partner.state
        if (waitingRef.current !== null && r.waiting > waitingRef.current) hRef.current.onNewBottle()
        waitingRef.current = r.waiting
        if (songRef.current !== null && r.songs.lastId > songRef.current) hRef.current.onNewSong(r.songs)
        songRef.current = r.songs.lastId
        setState({
          connected: true, partner: r.partner, together: r.together, waiting: r.waiting,
          distance: r.distance, songs: r.songs, listen: r.listen, fatal: null,
        })

        for (const e of r.events) {
          if (e === 'ripple') hRef.current.onRipple()
          else if (e === 'opened') hRef.current.onOpened()
        }
        if (prevPartner !== null && prevPartner !== r.partner.state) hRef.current.onPartnerState(r.partner.state, prevPartner)
        nextDelay = r.partner.state === 'here' ? FAST : SLOW
      } catch (e) {
        if (e instanceof ApiError && e.message === 'schema_missing' && e.extra?.sql) {
          setState((s) => ({ ...s, connected: false, fatal: { sql: e.extra!.sql!, dashboard: e.extra!.dashboard ?? 'https://supabase.com/dashboard' } }))
          nextDelay = 8000
        } else {
          setState((s) => ({ ...s, connected: false }))
          nextDelay = 4000
        }
      } finally {
        busy = false
        // A hidden page stops polling entirely; it resumes (and says so) when shown again.
        if (!stopped && document.visibilityState === 'visible') timer = setTimeout(run, nextDelay)
      }
    }

    const onVisibility = () => {
      clearTimeout(timer)
      void run() // tells the server immediately whether we are looking or not
    }

    void run()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stopped = true
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const sendRipple = useCallback(() => {
    api.post('/ripple').catch(() => {})
  }, [])

  const setWaiting = useCallback((n: number) => {
    waitingRef.current = n
    setState((s) => ({ ...s, waiting: n }))
  }, [])

  return { state, serverNow, sendRipple, setWaiting }
}
