import { Router } from 'express'
import crypto from 'node:crypto'
import { db, nextQuotationNumber, logAudit } from '../db.js'
import { requireAdmin } from '../lib/auth.js'
import { sendEmail, fillTemplate } from '../lib/email.js'
import { renderQuotationPdf } from '../lib/pdf.js'

export const quotationsRouter = Router()
quotationsRouter.use(requireAdmin)

function rowToQuotation(row) {
  return { ...row, items: JSON.parse(row.itemsJson), vatEnabled: Boolean(row.vatEnabled) }
}

quotationsRouter.get('/', (req, res) => {
  const rows = req.query.requestId
    ? db.prepare('SELECT * FROM quotations WHERE requestId = ? ORDER BY createdAt DESC').all(req.query.requestId)
    : db.prepare('SELECT * FROM quotations ORDER BY createdAt DESC').all()
  res.json(rows.map(rowToQuotation))
})

quotationsRouter.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM quotations WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'not_found' })
  res.json(rowToQuotation(row))
})

function fields(b) {
  return {
    requestId: b.requestId,
    validUntilDays: String(b.validUntilDays ?? 7),
    validUntilDate: b.validUntilDate,
    currency: b.currency ?? 'SAR',
    language: b.language ?? 'ar',
    customerName: b.customerName,
    customerCompany: b.customerCompany ?? null,
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone,
    customerCity: b.customerCity ?? null,
    itemsJson: JSON.stringify(b.items ?? []),
    vatEnabled: b.vatEnabled ? 1 : 0,
    vatRate: Number(b.vatRate ?? 15),
    leadTime: b.leadTime ?? null,
    paymentTerms: b.paymentTerms ?? null,
    deliveryLocation: b.deliveryLocation ?? null,
    warranty: b.warranty ?? null,
    notes: b.notes ?? null,
    termsAndConditions: b.termsAndConditions ?? null,
  }
}

quotationsRouter.post('/', (req, res) => {
  const b = req.body ?? {}
  if (!b.requestId) return res.status(400).json({ error: 'missing_requestId' })

  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const quotationNumber = nextQuotationNumber()
  const f = fields(b)

  db.prepare(
    `INSERT INTO quotations (
      id, quotationNumber, baseNumber, revision, requestId, createdAt, validUntilDays, validUntilDate,
      currency, language, status, customerName, customerCompany, customerEmail, customerPhone, customerCity,
      itemsJson, vatEnabled, vatRate, leadTime, paymentTerms, deliveryLocation, warranty, notes, termsAndConditions
    ) VALUES (
      @id, @quotationNumber, @baseNumber, 0, @requestId, @createdAt, @validUntilDays, @validUntilDate,
      @currency, @language, 'draft', @customerName, @customerCompany, @customerEmail, @customerPhone, @customerCity,
      @itemsJson, @vatEnabled, @vatRate, @leadTime, @paymentTerms, @deliveryLocation, @warranty, @notes, @termsAndConditions
    )`
  ).run({ id, quotationNumber, baseNumber: quotationNumber, createdAt: now, ...f })

  logAudit({ entityType: 'quotation', entityId: id, action: 'تم إنشاء عرض السعر', actor: req.adminUser.name })

  res.status(201).json(rowToQuotation(db.prepare('SELECT * FROM quotations WHERE id = ?').get(id)))
})

quotationsRouter.put('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM quotations WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'not_found' })

  const f = fields({ ...row, ...req.body, requestId: row.requestId })
  db.prepare(
    `UPDATE quotations SET validUntilDays=@validUntilDays, validUntilDate=@validUntilDate, currency=@currency,
     language=@language, customerName=@customerName, customerCompany=@customerCompany, customerEmail=@customerEmail,
     customerPhone=@customerPhone, customerCity=@customerCity, itemsJson=@itemsJson, vatEnabled=@vatEnabled,
     vatRate=@vatRate, leadTime=@leadTime, paymentTerms=@paymentTerms, deliveryLocation=@deliveryLocation,
     warranty=@warranty, notes=@notes, termsAndConditions=@termsAndConditions WHERE id=@id`
  ).run({ ...f, id: row.id })

  logAudit({ entityType: 'quotation', entityId: row.id, action: 'تحديث عرض السعر', actor: req.adminUser.name })
  res.json(rowToQuotation(db.prepare('SELECT * FROM quotations WHERE id = ?').get(row.id)))
})

quotationsRouter.post('/:id/revise', (req, res) => {
  const source = db.prepare('SELECT * FROM quotations WHERE id = ?').get(req.params.id)
  if (!source) return res.status(404).json({ error: 'not_found' })

  const maxRevision = db.prepare('SELECT MAX(revision) as m FROM quotations WHERE baseNumber = ?').get(source.baseNumber).m
  const revision = maxRevision + 1
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const quotationNumber = `${source.baseNumber}-R${revision}`

  db.prepare(
    `INSERT INTO quotations (
      id, quotationNumber, baseNumber, revision, requestId, createdAt, validUntilDays, validUntilDate,
      currency, language, status, customerName, customerCompany, customerEmail, customerPhone, customerCity,
      itemsJson, vatEnabled, vatRate, leadTime, paymentTerms, deliveryLocation, warranty, notes, termsAndConditions
    ) VALUES (
      @id, @quotationNumber, @baseNumber, @revision, @requestId, @createdAt, @validUntilDays, @validUntilDate,
      @currency, @language, 'draft', @customerName, @customerCompany, @customerEmail, @customerPhone, @customerCity,
      @itemsJson, @vatEnabled, @vatRate, @leadTime, @paymentTerms, @deliveryLocation, @warranty, @notes, @termsAndConditions
    )`
  ).run({
    id,
    quotationNumber,
    baseNumber: source.baseNumber,
    revision,
    requestId: source.requestId,
    createdAt: now,
    validUntilDays: source.validUntilDays,
    validUntilDate: source.validUntilDate,
    currency: source.currency,
    language: source.language,
    customerName: source.customerName,
    customerCompany: source.customerCompany,
    customerEmail: source.customerEmail,
    customerPhone: source.customerPhone,
    customerCity: source.customerCity,
    itemsJson: source.itemsJson,
    vatEnabled: source.vatEnabled,
    vatRate: source.vatRate,
    leadTime: source.leadTime,
    paymentTerms: source.paymentTerms,
    deliveryLocation: source.deliveryLocation,
    warranty: source.warranty,
    notes: source.notes,
    termsAndConditions: source.termsAndConditions,
  })

  logAudit({ entityType: 'quotation', entityId: id, action: `تم إنشاء مراجعة R${revision}`, actor: req.adminUser.name })
  res.status(201).json(rowToQuotation(db.prepare('SELECT * FROM quotations WHERE id = ?').get(id)))
})

quotationsRouter.get('/:id/pdf', async (req, res) => {
  const row = db.prepare('SELECT * FROM quotations WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'not_found' })
  const company = db.prepare('SELECT * FROM companySettings WHERE id = 1').get()

  try {
    const buffer = await renderQuotationPdf(rowToQuotation(row), company)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `inline; filename="${row.quotationNumber}.pdf"`)
    res.send(buffer)
  } catch (err) {
    console.error('[pdf] render failed:', err)
    res.status(500).json({ error: 'pdf_render_failed' })
  }
})

quotationsRouter.post('/:id/send', async (req, res) => {
  const row = db.prepare('SELECT * FROM quotations WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'not_found' })
  const company = db.prepare('SELECT * FROM companySettings WHERE id = 1').get()
  const emailSettings = db.prepare('SELECT * FROM emailSettings WHERE id = 1').get()
  const requestRow = db.prepare('SELECT requestNumber FROM requests WHERE id = ?').get(row.requestId)

  let pdfBuffer
  try {
    pdfBuffer = await renderQuotationPdf(rowToQuotation(row), company)
  } catch (err) {
    console.error('[pdf] render failed:', err)
    return res.status(500).json({ error: 'pdf_render_failed' })
  }

  const template = row.language === 'ar' ? JSON.parse(emailSettings.quoteTemplateArJson) : JSON.parse(emailSettings.quoteTemplateEnJson)
  const vars = {
    name: row.customerName,
    requestNumber: requestRow?.requestNumber ?? '',
    quotationNumber: row.quotationNumber,
    validUntil: row.validUntilDate,
  }

  const emailResult = await sendEmail({
    to: row.customerEmail,
    subject: fillTemplate(template.subject, vars),
    body: fillTemplate(template.body, vars),
    kind: 'quotation',
    relatedId: row.id,
    attachmentName: `${row.quotationNumber}.pdf`,
    attachmentBuffer: pdfBuffer,
    attachmentContentType: 'application/pdf',
  })

  if (emailResult.status !== 'sent') {
    return res.status(502).json({ error: 'email_send_failed', detail: emailResult.errorMessage })
  }

  const now = new Date().toISOString()
  db.prepare("UPDATE quotations SET status = 'sent', sentAt = ? WHERE id = ?").run(now, row.id)
  db.prepare("UPDATE requests SET status = 'quote_sent' WHERE id = ? AND status NOT IN ('approved','rejected','closed')").run(row.requestId)
  logAudit({ entityType: 'quotation', entityId: row.id, action: `تم إرسال عرض السعر إلى ${row.customerEmail}`, actor: req.adminUser.name })

  res.json(rowToQuotation(db.prepare('SELECT * FROM quotations WHERE id = ?').get(row.id)))
})

quotationsRouter.patch('/:id/status', (req, res) => {
  const row = db.prepare('SELECT * FROM quotations WHERE id = ?').get(req.params.id)
  if (!row) return res.status(404).json({ error: 'not_found' })
  const status = req.body?.status
  if (!status) return res.status(400).json({ error: 'missing_status' })
  db.prepare('UPDATE quotations SET status = ? WHERE id = ?').run(status, row.id)
  logAudit({ entityType: 'quotation', entityId: row.id, action: `تغيير حالة العرض إلى: ${status}`, actor: req.adminUser.name })
  res.json(rowToQuotation(db.prepare('SELECT * FROM quotations WHERE id = ?').get(row.id)))
})
