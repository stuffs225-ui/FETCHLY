export function DonutChart({
  data,
  size = 180,
  thickness = 26,
}: {
  data: { label: string; value: number; color: string }[]
  size?: number
  thickness?: number
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1E1E2E" strokeWidth={thickness} />
        {data.map((d, i) => {
          const fraction = total === 0 ? 0 : d.value / total
          const dash = fraction * circumference
          const circle = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              className="transition-all duration-700 ease-out"
            />
          )
          offset += dash
          return circle
        })}
      </svg>
      <div className="space-y-2.5">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="text-text-secondary">{d.label}</span>
            <span className="font-mono font-medium text-text">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
