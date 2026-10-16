import { useEffect, useState } from 'react'
import { Mic, Trash2 } from 'lucide-react'
import { Sheet } from './Sheet'
import { VoicePlayer } from './VoicePlayer'
import { api } from '@/lib/api'
import type { Bottle } from '@/lib/types'
import type { Copy } from '@/lib/copy'
import { ago } from '@/lib/time'

type Mode = 'mine' | 'kept'

/** Two quiet lists: what I threw into the sea, and the notes I've kept from them. */
export function BottleLists({ mode, onClose, copy }: { mode: Mode | null; onClose: () => void; copy: Copy }) {
  const [last, setLast] = useState<Mode>('mine')
  if (mode && mode !== last) setLast(mode)
  const active = mode ?? last
  return (
    <Sheet open={mode !== null} onClose={onClose} title={active === 'mine' ? copy.sea.mine : copy.sea.kept}>
      {mode && <ListBody key={mode} mode={mode} copy={copy} />}
    </Sheet>
  )
}

function ListBody({ mode, copy }: { mode: Mode; copy: Copy }) {
  const [items, setItems] = useState<Bottle[] | null>(null)
  const [confirm, setConfirm] = useState<number | null>(null)

  useEffect(() => {
    api.get<Bottle[]>(`/bottles/${mode}`).then(setItems).catch(() => setItems([]))
  }, [mode])

  const remove = async (id: number) => {
    await api.del(`/bottles/${id}`)
    setItems((list) => list?.filter((b) => b.id !== id) ?? null)
    setConfirm(null)
  }

  const active = mode
  return (
    <>
      {items === null && <p className="py-10 text-center text-sm text-mist">…</p>}
      {items?.length === 0 && <p className="py-10 text-center text-sm text-mist">{active === 'mine' ? copy.sea.noneMine : copy.sea.noneKept}</p>}
      <ul className="space-y-3">
        {items?.map((b) => (
          <li key={b.id} className="rounded-2xl border border-glass-line bg-glass p-4">
            <div className="mb-2 flex items-center justify-between text-xs text-mist">
              <span>{ago(active === 'kept' ? (b.openedAt ?? b.createdAt) : b.createdAt)}</span>
              {active === 'mine' && (
                <span className={b.openedAt ? 'text-rose-soft' : ''}>{b.openedAt ? `فُتحت ${ago(b.openedAt)}` : copy.sea.notFound}</span>
              )}
            </div>
            {b.kind === 'voice' && b.audioUrl && <div className="mb-2"><VoicePlayer src={b.audioUrl} /></div>}
            {b.kind === 'voice' && !b.audioUrl && <Mic className="h-4 w-4 text-mist" />}
            {b.text && <p className="whitespace-pre-wrap text-[16px] leading-8 text-ink">{b.text}</p>}
            {active === 'mine' && (
              <div className="mt-2 flex justify-end">
                {confirm === b.id ? (
                  <button onClick={() => remove(b.id)} className="rounded-full bg-rose/20 px-4 py-1.5 text-xs text-rose-soft">تأكيد الحذف</button>
                ) : (
                  <button onClick={() => setConfirm(b.id)} aria-label="حذف" className="rounded-full p-2 text-mist hover:bg-glass hover:text-ink"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
