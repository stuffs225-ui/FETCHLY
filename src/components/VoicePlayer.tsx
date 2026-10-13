import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { clock } from '@/lib/time'

/** A soft voice-note player with a pulsing waveform. */
export function VoicePlayer({ src }: { src: string }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const el = audio.current
    if (!el) return
    const onTime = () => setProgress(el.duration && isFinite(el.duration) ? el.currentTime / el.duration : 0)
    const onMeta = () => isFinite(el.duration) && setDuration(el.duration)
    const onEnd = () => { setPlaying(false); setProgress(0) }
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('durationchange', onMeta)
    el.addEventListener('ended', onEnd)
    return () => {
      el.pause()
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('durationchange', onMeta)
      el.removeEventListener('ended', onEnd)
    }
  }, [])

  const toggle = () => {
    const el = audio.current
    if (!el) return
    if (el.paused) { void el.play(); setPlaying(true) } else { el.pause(); setPlaying(false) }
  }

  const bars = 28
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/[0.06] px-3 py-2.5">
      <audio ref={audio} src={src} preload="metadata" />
      <button
        onClick={toggle}
        aria-label={playing ? 'إيقاف' : 'تشغيل'}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-coral to-rose text-night shadow-[0_6px_24px_rgba(255,107,139,.4)] transition-transform active:scale-90"
      >
        {playing ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5 translate-x-[-1px]" fill="currentColor" />}
      </button>
      <div className="flex h-9 flex-1 items-center gap-[3px]" dir="ltr">
        {Array.from({ length: bars }, (_, i) => {
          const h = 28 + Math.abs(Math.sin(i * 1.7) * 55) + (i % 3) * 6
          const done = i / bars < progress
          return (
            <span
              key={i}
              className="w-[3px] rounded-full transition-colors duration-200"
              style={{ height: `${h}%`, background: done ? '#ff8fae' : 'rgba(255,255,255,.28)', transform: playing && done ? `scaleY(${0.8 + ((i * 7) % 5) / 10})` : undefined }}
            />
          )
        })}
      </div>
      <span className="w-10 shrink-0 text-end text-xs tabular-nums text-mist">{duration ? clock(duration) : ''}</span>
    </div>
  )
}
