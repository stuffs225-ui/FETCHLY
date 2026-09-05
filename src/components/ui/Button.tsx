import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  to?: string
  href?: string
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-light shadow-sm shadow-primary/20',
  secondary: 'bg-transparent text-text border border-border-light hover:bg-black/[0.03] hover:border-primary/40',
  dark: 'bg-navy text-white hover:bg-navy-light border border-white/10',
  ghost: 'bg-transparent text-text-muted hover:bg-black/5 hover:text-text',
  danger: 'bg-danger text-white hover:bg-red-700',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3.5 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
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
        <a href={href} className={classes} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
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
