import { createCollection, createSingleton } from './storage'
import { uid } from './utils'
import type {
  SourcingRequest,
  Quotation,
  SavedProduct,
  SavedTerm,
  SourcingCase,
  FaqItem,
  Credential,
  CompanySettings,
  EmailSettings,
  EmailLogEntry,
  AuditLogEntry,
  AdminUser,
} from './types'

// ---------------------------------------------------------------------------
// Sequence counters (request / quotation numbering)
// ---------------------------------------------------------------------------

interface Counters {
  requestSeq: number
  quotationSeq: number
}

const countersStore = createSingleton<Counters>('counters', { requestSeq: 0, quotationSeq: 0 })

export function nextRequestNumber(): string {
  const c = countersStore.get()
  const seq = c.requestSeq + 1
  countersStore.set({ ...c, requestSeq: seq })
  const year = new Date().getFullYear()
  return `REQ-${year}-${String(seq).padStart(5, '0')}`
}

export function nextQuotationNumber(): string {
  const c = countersStore.get()
  const seq = c.quotationSeq + 1
  countersStore.set({ ...c, quotationSeq: seq })
  const year = new Date().getFullYear()
  return `QT-${year}-${String(seq).padStart(4, '0')}`
}

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

export const requestsRepo = createCollection<SourcingRequest>('requests')

// ---------------------------------------------------------------------------
// Quotations
// ---------------------------------------------------------------------------

export const quotationsRepo = createCollection<Quotation>('quotations')

export function quotationsForRequest(requestId: string): Quotation[] {
  return quotationsRepo
    .list()
    .filter((q) => q.requestId === requestId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function revisionsForBase(baseNumber: string): Quotation[] {
  return quotationsRepo
    .list()
    .filter((q) => q.baseNumber === baseNumber)
    .sort((a, b) => a.revision - b.revision)
}

// ---------------------------------------------------------------------------
// Saved products & terms (quotation builder reuse)
// ---------------------------------------------------------------------------

export const savedProductsRepo = createCollection<SavedProduct>('saved_products')
export const savedTermsRepo = createCollection<SavedTerm>('saved_terms', () => [
  {
    id: uid('term'),
    kind: 'payment',
    label: '100% مقدم قبل الشحن',
    value: '100% Advance Payment before shipment.',
  },
  {
    id: uid('term'),
    kind: 'payment',
    label: '50% مقدم / 50% قبل التسليم',
    value: '50% Advance / 50% Before Delivery.',
  },
  {
    id: uid('term'),
    kind: 'tc',
    label: 'شروط عامة',
    value:
      'هذا العرض غير قابل للتفاوض بعد انتهاء صلاحيته. يخضع التوريد لتوفر المنتج لدى المصدر وقت تأكيد الطلب. أي رسوم جمركية أو تصريحات إضافية مطلوبة من جهات نظامية تكون على مسؤولية العميل ما لم يُذكر خلاف ذلك صراحة.',
  },
])

// ---------------------------------------------------------------------------
// Sourcing cases (public homepage CMS)
// ---------------------------------------------------------------------------

/**
 * No illustrative/fictional cases are seeded. The public homepage section
 * that reads from this repo stays hidden until an admin adds a real,
 * completed sourcing case.
 */
export const casesRepo = createCollection<SourcingCase>('cases', () => [])

// ---------------------------------------------------------------------------
// FAQ overrides (falls back to i18n defaults on the public site when empty)
// ---------------------------------------------------------------------------

export const faqsRepo = createCollection<FaqItem>('faqs')

// ---------------------------------------------------------------------------
// Trust & compliance credentials
// ---------------------------------------------------------------------------

export const credentialsRepo = createCollection<Credential>('credentials', () => [
  { id: uid('cred'), key: 'cr', labelAr: 'السجل التجاري', labelEn: 'Commercial Registration', visible: true },
  { id: uid('cred'), key: 'sbc', labelAr: 'توثيق منصة الأعمال السعودية', labelEn: 'Saudi Business Center', visible: true },
  { id: uid('cred'), key: 'vat', labelAr: 'التسجيل في ضريبة القيمة المضافة', labelEn: 'VAT Registration', visible: true },
  { id: uid('cred'), key: 'zakat', labelAr: 'شهادة الزكاة', labelEn: 'Zakat Certificate', visible: true },
  { id: uid('cred'), key: 'address', labelAr: 'العنوان الوطني', labelEn: 'National Address', visible: true },
  { id: uid('cred'), key: 'balady', labelAr: 'رخصة بلدي', labelEn: 'Balady License', visible: true },
])

// ---------------------------------------------------------------------------
// Company settings
// ---------------------------------------------------------------------------

/**
 * Every field here defaults to an empty string rather than a bracket
 * placeholder. Public-facing components (footer, trust bar, trust page)
 * only render a field when it is actually filled in from Admin → Company
 * Settings — never a fabricated or placeholder-looking value.
 */
export const companySettingsStore = createSingleton<CompanySettings>('company_settings', {
  companyNameAr: '',
  companyNameEn: '',
  logoDataUrl: undefined,
  logoArDataUrl: undefined,
  crNumber: '',
  vatNumber: '',
  zakatCertificate: '',
  sbcNumber: '',
  nationalAddress: '',
  baladyLicense: '',
  phone: '',
  whatsapp: '',
  businessEmail: '',
  quotationEmail: '',
  websiteDomain: '',
  address: '',
  footerText: '',
  defaultVatRate: 15,
  defaultCurrency: 'SAR',
})

// ---------------------------------------------------------------------------
// Email settings + log
// ---------------------------------------------------------------------------

export const emailSettingsStore = createSingleton<EmailSettings>('email_settings', {
  senderName: '',
  senderEmail: '',
  internalNotificationEmails: '',
  replyToEmail: '',
  ackTemplateAr: {
    subject: 'تم استلام طلبك — {{requestNumber}}',
    body: 'مرحبًا {{name}}،\n\nتم استلام طلبك بنجاح.\n\nرقم الطلب: {{requestNumber}}\n\nسنقوم بمراجعة التفاصيل وإرسال عرض السعر إلى بريدك الإلكتروني بعد استكمال عملية التسعير.\n\nشكرًا لك.',
  },
  ackTemplateEn: {
    subject: 'We received your request — {{requestNumber}}',
    body: 'Hello {{name}},\n\nYour request has been received successfully.\n\nRequest number: {{requestNumber}}\n\nWe will review the details and send your quotation by email once pricing is complete.\n\nThank you.',
  },
  quoteTemplateAr: {
    subject: 'عرض السعر الخاص بك — {{quotationNumber}}',
    body: 'مرحبًا {{name}}،\n\nمرفق عرض السعر الخاص بطلبك رقم {{requestNumber}}.\n\nرقم العرض: {{quotationNumber}}\nصالح حتى: {{validUntil}}\n\nيسعدنا الرد على أي استفسار.',
  },
  quoteTemplateEn: {
    subject: 'Your Quotation — {{quotationNumber}}',
    body: 'Hello {{name}},\n\nPlease find attached the quotation for your request {{requestNumber}}.\n\nQuotation number: {{quotationNumber}}\nValid until: {{validUntil}}\n\nWe are happy to answer any questions.',
  },
})

export const emailLogRepo = createCollection<EmailLogEntry>('email_log')

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export const auditLogRepo = createCollection<AuditLogEntry>('audit_log')

export function logAudit(entry: Omit<AuditLogEntry, 'id' | 'createdAt'>) {
  auditLogRepo.upsert({ ...entry, id: uid('audit'), createdAt: new Date().toISOString() })
}

// ---------------------------------------------------------------------------
// Homepage content overrides (Hero headline/sub/CTAs) — CMS-editable, falls
// back to the i18n defaults when a field is left empty.
// ---------------------------------------------------------------------------

export interface ContentOverrides {
  heroHeadlineAr: string
  heroSubAr: string
  heroHeadlineEn: string
  heroSubEn: string
}

export const contentOverridesStore = createSingleton<ContentOverrides>('content_overrides', {
  heroHeadlineAr: '',
  heroSubAr: '',
  heroHeadlineEn: '',
  heroSubEn: '',
})

// ---------------------------------------------------------------------------
// Admin users (architecture prepared for roles; V1 ships a single admin)
// ---------------------------------------------------------------------------

export const adminUsersRepo = createCollection<AdminUser>('admin_users', () => [
  { id: uid('user'), name: 'المشرف الرئيسي', email: '', role: 'admin' },
])
