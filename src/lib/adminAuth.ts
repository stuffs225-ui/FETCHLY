/**
 * Admin authentication.
 *
 * No backend/identity provider is wired up in this environment, so this is a
 * client-side password gate backed by a Vite env var, with the "signed-in"
 * flag kept in sessionStorage. This is a development-tier stand-in only —
 * before any real deployment, replace this module with real server-side
 * session/JWT auth (the login form and route guard already assume a simple
 * `login(password): boolean` / `logout()` / `isAuthed(): boolean` contract,
 * so the swap is isolated to this file).
 */

const STORAGE_KEY = 'gs_admin_authed'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin@2026'

export function isAuthed(): boolean {
  return sessionStorage.getItem(STORAGE_KEY) === 'true'
}

export function login(password: string): boolean {
  if (password === ADMIN_PASSWORD) {
    sessionStorage.setItem(STORAGE_KEY, 'true')
    return true
  }
  return false
}

export function logout() {
  sessionStorage.removeItem(STORAGE_KEY)
}
