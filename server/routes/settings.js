import { Router } from 'express'
import { db, logAudit } from '../db.js'
import { requireAdmin } from '../lib/auth.js'

export const settingsRouter = Router()
settingsRouter.use(requireAdmin)

settingsRouter.get('/company', (_req, res) => {
  res.json(db.prepare('SELECT * FROM companySettings WHERE id = 1').get())
})

settingsRouter.put('/company', (req, res) => {
  const b = req.body ?? {}
  db.prepare(
    `UPDATE companySettings SET
      companyNameAr=@companyNameAr, companyNameEn=@companyNameEn, logoDataUrl=@logoDataUrl, logoArDataUrl=@logoArDataUrl,
      crNumber=@crNumber, vatNumber=@vatNumber, zakatCertificate=@zakatCertificate, sbcNumber=@sbcNumber,
      nationalAddress=@nationalAddress, baladyLicense=@baladyLicense, phone=@phone, whatsapp=@whatsapp,
      businessEmail=@businessEmail, quotationEmail=@quotationEmail, websiteDomain=@websiteDomain, address=@address,
      footerText=@footerText, defaultVatRate=@defaultVatRate, defaultCurrency=@defaultCurrency
     WHERE id = 1`
  ).run({
    companyNameAr: b.companyNameAr ?? '',
    companyNameEn: b.companyNameEn ?? '',
    logoDataUrl: b.logoDataUrl ?? null,
    logoArDataUrl: b.logoArDataUrl ?? null,
    crNumber: b.crNumber ?? '',
    vatNumber: b.vatNumber ?? '',
    zakatCertificate: b.zakatCertificate ?? '',
    sbcNumber: b.sbcNumber ?? '',
    nationalAddress: b.nationalAddress ?? '',
    baladyLicense: b.baladyLicense ?? '',
    phone: b.phone ?? '',
    whatsapp: b.whatsapp ?? '',
    businessEmail: b.businessEmail ?? '',
    quotationEmail: b.quotationEmail ?? '',
    websiteDomain: b.websiteDomain ?? '',
    address: b.address ?? '',
    footerText: b.footerText ?? '',
    defaultVatRate: Number(b.defaultVatRate ?? 15),
    defaultCurrency: b.defaultCurrency ?? 'SAR',
  })
  logAudit({ entityType: 'settings', entityId: 'company', action: 'تحديث بيانات الشركة', actor: req.adminUser.name })
  res.json(db.prepare('SELECT * FROM companySettings WHERE id = 1').get())
})

function rowToEmailSettings(row) {
  return {
    senderName: row.senderName,
    senderEmail: row.senderEmail,
    internalNotificationEmails: row.internalNotificationEmails,
    replyToEmail: row.replyToEmail,
    ackTemplateAr: JSON.parse(row.ackTemplateArJson),
    ackTemplateEn: JSON.parse(row.ackTemplateEnJson),
    quoteTemplateAr: JSON.parse(row.quoteTemplateArJson),
    quoteTemplateEn: JSON.parse(row.quoteTemplateEnJson),
  }
}

settingsRouter.get('/email', (_req, res) => {
  res.json(rowToEmailSettings(db.prepare('SELECT * FROM emailSettings WHERE id = 1').get()))
})

settingsRouter.put('/email', (req, res) => {
  const b = req.body ?? {}
  db.prepare(
    `UPDATE emailSettings SET senderName=@senderName, senderEmail=@senderEmail,
     internalNotificationEmails=@internalNotificationEmails, replyToEmail=@replyToEmail,
     ackTemplateArJson=@ackTemplateArJson, ackTemplateEnJson=@ackTemplateEnJson,
     quoteTemplateArJson=@quoteTemplateArJson, quoteTemplateEnJson=@quoteTemplateEnJson WHERE id = 1`
  ).run({
    senderName: b.senderName ?? '',
    senderEmail: b.senderEmail ?? '',
    internalNotificationEmails: b.internalNotificationEmails ?? '',
    replyToEmail: b.replyToEmail ?? '',
    ackTemplateArJson: JSON.stringify(b.ackTemplateAr ?? {}),
    ackTemplateEnJson: JSON.stringify(b.ackTemplateEn ?? {}),
    quoteTemplateArJson: JSON.stringify(b.quoteTemplateAr ?? {}),
    quoteTemplateEnJson: JSON.stringify(b.quoteTemplateEn ?? {}),
  })
  logAudit({ entityType: 'settings', entityId: 'email', action: 'تحديث إعدادات البريد الإلكتروني', actor: req.adminUser.name })
  res.json(rowToEmailSettings(db.prepare('SELECT * FROM emailSettings WHERE id = 1').get()))
})

settingsRouter.get('/content', (_req, res) => {
  res.json(db.prepare('SELECT * FROM contentOverrides WHERE id = 1').get())
})

settingsRouter.put('/content', (req, res) => {
  const b = req.body ?? {}
  db.prepare(
    'UPDATE contentOverrides SET heroHeadlineAr=@heroHeadlineAr, heroSubAr=@heroSubAr, heroHeadlineEn=@heroHeadlineEn, heroSubEn=@heroSubEn WHERE id = 1'
  ).run({
    heroHeadlineAr: b.heroHeadlineAr ?? '',
    heroSubAr: b.heroSubAr ?? '',
    heroHeadlineEn: b.heroHeadlineEn ?? '',
    heroSubEn: b.heroSubEn ?? '',
  })
  logAudit({ entityType: 'settings', entityId: 'content', action: 'تحديث محتوى الصفحة الرئيسية', actor: req.adminUser.name })
  res.json(db.prepare('SELECT * FROM contentOverrides WHERE id = 1').get())
})
