import { Router } from 'express'
import crypto from 'node:crypto'
import { db, logAudit } from '../db.js'
import { requireAdmin } from './auth.js'

/**
 * Generic admin CRUD router for simple single-table CMS collections (cases,
 * faqs, credentials, saved products/terms) whose rows are plain scalar
 * columns with no relations — avoids repeating the same list/create/
 * update/delete boilerplate five times.
 */
export function createCrudRouter({ table, columns, label, boolColumns = [] }) {
  const router = Router()
  router.use(requireAdmin)

  function toRow(input) {
    const row = {}
    for (const col of columns) {
      const value = input[col]
      row[col] = boolColumns.includes(col) ? (value ? 1 : 0) : value ?? null
    }
    return row
  }

  function fromRow(row) {
    const out = { ...row }
    for (const col of boolColumns) out[col] = Boolean(row[col])
    return out
  }

  router.get('/', (_req, res) => {
    res.json(db.prepare(`SELECT * FROM ${table}`).all().map(fromRow))
  })

  router.post('/', (req, res) => {
    const id = crypto.randomUUID()
    const row = { id, ...toRow(req.body ?? {}) }
    const cols = ['id', ...columns]
    db.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map((c) => '@' + c).join(',')})`).run(row)
    logAudit({ entityType: table, entityId: id, action: `تمت إضافة ${label}`, actor: req.adminUser.name })
    res.status(201).json(fromRow(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id)))
  })

  router.put('/:id', (req, res) => {
    const existing = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id)
    if (!existing) return res.status(404).json({ error: 'not_found' })
    const row = toRow(req.body ?? {})
    db.prepare(`UPDATE ${table} SET ${columns.map((c) => `${c} = @${c}`).join(', ')} WHERE id = @id`).run({ ...row, id: req.params.id })
    logAudit({ entityType: table, entityId: req.params.id, action: `تم تعديل ${label}`, actor: req.adminUser.name })
    res.json(fromRow(db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id)))
  })

  router.delete('/:id', (req, res) => {
    const existing = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id)
    if (!existing) return res.status(404).json({ error: 'not_found' })
    db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id)
    logAudit({ entityType: table, entityId: req.params.id, action: `تم حذف ${label}`, actor: req.adminUser.name })
    res.status(204).end()
  })

  return router
}
