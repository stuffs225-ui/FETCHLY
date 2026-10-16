import { useEffect, useState } from 'react'
import { Image as ImageIcon, Mic, Music, RotateCcw, Trash2 } from 'lucide-react'
import { Sheet } from './Sheet'
import { Skeleton } from './Skeleton'
import { PlatformBadge } from './Thumb'
import { VoicePlayer } from './VoicePlayer'
import { api } from '@/lib/api'
import type { Bottle, Song } from '@/lib/types'
import { ago } from '@/lib/time'

type Kind = 'songs' | 'bottles'
interface TrashData { songs: (Song & { deletedAt: number })[]; bottles: (Bottle & { deletedAt: number })[] }

/** Everything I deleted. Nothing is gone until I erase it from here. */
export function Trash({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="المحذوفات">
      {open && <TrashBody />}
    </Sheet>
  )
}

function TrashBody() {
  const [data, setData] = useState<TrashData | null>(null)
  const [tab, setTab] = useState<Kind>('songs')
  const [confirm, setConfirm] = useState<string | null>(null)

  useEffect(() => {
    api.get<TrashData>('/trash').then(setData).catch(() => setData({ songs: [], bottles: [] }))
  }, [])

  const drop = (kind: Kind, id: number) => setData((d) => (d ? { ...d, [kind]: d[kind].filter((x) => x.id !== id) } : d))
  const restore = async (kind: Kind, id: number) => { await api.post(`/trash/${kind}/${id}/restore`).catch(() => {}); drop(kind, id) }
  const erase = async (kind: Kind, id: number) => { await api.del(`/trash/${kind}/${id}`).catch(() => {}); drop(kind, id); setConfirm(null) }

  const items = data ? data[tab] : null
  const actions = (kind: Kind, id: number) => {
    const key = `${kind}${id}`
    return (
      <div className="mt-2 flex items-center justify-end gap-2">
        {confirm === key ? (
          <>
            <span className="me-auto text-xs text-mist">حذف نهائي؟ لا رجعة بعده</span>
            <button onClick={() => erase(kind, id)} className="rounded-full bg-accent/20 px-4 py-1.5 text-xs text-accent-soft">حذف نهائي</button>
            <button onClick={() => setConfirm(null)} className="rounded-full border border-glass-line px-4 py-1.5 text-xs text-ink">إلغاء</button>
          </>
        ) : (
          <>
            <button onClick={() => restore(kind, id)} className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-bold text-on-accent active:scale-95"><RotateCcw className="h-3.5 w-3.5" /> استرجاع</button>
            <button onClick={() => setConfirm(key)} aria-label="حذف نهائي" className="rounded-full p-2 text-mist active:scale-90"><Trash2 className="h-4 w-4" /></button>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="mb-4 grid grid-cols-2 gap-1 rounded-2xl border border-glass-line bg-glass p-1">
        {([['songs', 'المشاركات'], ['bottles', 'الرسائل']] as const).map(([k, label]) => (
          <button key={k} onClick={() => { setTab(k); setConfirm(null) }} aria-pressed={tab === k} className={`rounded-xl py-2 text-sm transition-colors ${tab === k ? 'bg-accent/20 text-ink' : 'text-mist'}`}>
            {label}{data && data[k].length > 0 ? ` · ${data[k].length}` : ''}
          </button>
        ))}
      </div>
      {items === null && <Skeleton rows={3} tall />}
      {items?.length === 0 && <p className="py-10 text-center text-sm text-mist">لا شيء هنا</p>}
      <ul className="space-y-3">
        {tab === 'songs' && data?.songs.map((s) => (
          <li key={s.id} className="rounded-2xl border border-glass-line bg-glass p-4">
            <div className="flex items-center gap-3">
              <Music className="h-4 w-4 shrink-0 text-mist" />
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 block text-sm font-medium text-ink">{s.title}</span>
                <span className="mt-0.5 flex items-center gap-2 text-xs text-mist"><PlatformBadge platform={s.platform} /> حُذفت {ago(s.deletedAt)}</span>
              </span>
            </div>
            {actions('songs', s.id)}
          </li>
        ))}
        {tab === 'bottles' && data?.bottles.map((b) => (
          <li key={b.id} className="rounded-2xl border border-glass-line bg-glass p-4">
            <div className="mb-2 flex items-center gap-2 text-xs text-mist">
              حُذفت {ago(b.deletedAt)}
              {b.photoUrl && <ImageIcon className="h-3.5 w-3.5" />}
              {b.song && <Music className="h-3.5 w-3.5" />}
            </div>
            {b.kind === 'voice' && (b.audioUrl ? <div className="mb-2"><VoicePlayer src={b.audioUrl} /></div> : <Mic className="h-4 w-4 text-mist" />)}
            {b.text && <p className="line-clamp-4 whitespace-pre-wrap text-[15px] leading-7 text-ink">{b.text}</p>}
            {actions('bottles', b.id)}
          </li>
        ))}
      </ul>
    </>
  )
}
