import { useCallback, useEffect, useRef, useState } from 'react'

type MotionCtor = typeof DeviceMotionEvent & { requestPermission?: () => Promise<'granted' | 'denied'> }

/** Calls `onShake` when the phone is shaken. iOS asks for permission, which must come from a tap. */
export function useShake(active: boolean, onShake: () => void) {
  const cb = useRef(onShake)
  useEffect(() => {
    cb.current = onShake
  })
  const supported = typeof window !== 'undefined' && 'DeviceMotionEvent' in window
  const needsPermission = supported && typeof (window.DeviceMotionEvent as MotionCtor).requestPermission === 'function'
  const [granted, setGranted] = useState(!needsPermission)

  const askPermission = useCallback(async () => {
    try {
      const res = await (window.DeviceMotionEvent as MotionCtor).requestPermission?.()
      setGranted(res === 'granted')
    } catch {
      setGranted(false)
    }
  }, [])

  useEffect(() => {
    if (!active || !supported || !granted) return
    let last = 0
    let hits = 0
    let hitAt = 0
    const onMotion = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (!a) return
      const mag = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0)
      const now = Date.now()
      if (Math.abs(mag - 9.8) > 14) {
        hits = now - hitAt < 700 ? hits + 1 : 1
        hitAt = now
        if (hits >= 3 && now - last > 2500) {
          last = now
          hits = 0
          cb.current()
        }
      }
    }
    window.addEventListener('devicemotion', onMotion)
    return () => window.removeEventListener('devicemotion', onMotion)
  }, [active, supported, granted])

  return { supported, needsPermission: needsPermission && !granted, askPermission }
}
