import { Router } from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { db, logAudit } from '../db.js'
import { requireAdmin, publicUser } from '../lib/auth.js'

export const usersRouter = Router()
usersRouter.use(requireAdmin)

function requireOwnerRole(req, res, next) {
  if (req.adminUser.role !== 'admin') return res.status(403).json({ error: 'forbidden' })
  next()
}

usersRouter.get('/', (_req, res) => {
  res.json(db.prepare('SELECT id, name, email, role, active, createdAt FROM adminUsers').all())
})

usersRouter.post('/', requireOwnerRole, (req, res) => {
  const { name, email, password, role } = req.body ?? {}
  if (!name?.trim() || !email?.trim() || !password || password.length < 8) {
    return res.status(400).json({ error: 'invalid_input' })
  }
  const id = crypto.randomUUID()
  try {
    db.prepare('INSERT INTO adminUsers (id, name, email, passwordHash, role, createdAt) VALUES (?, ?, ?, ?, ?, ?)').run(
      id,
      name.trim(),
      email.trim().toLowerCase(),
      bcrypt.hashSync(password, 12),
      role === 'sales' ? 'sales' : 'admin',
      new Date().toISOString()
    )
  } catch {
    return res.status(409).json({ error: 'email_taken' })
  }
  logAudit({ entityType: 'user', entityId: id, action: `تمت إضافة مستخدم: ${email}`, actor: req.adminUser.name })
  res.status(201).json(publicUser(db.prepare('SELECT * FROM adminUsers WHERE id = ?').get(id)))
})

usersRouter.patch('/:id', requireOwnerRole, (req, res) => {
  const user = db.prepare('SELECT * FROM adminUsers WHERE id = ?').get(req.params.id)
  if (!user) return res.status(404).json({ error: 'not_found' })

  const b = req.body ?? {}
  const name = b.name?.trim() || user.name
  const role = b.role === 'sales' ? 'sales' : b.role === 'admin' ? 'admin' : user.role
  const active = b.active !== undefined ? (b.active ? 1 : 0) : user.active
  db.prepare('UPDATE adminUsers SET name = ?, role = ?, active = ? WHERE id = ?').run(name, role, active, user.id)

  if (b.password) {
    if (b.password.length < 8) return res.status(400).json({ error: 'weak_password' })
    db.prepare('UPDATE adminUsers SET passwordHash = ? WHERE id = ?').run(bcrypt.hashSync(b.password, 12), user.id)
  }

  logAudit({ entityType: 'user', entityId: user.id, action: 'تحديث بيانات المستخدم', actor: req.adminUser.name })
  res.json(publicUser(db.prepare('SELECT * FROM adminUsers WHERE id = ?').get(user.id)))
})
