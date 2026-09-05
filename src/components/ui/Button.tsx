import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  to?: string
  href?: string
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-hover shadow-[0_0_0_1px_rgba(79,110,247,0.4),0_8px_24px_-4px_rgba(79,110,247,0.5)] hover:shadow-[0_0_0_1px_rgba(79,110,247,0.6),0_12px_32px_-4px_rgba(79,110,247,0.65)]',
  secondary:
    'bg-transparent text-text border border-primary/60 hover:bg-primary/10 hover:border-primary',
  ghost: 'bg-transparent text-text-secondary hover:bg-white/5 hover:text-text',
  danger: 'bg-danger text-white hover:bg-red-500',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', to, href, children, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center font-semibold transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
      variantClasses[variant],
      sizeClasses[size],
      className,
    )

    if (to) {
      return (
        <Link to={to} className={classes}>
          {children}
        </Link>
      )
    }
    if (href) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      )
    }
    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    )
  },
)
Button.displayName = 'Button'
