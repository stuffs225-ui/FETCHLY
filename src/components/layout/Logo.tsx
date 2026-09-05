import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2.5 group', className)}>
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[#7d93ff] shadow-[0_0_20px_rgba(79,110,247,0.5)]">
        <span className="font-display text-base font-extrabold text-white">F</span>
      </span>
      <span className="font-display text-xl font-extrabold tracking-tight text-text">
        FETCHLY
      </span>
    </Link>
  )
}
