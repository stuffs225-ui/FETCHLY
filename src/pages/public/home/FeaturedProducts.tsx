import { Link } from 'react-router-dom'
import { ProductCard } from '@/components/catalog/ProductCard'
import { useCatalog, useCatalogText } from '@/lib/catalog'

export default function FeaturedProducts() {
  const { c } = useCatalogText()
  const { products, brandById } = useCatalog()
  const featured = products.filter((p) => p.featured).slice(0, 6)
  if (featured.length === 0) return null
  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{c.featuredHome}</h2>
          <Link to="/products" className="shrink-0 text-sm font-semibold text-primary hover:underline">{c.viewAll}</Link>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <ProductCard key={p.id} product={p} brand={brandById.get(p.brandId)} />)}
        </div>
      </div>
    </section>
  )
}
