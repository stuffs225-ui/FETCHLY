import { useCallback, useEffect, useRef, useState } from 'react'
import type { DistanceInfo, PState, Together } from './types'

export interface LiveState {
  connected: boolean
  partner: { state: PState; lastSeen: number | null }
  together: Together
  waiting: number
  distance: DistanceInfo
}

interface Handlers {
  onRipple: () => void
  onOpened: () => void
  onNewBottle: () => void
  onPartnerState: (next: PState, prev: PState) => void
}

/**
 * One WebSocket for presence + events. Keeps a running estimate of the clock
 * offset to the server so both phones can beat to the exact same instant.
 */
export function useLive(handlers: Handlers) {
  const [state, setState] = useState<LiveState>({
    connected: false,
    partner: { state: 'gone', lastSeen: null },
    together: { total: 0, today: 0 },
    waiting: 0,
    distance: { meters: null, precise: false, at: { a: null, b: null }, closestToday: null },
  })
  const hRef = useRef(handlers)
  hRef.current = handlers
  const offset = useRef(0)
  const waitingRef = useRef(0)
  const partnerRef = useRef<PState>('gone')
  const wsRef = useRef<WebSocket | null>(null)

  const serverNow = useCallback(() => Date.now() + offset.current, [])

  useEffect(() => {
    let closed = false
    let retry = 0
    let timer: ReturnType<typeof setTimeout> | undefined
    let syncTimer: ReturnType<typeof setInterval> | undefined
    const samples: { rtt: number; offset: number }[] = []
    const sent = new Map<number, number>()

    const setPartner = (next: PState, lastSeen: number | null, silent = false) => {
      const prev = partnerRef.current
      partnerRef.current = next
      setState((s) => ({ ...s, partner: { state: next, lastSeen } }))
      if (!silent && prev !== next) hRef.current.onPartnerState(next, prev)
    }

    const connect = () => {
      const ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`)
      wsRef.current = ws

      const sendSync = () => {
        const id = Math.floor(performance.now())
        sent.set(id, performance.now())
        ws.send(JSON.stringify({ t: 'sync', id }))
      }

      ws.onopen = () => {
        retry = 0
        setState((s) => ({ ...s, connected: true }))
        ws.send(JSON.stringify({ t: 'visible', value: document.visibilityState === 'visible' }))
        sendSync()
        syncTimer = setInterval(() => ws.readyState === 1 && sendSync(), 20_000)
      }

      ws.onmessage = (ev) => {
        const m = JSON.parse(ev.data)
        if (m.t === 'hello') {
          setPartner(m.partner.state, m.partner.lastSeen, true)
          waitingRef.current = m.waiting
          setState((s) => ({ ...s, together: m.together, waiting: m.waiting, distance: m.distance }))
        } else if (m.t === 'partner') {
          setPartner(m.state, m.lastSeen)
        } else if (m.t === 'sync') {
          const t0 = sent.get(m.id)
          if (t0 === undefined) return
          sent.delete(m.id)
          const rtt = performance.now() - t0
          samples.push({ rtt, offset: m.serverTime + rtt / 2 - Date.now() })
          if (samples.length > 6) samples.shift()
          offset.current = samples.reduce((best, s) => (s.rtt < best.rtt ? s : best)).offset
        } else if (m.t === 'together') {
          setState((s) => ({ ...s, together: { total: m.total, today: m.today } }))
        } else if (m.t === 'distance') {
          setState((s) => ({ ...s, distance: { meters: m.meters, precise: m.precise, at: m.at, closestToday: m.closestToday } }))
        } else if (m.t === 'ripple') {
          hRef.current.onRipple()
        } else if (m.t === 'opened') {
          hRef.current.onOpened()
        } else if (m.t === 'bottle') {
          if (m.waiting > waitingRef.current) hRef.current.onNewBottle()
          waitingRef.current = m.waiting
          setState((s) => ({ ...s, waiting: m.waiting }))
        }
      }

      ws.onclose = () => {
        clearInterval(syncTimer)
        setState((s) => ({ ...s, connected: false }))
        if (closed) return
        timer = setTimeout(connect, Math.min(1000 * 2 ** retry++, 10_000))
      }
    }

    const onVisible = () => {
      const ws = wsRef.current
      if (ws?.readyState === 1) ws.send(JSON.stringify({ t: 'visible', value: document.visibilityState === 'visible' }))
      else if (document.visibilityState === 'visible' && !closed && (!ws || ws.readyState === 3)) {
        clearTimeout(timer)
        connect()
      }
    }

    connect()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      closed = true
      clearTimeout(timer)
      clearInterval(syncTimer)
      document.removeEventListener('visibilitychange', onVisible)
      wsRef.current?.close()
    }
  }, [])

  const sendRipple = useCallback(() => {
    const ws = wsRef.current
    if (ws?.readyState === 1) ws.send(JSON.stringify({ t: 'ripple' }))
  }, [])

  const setWaiting = useCallback((n: number) => {
    waitingRef.current = n
    setState((s) => ({ ...s, waiting: n }))
  }, [])

  return { state, serverNow, sendRipple, setWaiting }
}
