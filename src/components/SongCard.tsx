import { useState } from 'react'
import { ExternalLink, Play } from 'lucide-react'
import { Thumb, PlatformBadge } from './Thumb'
import type { BottleSong } from '@/lib/types'
import { PLATFORM_NAME } from '@/lib/types'
import { embedSrc } from '@/lib/youtube'
import type { Copy } from '@/lib/copy'

/** A song/video attached to a bottle: plays inside the page when it can, otherwise opens on its platform. */
export function SongCard({ song, copy }: { song: BottleSong; copy: Copy }) {
  const [open, setOpen] = useState(false)
  const portrait = song.platform !== 'youtube'
  return (
    <div className="rounded-2xl bg-[#3b2433]/[0.07] p-2">
      {open && song.embed ? (
        <div className={`mx-auto overflow-hidden rounded-xl bg-black ${portrait ? 'aspect-[9/16] max-h-[44dvh]' : 'aspect-video w-full'}`}>
          <iframe
            src={embedSrc({ platform: song.platform, ytId: song.ytId, url: song.url, start: song.start })}
            title={song.title}
            className="h-full w-full"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <Thumb src={song.thumb} platform={song.platform} badge={false} className="aspect-video w-24 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <PlatformBadge platform={song.platform} />
            <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-[#3b2433]">{song.title}</p>
          </div>
          {song.embed ? (
            <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-[#3b2433] px-3.5 py-2 text-sm font-bold text-[#f6ecdd] active:scale-95">
              <Play className="h-4 w-4" fill="currentColor" /> {copy.bottle.listen}
            </button>
          ) : (
            <a href={song.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-xl bg-[#3b2433] px-3.5 py-2 text-sm font-bold text-[#f6ecdd] active:scale-95">
              <ExternalLink className="h-4 w-4" /> {copy.songs.openIn(PLATFORM_NAME[song.platform])}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
