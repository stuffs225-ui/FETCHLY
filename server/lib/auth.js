import bcrypt from 'bcryptjs'
import rateLimit from 'express-rate-limit'
import { db, logAudit } from '../db.js'

const LOCK_THRESHOLD = 5
const LOCK_DURATION_MS = 15 * 60 * 1000

export function findAdminByEmail(email) {
  return db.prepare('SELECT * FROM adminUsers WHERE email = ?').get(email.toLowerCase())
}

export function verifyLogin(email, password) {
  const user = findAdminByEmail(email)
  if (!user || !user.active) return { ok: false, reason: 'invalid' }

  if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
    return { ok: false, reason: 'locked' }
  }

  const valid = bcrypt.compareSync(password, user.passwordHash)
  if (!valid) {
    const failedAttempts = user.failedAttempts + 1
    const lockedUntil = failedAttempts >= LOCK_THRESHOLD ? new Date(Date.now() + LOCK_DURATION_MS).toISOString() : null
    db.prepare('UPDATE adminUsers SET failedAttempts = ?, lockedUntil = ? WHERE id = ?').run(failedAttempts, lockedUntil, user.id)
    return { ok: false, reason: lockedUntil ? 'locked' : 'invalid' }
  }

  db.prepare('UPDATE adminUsers SET failedAttempts = 0, lockedUntil = NULL WHERE id = ?').run(user.id)
  logAudit({ entityType: 'auth', entityId: user.id, action: 'تسجيل دخول', actor: user.name })
  return { ok: true, user }
}

export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export function requireAdmin(req, res, next) {
  if (!req.session?.adminUserId) {
    return res.status(401).json({ error: 'unauthorized' })
  }
  const user = db.prepare('SELECT * FROM adminUsers WHERE id = ? AND active = 1').get(req.session.adminUserId)
  if (!user) {
    req.session.destroy(() => {})
    return res.status(401).json({ error: 'unauthorized' })
  }
  req.adminUser = user
  next()
}

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_attempts' },
})
