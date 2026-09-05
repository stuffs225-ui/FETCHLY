import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-2xl border border-border bg-card transition-colors duration-300', className)}
      {...props}
    />
  )
}

export function CardHover({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md',
        className,
      )}
      {...props}
    />
  )
}
