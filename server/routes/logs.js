import { Router } from 'express'
import { db } from '../db.js'
import { requireAdmin } from '../lib/auth.js'

export const logsRouter = Router()
logsRouter.use(requireAdmin)

logsRouter.get('/email', (_req, res) => {
  res.json(db.prepare('SELECT * FROM emailLog ORDER BY createdAt DESC LIMIT 500').all())
})

logsRouter.get('/audit', (_req, res) => {
  res.json(db.prepare('SELECT * FROM auditLog ORDER BY createdAt DESC LIMIT 500').all())
})
