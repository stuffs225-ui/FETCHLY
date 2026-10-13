import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class NoDatabaseError extends Error {
  constructor() {
    super('no_database')
    this.code = 'no_database'
  }
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS slots (who TEXT PRIMARY KEY, pass_hash TEXT, pass_salt TEXT)`,
  `CREATE TABLE IF NOT EXISTS presence (who TEXT PRIMARY KEY, beat DOUBLE PRECISION NOT NULL, visible BOOLEAN NOT NULL, seen DOUBLE PRECISION NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS locations (who TEXT PRIMARY KEY, lat DOUBLE PRECISION NOT NULL, lng DOUBLE PRECISION NOT NULL, accuracy DOUBLE PRECISION NOT NULL, updated DOUBLE PRECISION NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS together (day TEXT PRIMARY KEY, seconds DOUBLE PRECISION NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS bottles (
     id SERIAL PRIMARY KEY, author TEXT NOT NULL, kind TEXT NOT NULL, body TEXT, audio_mime TEXT, audio_b64 TEXT,
     created_at DOUBLE PRECISION NOT NULL, opened_at DOUBLE PRECISION, opened_count INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS events (id SERIAL PRIMARY KEY, to_who TEXT NOT NULL, kind TEXT NOT NULL, created DOUBLE PRECISION NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, since DOUBLE PRECISION NOT NULL)`,
]

async function open() {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING
  if (url) {
    const { neon } = await import('@neondatabase/serverless')
    const sql = neon(url)
    return { query: (text, params = []) => sql.query(text, params) }
  }
  // Local development only: an embedded Postgres, so the same SQL runs everywhere.
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') throw new NoDatabaseError()
  const dir = path.join(process.env.DATA_DIR || path.join(__dirname, 'data'), 'pg')
  fs.mkdirSync(dir, { recursive: true })
  const pkg = '@electric-sql/pglite'
  const { PGlite } = await import(/* @vite-ignore */ pkg)
  const pg = new PGlite(dir)
  return { query: async (text, params = []) => (await pg.query(text, params)).rows }
}

let ready = null
function db() {
  ready ??= (async () => {
    const d = await open()
    for (const stmt of SCHEMA) await d.query(stmt)
    return d
  })().catch((err) => {
    ready = null
    throw err
  })
  return ready
}

/** Run one SQL statement; returns an array of row objects. */
export async function q(text, params = []) {
  return (await db()).query(text, params)
}

export async function getSetting(key) {
  const rows = await q('SELECT value FROM settings WHERE key = $1', [key])
  return rows[0]?.value ?? null
}

export async function setSetting(key, value) {
  await q('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [key, String(value)])
}

/** Creates the value once (race-safe) and always returns the stored one. */
export async function persistentSecret(key, bytes = 32) {
  await q('INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [key, crypto.randomBytes(bytes).toString('base64url')])
  return getSetting(key)
}

export const dayKey = (d = new Date()) => d.toISOString().slice(0, 10)

export async function addTogether(seconds) {
  await q('INSERT INTO together (day, seconds) VALUES ($1, $2) ON CONFLICT (day) DO UPDATE SET seconds = together.seconds + EXCLUDED.seconds', [dayKey(), seconds])
}

export async function togetherStats() {
  const [{ total }] = await q('SELECT COALESCE(SUM(seconds), 0) AS total FROM together')
  const today = (await q('SELECT seconds FROM together WHERE day = $1', [dayKey()]))[0]?.seconds ?? 0
  return { total: Math.round(Number(total)), today: Math.round(Number(today)) }
}
