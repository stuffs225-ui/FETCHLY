import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api'

export type LocStatus = 'unsupported' | 'ask' | 'on' | 'denied' | 'off'

const KEY = 'nabd_loc'
const read = () => { try { return localStorage.getItem(KEY) } catch { return null } }
const write = (v: string) => { try { localStorage.setItem(KEY, v) } catch { /* ignore */ } }

const moved = (a: GeolocationCoordinates, b: GeolocationCoordinates) =>
  Math.hypot((a.latitude - b.latitude) * 111_000, (a.longitude - b.longitude) * 111_000 * Math.cos((a.latitude * Math.PI) / 180))

/**
 * Shares my position with the server — only while the page is open and visible,
 * and only after one explicit tap. The partner receives a distance, never coordinates.
 */
export function useLocationShare() {
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator
  const [status, setStatus] = useState<LocStatus>(() => {
    if (!supported) return 'unsupported'
    const saved = read()
    return saved === 'on' ? 'on' : saved === 'off' ? 'off' : 'ask'
  })
  const last = useRef<{ at: number; coords: GeolocationCoordinates } | null>(null)

  const push = useCallback((pos: GeolocationPosition) => {
    const prev = last.current
    const now = Date.now()
    if (prev && now - prev.at < 90_000 && moved(prev.coords, pos.coords) < 40) return
    last.current = { at: now, coords: pos.coords }
    api.put('/location', { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }).catch(() => {})
  }, [])

  const readOnce = useCallback(() => {
    navigator.geolocation.getCurrentPosition(push, (err) => { if (err.code === err.PERMISSION_DENIED) setStatus('denied') }, {
      enableHighAccuracy: true, timeout: 20_000, maximumAge: 30_000,
    })
  }, [push])

  // Already granted before (e.g. from the browser's own settings) → start without asking again.
  useEffect(() => {
    if (!supported || status !== 'ask') return
    navigator.permissions?.query({ name: 'geolocation' }).then((p) => {
      if (p.state === 'granted') { write('on'); setStatus('on') }
    }).catch(() => {})
  }, [supported, status])

  useEffect(() => {
    if (status !== 'on') return
    const tick = () => document.visibilityState === 'visible' && readOnce()
    tick()
    const id = setInterval(tick, 45_000)
    document.addEventListener('visibilitychange', tick)
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick) }
  }, [status, readOnce])

  /** Must be called from a tap so the browser is allowed to show its permission prompt. */
  const enable = useCallback(() => {
    if (!supported) return
    navigator.geolocation.getCurrentPosition(
      (pos) => { write('on'); setStatus('on'); push(pos) },
      (err) => setStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'ask'),
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 30_000 },
    )
  }, [supported, push])

  const disable = useCallback(() => {
    write('off')
    last.current = null
    setStatus('off')
    api.del('/location').catch(() => {})
  }, [])

  const dismiss = useCallback(() => { write('off'); setStatus('off') }, [])

  return { status, enable, disable, dismiss }
}
