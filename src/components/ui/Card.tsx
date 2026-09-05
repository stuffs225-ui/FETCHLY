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
        'rounded-2xl border border-border bg-card transition-all duration-300 hover:border-gold/50 hover:shadow-[0_0_0_1px_rgba(201,162,39,0.25),0_20px_50px_-20px_rgba(201,162,39,0.35)] hover:-translate-y-1',
        className,
      )}
      {...props}
    />
  )
}
