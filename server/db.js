import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export class NoDatabaseError extends Error {
  constructor() {
    super('no_database')
    this.code = 'no_database'
    // Names only (never values): lets the door screen say what the host *does* provide.
    this.seen = Object.keys(process.env).filter((k) => /supabase|postgres|database|neon|^pg/i.test(k)).sort()
  }
}

/** The database is configured but could not be reached / initialised. */
export class DatabaseUnavailableError extends Error {
  constructor(cause) {
    super('db_unavailable')
    this.code = 'db_unavailable'
    this.detail = [cause?.code, String(cause?.message ?? '').slice(0, 160)].filter(Boolean).join(' · ')
  }
}

/** Supabase project is reachable by its API key, but the one-time setup SQL has not been run yet. */
export class SchemaMissingError extends Error {
  constructor(ref) {
    super('schema_missing')
    this.code = 'schema_missing'
    this.dashboard = ref ? `https://supabase.com/dashboard/project/${ref}/sql/new` : 'https://supabase.com/dashboard'
  }
}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS nb_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS nb_slots (who TEXT PRIMARY KEY, pass_hash TEXT, pass_salt TEXT)`,
  `CREATE TABLE IF NOT EXISTS nb_presence (who TEXT PRIMARY KEY, beat DOUBLE PRECISION NOT NULL, visible BOOLEAN NOT NULL, seen DOUBLE PRECISION NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS nb_locations (who TEXT PRIMARY KEY, lat DOUBLE PRECISION NOT NULL, lng DOUBLE PRECISION NOT NULL, accuracy DOUBLE PRECISION NOT NULL, updated DOUBLE PRECISION NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS nb_together (day TEXT PRIMARY KEY, seconds DOUBLE PRECISION NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS nb_bottles (
     id SERIAL PRIMARY KEY, author TEXT NOT NULL, kind TEXT NOT NULL, body TEXT, audio_mime TEXT, audio_b64 TEXT,
     created_at DOUBLE PRECISION NOT NULL, opened_at DOUBLE PRECISION, opened_count INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS nb_events (id SERIAL PRIMARY KEY, to_who TEXT NOT NULL, kind TEXT NOT NULL, created DOUBLE PRECISION NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS nb_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, since DOUBLE PRECISION NOT NULL)`,
]

// Supabase exposes public-schema tables to the (public) anon key unless row-level security is on.
// With RLS enabled and no policies, only the server's secret key can touch these tables.
const TABLES = ['nb_settings', 'nb_slots', 'nb_presence', 'nb_locations', 'nb_together', 'nb_bottles', 'nb_events', 'nb_attempts']
const RLS_SQL = TABLES.map((t) => `ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;`)

const FUNCTIONS_SQL = `
-- Two small helper functions so the server can talk to this database using only the project API key.
-- They can be called ONLY with the secret service-role key (never from the browser).
create or replace function public.nb_read(query text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r jsonb;
begin
  execute 'with nb_t as (' || query || ') select coalesce(jsonb_agg(nb_t), ''[]''::jsonb) from nb_t' into r;
  return r;
end $$;

create or replace function public.nb_exec(query text) returns void
language plpgsql security definer set search_path = public as $$
begin
  execute query;
end $$;

do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    revoke all on nb_settings, nb_slots, nb_presence, nb_locations, nb_together, nb_bottles, nb_events, nb_attempts from anon, authenticated;
    revoke all on function public.nb_read(text) from public, anon, authenticated;
    revoke all on function public.nb_exec(text) from public, anon, authenticated;
    grant execute on function public.nb_read(text) to service_role;
    grant execute on function public.nb_exec(text) to service_role;
  end if;
end $$;

notify pgrst, 'reload schema';`

export const SETUP_SQL = `-- نبضنا: إعداد لمرة واحدة (آمن، لا يلمس جداولك الأخرى — كل أسماء الجداول تبدأ بـ nb_)\n${SCHEMA.map((s) => s.replace(/\s*\n\s*/g, ' ') + ';').join('\n')}\n${RLS_SQL.join('\n')}\n${FUNCTIONS_SQL}\n`

/** Inline parameters as safely-escaped literals (the REST bridge executes plain SQL text). */
function inline(text, params) {
  return text.replace(/\$(\d+)/g, (_, n) => {
    const v = params[Number(n) - 1]
    if (v === null || v === undefined) return 'NULL'
    if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
    if (typeof v === 'number') {
      if (!Number.isFinite(v)) throw new Error('bad_number')
      return String(v)
    }
    return `'${String(v).replace(/\u0000/g, '').replace(/'/g, "''")}'`
  })
}

/** Which Postgres role an API key maps to (read from the key itself; the signature is not checked here). */
function keyRole(key) {
  if (key.startsWith('sb_secret_')) return 'service_role'
  if (key.startsWith('sb_publishable_')) return 'anon'
  try {
    return JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role ?? 'unknown'
  } catch {
    return 'unknown'
  }
}

function supabaseRest(url, key) {
  const base = url.replace(/\/$/, '')
  const ref = new URL(base).hostname.split('.')[0]
  const call = async (fn, query) => {
    const res = await fetch(`${base}/rest/v1/rpc/${fn}`, {
      method: 'POST',
      // New-style keys (sb_secret_…) are not JWTs and go only in `apikey`; legacy JWT keys go in both.
      headers: { apikey: key, ...(key.startsWith('sb_') ? {} : { Authorization: `Bearer ${key}` }), 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    const raw = await res.text()
    if (!res.ok) {
      let e = {}
      try { e = JSON.parse(raw) } catch { /* not json */ }
      if (res.status === 404 || e.code === 'PGRST202') throw new SchemaMissingError(ref)
      if (/nb_[a-z]+/.test(e.message ?? '') && /does not exist/.test(e.message ?? '')) throw new SchemaMissingError(ref)
      const hint = e.code === '42501' || res.status === 401 || res.status === 403 ? ` · key role: ${keyRole(key)}` : ''
      const err = new Error((e.message || `HTTP ${res.status}`) + hint)
      err.code = e.code || String(res.status)
      throw err
    }
    return raw ? JSON.parse(raw) : []
  }
  return {
    rest: true,
    ref,
    query: (text, params = []) => {
      const sql = inline(text, params)
      const reads = /^\s*select\b/i.test(sql) || /\breturning\b/i.test(sql)
      return reads ? call('nb_read', sql) : call('nb_exec', sql).then(() => [])
    },
  }
}

async function open() {
  // Any Postgres works (Supabase, Neon, Vercel Postgres…). Prefer the pooled URL on serverless.
  const e = process.env
  const parts = e.POSTGRES_HOST && e.POSTGRES_PASSWORD
    ? `postgres://${encodeURIComponent(e.POSTGRES_USER || 'postgres')}:${encodeURIComponent(e.POSTGRES_PASSWORD)}@${e.POSTGRES_HOST}:${e.POSTGRES_PORT || 5432}/${e.POSTGRES_DATABASE || 'postgres'}`
    : null
  const raw = e.DATABASE_URL || e.POSTGRES_URL || e.POSTGRES_PRISMA_URL || e.POSTGRES_URL_NON_POOLING || parts
  if (raw) {
    const { default: pg } = await import('pg')
    const url = new URL(raw)
    const local = ['localhost', '127.0.0.1', '::1'].includes(url.hostname)
    // Provider-specific query flags confuse the driver; TLS is configured explicitly instead.
    for (const k of ['sslmode', 'supa', 'pgbouncer', 'connection_limit']) url.searchParams.delete(k)
    const pool = new pg.Pool({
      connectionString: url.toString(),
      max: 1,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
      ssl: local ? false : { rejectUnauthorized: false },
    })
    pool.on('error', () => {})
    return { query: async (text, params = []) => (await pool.query(text, params)).rows }
  }
  // Only the project API key is available (no database password): talk to Postgres through the REST API.
  const sbUrl = e.SUPABASE_URL || e.NEXT_PUBLIC_SUPABASE_URL
  const sbKey = e.SUPABASE_SERVICE_ROLE_KEY
  if (sbUrl && sbKey) return supabaseRest(sbUrl, sbKey)
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
    try {
      // Over the REST bridge the tables come from the one-time setup SQL; just verify it was run.
      if (d.rest) await d.query('SELECT key FROM nb_settings LIMIT 1')
      else for (const stmt of [...SCHEMA, ...RLS_SQL]) await d.query(stmt)
    } catch (err) {
      if (err instanceof SchemaMissingError) throw err
      throw new DatabaseUnavailableError(err)
    }
    return d
  })().catch((err) => {
    ready = null
    throw err instanceof NoDatabaseError || err instanceof DatabaseUnavailableError || err instanceof SchemaMissingError ? err : new DatabaseUnavailableError(err)
  })
  return ready
}

/** Run one SQL statement; returns an array of row objects. */
export async function q(text, params = []) {
  return (await db()).query(text, params)
}

export async function getSetting(key) {
  const rows = await q('SELECT value FROM nb_settings WHERE key = $1', [key])
  return rows[0]?.value ?? null
}

export async function setSetting(key, value) {
  await q('INSERT INTO nb_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value', [key, String(value)])
}

/** Creates the value once (race-safe) and always returns the stored one. */
export async function persistentSecret(key, bytes = 32) {
  await q('INSERT INTO nb_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING', [key, crypto.randomBytes(bytes).toString('base64url')])
  return getSetting(key)
}

export const dayKey = (d = new Date()) => d.toISOString().slice(0, 10)

export async function addTogether(seconds) {
  await q('INSERT INTO nb_together (day, seconds) VALUES ($1, $2) ON CONFLICT (day) DO UPDATE SET seconds = nb_together.seconds + EXCLUDED.seconds', [dayKey(), seconds])
}

export async function togetherStats() {
  const [{ total }] = await q('SELECT COALESCE(SUM(seconds), 0) AS total FROM nb_together')
  const today = (await q('SELECT seconds FROM nb_together WHERE day = $1', [dayKey()]))[0]?.seconds ?? 0
  return { total: Math.round(Number(total)), today: Math.round(Number(today)) }
}
