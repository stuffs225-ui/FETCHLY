import { useParams } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BrandLogo } from '@/components/catalog/BrandLogo'
import { ProductCard } from '@/components/catalog/ProductCard'
import { pick, useCatalog, useCatalogText } from '@/lib/catalog'
import { usePageTitle } from '@/lib/usePageTitle'

export default function BrandDetail() {
  const { slug } = useParams()
  const { c, locale } = useCatalogText()
  const { brands, products, loading } = useCatalog()
  const brand = brands.find((b) => b.slug === slug)
  usePageTitle(brand ? `${brand.name} | منتجات وتوريد` : c.brandNotFound, brand ? `${brand.name} | Products & Sourcing` : c.brandNotFound)

  if (!brand) {
    if (loading) return <div className="min-h-[50vh]" />
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-text">{c.brandNotFound}</h1>
        <Button to="/brands" className="mt-6">{c.brandsTitle}</Button>
      </div>
    )
  }

  const list = products.filter((p) => p.brandId === brand.id)

  return (
    <>
      <section className="border-b border-border py-14">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-5 px-6 text-center lg:px-8">
          <BrandLogo brand={brand} size="lg" />
          <p className="max-w-2xl text-text-muted">{pick(locale, brand.descAr, brand.descEn)}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-text-muted">
            {brand.country === 'US' && <span>{c.madeIn}: <b className="text-text">{c.usa}</b></span>}
            {brand.website && (
              <a href={brand.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                {c.website} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <h2 className="text-xl font-bold text-text">{c.productsOf(brand.name)}</h2>
          <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => <ProductCard key={p.id} product={p} brand={brand} />)}
          </div>
          {list.length === 0 && <p className="mt-6 text-text-muted">{c.noResults}</p>}
          <p className="mt-10 text-xs leading-relaxed text-text-muted">{c.note}</p>
        </div>
      </section>
    </>
  )
}
