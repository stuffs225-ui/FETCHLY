import { useEffect, useRef, useState } from 'react'
import { ClipboardPaste, Loader2 } from 'lucide-react'
import { Sheet } from './Sheet'
import { useToast } from './toastContext'
import { api, ApiError } from '@/lib/api'
import type { Copy } from '@/lib/copy'
import { Thumb, PlatformBadge } from './Thumb'
import type { Platform } from '@/lib/types'
import { formatTime, parseTime } from '@/lib/youtube'

interface Preview {
  platform: Platform
  id: string
  start: number
  url: string
  title: string | null
  channel: string | null
  thumb: string | null
  embed: boolean
}

/** Paste a YouTube link → see the video right away → add an optional line → done. */
function AddBody({ copy, onAdded, onClose }: { copy: Copy; onAdded: () => void; onClose: () => void }) {
  const toast = useToast()
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<Preview | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [start, setStart] = useState('')
  const [sending, setSending] = useState(false)
  const seq = useRef(0)

  // Look the link up shortly after it stops changing.
  useEffect(() => {
    const text = url.trim()
    if (!text) return
    const mine = ++seq.current
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const p = await api.post<Preview>('/songs/preview', { url: text })
        if (seq.current !== mine) return
        setPreview(p)
        setStart(p.start ? formatTime(p.start) : '')
        setError('')
      } catch (e) {
        if (seq.current !== mine) return
        const key = e instanceof ApiError ? e.message : 'generic'
        setPreview(null)
        setError(copy.songs.errors[key as keyof typeof copy.songs.errors] ?? copy.songs.errors.generic)
      } finally {
        if (seq.current === mine) setLoading(false)
      }
    }, 350)
    return () => clearTimeout(timer)
  }, [url, copy])

  const onUrl = (v: string) => {
    setUrl(v)
    if (!v.trim()) {
      seq.current++
      setPreview(null)
      setError('')
      setLoading(false)
    }
  }

  const pasteFromClipboard = async () => {
    try {
      onUrl(await navigator.clipboard.readText())
    } catch {
      /* the browser refused — the user can paste by hand */
    }
  }

  const send = async () => {
    if (!preview || sending) return
    setSending(true)
    try {
      await api.post('/songs', { url: url.trim(), note: note.trim(), start: parseTime(start) })
      onAdded()
      onClose()
    } catch (e) {
      const key = e instanceof ApiError ? e.message : 'generic'
      toast(copy.songs.errors[key as keyof typeof copy.songs.errors] ?? copy.toast.error)
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          value={url}
          onChange={(e) => onUrl(e.target.value)}
          placeholder={copy.songs.pastePlaceholder}
          dir="ltr"
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          className="w-full rounded-2xl border border-glass-line bg-glass py-3.5 pl-24 pr-4 text-left text-ink outline-none placeholder:text-mist/60 focus:border-accent/50"
        />
        <button onClick={pasteFromClipboard} className="absolute left-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-xl bg-mist/20 px-3 py-2 text-sm text-ink active:scale-95">
          <ClipboardPaste className="h-4 w-4" /> {copy.songs.paste}
        </button>
      </div>

      {loading && <p className="flex items-center justify-center gap-2 text-sm text-mist"><Loader2 className="h-4 w-4 animate-spin" /></p>}
      {error && !loading && <p className="text-center text-sm text-accent-soft">{error}</p>}

      {preview && !loading && (
        <div className="space-y-3">
          <div className="flex gap-3 rounded-2xl border border-glass-line bg-glass p-2.5">
            <Thumb src={preview.thumb} platform={preview.platform} className="aspect-video w-32 shrink-0 rounded-xl" />
            <div className="min-w-0 py-1">
              <PlatformBadge platform={preview.platform} />
              <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-ink">{preview.title ?? ''}</p>
              {preview.channel && <p className="mt-1 truncate text-xs text-mist">{preview.channel}</p>}
            </div>
          </div>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, 140))}
            placeholder={copy.songs.note}
            className="w-full rounded-2xl border border-glass-line bg-glass px-4 py-3 text-ink outline-none placeholder:text-mist/60 focus:border-accent/50"
          />
          {!preview.embed && <p className="px-1 text-xs leading-6 text-accent-soft">{copy.songs.noEmbed}</p>}
          {preview.platform === 'youtube' && <label className="flex items-center justify-between gap-3 rounded-2xl border border-glass-line bg-glass px-4 py-2.5">
            <span className="text-sm text-mist">{copy.songs.startsAt}</span>
            <input
              value={start}
              onChange={(e) => setStart(e.target.value)}
              placeholder="0:00"
              dir="ltr"
              inputMode="numeric"
              className="w-20 bg-transparent text-center text-ink outline-none placeholder:text-mist/50"
            />
          </label>}
          <button onClick={send} disabled={sending} className="w-full rounded-2xl bg-accent py-3.5 text-base font-bold text-on-accent transition-transform active:scale-[0.98] disabled:opacity-50">
            {copy.songs.send}
          </button>
        </div>
      )}
    </div>
  )
}

export function AddSong({ open, onClose, copy, onAdded }: { open: boolean; onClose: () => void; copy: Copy; onAdded: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title={copy.songs.title}>
      <AddBody copy={copy} onAdded={onAdded} onClose={onClose} />
    </Sheet>
  )
}
