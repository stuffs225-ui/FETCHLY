let ctx: AudioContext | null = null

/** Must be called from a user gesture (e.g. the settings toggle) so mobile browsers allow audio. */
export function unlockSound() {
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return
  ctx ??= new Ctor()
  void ctx.resume()
}

function thump(at: number, freq: number, gain: number, len: number) {
  if (!ctx) return
  const osc = ctx.createOscillator()
  const amp = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(freq, at)
  osc.frequency.exponentialRampToValueAtTime(freq * 0.55, at + len)
  amp.gain.setValueAtTime(0.0001, at)
  amp.gain.exponentialRampToValueAtTime(gain, at + 0.012)
  amp.gain.exponentialRampToValueAtTime(0.0001, at + len)
  osc.connect(amp).connect(ctx.destination)
  osc.start(at)
  osc.stop(at + len + 0.02)
}

/** A soft "lub-dub". */
export function heartbeatSound() {
  if (!ctx || ctx.state !== 'running') return
  const t = ctx.currentTime
  thump(t, 74, 0.32, 0.16)
  thump(t + 0.17, 62, 0.2, 0.14)
}

/** A soft two-note chime for "something just arrived" (the iPhone cannot vibrate from a web page). */
export function chime() {
  if (!ctx || ctx.state !== 'running') return
  const t = ctx.currentTime
  for (const [i, f] of [[0, 659], [0.14, 880]] as const) {
    const osc = ctx.createOscillator()
    const amp = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = f
    amp.gain.setValueAtTime(0.0001, t + i)
    amp.gain.exponentialRampToValueAtTime(0.18, t + i + 0.02)
    amp.gain.exponentialRampToValueAtTime(0.0001, t + i + 0.5)
    osc.connect(amp).connect(ctx.destination)
    osc.start(t + i)
    osc.stop(t + i + 0.55)
  }
}
