import { emailLogRepo, emailSettingsStore } from './repo'
import { uid } from './utils'
import type { EmailLogEntry } from './types'

/**
 * Transactional email delivery.
 *
 * This build has no SMTP/Resend/SendGrid credentials configured (no backend
 * has been provisioned in this environment), so `send()` records the fully
 * rendered email — subject, body, recipient, attachment name — into the
 * Email Log instead of dispatching it over the wire, and returns a
 * "simulated" status. Every call site already awaits a Promise and checks
 * `.status`, so swapping the body of this function for a real provider call
 * (e.g. POST to /api/send-email backed by Resend) is the only change needed
 * to go live — no calling code changes.
 */

function fillTemplate(template: string, vars: Record<string, string>) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
}

export function renderTemplate(subject: string, body: string, vars: Record<string, string>) {
  return { subject: fillTemplate(subject, vars), body: fillTemplate(body, vars) }
}

export async function sendEmail(input: {
  to: string
  subject: string
  body: string
  kind: EmailLogEntry['kind']
  relatedId?: string
  attachmentName?: string
}): Promise<EmailLogEntry> {
  const entry: EmailLogEntry = {
    id: uid('email'),
    createdAt: new Date().toISOString(),
    to: input.to,
    subject: input.subject,
    body: input.body,
    kind: input.kind,
    relatedId: input.relatedId,
    status: 'simulated',
    attachmentName: input.attachmentName,
  }
  emailLogRepo.upsert(entry)
  return entry
}

export function getEmailSettings() {
  return emailSettingsStore.get()
}
