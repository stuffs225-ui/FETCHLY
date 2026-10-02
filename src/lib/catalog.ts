import { useMemo } from 'react'
import { Droplet, Factory, Wrench, Cpu, Stethoscope, Package } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useI18n } from '@/i18n'
import { getPublicBrands, getPublicProducts } from '@/lib/repo'
import { useAsyncData } from '@/lib/useAsync'
import type { Brand, Product } from '@/lib/types'

export interface Category {
  key: string
  ar: string
  en: string
  icon: LucideIcon
}

export const categories: Category[] = [
  { key: 'oils', ar: 'زيوت ومواد تشغيلية', en: 'Oils & Lubricants', icon: Droplet },
  { key: 'industrial', ar: 'مستلزمات صناعية وسلامة', en: 'Industrial & Safety', icon: Factory },
  { key: 'parts', ar: 'قطع غيار وفلاتر', en: 'Spare Parts & Filters', icon: Package },
  { key: 'equipment', ar: 'عدد ومعدات', en: 'Tools & Equipment', icon: Wrench },
  { key: 'electronics', ar: 'أجهزة قياس وإلكترونيات', en: 'Instruments & Electronics', icon: Cpu },
  { key: 'medical', ar: 'مستلزمات طبية ومختبرية', en: 'Medical & Lab', icon: Stethoscope },
]

export const categoryByKey = (key: string) => categories.find((c) => c.key === key)

/** UI strings for the catalogue pages (kept local so they sit next to the data they describe). */
export const catalogText = {
  ar: {
    productsTitle: 'المنتجات',
    productsSub: 'نماذج من المنتجات والعلامات التي نوفرها. لم تجد ما تبحث عنه؟ أرسل طلبك وسنوفره لك.',
    brandsTitle: 'العلامات التجارية',
    brandsSub: 'شركات أمريكية معروفة نتعامل معها ونوفر منتجاتها لعملائنا في المملكة.',
    brandsHome: 'علامات أمريكية نوفر منتجاتها',
    featuredHome: 'منتجات مختارة',
    all: 'الكل',
    allBrands: 'كل العلامات',
    search: 'ابحث باسم المنتج أو العلامة...',
    results: (n: number) => `${n} منتج`,
    noResults: 'لا توجد منتجات مطابقة. أرسل لنا طلبك وسنوفره لك.',
    viewAll: 'عرض الكل',
    viewProduct: 'التفاصيل',
    requestProduct: 'اطلب عرض سعر لهذا المنتج',
    askAvailability: 'اسأل عن التوفر',
    brand: 'العلامة',
    category: 'الفئة',
    specs: 'المواصفات',
    related: 'منتجات أخرى من نفس العلامة',
    productsOf: (b: string) => `منتجات ${b}`,
    madeIn: 'بلد المنشأ',
    usa: 'الولايات المتحدة',
    website: 'الموقع الرسمي',
    note: 'الأسعار والتوفر والمواصفات الدقيقة تُؤكَّد في عرض السعر. أسماء العلامات التجارية وشعاراتها ملك لأصحابها، وذكرها هنا لا يعني وجود تمثيل رسمي ما لم يُذكر ذلك صراحة.',
    notFound: 'المنتج غير موجود',
    brandNotFound: 'العلامة غير موجودة',
    back: 'رجوع',
    nBrandProducts: (n: number) => `${n} منتج`,
    ctaTitle: 'تحتاج منتجًا غير موجود هنا؟',
    ctaSub: 'نوفر من الشركات الأمريكية وغيرها — أرسل الاسم أو الصورة أو رقم القطعة.',
  },
  en: {
    productsTitle: 'Products',
    productsSub: 'A selection of the products and brands we source. Can’t find what you need? Send a request and we’ll get it for you.',
    brandsTitle: 'Brands',
    brandsSub: 'Well-known American companies we work with and supply to customers across Saudi Arabia.',
    brandsHome: 'American brands we supply',
    featuredHome: 'Featured products',
    all: 'All',
    allBrands: 'All brands',
    search: 'Search by product or brand...',
    results: (n: number) => `${n} product${n === 1 ? '' : 's'}`,
    noResults: 'No matching products. Send us a request and we will source it for you.',
    viewAll: 'View all',
    viewProduct: 'Details',
    requestProduct: 'Request a quote for this product',
    askAvailability: 'Ask about availability',
    brand: 'Brand',
    category: 'Category',
    specs: 'Specifications',
    related: 'More from this brand',
    productsOf: (b: string) => `${b} products`,
    madeIn: 'Country of origin',
    usa: 'United States',
    website: 'Official website',
    note: 'Pricing, availability and exact specifications are confirmed in the quotation. Brand names and logos belong to their respective owners; listing them here does not imply official representation unless explicitly stated.',
    notFound: 'Product not found',
    brandNotFound: 'Brand not found',
    back: 'Back',
    nBrandProducts: (n: number) => `${n} product${n === 1 ? '' : 's'}`,
    ctaTitle: 'Need something that isn’t listed?',
    ctaSub: 'We source from American and other manufacturers — send the name, a photo or a part number.',
  },
}

// One shared fetch per page load — several sections on a page read the catalogue.
let brandsPromise: Promise<Brand[]> | null = null
let productsPromise: Promise<Product[]> | null = null
const cachedBrands = () => (brandsPromise ??= getPublicBrands().catch((e) => { brandsPromise = null; throw e }))
const cachedProducts = () => (productsPromise ??= getPublicProducts().catch((e) => { productsPromise = null; throw e }))

export function useCatalog() {
  const brands = useAsyncData<Brand[]>(cachedBrands, [])
  const products = useAsyncData<Product[]>(cachedProducts, [])
  const brandById = useMemo(() => new Map((brands.data ?? []).map((b) => [b.id, b])), [brands.data])
  return {
    brands: brands.data ?? [],
    products: products.data ?? [],
    brandById,
    loading: brands.loading || products.loading,
  }
}

export function useCatalogText() {
  const { locale } = useI18n()
  return { c: catalogText[locale], locale }
}

export const pick = (locale: 'ar' | 'en', ar: string | null | undefined, en: string | null | undefined) =>
  (locale === 'ar' ? ar || en : en || ar) ?? ''

export function parseSpecs(text: string | null | undefined): { label: string; value: string }[] {
  return (text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.search(/[:：]/)
      return i < 0 ? { label: '', value: l } : { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() }
    })
}

/** Link to the request form with the product details pre-filled. */
export function requestLink(p: Product, brand: Brand | undefined, locale: 'ar' | 'en') {
  const q = new URLSearchParams({
    productName: pick(locale, p.nameAr, p.nameEn),
    brand: brand?.name ?? '',
  })
  if (p.partNumber) q.set('partNumber', p.partNumber)
  return `/request?${q.toString()}`
}
