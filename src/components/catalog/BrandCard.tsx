import { Link } from 'react-router-dom'
import { CardHover } from '@/components/ui/Card'
import { BrandLogo } from './BrandLogo'
import type { Brand } from '@/lib/types'

export function BrandCard({ brand, count, label }: { brand: Brand; count?: number; label?: string }) {
  return (
    <Link to={`/brands/${brand.slug}`}>
      <CardHover className="flex h-full min-h-[112px] flex-col items-center justify-center gap-2 p-5 text-center">
        <BrandLogo brand={brand} />
        {count !== undefined && label && <span className="text-xs text-text-muted">{label}</span>}
      </CardHover>
    </Link>
  )
}
