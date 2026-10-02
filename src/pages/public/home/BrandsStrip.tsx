import { Link } from 'react-router-dom'
import { BrandCard } from '@/components/catalog/BrandCard'
import { useCatalog, useCatalogText } from '@/lib/catalog'

export default function BrandsStrip() {
  const { c } = useCatalogText()
  const { brands } = useCatalog()
  const featured = brands.filter((b) => b.featured).slice(0, 12)
  if (featured.length === 0) return null
  return (
    <section className="border-t border-border bg-surface/60 py-20">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{c.brandsHome}</h2>
          <Link to="/brands" className="shrink-0 text-sm font-semibold text-primary hover:underline">{c.viewAll}</Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((b) => <BrandCard key={b.id} brand={b} />)}
        </div>
      </div>
    </section>
  )
}
