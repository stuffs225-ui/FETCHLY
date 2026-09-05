import { Router } from 'express'
import { db } from '../db.js'
import { sendEmail } from '../lib/email.js'

export const contactRouter = Router()

contactRouter.post('/', async (req, res) => {
  const b = req.body ?? {}
  if (!b.name?.trim() || !b.email?.trim() || !b.message?.trim()) {
    return res.status(400).json({ error: 'validation' })
  }

  const company = db.prepare('SELECT businessEmail FROM companySettings WHERE id = 1').get()
  if (!company?.businessEmail) {
    return res.status(503).json({ error: 'not_configured' })
  }

  const result = await sendEmail({
    to: company.businessEmail,
    subject: `[Contact] ${b.subject?.trim() || b.name.trim()}`,
    body: `From: ${b.name.trim()} <${b.email.trim()}>\n\n${b.message.trim()}`,
    kind: 'contact',
  })

  if (result.status !== 'sent') {
    return res.status(502).json({ error: 'email_send_failed', detail: result.errorMessage })
  }
  res.status(201).json({ ok: true })
})
