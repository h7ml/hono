import type { DbCheckinAccount, DbCheckinLog, PaginatedResponse } from '../../types/app'
import type { QueryOptions } from './shared'
import { buildPagination, paginated } from './shared'

interface CountRow { total: number }

// 列表（session_cookie 脱敏，仅显示前8位 + ****）
export async function getAllCheckinAccounts(db: D1Database): Promise<DbCheckinAccount[]> {
  const result = await db
    .prepare('SELECT * FROM hono_checkin_accounts ORDER BY id DESC')
    .all<DbCheckinAccount>()
  return result.results.map((a) => ({
    ...a,
    session_cookie: a.session_cookie.slice(0, 8) + '****'
  }))
}

// 仅 active 状态（返回完整 session_cookie 供签到使用）
export async function getActiveCheckinAccounts(db: D1Database): Promise<DbCheckinAccount[]> {
  const result = await db
    .prepare("SELECT * FROM hono_checkin_accounts WHERE status = 'active' ORDER BY id")
    .all<DbCheckinAccount>()
  return result.results
}

export async function getCheckinAccountById(db: D1Database, id: number): Promise<DbCheckinAccount | null> {
  return db
    .prepare('SELECT * FROM hono_checkin_accounts WHERE id = ?')
    .bind(id)
    .first<DbCheckinAccount>()
}

export async function createCheckinAccount(
  db: D1Database,
  data: { label: string; session_cookie: string; upstream_url?: string; custom_fields?: string }
): Promise<DbCheckinAccount | null> {
  const upstream = data.upstream_url?.trim() || 'https://anyrouter.top'
  const fields = data.custom_fields?.trim() || '{}'
  const result = await db
    .prepare('INSERT INTO hono_checkin_accounts (label, session_cookie, upstream_url, custom_fields) VALUES (?, ?, ?, ?) RETURNING *')
    .bind(data.label.trim(), data.session_cookie.trim(), upstream, fields)
    .first<DbCheckinAccount>()
  return result
}

export async function updateCheckinAccount(
  db: D1Database,
  id: number,
  data: { label?: string; session_cookie?: string; upstream_url?: string; custom_fields?: string }
): Promise<DbCheckinAccount | null> {
  const sets: string[] = []
  const vals: unknown[] = []
  if (data.label !== undefined) { sets.push('label = ?'); vals.push(data.label.trim()) }
  if (data.session_cookie !== undefined) { sets.push('session_cookie = ?'); vals.push(data.session_cookie.trim()) }
  if (data.upstream_url !== undefined) { sets.push('upstream_url = ?'); vals.push(data.upstream_url.trim() || 'https://anyrouter.top') }
  if (data.custom_fields !== undefined) { sets.push('custom_fields = ?'); vals.push(data.custom_fields.trim() || '{}') }
  if (!sets.length) return null
  sets.push("updated_at = datetime('now')")
  vals.push(id)
  return db
    .prepare(`UPDATE hono_checkin_accounts SET ${sets.join(', ')} WHERE id = ? RETURNING *`)
    .bind(...vals)
    .first<DbCheckinAccount>()
}

export async function deleteCheckinAccount(db: D1Database, id: number): Promise<boolean> {
  const info = await db
    .prepare('DELETE FROM hono_checkin_accounts WHERE id = ?')
    .bind(id)
    .run()
  return (info.meta?.changes ?? 0) > 0
}

export async function toggleCheckinAccountStatus(db: D1Database, id: number): Promise<DbCheckinAccount | null> {
  return db
    .prepare(
      "UPDATE hono_checkin_accounts SET status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END, updated_at = datetime('now') WHERE id = ? RETURNING *"
    )
    .bind(id)
    .first<DbCheckinAccount>()
}

export async function updateCheckinResult(
  db: D1Database,
  id: number,
  result: string
): Promise<void> {
  await db
    .prepare("UPDATE hono_checkin_accounts SET last_checkin_at = datetime('now'), last_checkin_result = ?, updated_at = datetime('now') WHERE id = ?")
    .bind(result, id)
    .run()
}

export async function writeCheckinLog(
  db: D1Database,
  data: { account_id: number; account_label: string; success: boolean; message: string }
): Promise<void> {
  await db
    .prepare('INSERT INTO hono_checkin_logs (account_id, account_label, success, message) VALUES (?, ?, ?, ?)')
    .bind(data.account_id, data.account_label, data.success ? 1 : 0, data.message)
    .run()
}

export async function getCheckinLogsPage(
  db: D1Database,
  opts: QueryOptions
): Promise<PaginatedResponse<DbCheckinLog>> {
  const { page, pageSize, offset } = buildPagination(opts)
  const totalRow = await db
    .prepare('SELECT COUNT(*) as total FROM hono_checkin_logs')
    .first<CountRow>()
  const total = Number(totalRow?.total ?? 0)
  const result = await db
    .prepare('SELECT * FROM hono_checkin_logs ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .bind(pageSize, offset)
    .all<DbCheckinLog>()
  return paginated(result.results, total, page, pageSize)
}
