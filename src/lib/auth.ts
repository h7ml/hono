import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { Permission } from '../types/app'

export interface SessionUser {
  id: number
  name: string
  role: string
  permissions: Permission[]
}

const COOKIE_OPTS = { path: '/', httpOnly: true, sameSite: 'Lax' as const }
const ACCESS_COOKIE = 'hl_access_token'
const REFRESH_COOKIE = 'hl_refresh_token'
const ROLE_COOKIE = 'hl_role'
const NAME_COOKIE = 'hl_name'
const ID_COOKIE = 'hl_user_id'
const PERMS_COOKIE = 'hl_permissions'

export function writeSession(c: Context, user: { id: number; name: string; role: string; permissions: Permission[] }) {
  const accessOpts = { ...COOKIE_OPTS, maxAge: 900 }
  const refreshOpts = { ...COOKIE_OPTS, maxAge: 604800 }
  setCookie(c, ACCESS_COOKIE, 'active', accessOpts)
  setCookie(c, REFRESH_COOKIE, 'active', refreshOpts)
  setCookie(c, ID_COOKIE, String(user.id), accessOpts)
  setCookie(c, NAME_COOKIE, user.name, accessOpts)
  setCookie(c, ROLE_COOKIE, user.role, accessOpts)
  setCookie(c, PERMS_COOKIE, JSON.stringify(user.permissions), accessOpts)
}

export function readSession(c: Context): SessionUser | null {
  const accessToken = getCookie(c, ACCESS_COOKIE)
  if (!accessToken) return null
  const id = Number(getCookie(c, ID_COOKIE) ?? '0')
  const name = getCookie(c, NAME_COOKIE) ?? '访客'
  const role = getCookie(c, ROLE_COOKIE) ?? 'viewer'
  let permissions: Permission[] = []
  try {
    permissions = JSON.parse(getCookie(c, PERMS_COOKIE) ?? '[]')
  } catch { /* empty */ }
  return { id, name, role, permissions }
}

export function clearSession(c: Context) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE, NAME_COOKIE, ID_COOKIE, PERMS_COOKIE]) {
    deleteCookie(c, name, { path: '/' })
  }
}
