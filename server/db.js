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
  // Bottle ritual (schema version 4): mood, journey / time-lock, moment stamp, photo, attached song.
  `ALTER TABLE nb_bottles ADD COLUMN IF NOT EXISTS mood TEXT`,
  `ALTER TABLE nb_bottles ADD COLUMN IF NOT EXISTS arrive_at DOUBLE PRECISION`,
  `ALTER TABLE nb_bottles ADD COLUMN IF NOT EXISTS unlock_at DOUBLE PRECISION`,
  `ALTER TABLE nb_bottles ADD COLUMN IF NOT EXISTS stamp_min INTEGER`,
  `ALTER TABLE nb_bottles ADD COLUMN IF NOT EXISTS stamp_dist DOUBLE PRECISION`,
  `ALTER TABLE nb_bottles ADD COLUMN IF NOT EXISTS photo_b64 TEXT`,
  `ALTER TABLE nb_bottles ADD COLUMN IF NOT EXISTS song_json TEXT`,
  // Trash (schema version 5): deleting only hides; the owner can restore from Settings.
  `ALTER TABLE nb_bottles ADD COLUMN IF NOT EXISTS deleted_at DOUBLE PRECISION`,
  `ALTER TABLE nb_songs ADD COLUMN IF NOT EXISTS deleted_at DOUBLE PRECISION`,
  `CREATE TABLE IF NOT EXISTS nb_songs (
     id SERIAL PRIMARY KEY, author TEXT NOT NULL, yt_id TEXT NOT NULL, title TEXT NOT NULL, channel TEXT, note TEXT,
     start_sec INTEGER NOT NULL DEFAULT 0, reaction TEXT, created_at DOUBLE PRECISION NOT NULL)`,
  // Links from YouTube, Instagram and TikTok share one table (added in schema version 3).
  `ALTER TABLE nb_songs ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'youtube'`,
  `ALTER TABLE nb_songs ADD COLUMN IF NOT EXISTS url TEXT`,
  `ALTER TABLE nb_songs ADD COLUMN IF NOT EXISTS thumb TEXT`,
  `ALTER TABLE nb_songs ADD COLUMN IF NOT EXISTS embed BOOLEAN NOT NULL DEFAULT TRUE`,
  `CREATE TABLE IF NOT EXISTS nb_events (id SERIAL PRIMARY KEY, to_who TEXT NOT NULL, kind TEXT NOT NULL, created DOUBLE PRECISION NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS nb_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, since DOUBLE PRECISION NOT NULL)`,
]

// Supabase exposes public-schema tables to the (public) anon key unless row-level security is on.
// With RLS enabled and no policies, only the server's secret key can touch these tables.
const TABLES = ['nb_settings', 'nb_slots', 'nb_presence', 'nb_locations', 'nb_together', 'nb_bottles', 'nb_songs', 'nb_events', 'nb_attempts']

/** Bump when the schema/functions change so the one-time setup SQL is offered again. */
export const SCHEMA_VERSION = '5'
const RLS_SQL = TABLES.map((t) => `ALTER TABLE ${t} ENABLE ROW LEVEL SECURITY;`)

// One round trip per poll: presence, together-time, events, counts and shared state all come back in a single call.
const SYNC_FN = `create or replace function public.nb_sync(p_who text, p_visible boolean, p_now double precision) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_partner text := case when p_who = 'a' then 'b' else 'a' end;
  v_a nb_presence%rowtype;
  v_b nb_presence%rowtype;
  v_here_a boolean := false;
  v_here_b boolean := false;
  v_tg double precision;
  v_day text := to_char(to_timestamp(p_now / 1000.0) at time zone 'UTC', 'YYYY-MM-DD');
  v_events jsonb;
  v_waiting int;
  v_total double precision;
  v_today double precision;
  v_songs jsonb;
begin
  insert into nb_presence (who, beat, visible, seen) values (p_who, p_now, p_visible, p_now)
    on conflict (who) do update set beat = excluded.beat, visible = excluded.visible, seen = excluded.seen;

  select * into v_a from nb_presence where who = 'a';
  v_here_a := found and v_a.visible and p_now - v_a.beat < 15000;
  select * into v_b from nb_presence where who = 'b';
  v_here_b := found and v_b.visible and p_now - v_b.beat < 15000;

  if v_here_a and v_here_b then
    select value::double precision into v_tg from nb_settings where key = 'tg';
    if v_tg is not null and p_now - v_tg <= 7000 then
      insert into nb_together (day, seconds) values (v_day, (p_now - v_tg) / 1000.0)
        on conflict (day) do update set seconds = nb_together.seconds + excluded.seconds;
    end if;
    insert into nb_settings (key, value) values ('tg', trunc(p_now)::bigint::text)
      on conflict (key) do update set value = excluded.value;
  end if;

  with d as (delete from nb_events where to_who = p_who returning kind)
  select coalesce(jsonb_agg(kind), '[]'::jsonb) into v_events from d;

  delete from nb_events where created < p_now - 259200000;
  delete from nb_attempts where since < p_now - 86400000;

  select count(*)::int into v_waiting from nb_bottles
    where author = v_partner and opened_at is null and deleted_at is null
      and (arrive_at is null or arrive_at <= p_now) and (unlock_at is null or unlock_at <= p_now);
  select coalesce(sum(seconds), 0) into v_total from nb_together;
  select coalesce((select seconds from nb_together where day = v_day), 0) into v_today;
  select jsonb_build_object('n', count(*), 'lastId', coalesce(max(id), 0),
           'lastAuthor', (select author from nb_songs where deleted_at is null order by id desc limit 1)) into v_songs from nb_songs where deleted_at is null;

  return jsonb_build_object(
    'presence', (select coalesce(jsonb_agg(jsonb_build_object('who', who, 'beat', beat, 'visible', visible, 'seen', seen)), '[]'::jsonb) from nb_presence),
    'waiting', v_waiting,
    'events', v_events,
    'distance', (select value from nb_settings where key = 'distance'),
    'listen', (select value from nb_settings where key = 'listen'),
    'total', v_total,
    'today', v_today,
    'songs', v_songs
  );
end $$`

const FUNCTIONS_SQL = `
-- Helper functions so the server can talk to this database using only the project API key.
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

${SYNC_FN};

do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    revoke all on nb_settings, nb_slots, nb_presence, nb_locations, nb_together, nb_bottles, nb_songs, nb_events, nb_attempts from anon, authenticated;
    revoke all on function public.nb_read(text) from public, anon, authenticated;
    revoke all on function public.nb_exec(text) from public, anon, authenticated;
    revoke all on function public.nb_sync(text, boolean, double precision) from public, anon, authenticated;
    grant execute on function public.nb_sync(text, boolean, double precision) to service_role;
    grant execute on function public.nb_read(text) to service_role;
    grant execute on function public.nb_exec(text) to service_role;
  end if;
end $$;

notify pgrst, 'reload schema';`

export const SETUP_SQL = `-- نبضنا: إعداد لمرة واحدة (آمن، لا يلمس جداولك الأخرى — كل أسماء الجداول تبدأ بـ nb_)\n${SCHEMA.map((s) => s.replace(/\s*\n\s*/g, ' ') + ';').join('\n')}\n${RLS_SQL.join('\n')}\n${FUNCTIONS_SQL}\ninsert into nb_settings (key, value) values ('schemaVersion', '${SCHEMA_VERSION}') on conflict (key) do update set value = excluded.value;\n`

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
    return `'${String(v).replaceAll('\u0000', '').replace(/'/g, "''")}'`
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
      if (d.rest) {
        const v = await d.query("SELECT value FROM nb_settings WHERE key = 'schemaVersion'")
        if (v[0]?.value !== SCHEMA_VERSION) throw new SchemaMissingError(d.ref)
      } else {
        for (const stmt of [...SCHEMA, ...RLS_SQL, SYNC_FN]) await d.query(stmt)
        await d.query("INSERT INTO nb_settings (key, value) VALUES ('schemaVersion', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", [SCHEMA_VERSION])
      }
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
