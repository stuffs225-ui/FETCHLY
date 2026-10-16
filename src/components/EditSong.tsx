import { useState } from 'react'
import { Sheet } from './Sheet'
import { PlatformBadge } from './Thumb'
import { useToast } from './toastContext'
import { api } from '@/lib/api'
import type { Copy } from '@/lib/copy'
import type { Song } from '@/lib/types'
import { formatTime, parseTime } from '@/lib/youtube'

function EditBody({ song, copy, onSaved, onClose }: { song: Song; copy: Copy; onSaved: (s: Song) => void; onClose: () => void }) {
  const toast = useToast()
  const [note, setNote] = useState(song.note ?? '')
  const [start, setStart] = useState(song.start ? formatTime(song.start) : '')
  const [busy, setBusy] = useState(false)

  const save = async () => {
    setBusy(true)
    try {
      onSaved(await api.patch<Song>(`/songs/${song.id}`, { note: note.trim(), start: parseTime(start) }))
      onClose()
    } catch {
      toast(copy.toast.error)
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <PlatformBadge platform={song.platform} />
        <p className="line-clamp-1 flex-1 text-sm text-ink">{song.title}</p>
      </div>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, 140))}
        placeholder={copy.songs.note}
        className="w-full rounded-2xl border border-glass-line bg-glass px-4 py-3 text-ink outline-none placeholder:text-mist/60 focus:border-accent/50"
      />
      {song.platform === 'youtube' && (
        <label className="flex items-center justify-between gap-3 rounded-2xl border border-glass-line bg-glass px-4 py-2.5">
          <span className="text-sm text-mist">{copy.songs.startsAt}</span>
          <input value={start} onChange={(e) => setStart(e.target.value)} placeholder="0:00" dir="ltr" inputMode="numeric" className="w-20 bg-transparent text-center text-ink outline-none placeholder:text-mist/50" />
        </label>
      )}
      <button onClick={save} disabled={busy} className="w-full rounded-2xl bg-accent py-3.5 text-base font-bold text-on-accent transition-transform active:scale-[0.98] disabled:opacity-50">
        {copy.songs.save}
      </button>
    </div>
  )
}

/** The person who added a link can change its note (and, for YouTube, the start second). */
export function EditSong({ song, onClose, copy, onSaved }: { song: Song | null; onClose: () => void; copy: Copy; onSaved: (s: Song) => void }) {
  return (
    <Sheet open={song !== null} onClose={onClose} title={copy.songs.edit}>
      {song && <EditBody key={song.id} song={song} copy={copy} onSaved={onSaved} onClose={onClose} />}
    </Sheet>
  )
}
