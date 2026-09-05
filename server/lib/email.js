import nodemailer from 'nodemailer'
import crypto from 'node:crypto'
import { db } from '../db.js'

let transporter = null
let transporterError = null

function getTransporter() {
  if (transporter || transporterError) return transporter

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    transporterError = 'SMTP is not configured (set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in the environment).'
    console.warn(`[email] ${transporterError}`)
    return null
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  return transporter
}

export function fillTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? '')
}

/**
 * Sends a real email via the configured SMTP transport and records the
 * outcome in the email log. There is no "simulated" success path: if SMTP
 * isn't configured or the send fails, the log entry (and the return value)
 * says so honestly instead of pretending delivery happened.
 */
export async function sendEmail({ to, subject, body, kind, relatedId, attachmentName, attachmentBuffer, attachmentContentType }) {
  const entry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    to,
    subject,
    body,
    kind,
    relatedId: relatedId ?? null,
    status: 'failed',
    attachmentName: attachmentName ?? null,
    errorMessage: null,
  }

  const t = getTransporter()
  if (!t) {
    entry.errorMessage = transporterError
    persist(entry)
    return entry
  }

  const { SMTP_FROM, SMTP_USER } = process.env
  try {
    await t.sendMail({
      from: SMTP_FROM || SMTP_USER,
      to,
      subject,
      text: body,
      attachments: attachmentBuffer
        ? [{ filename: attachmentName || 'attachment.pdf', content: attachmentBuffer, contentType: attachmentContentType }]
        : undefined,
    })
    entry.status = 'sent'
  } catch (err) {
    entry.errorMessage = err.message
    console.error('[email] send failed:', err.message)
  }

  persist(entry)
  return entry
}

function persist(entry) {
  db.prepare(
    `INSERT INTO emailLog (id, createdAt, "to", subject, body, kind, relatedId, status, attachmentName, errorMessage)
     VALUES (@id, @createdAt, @to, @subject, @body, @kind, @relatedId, @status, @attachmentName, @errorMessage)`
  ).run(entry)
}

export function isEmailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS)
}
