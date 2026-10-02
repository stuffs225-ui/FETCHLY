import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { DirArrow } from '@/components/ui/DirArrow'
import { BrandLogo } from '@/components/catalog/BrandLogo'
import { ProductCard, ProductVisual } from '@/components/catalog/ProductCard'
import { categoryByKey, parseSpecs, pick, requestLink, useCatalog, useCatalogText } from '@/lib/catalog'
import { usePageTitle } from '@/lib/usePageTitle'

export default function ProductDetail() {
  const { slug } = useParams()
  const { c, locale } = useCatalogText()
  const { products, brandById, loading } = useCatalog()
  const product = products.find((p) => p.slug === slug)
  const brand = product ? brandById.get(product.brandId) : undefined
  usePageTitle(
    product ? `${product.nameAr} | ${brand?.name ?? ''}` : c.notFound,
    product ? `${product.nameEn} | ${brand?.name ?? ''}` : c.notFound,
  )

  if (!product) {
    if (loading) return <div className="min-h-[50vh]" />
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-text">{c.notFound}</h1>
        <Button to="/products" className="mt-6">{c.productsTitle}</Button>
      </div>
    )
  }

  const cat = categoryByKey(product.category)
  const specs = parseSpecs(locale === 'ar' ? product.specsAr : product.specsEn)
  const related = products.filter((p) => p.brandId === product.brandId && p.id !== product.id).slice(0, 3)

  return (
    <section className="py-12">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-text-muted">
          <Link to="/products" className="hover:text-primary">{c.productsTitle}</Link>
          <span>/</span>
          {brand && <><Link to={`/brands/${brand.slug}`} className="hover:text-primary">{brand.name}</Link><span>/</span></>}
          <span className="text-text">{pick(locale, product.nameAr, product.nameEn)}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card">
            <ProductVisual product={product} brand={brand} />
          </div>

          <div>
            {brand && (
              <Link to={`/brands/${brand.slug}`} className="inline-block"><BrandLogo brand={brand} size="sm" /></Link>
            )}
            <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-text">{pick(locale, product.nameAr, product.nameEn)}</h1>
            <p className="mt-4 leading-relaxed text-text-muted">{pick(locale, product.descAr, product.descEn)}</p>

            <dl className="mt-6 divide-y divide-border rounded-xl border border-border bg-card text-sm">
              {cat && <div className="flex justify-between px-4 py-3"><dt className="text-text-muted">{c.category}</dt><dd className="font-medium text-text">{locale === 'ar' ? cat.ar : cat.en}</dd></div>}
              {brand && <div className="flex justify-between px-4 py-3"><dt className="text-text-muted">{c.brand}</dt><dd className="font-medium text-text">{brand.name}</dd></div>}
              {product.partNumber && <div className="flex justify-between px-4 py-3"><dt className="text-text-muted">Part No.</dt><dd dir="ltr" className="font-mono text-text">{product.partNumber}</dd></div>}
              {specs.map((s, i) => (
                <div key={i} className="flex justify-between gap-4 px-4 py-3">
                  <dt className="text-text-muted">{s.label}</dt>
                  <dd className="text-end font-medium text-text">{s.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button to={requestLink(product, brand, locale)} size="lg">{c.requestProduct} <DirArrow /></Button>
            </div>
            <p className="mt-6 text-xs leading-relaxed text-text-muted">{c.note}</p>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-text">{c.related}</h2>
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <ProductCard key={p.id} product={p} brand={brand} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
