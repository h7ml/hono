import type { PaginatedResponse } from '../../types/app'

export interface DbUser {
  id: number
  username: string
  name: string
  email: string
  role: string
  status: string
}

interface CountRow {
  total: number
}

interface QueryOptions {
  page: number
  pageSize: number
}

export async function findActiveUserByCredentials(
  db: D1Database,
  username: string,
  password: string
): Promise<DbUser | null> {
  return db
    .prepare(
      'SELECT id, username, name, email, role, status FROM hono_users WHERE username = ? AND password = ? AND status = ? LIMIT 1'
    )
    .bind(username, password, 'active')
    .first<DbUser>()
}

export async function getUsersPage(
  db: D1Database,
  options: QueryOptions
): Promise<PaginatedResponse<DbUser>> {
  const page = Math.max(1, options.page)
  const pageSize = Math.min(100, Math.max(1, options.pageSize))

  const totalRow = await db
    .prepare('SELECT COUNT(*) as total FROM hono_users')
    .first<CountRow>()

  const total = Number(totalRow?.total ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const offset = (page - 1) * pageSize

  const result = await db
    .prepare(
      'SELECT id, username, name, email, role, status FROM hono_users ORDER BY id DESC LIMIT ? OFFSET ?'
    )
    .bind(pageSize, offset)
    .all<DbUser>()

  return {
    list: result.results,
    total,
    page,
    pageSize,
    totalPages
  }
}
