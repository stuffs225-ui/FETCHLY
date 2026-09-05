export type RequestStatus =
  | 'new'
  | 'in_review'
  | 'pricing'
  | 'quote_sent'
  | 'customer_interested'
  | 'approved'
  | 'rejected'
  | 'closed'

export const REQUEST_STATUSES: { key: RequestStatus; label: string }[] = [
  { key: 'new', label: 'طلب جديد' },
  { key: 'in_review', label: 'قيد المراجعة' },
  { key: 'pricing', label: 'قيد التسعير' },
  { key: 'quote_sent', label: 'تم إرسال عرض السعر' },
  { key: 'customer_interested', label: 'العميل مهتم' },
  { key: 'approved', label: 'تمت الموافقة' },
  { key: 'rejected', label: 'مرفوض' },
  { key: 'closed', label: 'مغلق' },
]

export type SourcePreference = 'best' | 'usa' | 'uk' | 'europe' | 'asia' | 'other'
export type Urgency = 'normal' | 'soon' | 'urgent'

export interface SourcingRequest {
  id: string
  requestNumber: string
  createdAt: string
  locale: 'ar' | 'en'
  status: RequestStatus
  // customer
  name: string
  company?: string
  email: string
  phone: string
  city: string
  // product
  productName: string
  quantity: number
  brand?: string
  model?: string
  partNumber?: string
  productUrl?: string
  description?: string
  sourcePreference: SourcePreference
  // delivery
  deliveryCity?: string
  requiredDate?: string
  urgency?: Urgency
  // internal
  internalNotes?: string
  assignedAgent?: string
  attachmentIds: string[]
  attachments?: AttachmentMeta[]
  consentAt: string
}

export interface AttachmentMeta {
  id: string
  requestId: string
  fileName: string
  mimeType: string
  size: number
  createdAt: string
}

export interface QuotationItem {
  id: string
  name: string
  description?: string
  quantity: number
  unitPrice: number
}

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

export interface Quotation {
  id: string
  quotationNumber: string // e.g. QT-2026-0001 or QT-2026-0001-R1
  baseNumber: string // QT-2026-0001 (shared across revisions)
  revision: number // 0 = original, 1 = R1, etc.
  requestId: string
  createdAt: string
  sentAt?: string
  validUntilDays: 7 | 15 | 30 | 'custom'
  validUntilDate: string
  currency: 'SAR' | 'USD' | 'GBP' | 'EUR'
  language: 'ar' | 'en'
  status: QuotationStatus
  // customer snapshot (editable independent from request)
  customerName: string
  customerCompany?: string
  customerEmail: string
  customerPhone: string
  customerCity: string
  // items
  items: QuotationItem[]
  vatEnabled: boolean
  vatRate: number
  // commercial terms
  leadTime?: string
  paymentTerms?: string
  deliveryLocation?: string
  warranty?: string
  notes?: string
  termsAndConditions?: string
}

export interface SavedProduct {
  id: string
  name: string
  description?: string
  lastPrice: number
  currency: Quotation['currency']
  manufacturer?: string
  supplierRef?: string
  lastQuotedAt: string
}

export interface SavedTerm {
  id: string
  kind: 'payment' | 'notes' | 'tc'
  label: string
  value: string
}

export interface SourcingCase {
  id: string
  titleAr: string
  titleEn: string
  sourceAr: string
  sourceEn: string
  challengeAr?: string
  challengeEn?: string
  solutionAr?: string
  solutionEn?: string
  published: boolean
}

export interface FaqItem {
  id: string
  qAr: string
  qEn: string
  aAr: string
  aEn: string
  published: boolean
}

export type CredentialKey = 'cr' | 'sbc' | 'vat' | 'zakat' | 'address' | 'balady' | 'iso' | 'other'

export interface Credential {
  id: string
  key: CredentialKey
  labelAr: string
  labelEn: string
  authority?: string
  number?: string
  issuedDate?: string
  expiryDate?: string
  verifyUrl?: string
  documentDataUrl?: string
  visible: boolean
}

export interface CompanySettings {
  companyNameAr: string
  companyNameEn: string
  logoDataUrl?: string
  logoArDataUrl?: string
  crNumber: string
  vatNumber: string
  zakatCertificate: string
  sbcNumber: string
  nationalAddress: string
  baladyLicense: string
  phone: string
  whatsapp: string
  businessEmail: string
  quotationEmail: string
  websiteDomain: string
  address: string
  footerText: string
  defaultVatRate: number
  defaultCurrency: Quotation['currency']
}

export interface EmailSettings {
  senderName: string
  senderEmail: string
  internalNotificationEmails: string
  replyToEmail: string
  ackTemplateAr: { subject: string; body: string }
  ackTemplateEn: { subject: string; body: string }
  quoteTemplateAr: { subject: string; body: string }
  quoteTemplateEn: { subject: string; body: string }
}

export interface EmailLogEntry {
  id: string
  createdAt: string
  to: string
  subject: string
  body: string
  kind: 'acknowledgement' | 'quotation' | 'contact'
  relatedId?: string
  status: 'sent' | 'failed'
  attachmentName?: string
  errorMessage?: string
}

export interface AuditLogEntry {
  id: string
  createdAt: string
  entityType: 'request' | 'quotation'
  entityId: string
  action: string
  actor: string
  details?: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'sales'
}
