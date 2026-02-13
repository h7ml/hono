import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { Permission } from '../types/app'
import { rolePermissions } from './permissions'

export interface SessionUser {
  name: string
  role: string
  permissions: Permission[]
}

const ACCESS_COOKIE = 'hl_access_token'
const REFRESH_COOKIE = 'hl_refresh_token'
const ROLE_COOKIE = 'hl_role'
const NAME_COOKIE = 'hl_name'

export function readSession(c: Context): SessionUser | null {
  const accessToken = getCookie(c, ACCESS_COOKIE)
  if (!accessToken) {
    return null
  }

  const role = getCookie(c, ROLE_COOKIE) ?? 'viewer'
  const name = getCookie(c, NAME_COOKIE) ?? '访客'
  return {
    name,
    role,
    permissions: rolePermissions[role] ?? []
  }
}

export function writeSession(c: Context, name: string, role: string): void {
  setCookie(c, ACCESS_COOKIE, `hono_access_${Date.now()}`, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 900
  })
  setCookie(c, REFRESH_COOKIE, `hono_refresh_${Date.now()}`, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: 604800
  })
  setCookie(c, ROLE_COOKIE, role, {
    path: '/',
    sameSite: 'Lax',
    maxAge: 604800
  })
  setCookie(c, NAME_COOKIE, name, {
    path: '/',
    sameSite: 'Lax',
    maxAge: 604800
  })
}

export function clearSession(c: Context): void {
  const cookies = [ACCESS_COOKIE, REFRESH_COOKIE, ROLE_COOKIE, NAME_COOKIE]
  for (const key of cookies) {
    deleteCookie(c, key, { path: '/' })
  }
}
