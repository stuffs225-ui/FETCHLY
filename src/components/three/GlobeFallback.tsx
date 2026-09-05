/** Lightweight 2D stand-in for the 3D globe — used on small/low-power devices. */
export default function GlobeFallback({ className }: { className?: string }) {
  const points = [
    [78, 30], [92, 46], [70, 20], [58, 18], [18, 24], [10, 44], [4, 34],
  ]
  const hub = [50, 62]

  return (
    <div className={className}>
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <circle cx="50" cy="50" r="42" fill="none" stroke="#8f8367" strokeOpacity="0.2" strokeWidth="0.6" />
        <circle cx="50" cy="50" r="42" fill="#101625" />
        {[...Array(6)].map((_, i) => (
          <ellipse key={i} cx="50" cy="50" rx={42 - i * 0} ry={8 + i * 6} fill="none" stroke="#2f3648" strokeWidth="0.3" />
        ))}
        {points.map(([x, y], i) => {
          const path = `M ${hub[0]} ${hub[1]} Q ${(x + hub[0]) / 2} ${Math.min(hub[1], y) - 18}, ${x} ${y}`
          return (
            <g key={i}>
              <path d={path} fill="none" stroke="#9a8a5f" strokeWidth="0.5" strokeOpacity="0.35" />
              <circle cx={x} cy={y} r="1.4" fill="#dfe4ee" />
            </g>
          )
        })}
        <circle cx={hub[0]} cy={hub[1]} r="2.4" fill="#c9a668" />
      </svg>
    </div>
  )
}
