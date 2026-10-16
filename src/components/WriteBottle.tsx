import { useEffect, useRef, useState } from 'react'
import { Check, Image as ImageIcon, Mic, Music, Square, Trash2, Send, X } from 'lucide-react'
import { Sheet } from './Sheet'
import { VoicePlayer } from './VoicePlayer'
import { Thumb } from './Thumb'
import { api } from '@/lib/api'
import type { Copy } from '@/lib/copy'
import { useToast } from './toastContext'
import { clock } from '@/lib/time'
import { MOODS } from '@/lib/moods'
import type { Mood, Song } from '@/lib/types'
import type { ThrowInfo } from './ThrowRitual'

const MAX = 600
const MAX_SECONDS = 45

function pickMime() {
  const options = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg']
  return options.find((m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) ?? ''
}

/** Shrinks a photo on the phone first so the bottle stays light. Returns base64 JPEG (no prefix). */
async function preparePhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const scale = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    for (const q of [0.78, 0.68, 0.58, 0.48, 0.4]) {
      const b64 = canvas.toDataURL('image/jpeg', q).split(',')[1]
      if (b64.length <= 440_000) return b64
    }
    throw new Error('too_big')
  } finally {
    URL.revokeObjectURL(url)
  }
}

const localInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)

/** Write a note (and/or voice, photo, song), choose how it travels, and let it drift into the sea. */
export function WriteBottle({ open, onClose, copy, onThrown }: { open: boolean; onClose: () => void; copy: Copy; onThrown: (info: ThrowInfo) => void }) {
  return (
    <Sheet open={open} onClose={onClose} title={copy.sea.writeTitle}>
      <WriteBody onClose={onClose} copy={copy} onThrown={onThrown} />
    </Sheet>
  )
}

function Chip({ on, onClick, children, color }: { on: boolean; onClick: () => void; children: React.ReactNode; color?: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-colors active:scale-95 ${on ? 'border-accent bg-accent/15 text-ink' : 'border-glass-line text-mist'}`}
    >
      {color && <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />}
      {children}
    </button>
  )
}

function WriteBody({ onClose, copy, onThrown }: { onClose: () => void; copy: Copy; onThrown: (info: ThrowInfo) => void }) {
  const toast = useToast()
  const [text, setText] = useState('')
  const [rec, setRec] = useState<'idle' | 'recording' | 'done'>('idle')
  const [seconds, setSeconds] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [song, setSong] = useState<Song | null>(null)
  const [songs, setSongs] = useState<Song[] | null>(null)
  const [picking, setPicking] = useState(false)
  const [mood, setMood] = useState<Mood | null>(null)
  const [mode, setMode] = useState<'now' | 'drift' | 'at'>('now')
  const [at, setAt] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(9, 0, 0, 0)
    return localInput(d)
  })
  const [stamp, setStamp] = useState(true)
  const [sending, setSending] = useState(false)
  const [openedAt] = useState(() => Date.now())
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const fileInput = useRef<HTMLInputElement>(null)

  const stopStream = () => {
    clearInterval(timer.current)
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
  }

  // The sheet unmounts this body when it closes, so leaving also stops any recording in progress.
  useEffect(() => () => {
    stopStream()
    if (recorder.current && recorder.current.state !== 'inactive') {
      recorder.current.onstop = null
      recorder.current.stop()
    }
  }, [])
  useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url])

  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.current = s
      const mimeType = pickMime()
      const r = new MediaRecorder(s, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 32000 })
      const chunks: Blob[] = []
      r.ondataavailable = (e) => e.data.size && chunks.push(e.data)
      r.onstop = () => {
        const b = new Blob(chunks, { type: r.mimeType || mimeType || 'audio/webm' })
        setBlob(b)
        setUrl(URL.createObjectURL(b))
        setRec('done')
        stopStream()
      }
      recorder.current = r
      r.start()
      setSeconds(0)
      setRec('recording')
      timer.current = setInterval(() => setSeconds((v) => {
        if (v + 1 >= MAX_SECONDS) r.stop()
        return v + 1
      }), 1000)
    } catch {
      toast(copy.toast.micDenied)
    }
  }

  const stop = () => recorder.current?.state === 'recording' && recorder.current.stop()

  const discardVoice = () => {
    setBlob(null)
    setUrl(null)
    setRec('idle'); setSeconds(0)
  }

  const onPhoto = async (file: File | undefined) => {
    if (!file) return
    try {
      setPhoto(await preparePhoto(file))
    } catch {
      toast(copy.bottle.photoFail)
    }
  }

  const openPicker = () => {
    setPicking((v) => !v)
    if (songs === null) api.get<Song[]>('/songs').then(setSongs).catch(() => setSongs([]))
  }

  const atMs = new Date(at).getTime()
  const atValid = mode !== 'at' || (Number.isFinite(atMs) && atMs > openedAt + 60_000)
  const hasContent = text.trim().length > 0 || blob !== null || photo !== null
  const canSend = !sending && rec !== 'recording' && hasContent && atValid

  const send = async () => {
    setSending(true)
    const now = new Date()
    const ritual = { mood, mode, at: mode === 'at' ? atMs : null, stamp, stampMin: now.getHours() * 60 + now.getMinutes(), songId: song?.id ?? null }
    try {
      if (blob) {
        const type = (blob.type || 'audio/webm').split(';')[0]
        const q = new URLSearchParams({ text: text.trim(), mode, stamp: stamp ? '1' : '0', stampMin: String(ritual.stampMin) })
        if (mood) q.set('mood', mood)
        if (ritual.at) q.set('at', String(ritual.at))
        if (song) q.set('songId', String(song.id))
        await api.postBlob(`/bottles/voice?${q}`, blob, type)
      } else {
        await api.post('/bottles', {
          text: text.trim(), mood, photo, songId: ritual.songId,
          delivery: { mode, at: ritual.at }, stamp: { on: stamp, min: ritual.stampMin },
        })
      }
      onThrown({ preview: text.trim(), mood, mode, at: ritual.at, media: blob ? 'voice' : photo ? 'photo' : null })
      onClose()
    } catch {
      toast(copy.toast.error)
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => { void onPhoto(e.target.files?.[0]); e.target.value = '' }} />

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX))}
        placeholder={copy.sea.placeholder}
        rows={4}
        className="w-full resize-none rounded-2xl border border-glass-line bg-glass p-4 text-[17px] leading-8 text-ink outline-none placeholder:text-mist/60 focus:border-accent/50"
      />
      <div className="mt-1 text-end text-xs text-mist/70">{MAX - text.length}</div>

      {/* attachments */}
      <div className="mt-2 flex flex-wrap gap-2">
        {rec === 'idle' && !photo && (
          <Chip on={false} onClick={start}><Mic className="h-4 w-4" /> {copy.bottle.voice}</Chip>
        )}
        {rec === 'recording' && (
          <button onClick={stop} className="flex items-center gap-2.5 rounded-full border border-accent/60 bg-accent/10 px-4 py-2 text-sm text-ink">
            <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" /></span>
            <span className="tabular-nums">{clock(seconds)}</span>
            <Square className="h-3.5 w-3.5" fill="currentColor" />
          </button>
        )}
        {rec === 'idle' && !photo && <Chip on={false} onClick={() => fileInput.current?.click()}><ImageIcon className="h-4 w-4" /> {copy.bottle.photo}</Chip>}
        <Chip on={Boolean(song) || picking} onClick={openPicker}><Music className="h-4 w-4" /> {copy.bottle.song}</Chip>
      </div>

      {rec === 'done' && url && (
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1"><VoicePlayer src={url} /></div>
          <button onClick={discardVoice} aria-label="حذف التسجيل" className="rounded-full p-3 text-mist hover:bg-glass hover:text-ink"><Trash2 className="h-5 w-5" /></button>
        </div>
      )}
      {photo && (
        <div className="relative mt-3 w-fit">
          <img src={`data:image/jpeg;base64,${photo}`} alt="" className="max-h-40 rounded-xl border border-glass-line object-cover" />
          <button onClick={() => setPhoto(null)} aria-label="حذف الصورة" className="absolute -end-2 -top-2 rounded-full bg-night p-1.5 text-ink shadow active:scale-90"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}
      {song && !picking && (
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-glass-line bg-glass p-2">
          <Thumb src={song.thumb} platform={song.platform} badge={false} className="aspect-video w-20 shrink-0 rounded-lg" />
          <p className="line-clamp-2 flex-1 text-sm text-ink">{song.title}</p>
          <button onClick={() => setSong(null)} aria-label="إزالة" className="rounded-full p-2 text-mist active:scale-90"><X className="h-4 w-4" /></button>
        </div>
      )}
      {picking && (
        <ul className="scroll-soft mt-3 max-h-48 space-y-2 overflow-y-auto">
          {songs === null && <li className="py-3 text-center text-sm text-mist">…</li>}
          {songs?.length === 0 && <li className="py-3 text-center text-sm text-mist">{copy.bottle.noSongs}</li>}
          {songs?.map((s) => (
            <li key={s.id}>
              <button onClick={() => { setSong(s); setPicking(false) }} className="flex w-full items-center gap-3 rounded-2xl border border-glass-line bg-glass p-2 text-start active:scale-[0.99]">
                <Thumb src={s.thumb} platform={s.platform} badge={false} className="aspect-video w-20 shrink-0 rounded-lg" />
                <span className="line-clamp-2 flex-1 text-sm text-ink">{s.title}</span>
                {song?.id === s.id && <Check className="h-4 w-4 text-accent" />}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* mood */}
      <p className="mb-2 mt-5 text-xs text-mist">{copy.bottle.mood}</p>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <Chip key={m.key} on={mood === m.key} color={m.color} onClick={() => setMood(mood === m.key ? null : m.key)}>{copy.moods[m.key]}</Chip>
        ))}
      </div>

      {/* delivery */}
      <p className="mb-2 mt-5 text-xs text-mist">{copy.bottle.when}</p>
      <div className="flex flex-wrap gap-2">
        <Chip on={mode === 'now'} onClick={() => setMode('now')}>{copy.bottle.now}</Chip>
        <Chip on={mode === 'drift'} onClick={() => setMode('drift')}>{copy.bottle.drift}</Chip>
        <Chip on={mode === 'at'} onClick={() => setMode('at')}>{copy.bottle.at}</Chip>
      </div>
      {mode === 'at' && (
        <input
          type="datetime-local"
          value={at}
          min={localInput(new Date(openedAt + 120_000))}
          onChange={(e) => setAt(e.target.value)}
          className="mt-3 w-full rounded-2xl border border-glass-line bg-glass px-4 py-3 text-ink outline-none focus:border-accent/50"
        />
      )}

      {/* moment stamp */}
      <button onClick={() => setStamp((v) => !v)} role="switch" aria-checked={stamp} className="mt-5 flex w-full items-center gap-3 rounded-2xl border border-glass-line bg-glass p-3.5 text-start">
        <span className="flex-1">
          <span className="block text-[15px] text-ink">{copy.bottle.stamp}</span>
          <span className="block text-xs text-mist">{copy.bottle.stampHint}</span>
        </span>
        <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${stamp ? 'bg-accent' : 'bg-mist/30'}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${stamp ? 'start-[22px]' : 'start-0.5'}`} />
        </span>
      </button>

      <button
        onClick={send}
        disabled={!canSend}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-4 text-base font-bold text-on-accent transition-all active:scale-[0.98] disabled:opacity-35"
      >
        <Send className="h-4.5 w-4.5 -scale-x-100" /> {copy.sea.throwIt}
      </button>
    </>
  )
}
