import { Router } from 'express'
import express from 'express'
import { db, dayKey } from './db.js'
import { requireMe, partnerOf } from './auth.js'

export const locationRouter = Router()
locationRouter.use(requireMe)

const FRESH = 10 * 60 * 1000

function haversine(a, b) {
  const R = 6371000
  const rad = (d) => (d * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * The only thing either person ever receives about the other's position:
 * a distance, how old each reading is, and whether it is precise enough to
 * claim "very close". Coordinates stay on the server.
 */
export function distanceInfo() {
  const rows = Object.fromEntries(db.prepare('SELECT * FROM locations').all().map((r) => [r.who, r]))
  const at = { a: rows.a?.updatedAt ?? null, b: rows.b?.updatedAt ?? null }
  if (!rows.a || !rows.b) return { meters: null, precise: false, at, closestToday: closestToday() }
  const meters = haversine(rows.a, rows.b)
  const precise = rows.a.accuracy + rows.b.accuracy < 250
  if (Date.now() - Math.min(at.a, at.b) < FRESH) {
    const cur = db.prepare('SELECT meters FROM closest WHERE day = ?').get(dayKey())
    if (!cur || meters < cur.meters) {
      db.prepare('INSERT INTO closest (day, meters) VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET meters = excluded.meters').run(dayKey(), meters)
    }
  }
  return { meters: Math.round(meters), precise, at, closestToday: closestToday() }
}

function closestToday() {
  const r = db.prepare('SELECT meters FROM closest WHERE day = ?').get(dayKey())
  return r ? Math.round(r.meters) : null
}

let notify = () => {}
export const onDistanceChange = (fn) => { notify = fn }

locationRouter.put('/', express.json({ limit: '1kb' }), (req, res) => {
  const { lat, lng, accuracy } = req.body ?? {}
  if (![lat, lng, accuracy].every((n) => typeof n === 'number' && Number.isFinite(n)) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return res.status(400).json({ error: 'bad_location' })
  }
  db.prepare(
    'INSERT INTO locations (who, lat, lng, accuracy, updatedAt) VALUES (?, ?, ?, ?, ?) ON CONFLICT(who) DO UPDATE SET lat = excluded.lat, lng = excluded.lng, accuracy = excluded.accuracy, updatedAt = excluded.updatedAt'
  ).run(req.who, Math.round(lat * 1e4) / 1e4, Math.round(lng * 1e4) / 1e4, Math.min(Math.max(accuracy, 1), 100000), Date.now())
  notify()
  res.status(204).end()
})

// Stop sharing: forget my position entirely.
locationRouter.delete('/', (req, res) => {
  db.prepare('DELETE FROM locations WHERE who = ?').run(req.who)
  notify()
  res.status(204).end()
})

locationRouter.get('/', (req, res) => res.json({ ...distanceInfo(), partner: partnerOf(req.who) }))
