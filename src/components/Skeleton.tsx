/** A resting placeholder that breathes while real content loads. */
export function Skeleton({ rows = 3, tall = false }: { rows?: number; tall?: boolean }) {
  return (
    <ul className="space-y-3" aria-hidden>
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="animate-breathe rounded-2xl border border-glass-line bg-glass p-3" style={{ animationDelay: `${-i * 0.7}s` }}>
          <div className="flex items-center gap-3">
            <span className={`block shrink-0 rounded-lg bg-mist/15 ${tall ? 'h-14 w-14' : 'h-11 w-[76px]'}`} />
            <span className="flex-1 space-y-2">
              <span className="block h-3 w-4/5 rounded-full bg-mist/15" />
              <span className="block h-2.5 w-1/2 rounded-full bg-mist/10" />
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
