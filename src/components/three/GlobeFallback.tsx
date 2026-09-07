import { CONTINENTS } from './continents'

const R = 42
const CENTER_LON = 12
const CENTER_LAT = 12

/** Simple orthographic projection so the fallback draws the same simplified
 * continent outlines as the 3D globe, not a hand-drawn decorative shape. */
function project(lat: number, lon: number): [number, number] | null {
  const latR = (lat * Math.PI) / 180
  const lonR = ((lon - CENTER_LON) * Math.PI) / 180
  const latCR = (CENTER_LAT * Math.PI) / 180
  const cosC = Math.sin(latCR) * Math.sin(latR) + Math.cos(latCR) * Math.cos(latR) * Math.cos(lonR)
  if (cosC < 0.03) return null
  const x = R * Math.cos(latR) * Math.sin(lonR)
  const y = R * (Math.cos(latCR) * Math.sin(latR) - Math.sin(latCR) * Math.cos(latR) * Math.cos(lonR))
  return [50 + x, 50 - y]
}

function continentPath(points: [number, number][]): string | null {
  const projected = points.map(([lat, lon]) => project(lat, lon))
  if (projected.some((p) => p === null)) return null
  return projected.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p![0].toFixed(1)} ${p![1].toFixed(1)}`).join(' ') + ' Z'
}

/** Lightweight 2D stand-in for the 3D globe — used on small/low-power devices. */
export default function GlobeFallback({ className }: { className?: string }) {
  const points = [
    [78, 30], [70, 20], [30, 20], [16, 40],
  ]
  const hub = [50, 62]

  const continentPaths = CONTINENTS.map(continentPath).filter((d): d is string => d !== null)

  return (
    <div className={className}>
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
        <circle cx="50" cy="50" r="42" fill="none" stroke="#8f8367" strokeOpacity="0.2" strokeWidth="0.6" />
        <circle cx="50" cy="50" r="42" fill="#101625" />
        <clipPath id="globe-clip">
          <circle cx="50" cy="50" r="42" />
        </clipPath>
        <g clipPath="url(#globe-clip)" fill="none" stroke="#8f8367" strokeWidth="0.35" strokeOpacity="0.4">
          {continentPaths.map((d, i) => (
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
