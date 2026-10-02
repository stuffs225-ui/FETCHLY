import { Router } from 'express'
import { db } from '../db.js'

export const publicRouter = Router()

publicRouter.get('/company', (_req, res) => {
  res.json(db.prepare('SELECT * FROM companySettings WHERE id = 1').get())
})

publicRouter.get('/content', (_req, res) => {
  res.json(db.prepare('SELECT * FROM contentOverrides WHERE id = 1').get())
})

publicRouter.get('/cases', (_req, res) => {
  const rows = db.prepare('SELECT * FROM cases WHERE published = 1').all()
  res.json(rows.map((r) => ({ ...r, published: Boolean(r.published) })))
})

publicRouter.get('/faqs', (_req, res) => {
  const rows = db.prepare('SELECT * FROM faqs WHERE published = 1').all()
  res.json(rows.map((r) => ({ ...r, published: Boolean(r.published) })))
})

publicRouter.get('/credentials', (_req, res) => {
  const rows = db.prepare("SELECT * FROM credentials WHERE visible = 1 AND number IS NOT NULL AND number != ''").all()
  res.json(rows.map((r) => ({ ...r, visible: Boolean(r.visible) })))
})

publicRouter.get('/brands', (_req, res) => {
  const rows = db.prepare('SELECT * FROM brands WHERE published = 1 ORDER BY sortOrder, name').all()
  res.json(rows.map((r) => ({ ...r, featured: Boolean(r.featured), published: Boolean(r.published) })))
})

publicRouter.get('/products', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT p.* FROM products p JOIN brands b ON b.id = p.brandId
       WHERE p.published = 1 AND b.published = 1 ORDER BY p.sortOrder, p.nameEn`
    )
    .all()
  res.json(rows.map((r) => ({ ...r, featured: Boolean(r.featured), published: Boolean(r.published) })))
})
