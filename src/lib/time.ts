const nf = new Intl.NumberFormat('ar-EG')
export const num = (n: number) => nf.format(n)

function unit(n: number, one: string, two: string, few: string, many: string) {
  if (n === 1) return one
  if (n === 2) return two
  if (n >= 3 && n <= 10) return `${num(n)} ${few}`
  return `${num(n)} ${many}`
}

/** "قبل ٣ ساعات" style relative time. */
export function ago(ts: number | null, now = Date.now()): string {
  if (!ts) return ''
  const s = Math.max(0, Math.floor((now - ts) / 1000))
  if (s < 60) return 'قبل لحظات'
  const m = Math.floor(s / 60)
  if (m < 60) return `قبل ${unit(m, 'دقيقة', 'دقيقتين', 'دقائق', 'دقيقة')}`
  const h = Math.floor(m / 60)
  if (h < 24) return `قبل ${unit(h, 'ساعة', 'ساعتين', 'ساعات', 'ساعة')}`
  const d = Math.floor(h / 24)
  return `قبل ${unit(d, 'يوم', 'يومين', 'أيام', 'يومًا')}`
}

/** "٣ ساعات و١٢ دقيقة" for time-together totals. */
export function spent(seconds: number): string {
  const m = Math.floor(seconds / 60)
  if (m < 1) return 'أقل من دقيقة'
  const h = Math.floor(m / 60)
  const rest = m % 60
  const mins = unit(rest, 'دقيقة', 'دقيقتين', 'دقائق', 'دقيقة')
  if (h === 0) return mins
  const hours = unit(h, 'ساعة', 'ساعتين', 'ساعات', 'ساعة')
  return rest === 0 ? hours : `${hours} و${mins}`
}

export const clock = (sec: number) => `${num(Math.floor(sec / 60))}:${num(Math.floor(sec % 60)).padStart(2, '٠')}`

/** "٢٤٠ متر" · "٣٫٢ كم" · "١٬٢٠٠ كم" */
export function dist(meters: number): string {
  if (meters < 1000) return `${num(Math.max(10, Math.round(meters / 10) * 10))} متر`
  const km = meters / 1000
  return `${new Intl.NumberFormat('ar-EG', { maximumFractionDigits: km < 10 ? 1 : 0 }).format(km)} كم`
}

const period = (h: number) => (h < 4 ? 'ليلًا' : h < 6 ? 'فجرًا' : h < 12 ? 'صباحًا' : h < 15 ? 'ظهرًا' : h < 18 ? 'عصرًا' : h < 22 ? 'مساءً' : 'ليلًا')

/** "كُتبت الساعة ٢:١٤ فجرًا، وكنا بعيدين ١٢٠ كم" — the moment stamp on a bottle. */
export function stampText(min: number, meters: number | null): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  const time = `${num(h % 12 || 12)}:${num(m).padStart(2, '٠')} ${period(h)}`
  const far = meters === null ? '' : meters < 150 ? '، وكنا قريبين جدًا' : `، وكنا بعيدين ${dist(meters)}`
  return `كُتبت الساعة ${time}${far}`
}

export const dateText = (ts: number) =>
  new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }).format(ts)

/** The sky over the sea follows the real clock. `t` is 0..1 along the day (sun) or night (moon). */
export function skyNow(now = new Date()) {
  const h = now.getHours() + now.getMinutes() / 60
  const day = h >= 6.5 && h < 17.5
  const phase = h >= 5 && h < 6.5 ? 'dawn' : day ? 'day' : h >= 17.5 && h < 19 ? 'dusk' : 'night'
  const t = day ? (h - 6.5) / 11 : ((h >= 17.5 ? h - 17.5 : h + 6.5) / 13)
  return { phase, day, t: Math.min(1, Math.max(0, t)) } as const
}
