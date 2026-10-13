import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const dataDir = process.env.DATA_DIR || path.join(__dirname, 'data')
export const audioDir = path.join(dataDir, 'audio')
fs.mkdirSync(audioDir, { recursive: true })

export const db = new Database(path.join(dataDir, 'nabdona.db'))
db.pragma('journal_mode = WAL')

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bottles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author TEXT NOT NULL,
  kind TEXT NOT NULL,
  text TEXT,
  audioMime TEXT,
  createdAt INTEGER NOT NULL,
  openedAt INTEGER,
  openedCount INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS pushSubs (
  endpoint TEXT PRIMARY KEY,
  who TEXT NOT NULL,
  json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS together (
  day TEXT PRIMARY KEY,
  seconds INTEGER NOT NULL DEFAULT 0
);
`)

export function getSetting(key, fallback = null) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key)
  return row ? row.value : fallback
}

export function setSetting(key, value) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(key, String(value))
}

/** A secret that survives restarts without needing any manual configuration. */
export function persistentSecret(key) {
  let v = getSetting(key)
  if (!v) {
    v = crypto.randomBytes(32).toString('hex')
    setSetting(key, v)
  }
  return v
}

export const dayKey = (d = new Date()) => d.toISOString().slice(0, 10)

export function addTogether(seconds) {
  db.prepare(
    'INSERT INTO together (day, seconds) VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET seconds = seconds + excluded.seconds'
  ).run(dayKey(), seconds)
}

export function togetherStats() {
  const total = db.prepare('SELECT COALESCE(SUM(seconds), 0) AS s FROM together').get().s
  const today = db.prepare('SELECT COALESCE(seconds, 0) AS s FROM together WHERE day = ?').get(dayKey())?.s ?? 0
  return { total, today }
}
