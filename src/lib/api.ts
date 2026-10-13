export class ApiError extends Error {
  status: number
  detail?: string
  seen?: string[]
  constructor(status: number, message: string, detail?: string, seen?: string[]) {
    super(message)
    this.status = status
    this.detail = detail
    this.seen = seen
  }
}

async function request<T>(method: string, path: string, body?: BodyInit | null, headers?: Record<string, string>): Promise<T> {
  const res = await fetch(`/api${path}`, { method, body, headers, credentials: 'same-origin' })
  if (res.status === 204) return undefined as T
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, data?.error ?? 'request_failed', data?.detail, data?.seen)
  return data as T
}

const json = { 'Content-Type': 'application/json' }

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, data?: unknown) => request<T>('POST', path, data === undefined ? null : JSON.stringify(data), json),
  put: <T>(path: string, data: unknown) => request<T>('PUT', path, JSON.stringify(data), json),
  del: <T>(path: string) => request<T>('DELETE', path),
  // Audio is sent as an opaque binary body; its real type travels in a header.
  postBlob: <T>(path: string, blob: Blob, audioType: string) => request<T>('POST', path, blob, { 'Content-Type': 'application/octet-stream', 'X-Audio-Type': audioType }),
}
