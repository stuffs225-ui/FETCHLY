import { useEffect, useRef, useState } from 'react'
import { Mic, Square, Trash2, Send } from 'lucide-react'
import { Sheet } from './Sheet'
import { VoicePlayer } from './VoicePlayer'
import { api } from '@/lib/api'
import type { Copy } from '@/lib/copy'
import { useToast } from './Toast'
import { clock } from '@/lib/time'

const MAX = 600
const MAX_SECONDS = 45

function pickMime() {
  const options = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm', 'audio/ogg']
  return options.find((m) => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) ?? ''
}

/** Write a note (and/or record your voice) and let it drift into the sea. */
export function WriteBottle({ open, onClose, copy, onThrown }: { open: boolean; onClose: () => void; copy: Copy; onThrown: () => void }) {
  const toast = useToast()
  const [text, setText] = useState('')
  const [rec, setRec] = useState<'idle' | 'recording' | 'done'>('idle')
  const [seconds, setSeconds] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const recorder = useRef<MediaRecorder | null>(null)
  const stream = useRef<MediaStream | null>(null)
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  const stopStream = () => {
    clearInterval(timer.current)
    stream.current?.getTracks().forEach((t) => t.stop())
    stream.current = null
  }

  const reset = () => {
    stopStream()
    if (recorder.current && recorder.current.state !== 'inactive') {
      recorder.current.onstop = null
      recorder.current.stop()
    }
    setText(''); setRec('idle'); setSeconds(0); setBlob(null)
    setUrl((u) => { if (u) URL.revokeObjectURL(u); return null })
  }

  useEffect(() => { if (!open) reset() }, [open])
  useEffect(() => () => stopStream(), [])

  const start = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.current = s
      const mimeType = pickMime()
      const r = new MediaRecorder(s, mimeType ? { mimeType } : undefined)
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
    setUrl((u) => { if (u) URL.revokeObjectURL(u); return null })
    setRec('idle'); setSeconds(0)
  }

  const canSend = !sending && rec !== 'recording' && (text.trim().length > 0 || blob !== null)

  const send = async () => {
    setSending(true)
    try {
      if (blob) {
        const type = (blob.type || 'audio/webm').split(';')[0]
        await api.postBlob(`/bottles/voice?text=${encodeURIComponent(text.trim())}`, blob, type)
      } else {
        await api.post('/bottles', { text: text.trim() })
      }
      toast(blob ? copy.toast.thrownVoice : copy.toast.thrown)
      onThrown()
      onClose()
    } catch {
      toast(copy.toast.error)
    } finally {
      setSending(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title={copy.sea.writeTitle}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX))}
        placeholder={copy.sea.placeholder}
        rows={5}
        className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-[17px] leading-8 text-ink outline-none placeholder:text-mist/60 focus:border-rose/50 focus:bg-white/[0.07]"
      />
      <div className="mt-1 text-end text-xs text-mist/70">{MAX - text.length}</div>

      <div className="mt-3">
        {rec === 'idle' && (
          <button onClick={start} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 py-3.5 text-sm text-mist transition-colors hover:border-rose/50 hover:text-ink">
            <Mic className="h-4.5 w-4.5" /> سجّل صوتك (حتى {MAX_SECONDS} ثانية)
          </button>
        )}
        {rec === 'recording' && (
          <button onClick={stop} className="flex w-full items-center justify-center gap-3 rounded-2xl border border-rose/60 bg-rose/10 py-3.5 text-sm text-ink">
            <span className="relative flex h-3 w-3"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose opacity-75" /><span className="relative inline-flex h-3 w-3 rounded-full bg-rose" /></span>
            <span className="tabular-nums">{clock(seconds)}</span>
            <Square className="h-4 w-4" fill="currentColor" /> إيقاف
          </button>
        )}
        {rec === 'done' && url && (
          <div className="flex items-center gap-2">
            <div className="flex-1"><VoicePlayer src={url} /></div>
            <button onClick={discardVoice} aria-label="حذف التسجيل" className="rounded-full p-3 text-mist hover:bg-white/10 hover:text-ink"><Trash2 className="h-5 w-5" /></button>
          </div>
        )}
      </div>

      <button
        onClick={send}
        disabled={!canSend}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-br from-coral to-rose py-4 text-base font-bold text-night shadow-[0_12px_40px_rgba(255,107,139,.38)] transition-all active:scale-[0.98] disabled:opacity-35 disabled:shadow-none"
      >
        <Send className="h-4.5 w-4.5 -scale-x-100" /> {copy.sea.throwIt}
      </button>
    </Sheet>
  )
}
