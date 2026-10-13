import crypto from 'node:crypto'
import { persistentSecret, getSetting } from './db.js'

export const isProduction = process.env.NODE_ENV === 'production'
const secret = process.env.SESSION_SECRET || persistentSecret('cookieSecret')
const COOKIE = 'nabd'
const MAX_AGE = 1000 * 60 * 60 * 24 * 180

export const WHO = ['a', 'b']
export const partnerOf = (who) => (who === 'a' ? 'b' : 'a')

export const config = {
  passphrase: process.env.ROOM_PASSPHRASE || (isProduction ? '' : 'dev'),
  // Grammatical gender used for Arabic copy ('m' | 'f') — slot A is "him", slot B is "her" by default.
  genders: { a: process.env.GENDER_A === 'f' ? 'f' : 'm', b: process.env.GENDER_B === 'm' ? 'm' : 'f' },
  defaultNames: { a: 'هو', b: 'هي' },
}

export function names() {
  return {
    a: getSetting('name_a') || config.defaultNames.a,
    b: getSetting('name_b') || config.defaultNames.b,
  }
}

const sign = (value) => crypto.createHmac('sha256', secret).update(value).digest('base64url')

export function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

export function issueCookie(res, who) {
  const value = `${who}.${Date.now()}`
  res.cookie(COOKIE, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: MAX_AGE,
    path: '/',
  })
}

export function clearCookie(res) {
  res.clearCookie(COOKIE, { path: '/' })
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
