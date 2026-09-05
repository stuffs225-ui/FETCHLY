import { api } from './api'
import { createResource } from './apiResource'
import type {
  SourcingRequest,
  Quotation,
  QuotationStatus,
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
// Requests
// ---------------------------------------------------------------------------

export const requestsRepo = createResource<SourcingRequest>('/requests')

export async function submitSourcingRequest(formData: FormData): Promise<{ id: string; requestNumber: string }> {
  const result = await api.postForm<{ id: string; requestNumber: string }>('/requests', formData)
  return result
}

export function attachmentUrl(requestId: string, attachmentId: string) {
  return `/api/requests/${requestId}/attachments/${attachmentId}`
}

// ---------------------------------------------------------------------------
// Quotations
// ---------------------------------------------------------------------------

export const quotationsRepo = createResource<Quotation>('/quotations')

export async function quotationsForRequest(requestId: string): Promise<Quotation[]> {
  return api.get<Quotation[]>(`/quotations?requestId=${encodeURIComponent(requestId)}`)
}

export async function sendQuotation(id: string, overrides?: { subject: string; body: string }): Promise<Quotation> {
  return api.post<Quotation>(`/quotations/${id}/send`, overrides)
}

export async function getQuotationEmailPreview(id: string): Promise<{ subject: string; body: string }> {
  return api.get(`/quotations/${id}/email-preview`)
}

export async function reviseQuotation(id: string): Promise<Quotation> {
  return api.post<Quotation>(`/quotations/${id}/revise`)
}

export async function updateQuotationStatus(id: string, status: QuotationStatus): Promise<Quotation> {
  return api.patch<Quotation>(`/quotations/${id}/status`, { status })
}

export function quotationPdfUrl(id: string) {
  return `/api/quotations/${id}/pdf`
}

// ---------------------------------------------------------------------------
// Saved products & terms (quotation builder reuse)
// ---------------------------------------------------------------------------

export const savedProductsRepo = createResource<SavedProduct>('/cms/saved-products')
export const savedTermsRepo = createResource<SavedTerm>('/cms/saved-terms')

// ---------------------------------------------------------------------------
// CMS: sourcing cases, FAQs, trust credentials
// ---------------------------------------------------------------------------

export const casesRepo = createResource<SourcingCase>('/cms/cases')
export const faqsRepo = createResource<FaqItem>('/cms/faqs')
export const credentialsRepo = createResource<Credential>('/cms/credentials')

// ---------------------------------------------------------------------------
// Public read endpoints (no admin session required) — used by the public
// site so a visitor's browser never needs write access to see published
// content, only Admin can create/edit it.
// ---------------------------------------------------------------------------

export async function getPublicCompany(): Promise<CompanySettings> {
  return api.get<CompanySettings>('/public/company')
}

export async function getPublicContent(): Promise<ContentOverrides> {
  return api.get<ContentOverrides>('/public/content')
}

export async function getPublicCases(): Promise<SourcingCase[]> {
  return api.get<SourcingCase[]>('/public/cases')
}

export async function getPublicFaqs(): Promise<FaqItem[]> {
  return api.get<FaqItem[]>('/public/faqs')
}

export async function getPublicCredentials(): Promise<Credential[]> {
  return api.get<Credential[]>('/public/credentials')
}

// ---------------------------------------------------------------------------
// Company / email / content settings (admin)
// ---------------------------------------------------------------------------

export async function getCompanySettings(): Promise<CompanySettings> {
  return api.get<CompanySettings>('/settings/company')
}

export async function updateCompanySettings(data: CompanySettings): Promise<CompanySettings> {
  return api.put<CompanySettings>('/settings/company', data)
}

export async function getEmailSettings(): Promise<EmailSettings> {
  return api.get<EmailSettings>('/settings/email')
}

export async function updateEmailSettings(data: EmailSettings): Promise<EmailSettings> {
  return api.put<EmailSettings>('/settings/email', data)
}

export interface ContentOverrides {
  heroHeadlineAr: string
  heroSubAr: string
  heroHeadlineEn: string
  heroSubEn: string
}

export async function getContentOverrides(): Promise<ContentOverrides> {
  return api.get<ContentOverrides>('/settings/content')
}

export async function updateContentOverrides(data: ContentOverrides): Promise<ContentOverrides> {
  return api.put<ContentOverrides>('/settings/content', data)
}

// ---------------------------------------------------------------------------
// Admin users
// ---------------------------------------------------------------------------

export interface AdminUserRecord extends AdminUser {
  active: boolean
  createdAt: string
}

export const adminUsersRepo = createResource<AdminUserRecord>('/users')

// ---------------------------------------------------------------------------
// Logs (read-only)
// ---------------------------------------------------------------------------

export async function submitContactMessage(data: { name: string; email: string; subject?: string; message: string }): Promise<void> {
  await api.post('/contact', data)
}

export async function getEmailLog(): Promise<EmailLogEntry[]> {
  return api.get<EmailLogEntry[]>('/logs/email')
}

export async function getAuditLog(): Promise<AuditLogEntry[]> {
  return api.get<AuditLogEntry[]>('/logs/audit')
}
