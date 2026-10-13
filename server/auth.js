import crypto from 'node:crypto'
import { q, persistentSecret } from './db.js'
import { parseCookies, isSecure } from './http.js'

const COOKIE = 'nabd'
// Browsers cap cookie lifetime at ~400 days, so this is effectively "until they clear the site data".
const MAX_AGE_S = 60 * 60 * 24 * 399

export const WHO = ['a', 'b']
export const partnerOf = (who) => (who === 'a' ? 'b' : 'a')

let cfg = null
/** Secrets are created once in the database; env vars can override them. */
export async function config() {
  if (cfg) return cfg
  const [cookieSecret, a, b] = await Promise.all([persistentSecret('cookieSecret'), persistentSecret('linkTokenA', 18), persistentSecret('linkTokenB', 18)])
  cfg = {
    cookieSecret: process.env.SESSION_SECRET || cookieSecret,
    tokens: { a: process.env.LINK_TOKEN_A || a, b: process.env.LINK_TOKEN_B || b },
  }
  return cfg
}

const sha = (v) => crypto.createHash('sha256').update(String(v)).digest()
export const safeEqual = (a, b) => crypto.timingSafeEqual(sha(a), sha(b))

export async function whoForToken(token) {
  if (typeof token !== 'string' || token.length < 8) return null
  const { tokens } = await config()
  // Compare against both so timing never reveals which one was close.
  const a = safeEqual(token, tokens.a)
  const b = safeEqual(token, tokens.b)
  return a ? 'a' : b ? 'b' : null
}

const hashPassword = (password, salt) => crypto.scryptSync(password, salt, 32).toString('hex')

export async function hasPassword(who) {
  const r = await q('SELECT pass_hash FROM nb_slots WHERE who = $1', [who])
  return Boolean(r[0]?.pass_hash)
}

export async function anyPasswordSet() {
  return (await q('SELECT 1 FROM nb_slots WHERE pass_hash IS NOT NULL LIMIT 1')).length > 0
}

export async function setPassword(who, password) {
  const salt = crypto.randomBytes(16).toString('hex')
  await q(
    'INSERT INTO nb_slots (who, pass_hash, pass_salt) VALUES ($1, $2, $3) ON CONFLICT (who) DO UPDATE SET pass_hash = EXCLUDED.pass_hash, pass_salt = EXCLUDED.pass_salt',
    [who, hashPassword(password, salt), salt],
  )
}

export async function checkPassword(who, password) {
  const r = (await q('SELECT pass_hash, pass_salt FROM nb_slots WHERE who = $1', [who]))[0]
  if (!r?.pass_hash) return false
  return safeEqual(hashPassword(password, r.pass_salt), r.pass_hash)
}

export async function resetPassword(who) {
  await q('DELETE FROM nb_slots WHERE who = $1', [who])
}

const sign = (secret, value) => crypto.createHmac('sha256', secret).update(value).digest('base64url')

export async function issueCookie(req, res, who) {
  const { cookieSecret } = await config()
  const value = `${who}.${Date.now()}`
  const parts = [`${COOKIE}=${value}.${sign(cookieSecret, value)}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${MAX_AGE_S}`]
  if (isSecure(req)) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

/** Returns 'a' | 'b' for a valid signed cookie, otherwise null. */
export async function whoFromRequest(req) {
  const raw = parseCookies(req.headers.cookie)[COOKIE]
  if (!raw) return null
  const [who, ts, sig] = raw.split('.')
  if (!WHO.includes(who) || !ts || !sig) return null
  const { cookieSecret } = await config()
  const expected = sign(cookieSecret, `${who}.${ts}`)
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null
  if (Date.now() - Number(ts) > MAX_AGE_S * 1000) return null
  return who
}

/** Shared across serverless instances because it lives in the database. */
export async function tooManyAttempts(key, max, windowMs) {
  const now = Date.now()
  const r = await q(
    `INSERT INTO nb_attempts (key, count, since) VALUES ($1, 1, $2)
     ON CONFLICT (key) DO UPDATE SET
       count = CASE WHEN $2 - nb_attempts.since > $3 THEN 1 ELSE nb_attempts.count + 1 END,
       since = CASE WHEN $2 - nb_attempts.since > $3 THEN $2 ELSE nb_attempts.since END
     RETURNING count`,
    [key, now, windowMs],
  )
  return r[0].count > max
}
