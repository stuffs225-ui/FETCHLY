import type { Brand } from '@/lib/types'
import { cn } from '@/lib/utils'

/**
 * Shows the uploaded logo when the admin has set `logoUrl`; otherwise a clean
 * wordmark in the brand's colour. (Official artwork is trademarked — upload
 * it from the admin panel once you have the brand's permission/assets.)
 */
export function BrandLogo({ brand, className, size = 'md' }: { brand: Pick<Brand, 'name' | 'color' | 'logoUrl'>; className?: string; size?: 'sm' | 'md' | 'lg' }) {
  if (brand.logoUrl) {
    return <img src={brand.logoUrl} alt={brand.name} loading="lazy" className={cn('object-contain', size === 'lg' ? 'h-12' : size === 'sm' ? 'h-6' : 'h-8', className)} />
  }
  return (
    <span
      dir="ltr"
      style={{ color: brand.color || 'var(--color-primary)' }}
      className={cn(
        'select-none whitespace-nowrap font-en font-black leading-none tracking-tight',
        size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-sm' : 'text-2xl',
        className,
      )}
    >
      {brand.name}
    </span>
  )
}
