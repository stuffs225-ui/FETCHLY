import { Router } from 'express'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { db, nextRequestNumber, logAudit } from '../db.js'
import { requireAdmin } from '../lib/auth.js'
import { upload, assignRequestId, uploadsRoot } from '../lib/upload.js'
import { sendEmail, fillTemplate } from '../lib/email.js'

export const requestsRouter = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

requestsRouter.post('/', assignRequestId, upload.array('files', 5), async (req, res) => {
  const b = req.body ?? {}
  const errors = {}
  if (!b.name?.trim()) errors.name = 'required'
  if (!b.email?.trim() || !EMAIL_RE.test(b.email.trim())) errors.email = 'invalid'
  if (!b.phone?.trim()) errors.phone = 'required'
  if (!b.productName?.trim()) errors.productName = 'required'
  const quantity = Number(b.quantity)
  if (!quantity || quantity < 1) errors.quantity = 'invalid'
  if (Object.keys(errors).length > 0) {
    // Files were already written to disk by multer before validation ran; clean up.
    fs.rm(path.join(uploadsRoot, req.pendingRequestId), { recursive: true, force: true }, () => {})
    return res.status(400).json({ error: 'validation', fields: errors })
  }

  const id = req.pendingRequestId
  const now = new Date().toISOString()
  const requestNumber = nextRequestNumber()
  const files = req.files ?? []
  const attachmentIds = []

  db.prepare(
    `INSERT INTO requests (
      id, requestNumber, createdAt, locale, status, name, company, email, phone, city,
      productName, quantity, brand, model, partNumber, productUrl, description, sourcePreference,
      deliveryCity, requiredDate, urgency, consentAt
    ) VALUES (
      @id, @requestNumber, @createdAt, @locale, 'new', @name, @company, @email, @phone, @city,
      @productName, @quantity, @brand, @model, @partNumber, @productUrl, @description, @sourcePreference,
      @deliveryCity, @requiredDate, @urgency, @consentAt
    )`
  ).run({
    id,
    requestNumber,
    createdAt: now,
    locale: b.locale === 'en' ? 'en' : 'ar',
    name: b.name.trim(),
    company: b.company?.trim() || null,
    email: b.email.trim(),
    phone: b.phone.trim(),
    city: b.city?.trim() || null,
    productName: b.productName.trim(),
    quantity,
    brand: b.brand?.trim() || null,
    model: b.model?.trim() || null,
    partNumber: b.partNumber?.trim() || null,
    productUrl: b.productUrl?.trim() || null,
    description: b.description?.trim() || null,
    sourcePreference: b.sourcePreference || 'best',
    deliveryCity: b.deliveryCity?.trim() || null,
    requiredDate: b.requiredDate || null,
    urgency: b.urgency || null,
    consentAt: now,
  })

  const insertAttachment = db.prepare(
    'INSERT INTO attachments (id, requestId, fileName, mimeType, size, storagePath, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
  for (const file of files) {
    const attId = crypto.randomUUID()
    insertAttachment.run(attId, id, file.originalname, file.mimetype, file.size, file.path, now)
    attachmentIds.push(attId)
  }

  logAudit({ entityType: 'request', entityId: id, action: 'تم إنشاء الطلب', actor: 'العميل' })

  const locale = b.locale === 'en' ? 'en' : 'ar'
  const emailSettings = db.prepare('SELECT * FROM emailSettings WHERE id = 1').get()
  const template = locale === 'ar' ? JSON.parse(emailSettings.ackTemplateArJson) : JSON.parse(emailSettings.ackTemplateEnJson)
  const vars = { requestNumber, name: b.name.trim() }
  await sendEmail({
    to: b.email.trim(),
    subject: fillTemplate(template.subject, vars),
    body: fillTemplate(template.body, vars),
    kind: 'acknowledgement',
    relatedId: id,
  })

  if (emailSettings.internalNotificationEmails?.trim()) {
    for (const to of emailSettings.internalNotificationEmails.split(',').map((s) => s.trim()).filter(Boolean)) {
      await sendEmail({
        to,
        subject: `طلب جديد — ${requestNumber}`,
        body: `تم استلام طلب جديد من ${b.name.trim()}.\n\nالمنتج: ${b.productName.trim()}\nالكمية: ${quantity}\nالبريد: ${b.email.trim()}\nالجوال: ${b.phone.trim()}`,
        kind: 'contact',
        relatedId: id,
      })
    }
  }

  res.status(201).json({ id, requestNumber })
})

requestsRouter.get('/', requireAdmin, (_req, res) => {
  const rows = db.prepare('SELECT * FROM requests ORDER BY createdAt DESC').all()
  res.json(rows.map(attachAttachmentIds))
})

requestsRouter.get('/:id', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'not_found' })
  res.json(attachAttachmentIds(row))
})

requestsRouter.patch('/:id', requireAdmin, (req, res) => {
  const row = db.prepare('SELECT * FROM requests WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'not_found' })

  const b = req.body ?? {}
  const next = {
    status: b.status ?? row.status,
    internalNotes: b.internalNotes !== undefined ? b.internalNotes : row.internalNotes,
    assignedAgent: b.assignedAgent !== undefined ? b.assignedAgent : row.assignedAgent,
  }
  db.prepare('UPDATE requests SET status = ?, internalNotes = ?, assignedAgent = ? WHERE id = ?').run(
    next.status,
    next.internalNotes,
    next.assignedAgent,
    row.id
  )

  if (b.status && b.status !== row.status) {
    logAudit({ entityType: 'request', entityId: row.id, action: `تغيير الحالة إلى: ${b.status}`, actor: req.adminUser.name })
  }
  if (b.internalNotes !== undefined || b.assignedAgent !== undefined) {
    logAudit({ entityType: 'request', entityId: row.id, action: 'تحديث الملاحظات الداخلية / الوكيل المسؤول', actor: req.adminUser.name })
  }

  const updated = db.prepare('SELECT * FROM requests WHERE id = ?').get(row.id)
  res.json(attachAttachmentIds(updated))
})

requestsRouter.get('/:id/attachments/:attachmentId', requireAdmin, (req, res) => {
  const att = db.prepare('SELECT * FROM attachments WHERE id = ? AND requestId = ?').get(req.params.attachmentId, req.params.id)
  if (!att || !fs.existsSync(att.storagePath)) return res.status(404).json({ error: 'not_found' })
  res.setHeader('Content-Type', att.mimeType)
  res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(att.fileName)}"`)
  fs.createReadStream(att.storagePath).pipe(res)
})

function attachAttachmentIds(row) {
  const attachments = db
    .prepare('SELECT id, requestId, fileName, mimeType, size, createdAt FROM attachments WHERE requestId = ?')
    .all(row.id)
  return { ...row, attachmentIds: attachments.map((a) => a.id), attachments }
}
