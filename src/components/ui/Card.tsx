import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card transition-colors duration-300',
        className,
      )}
      {...props}
    />
  )
}

export function CardHover({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary hover:shadow-[0_0_0_1px_rgba(79,110,247,0.3),0_16px_40px_-12px_rgba(79,110,247,0.35)] hover:-translate-y-1',
        className,
      )}
      {...props}
    />
  )
}
