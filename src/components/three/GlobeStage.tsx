import { lazy, Suspense, useEffect, useState } from 'react'
import GlobeFallback from './GlobeFallback'
import { ThreeErrorBoundary } from './ErrorBoundary'

const Globe = lazy(() => import('./Globe'))

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

/** Chooses the full 3D globe on capable/larger screens, a light SVG stand-in otherwise. */
export default function GlobeStage({ className }: { className?: string }) {
  const [capable, setCapable] = useState<boolean | null>(null)

  useEffect(() => {
    const check = () => setCapable(window.innerWidth >= 820 && hasWebGL())
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (capable === null) return <div className={className} />

  if (!capable) return <GlobeFallback className={className} />

  return (
    <ThreeErrorBoundary fallback={<GlobeFallback className={className} />}>
      <Suspense fallback={<GlobeFallback className={className} />}>
        <Globe className={className} />
      </Suspense>
    </ThreeErrorBoundary>
  )
}
