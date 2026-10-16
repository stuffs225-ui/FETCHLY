/** A wax seal in the sender's heart colour. */
export function Seal({ color, className }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <path d="M50 4 C58 4 62 10 69 11 C77 12 84 16 87 24 C90 31 96 36 96 45 C96 54 91 58 89 66 C86 74 82 82 74 86 C66 90 60 96 50 96 C40 96 34 90 26 86 C18 82 14 74 11 66 C9 58 4 54 4 45 C4 36 10 31 13 24 C16 16 23 12 31 11 C38 10 42 4 50 4 Z" style={{ fill: color }} />
      <circle cx="50" cy="50" r="33" fill="none" stroke="rgba(0,0,0,.2)" strokeWidth="2" />
      <circle cx="50" cy="50" r="31" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1.5" />
      <path d="M50 70 C33 58 28 51 28 44 C28 38.5 32 35 37 35 C41 35 44.5 37 50 42 C55.5 37 59 35 63 35 C68 35 72 38.5 72 44 C72 51 67 58 50 70 Z" fill="rgba(0,0,0,.22)" />
      <path d="M50 67 C35 56.5 31 50.5 31 45 C31 40.5 34 38 37.5 38 C41 38 44 40 50 45 C56 40 59 38 62.5 38 C66 38 69 40.5 69 45 C69 50.5 65 56.5 50 67 Z" fill="rgba(255,255,255,.34)" />
    </svg>
  )
}
