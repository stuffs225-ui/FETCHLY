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
  columns: ['key', 'labelAr', 'labelEn', 'authority', 'number', 'issuedDate', 'expiryDate', 'verifyUrl', 'documentAttachmentId', 'visible'],
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
