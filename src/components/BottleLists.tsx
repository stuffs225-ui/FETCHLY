import { useEffect, useState } from 'react'
import { Image as ImageIcon, Mic, Music, Trash2 } from 'lucide-react'
import { Sheet } from './Sheet'
import { VoicePlayer } from './VoicePlayer'
import { api } from '@/lib/api'
import type { Bottle } from '@/lib/types'
import type { Copy } from '@/lib/copy'
import { moodColor } from '@/lib/moods'
import { ago, dateText } from '@/lib/time'

function statusOf(b: Bottle, copy: Copy, now: number) {
  if (b.openedAt) return copy.bottle.statusOpened(ago(b.openedAt))
  if (b.arriveAt && b.arriveAt > now) return copy.bottle.statusSailing
  if (b.unlockAt && b.unlockAt > now) return copy.bottle.statusLocked(dateText(b.unlockAt))
  return b.arriveAt ? copy.bottle.statusArrived : copy.sea.notFound
}

/** What I threw into the sea, and where each bottle is now. */
export function BottleLists({ open, onClose, copy }: { open: boolean; onClose: () => void; copy: Copy }) {
  return (
    <Sheet open={open} onClose={onClose} title={copy.sea.mine}>
      {open && <MineBody copy={copy} />}
    </Sheet>
  )
}

function MineBody({ copy }: { copy: Copy }) {
  const [items, setItems] = useState<Bottle[] | null>(null)
  const [confirm, setConfirm] = useState<number | null>(null)
  const [now] = useState(() => Date.now())

  useEffect(() => {
    api.get<Bottle[]>('/bottles/mine').then(setItems).catch(() => setItems([]))
  }, [])

  const remove = async (id: number) => {
    await api.del(`/bottles/${id}`)
    setItems((list) => list?.filter((b) => b.id !== id) ?? null)
    setConfirm(null)
  }

  return (
    <>
      {items === null && <p className="py-10 text-center text-sm text-mist">…</p>}
      {items?.length === 0 && <p className="py-10 text-center text-sm text-mist">{copy.sea.noneMine}</p>}
      <ul className="space-y-3">
        {items?.map((b) => (
          <li key={b.id} className="rounded-2xl border border-glass-line bg-glass p-4">
            <div className="mb-2 flex items-center justify-between gap-2 text-xs text-mist">
              <span className="flex items-center gap-2">
                {b.mood && <span className="h-2.5 w-2.5 rounded-full" style={{ background: moodColor(b.mood) ?? undefined }} />}
                {ago(b.createdAt)}
                {b.photoUrl && <ImageIcon className="h-3.5 w-3.5" />}
                {b.song && <Music className="h-3.5 w-3.5" />}
              </span>
              <span className={b.openedAt ? 'text-accent-soft' : ''}>{statusOf(b, copy, now)}</span>
            </div>
            {b.kind === 'voice' && b.audioUrl && <div className="mb-2"><VoicePlayer src={b.audioUrl} /></div>}
            {b.kind === 'voice' && !b.audioUrl && <Mic className="h-4 w-4 text-mist" />}
            {b.photoUrl && <img src={b.photoUrl} alt="" className="mb-2 max-h-40 rounded-xl object-cover" />}
            {b.text && <p className="whitespace-pre-wrap text-[16px] leading-8 text-ink">{b.text}</p>}
            <div className="mt-2 flex justify-end">
              {confirm === b.id ? (
                <button onClick={() => remove(b.id)} className="rounded-full bg-accent/20 px-4 py-1.5 text-xs text-accent-soft">تأكيد الحذف</button>
              ) : (
                <button onClick={() => setConfirm(b.id)} aria-label="حذف" className="rounded-full p-2 text-mist hover:bg-glass hover:text-ink"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
