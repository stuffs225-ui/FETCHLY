import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import crypto from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, 'data')
fs.mkdirSync(dataDir, { recursive: true })

export const db = new Database(path.join(dataDir, 'fetchly.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
CREATE TABLE IF NOT EXISTS sessions (
  sid TEXT PRIMARY KEY,
  sess TEXT NOT NULL,
  expire INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS adminUsers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  active INTEGER NOT NULL DEFAULT 1,
  failedAttempts INTEGER NOT NULL DEFAULT 0,
  lockedUntil TEXT,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS counters (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  requestSeq INTEGER NOT NULL DEFAULT 0,
  quotationSeq INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  requestNumber TEXT NOT NULL,
  createdAt TEXT NOT NULL,
  locale TEXT NOT NULL,
  status TEXT NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  productName TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  brand TEXT,
  model TEXT,
  partNumber TEXT,
  productUrl TEXT,
  description TEXT,
  sourcePreference TEXT NOT NULL,
  deliveryCity TEXT,
  requiredDate TEXT,
  urgency TEXT,
  internalNotes TEXT,
  assignedAgent TEXT,
  consentAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attachments (
  id TEXT PRIMARY KEY,
  requestId TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  fileName TEXT NOT NULL,
  mimeType TEXT NOT NULL,
  size INTEGER NOT NULL,
  storagePath TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quotations (
  id TEXT PRIMARY KEY,
  quotationNumber TEXT NOT NULL,
  baseNumber TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 0,
  requestId TEXT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  createdAt TEXT NOT NULL,
  sentAt TEXT,
  validUntilDays TEXT NOT NULL,
  validUntilDate TEXT NOT NULL,
  currency TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL,
  customerName TEXT NOT NULL,
  customerCompany TEXT,
  customerEmail TEXT NOT NULL,
  customerPhone TEXT NOT NULL,
  customerCity TEXT,
  itemsJson TEXT NOT NULL DEFAULT '[]',
  vatEnabled INTEGER NOT NULL DEFAULT 1,
  vatRate REAL NOT NULL DEFAULT 15,
  leadTime TEXT,
  paymentTerms TEXT,
  deliveryLocation TEXT,
  warranty TEXT,
  notes TEXT,
  termsAndConditions TEXT
);

CREATE TABLE IF NOT EXISTS savedProducts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  lastPrice REAL NOT NULL,
  currency TEXT NOT NULL,
  manufacturer TEXT,
  supplierRef TEXT,
  lastQuotedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS savedTerms (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  titleAr TEXT NOT NULL,
  titleEn TEXT NOT NULL,
  sourceAr TEXT NOT NULL,
  sourceEn TEXT NOT NULL,
  challengeAr TEXT,
  challengeEn TEXT,
  solutionAr TEXT,
  solutionEn TEXT,
  published INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS faqs (
  id TEXT PRIMARY KEY,
  qAr TEXT NOT NULL,
  qEn TEXT NOT NULL,
  aAr TEXT NOT NULL,
  aEn TEXT NOT NULL,
  published INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS credentials (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  labelAr TEXT NOT NULL,
  labelEn TEXT NOT NULL,
  authority TEXT,
  number TEXT,
  issuedDate TEXT,
  expiryDate TEXT,
  verifyUrl TEXT,
  documentDataUrl TEXT,
  visible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS companySettings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  companyNameAr TEXT NOT NULL DEFAULT '',
  companyNameEn TEXT NOT NULL DEFAULT '',
  logoDataUrl TEXT,
  logoArDataUrl TEXT,
  crNumber TEXT NOT NULL DEFAULT '',
  vatNumber TEXT NOT NULL DEFAULT '',
  zakatCertificate TEXT NOT NULL DEFAULT '',
  sbcNumber TEXT NOT NULL DEFAULT '',
  nationalAddress TEXT NOT NULL DEFAULT '',
  baladyLicense TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  businessEmail TEXT NOT NULL DEFAULT '',
  quotationEmail TEXT NOT NULL DEFAULT '',
  websiteDomain TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  footerText TEXT NOT NULL DEFAULT '',
  defaultVatRate REAL NOT NULL DEFAULT 15,
  defaultCurrency TEXT NOT NULL DEFAULT 'SAR'
);

CREATE TABLE IF NOT EXISTS emailSettings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  senderName TEXT NOT NULL DEFAULT '',
  senderEmail TEXT NOT NULL DEFAULT '',
  internalNotificationEmails TEXT NOT NULL DEFAULT '',
  replyToEmail TEXT NOT NULL DEFAULT '',
  ackTemplateArJson TEXT NOT NULL,
  ackTemplateEnJson TEXT NOT NULL,
  quoteTemplateArJson TEXT NOT NULL,
  quoteTemplateEnJson TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contentOverrides (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  heroHeadlineAr TEXT NOT NULL DEFAULT '',
  heroSubAr TEXT NOT NULL DEFAULT '',
  heroHeadlineEn TEXT NOT NULL DEFAULT '',
  heroSubEn TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS emailLog (
  id TEXT PRIMARY KEY,
  createdAt TEXT NOT NULL,
  "to" TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  kind TEXT NOT NULL,
  relatedId TEXT,
  status TEXT NOT NULL,
  attachmentName TEXT,
  errorMessage TEXT
);

CREATE TABLE IF NOT EXISTS auditLog (
  id TEXT PRIMARY KEY,
  createdAt TEXT NOT NULL,
  entityType TEXT NOT NULL,
  entityId TEXT NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  details TEXT
);
`)

db.prepare('INSERT OR IGNORE INTO counters (id, requestSeq, quotationSeq) VALUES (1, 0, 0)').run()
db.prepare('INSERT OR IGNORE INTO companySettings (id) VALUES (1)').run()
db.prepare(
  `INSERT OR IGNORE INTO emailSettings (id, ackTemplateArJson, ackTemplateEnJson, quoteTemplateArJson, quoteTemplateEnJson)
   VALUES (1, ?, ?, ?, ?)`
).run(
  JSON.stringify({ subject: 'تم استلام طلبك — {{requestNumber}}', body: 'مرحبًا {{name}}،\n\nتم استلام طلبك بنجاح.\n\nرقم الطلب: {{requestNumber}}\n\nسنقوم بمراجعة التفاصيل وإرسال عرض السعر إلى بريدك الإلكتروني بعد استكمال عملية التسعير.\n\nشكرًا لك.' }),
  JSON.stringify({ subject: 'We received your request — {{requestNumber}}', body: 'Hello {{name}},\n\nYour request has been received successfully.\n\nRequest number: {{requestNumber}}\n\nWe will review the details and send your quotation by email once pricing is complete.\n\nThank you.' }),
  JSON.stringify({ subject: 'عرض السعر الخاص بك — {{quotationNumber}}', body: 'مرحبًا {{name}}،\n\nمرفق عرض السعر الخاص بطلبك رقم {{requestNumber}}.\n\nرقم العرض: {{quotationNumber}}\nصالح حتى: {{validUntil}}\n\nيسعدنا الرد على أي استفسار.' }),
  JSON.stringify({ subject: 'Your Quotation — {{quotationNumber}}', body: 'Hello {{name}},\n\nPlease find attached the quotation for your request {{requestNumber}}.\n\nQuotation number: {{quotationNumber}}\nValid until: {{validUntil}}\n\nWe are happy to answer any questions.' }),
)
db.prepare('INSERT OR IGNORE INTO contentOverrides (id) VALUES (1)').run()

const defaultCredentials = [
  ['cr', 'السجل التجاري', 'Commercial Registration'],
  ['sbc', 'توثيق منصة الأعمال السعودية', 'Saudi Business Center'],
  ['vat', 'التسجيل في ضريبة القيمة المضافة', 'VAT Registration'],
  ['zakat', 'شهادة الزكاة', 'Zakat Certificate'],
  ['address', 'العنوان الوطني', 'National Address'],
  ['balady', 'رخصة بلدي', 'Balady License'],
]
const credCount = db.prepare('SELECT COUNT(*) as n FROM credentials').get().n
if (credCount === 0) {
  const insertCred = db.prepare(
    'INSERT INTO credentials (id, key, labelAr, labelEn, visible) VALUES (?, ?, ?, ?, 1)'
  )
  for (const [key, labelAr, labelEn] of defaultCredentials) {
    insertCred.run(crypto.randomUUID(), key, labelAr, labelEn)
  }
}

export function nextRequestNumber() {
  const c = db.prepare('SELECT requestSeq FROM counters WHERE id = 1').get()
  const seq = c.requestSeq + 1
  db.prepare('UPDATE counters SET requestSeq = ? WHERE id = 1').run(seq)
  const year = new Date().getFullYear()
  return `REQ-${year}-${String(seq).padStart(5, '0')}`
}

export function nextQuotationNumber() {
  const c = db.prepare('SELECT quotationSeq FROM counters WHERE id = 1').get()
  const seq = c.quotationSeq + 1
  db.prepare('UPDATE counters SET quotationSeq = ? WHERE id = 1').run(seq)
  const year = new Date().getFullYear()
  return `QT-${year}-${String(seq).padStart(4, '0')}`
}

export function logAudit({ entityType, entityId, action, actor, details }) {
  db.prepare(
    'INSERT INTO auditLog (id, createdAt, entityType, entityId, action, actor, details) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(crypto.randomUUID(), new Date().toISOString(), entityType, entityId, action, actor, details ?? null)
}

export function bootstrapAdmin() {
  const count = db.prepare('SELECT COUNT(*) as n FROM adminUsers').get().n
  if (count > 0) return

  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    console.warn(
      '[auth] No admin user exists and ADMIN_EMAIL/ADMIN_PASSWORD are not set in the environment.\n' +
        '        Set them and restart the server to create the first admin account.'
    )
    return
  }

  const passwordHash = bcrypt.hashSync(password, 12)
  db.prepare(
    'INSERT INTO adminUsers (id, name, email, passwordHash, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(crypto.randomUUID(), 'المشرف الرئيسي', email.toLowerCase(), passwordHash, 'admin', new Date().toISOString())
  console.log(`[auth] Created first admin user: ${email}`)
}
