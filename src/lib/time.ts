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
