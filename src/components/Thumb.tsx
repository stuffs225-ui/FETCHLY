import { useState } from 'react'
import { Music } from 'lucide-react'
import { PLATFORM_NAME } from '@/lib/types'
import type { Platform } from '@/lib/types'

const COLOR: Record<Platform, string> = {
  youtube: '#e5322d',
  instagram: 'linear-gradient(135deg,#f58529,#dd2a7b 55%,#8134af)',
  tiktok: '#111111',
}

/** A small coloured tag saying where a link comes from. */
export function PlatformBadge({ platform, className }: { platform: Platform; className?: string }) {
  return (
    <span className={`rounded-md px-1.5 py-[1px] text-[10px] font-bold leading-4 text-white ${className ?? ''}`} style={{ background: COLOR[platform] }}>
      {PLATFORM_NAME[platform]}
    </span>
  )
}

/** The video's still when the platform gives us one; otherwise (or if it fails to load) a quiet placeholder. */
export function Thumb({ src, platform, className, badge = true }: { src: string | null; platform: Platform; className?: string; badge?: boolean }) {
  const [failed, setFailed] = useState(false)
  return !src || failed ? (
    <span className={`flex flex-col items-center justify-center gap-1 bg-mist/20 text-mist ${className ?? ''}`}>
      <Music className="h-5 w-5" />
      {badge && <PlatformBadge platform={platform} />}
    </span>
  ) : (
    <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className={`bg-mist/20 object-cover ${className ?? ''}`} />
  )
}
