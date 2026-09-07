/** Lightweight 2D stand-in for the 3D globe — used on small/low-power devices. */
export default function GlobeFallback({ className }: { className?: string }) {
  const points = [
    [78, 30], [70, 20], [30, 20], [16, 40],
  ]
  const hub = [50, 62]

  // Rough, stylized landmass hints (not real coastlines) so the circle reads
  // as "a globe" rather than an abstract dashboard dial.
  const continents = [
    'M 20 30 Q 14 40 20 48 Q 28 46 26 36 Q 24 30 20 30 Z',
    'M 42 22 Q 36 30 42 40 Q 52 42 56 32 Q 54 24 42 22 Z',
    'M 64 30 Q 60 40 68 46 Q 80 44 82 34 Q 76 26 64 30 Z',
  ]

  return (
    <div className={className}>
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <circle cx="50" cy="50" r="42" fill="none" stroke="#8f8367" strokeOpacity="0.2" strokeWidth="0.6" />
        <circle cx="50" cy="50" r="42" fill="#101625" />
        <clipPath id="globe-clip">
          <circle cx="50" cy="50" r="42" />
        </clipPath>
        <g clipPath="url(#globe-clip)" fill="#2b3346" stroke="#8f8367" strokeWidth="0.3" strokeOpacity="0.5">
          {continents.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        {[...Array(3)].map((_, i) => (
          <ellipse key={i} cx="50" cy="50" rx="42" ry={10 + i * 10} fill="none" stroke="#2f3648" strokeWidth="0.3" />
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
        <circle cx={hub[0]} cy={hub[1]} r="2.4" fill="#d4b878" />
      </svg>
    </div>
  )
}
