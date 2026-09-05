import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-border-light bg-white/5 px-3 py-1 text-xs font-medium text-text-secondary',
        className,
      )}
      {...props}
    />
  )
}
