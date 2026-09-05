import { useEffect, useState } from 'react'

/**
 * Re-renders whenever any localStorage-backed collection changes (including
 * updates made from another tab), by subscribing to the custom event the
 * storage module dispatches on every write.
 */
export function useCollectionVersion(): number {
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1)
    window.addEventListener('gs:collection-changed', bump)
    window.addEventListener('storage', bump)
    return () => {
      window.removeEventListener('gs:collection-changed', bump)
      window.removeEventListener('storage', bump)
    }
  }, [])

  return version
}
