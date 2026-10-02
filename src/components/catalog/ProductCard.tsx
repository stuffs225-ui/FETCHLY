import { Link } from 'react-router-dom'
import { CardHover } from '@/components/ui/Card'
import { BrandLogo } from './BrandLogo'
import { categoryByKey, pick, useCatalogText } from '@/lib/catalog'
import type { Brand, Product } from '@/lib/types'

export function ProductVisual({ product, brand }: { product: Product; brand?: Brand }) {
  const Icon = categoryByKey(product.category)?.icon
  if (product.imageUrl) {
    return <img src={product.imageUrl} alt="" loading="lazy" className="h-full w-full object-contain p-4" />
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-surface to-white">
      {brand && <BrandLogo brand={brand} />}
      {Icon && <Icon className="h-5 w-5 text-text-muted/50" />}
    </div>
  )
}

export function ProductCard({ product, brand }: { product: Product; brand?: Brand }) {
  const { c, locale } = useCatalogText()
  const cat = categoryByKey(product.category)
  return (
    <Link to={`/products/${product.slug}`} className="group block">
      <CardHover className="flex h-full flex-col overflow-hidden">
        <div className="aspect-[4/3] border-b border-border">
          <ProductVisual product={product} brand={brand} />
        </div>
        <div className="flex flex-1 flex-col p-5">
          <span className="text-xs font-semibold text-primary">{cat && (locale === 'ar' ? cat.ar : cat.en)}</span>
          <h3 className="mt-1.5 text-base font-bold leading-snug text-text">{pick(locale, product.nameAr, product.nameEn)}</h3>
          <p className="mt-2 line-clamp-2 text-sm text-text-muted">{pick(locale, product.descAr, product.descEn)}</p>
          <span className="mt-4 text-sm font-semibold text-primary group-hover:underline">{c.viewProduct}</span>
        </div>
      </CardHover>
    </Link>
  )
}
