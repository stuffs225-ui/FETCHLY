import { useState } from 'react'
import { Music } from 'lucide-react'
import { thumb } from '@/lib/youtube'

/** YouTube's still of the video; falls back to a quiet placeholder if it cannot load. */
export function Thumb({ id, className }: { id: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  return failed ? (
    <span className={`flex items-center justify-center bg-mist/20 text-mist ${className ?? ''}`}><Music className="h-5 w-5" /></span>
  ) : (
    <img src={thumb(id)} alt="" loading="lazy" onError={() => setFailed(true)} className={`bg-mist/20 object-cover ${className ?? ''}`} />
  )
}
