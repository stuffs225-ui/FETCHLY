import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DirArrow } from '@/components/ui/DirArrow'
import { ProductCard } from '@/components/catalog/ProductCard'
import { useI18n } from '@/i18n'
import { categories, useCatalog, useCatalogText } from '@/lib/catalog'
import { usePageTitle } from '@/lib/usePageTitle'
import { cn } from '@/lib/utils'

export default function Products() {
  const { c, locale } = useCatalogText()
  const { t } = useI18n()
  const { products, brands, brandById, loading } = useCatalog()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const category = params.get('category') ?? ''
  const brandSlug = params.get('brand') ?? ''
  usePageTitle('المنتجات | علامات أمريكية وتوريد حسب الطلب', 'Products | American Brands & Sourcing on Request')

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      const brand = brandById.get(p.brandId)
      if (category && p.category !== category) return false
      if (brandSlug && brand?.slug !== brandSlug) return false
      if (!q) return true
      return [p.nameAr, p.nameEn, p.partNumber, brand?.name].some((v) => v?.toLowerCase().includes(q))
    })
  }, [products, brandById, category, brandSlug, query])

  return (
    <>
      <section className="border-b border-border py-14 text-center">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-balance text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{c.productsTitle}</h1>
          <p className="mt-4 text-text-muted">{c.productsSub}</p>
        </div>
      </section>

      <section className="py-10">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {[{ key: '', ar: c.all, en: c.all }, ...categories].map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setFilter('category', cat.key)}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                    category === cat.key ? 'border-primary bg-primary text-white' : 'border-border bg-card text-text-muted hover:border-primary/40 hover:text-text',
                  )}
                >
                  {locale === 'ar' ? cat.ar : cat.en}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 lg:w-64">
                <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={c.search}
                  className="w-full rounded-lg border border-border bg-card py-2 ps-9 pe-3 text-sm outline-none focus:border-primary"
                />
              </div>
              <select
                value={brandSlug}
                onChange={(e) => setFilter('brand', e.target.value)}
                className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">{c.allBrands}</option>
                {brands.map((b) => <option key={b.id} value={b.slug}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <p className="mt-6 text-sm text-text-muted">{c.results(filtered.length)}</p>

          {filtered.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => <ProductCard key={p.id} product={p} brand={brandById.get(p.brandId)} />)}
            </div>
          ) : (
            !loading && <p className="mt-10 text-center text-text-muted">{c.noResults}</p>
          )}

          <div className="mt-14 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
            <h2 className="text-xl font-bold text-text">{c.ctaTitle}</h2>
            <p className="text-sm text-text-muted">{c.ctaSub}</p>
            <Button to="/request">{t.nav.requestQuote} <DirArrow /></Button>
          </div>
          <p className="mt-8 text-xs leading-relaxed text-text-muted">{c.note}</p>
        </div>
      </section>
    </>
  )
}
