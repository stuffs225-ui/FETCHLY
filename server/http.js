// Tiny framework-free helpers so the same handler runs on Vercel and on a plain Node server.

export function send(res, status, data, headers = {}) {
  res.statusCode = status
  if (status === 204) {
    for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
    return res.end()
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v)
  res.end(JSON.stringify(data))
}

/** Reads the raw body whether or not the platform already consumed/parsed it. */
export async function readBody(req, limit = 1_600_000) {
  const pre = req.body
  if (pre !== undefined && pre !== null && pre !== '') {
    if (Buffer.isBuffer(pre) && pre.length > limit) throw Object.assign(new Error('too_large'), { status: 413 })
    return pre
  }
  const chunks = []
  let size = 0
  for await (const c of req) {
    size += c.length
    if (size > limit) throw Object.assign(new Error('too_large'), { status: 413 })
    chunks.push(c)
  }
  return Buffer.concat(chunks)
}

export async function readJson(req) {
  const b = await readBody(req, 20_000)
  if (Buffer.isBuffer(b) || typeof b === 'string') {
    try {
      return JSON.parse(b.toString() || '{}')
    } catch {
      return {}
    }
  }
  return b && typeof b === 'object' ? b : {}
}

export async function readBinary(req, limit) {
  const b = await readBody(req, limit)
  if (Buffer.isBuffer(b)) return b
  if (typeof b === 'string') return Buffer.from(b, 'binary')
  return null
}

export function parseCookies(header = '') {
  const out = {}
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}

export function isSecure(req) {
  return req.headers['x-forwarded-proto'] === 'https' || Boolean(req.socket?.encrypted)
}
