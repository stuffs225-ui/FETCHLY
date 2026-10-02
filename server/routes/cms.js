import { createCrudRouter } from '../lib/crudRouter.js'

export const casesRouter = createCrudRouter({
  table: 'cases',
  label: 'دراسة حالة',
  boolColumns: ['published'],
  columns: ['titleAr', 'titleEn', 'sourceAr', 'sourceEn', 'challengeAr', 'challengeEn', 'solutionAr', 'solutionEn', 'published'],
})

export const faqsRouter = createCrudRouter({
  table: 'faqs',
  label: 'سؤال شائع',
  boolColumns: ['published'],
  columns: ['qAr', 'qEn', 'aAr', 'aEn', 'published'],
})

export const credentialsRouter = createCrudRouter({
  table: 'credentials',
  label: 'شهادة اعتماد',
  boolColumns: ['visible'],
  columns: ['key', 'labelAr', 'labelEn', 'authority', 'number', 'issuedDate', 'expiryDate', 'verifyUrl', 'documentDataUrl', 'visible'],
})

export const savedProductsRouter = createCrudRouter({
  table: 'savedProducts',
  label: 'منتج محفوظ',
  columns: ['name', 'description', 'lastPrice', 'currency', 'manufacturer', 'supplierRef', 'lastQuotedAt'],
})

export const savedTermsRouter = createCrudRouter({
  table: 'savedTerms',
  label: 'شرط محفوظ',
  columns: ['kind', 'label', 'value'],
})

export const brandsRouter = createCrudRouter({
  table: 'brands',
  label: 'علامة تجارية',
  boolColumns: ['featured', 'published'],
  columns: ['slug', 'name', 'country', 'color', 'descAr', 'descEn', 'website', 'logoUrl', 'featured', 'published', 'sortOrder'],
})

export const productsRouter = createCrudRouter({
  table: 'products',
  label: 'منتج',
  boolColumns: ['featured', 'published'],
  columns: ['slug', 'brandId', 'category', 'nameAr', 'nameEn', 'descAr', 'descEn', 'specsAr', 'specsEn', 'partNumber', 'imageUrl', 'featured', 'published', 'sortOrder'],
})
