export class ApiError extends Error {
  status: number
  fields?: Record<string, string>
  detail?: string

  constructor(status: number, message: string, fields?: Record<string, string>, detail?: string) {
    super(message)
    this.status = status
    this.fields = fields
    this.detail = detail
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    ...init,
  })

  if (!res.ok) {
    let body: { error?: string; fields?: Record<string, string>; detail?: string } | null = null
    try {
      body = await res.json()
    } catch {
      // no JSON body
    }
    throw new ApiError(res.status, body?.error ?? 'request_failed', body?.fields, body?.detail)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function jsonInit(method: string, body?: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) => request<T>(path, jsonInit('POST', body)),
  put: <T>(path: string, body?: unknown) => request<T>(path, jsonInit('PUT', body)),
  patch: <T>(path: string, body?: unknown) => request<T>(path, jsonInit('PATCH', body)),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  postForm: <T>(path: string, formData: FormData) => request<T>(path, { method: 'POST', body: formData }),
}
