/** Minimal typing + loader for the YouTube IFrame Player API. */
export interface YTPlayer {
  loadVideoById(arg: string | { videoId: string; startSeconds?: number }): void
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead?: boolean): void
  getCurrentTime(): number
  getPlayerState(): number
  getDuration(): number
  destroy(): void
}

export interface YTNamespace {
  Player: new (el: HTMLElement, opts: unknown) => YTPlayer
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

export const YT_STATE = { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3 } as const

let api: Promise<YTNamespace> | null = null

export function loadYouTube(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  api ??= new Promise<YTNamespace>((resolve, reject) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prev?.()
      resolve(window.YT as YTNamespace)
    }
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.async = true
    s.onerror = () => {
      api = null
      reject(new Error('youtube_unreachable'))
    }
    document.head.appendChild(s)
  })
  return api
}

export const ytThumb = (id: string) => `https://i.ytimg.com/vi/${id}/mqdefault.jpg`
export const watchUrl = (id: string, start = 0) => `https://youtu.be/${id}${start ? `?t=${start}` : ''}`

/** "1:23" / "83" / "1h2m3s" → seconds (0 when unreadable). */
export function parseTime(text: string): number {
  const t = text.trim()
  if (!t) return 0
  if (/^\d+$/.test(t)) return Number(t)
  const colon = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/.exec(t)
  if (colon) return Number(colon[1] ?? 0) * 3600 + Number(colon[2]) * 60 + Number(colon[3])
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/.exec(t)
  return m ? Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0
}

export function formatTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** The official embed URL for a shared link (used where we do not need the full player API). */
export function embedSrc(s: { platform: 'youtube' | 'instagram' | 'tiktok'; ytId: string; url: string; start?: number }, autoplay = true): string {
  if (s.platform === 'youtube') return `https://www.youtube-nocookie.com/embed/${s.ytId}?playsinline=1&rel=0&modestbranding=1&autoplay=${autoplay ? 1 : 0}${s.start ? `&start=${s.start}` : ''}`
  if (s.platform === 'tiktok') return `https://www.tiktok.com/player/v1/${s.ytId}?autoplay=${autoplay ? 1 : 0}&music_info=1&description=1`
  return `${s.url.replace(/\/$/, '')}/embed/`
}
