import { api, ApiError } from './api'

export interface AdminSessionUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'sales'
}

/** Returns the signed-in admin user, or null if there is no active session (never throws for a plain 401). */
export async function fetchCurrentUser(): Promise<AdminSessionUser | null> {
  try {
    const { user } = await api.get<{ user: AdminSessionUser }>('/auth/me')
    return user
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) return null
    throw err
  }
}

export async function login(email: string, password: string): Promise<AdminSessionUser> {
  const { user } = await api.post<{ user: AdminSessionUser }>('/auth/login', { email, password })
  return user
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}
