import crypto from 'node:crypto'
import { db, persistentSecret } from './db.js'

export const isProduction = process.env.NODE_ENV === 'production'
const secret = process.env.SESSION_SECRET || persistentSecret('cookieSecret')
const COOKIE = 'nabd'
// Browsers cap cookie lifetime at ~400 days, so this is effectively "until they clear the site data".
const MAX_AGE = 1000 * 60 * 60 * 24 * 399

export const WHO = ['a', 'b']
export const partnerOf = (who) => (who === 'a' ? 'b' : 'a')

/** Each person has one private link. Slot A is "her", slot B is "him". Nothing is shown by name. */
export const linkTokens = {
  a: process.env.LINK_TOKEN_A || persistentSecret('linkTokenA', 18),
  b: process.env.LINK_TOKEN_B || persistentSecret('linkTokenB', 18),
}

const sha = (v) => crypto.createHash('sha256').update(String(v)).digest()
export const safeEqual = (a, b) => crypto.timingSafeEqual(sha(a), sha(b))

export function whoForToken(token) {
  if (typeof token !== 'string' || token.length < 8) return null
  // Compare against both so timing never reveals which one was close.
  const a = safeEqual(token, linkTokens.a)
  const b = safeEqual(token, linkTokens.b)
  return a ? 'a' : b ? 'b' : null
}

const hashPassword = (password, salt) => crypto.scryptSync(password, salt, 32).toString('hex')

export function hasPassword(who) {
  return Boolean(db.prepare('SELECT passHash FROM slots WHERE who = ?').get(who)?.passHash)
}

export function setPassword(who, password) {
  const salt = crypto.randomBytes(16).toString('hex')
  db.prepare(
    'INSERT INTO slots (who, passHash, passSalt) VALUES (?, ?, ?) ON CONFLICT(who) DO UPDATE SET passHash = excluded.passHash, passSalt = excluded.passSalt'
  ).run(who, hashPassword(password, salt), salt)
}

export function checkPassword(who, password) {
  const row = db.prepare('SELECT passHash, passSalt FROM slots WHERE who = ?').get(who)
  if (!row?.passHash) return false
  return safeEqual(hashPassword(password, row.passSalt), row.passHash)
}

export function anyPasswordSet() {
  return db.prepare('SELECT 1 FROM slots WHERE passHash IS NOT NULL LIMIT 1').get() !== undefined
}

export function resetPassword(who) {
  db.prepare('DELETE FROM slots WHERE who = ?').run(who)
}

const sign = (value) => crypto.createHmac('sha256', secret).update(value).digest('base64url')

export function issueCookie(req, res, who) {
  const value = `${who}.${Date.now()}`
  res.cookie(COOKIE, `${value}.${sign(value)}`, { httpOnly: true, sameSite: 'lax', secure: req.secure, maxAge: MAX_AGE, path: '/' })
}

function parseCookies(header = '') {
  const out = {}
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

/** Returns 'a' | 'b' for a valid signed cookie header, otherwise null. */
export function whoFromCookieHeader(header) {
  const raw = parseCookies(header)[COOKIE]
  if (!raw) return null
  const [who, ts, sig] = raw.split('.')
  if (!WHO.includes(who) || !ts || !sig) return null
  const expected = sign(`${who}.${ts}`)
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  if (Date.now() - Number(ts) > MAX_AGE) return null
  return who
}

export function requireMe(req, res, next) {
  const who = whoFromCookieHeader(req.headers.cookie)
  if (!who) return res.status(401).json({ error: 'unauthorized' })
  req.who = who
  next()
}

/** Blocks cross-site writes: the Origin (when sent) must match this host. */
export function sameOrigin(req, res, next) {
  const origin = req.headers.origin
  if (origin && req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      if (new URL(origin).host !== req.headers.host) return res.status(403).json({ error: 'bad_origin' })
    } catch {
      return res.status(403).json({ error: 'bad_origin' })
    }
  }
  next()
}
