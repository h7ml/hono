import type { PaginatedResponse, UserListItem } from '../../types/app'
import type { QueryOptions } from './shared'
import { buildPagination, paginated } from './shared'

export interface DbUser {
  id: number
  username: string
  name: string
  email: string
  role: string
  status: string
}

interface CountRow { total: number }

const USER_COLS = 'id, username, name, email, role, status'

export async function findActiveUserByCredentials(
  db: D1Database,
  username: string,
  password: string
): Promise<DbUser | null> {
  return db
    .prepare(
      `SELECT ${USER_COLS} FROM hono_users WHERE username = ? AND password = ? AND status = ? LIMIT 1`
    )
    .bind(username, password, 'active')
    .first<DbUser>()
}

export async function getUsersPage(
  db: D1Database,
  opts: QueryOptions
): Promise<PaginatedResponse<UserListItem>> {
  const { page, pageSize, offset } = buildPagination(opts)

  const wheres: string[] = []
  const params: unknown[] = []

  if (opts.search) {
    wheres.push('(username LIKE ? OR name LIKE ? OR email LIKE ?)')
    const like = `%${opts.search}%`
    params.push(like, like, like)
  }
  if (opts.role) {
    wheres.push('role = ?')
    params.push(opts.role)
  }
  if (opts.status) {
    wheres.push('status = ?')
    params.push(opts.status)
  }

  const where = wheres.length ? ` WHERE ${wheres.join(' AND ')}` : ''

  const totalRow = await db
    .prepare(`SELECT COUNT(*) as total FROM hono_users${where}`)
    .bind(...params)
    .first<CountRow>()
  const total = Number(totalRow?.total ?? 0)

  const result = await db
    .prepare(
      `SELECT ${USER_COLS} FROM hono_users${where} ORDER BY id DESC LIMIT ? OFFSET ?`
    )
    .bind(...params, pageSize, offset)
    .all<UserListItem>()

  return paginated(result.results, total, page, pageSize)
}

export async function getUserById(db: D1Database, id: number): Promise<DbUser | null> {
  return db
    .prepare(`SELECT ${USER_COLS} FROM hono_users WHERE id = ?`)
    .bind(id)
    .first<DbUser>()
}

export async function createUser(
  db: D1Database,
  data: {
    username: string
    password: string
    name: string
    email: string
    role: string
    status?: string
  }
): Promise<DbUser | null> {
  const result = await db
    .prepare(
      "INSERT INTO hono_users (username, password, name, email, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))"
    )
    .bind(
      data.username,
      data.password,
      data.name,
      data.email,
      data.role,
      data.status ?? 'active'
    )
    .run()

  const id = result.meta.last_row_id
  return getUserById(db, id as number)
}

export async function updateUser(
  db: D1Database,
  id: number,
  data: { name?: string; email?: string; role?: string; status?: string }
): Promise<DbUser | null> {
  const sets: string[] = []
  const vals: unknown[] = []

  if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name) }
  if (data.email !== undefined) { sets.push('email = ?'); vals.push(data.email) }
  if (data.role !== undefined) { sets.push('role = ?'); vals.push(data.role) }
  if (data.status !== undefined) { sets.push('status = ?'); vals.push(data.status) }

  if (sets.length === 0) return getUserById(db, id)

  sets.push("updated_at = datetime('now')")
  vals.push(id)

  await db
    .prepare(`UPDATE hono_users SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...vals)
    .run()

  return getUserById(db, id)
}

export async function deleteUser(db: D1Database, id: number): Promise<boolean> {
  const result = await db
    .prepare('DELETE FROM hono_users WHERE id = ?')
    .bind(id)
    .run()
  return (result.meta.changes ?? 0) > 0
}

export async function toggleUserStatus(db: D1Database, id: number): Promise<DbUser | null> {
  await db
    .prepare(
      "UPDATE hono_users SET status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END, updated_at = datetime('now') WHERE id = ?"
    )
    .bind(id)
    .run()

  return getUserById(db, id)
}
