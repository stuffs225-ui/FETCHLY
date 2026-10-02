import { BrandCard } from '@/components/catalog/BrandCard'
import { Button } from '@/components/ui/Button'
import { DirArrow } from '@/components/ui/DirArrow'
import { useCatalog, useCatalogText } from '@/lib/catalog'
import { useI18n } from '@/i18n'
import { usePageTitle } from '@/lib/usePageTitle'

export default function Brands() {
  const { c } = useCatalogText()
  const { t } = useI18n()
  const { brands, products } = useCatalog()
  usePageTitle('العلامات التجارية | شركات أمريكية نوفر منتجاتها', 'Brands | American Companies We Supply')
  const count = (id: string) => products.filter((p) => p.brandId === id).length

  return (
    <>
      <section className="border-b border-border py-14 text-center">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-text sm:text-4xl">{c.brandsTitle}</h1>
          <p className="mt-4 text-text-muted">{c.brandsSub}</p>
        </div>
      </section>
      <section className="py-12">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {brands.map((b) => <BrandCard key={b.id} brand={b} count={count(b.id)} label={c.nBrandProducts(count(b.id))} />)}
          </div>
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
