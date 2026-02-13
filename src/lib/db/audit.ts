import type { DbAuditLog, DashboardStats, PaginatedResponse } from '../../types/app'
import type { QueryOptions } from './shared'
import { buildPagination, paginated } from './shared'

interface CountRow { total: number }

export async function getAuditLogsPage(
  db: D1Database,
  opts: QueryOptions
): Promise<PaginatedResponse<DbAuditLog>> {
  const { page, pageSize, offset } = buildPagination(opts)

  const totalRow = await db
    .prepare('SELECT COUNT(*) as total FROM hono_audit_logs')
    .first<CountRow>()
  const total = Number(totalRow?.total ?? 0)

  const result = await db
    .prepare('SELECT * FROM hono_audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .bind(pageSize, offset)
    .all<DbAuditLog>()

  return paginated(result.results, total, page, pageSize)
}

export async function writeAuditLog(
  db: D1Database,
  data: {
    user_id?: number
    user_name: string
    action: string
    resource_type?: string
    resource_id?: string
    detail?: string
    ip?: string
  }
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO hono_audit_logs (user_id, user_name, action, resource_type, resource_id, detail, ip, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))"
    )
    .bind(
      data.user_id ?? null,
      data.user_name,
      data.action,
      data.resource_type ?? null,
      data.resource_id ?? null,
      data.detail ?? null,
      data.ip ?? null
    )
    .run()
}

export async function getDashboardStats(db: D1Database): Promise<DashboardStats> {
  const [userCount, activeUserCount, roleCount, todayLogCount, recentLogs] = await Promise.all([
    db.prepare('SELECT COUNT(*) as total FROM hono_users').first<CountRow>(),
    db.prepare("SELECT COUNT(*) as total FROM hono_users WHERE status = 'active'").first<CountRow>(),
    db.prepare('SELECT COUNT(*) as total FROM hono_roles').first<CountRow>(),
    db.prepare("SELECT COUNT(*) as total FROM hono_audit_logs WHERE created_at >= date('now')").first<CountRow>(),
    db.prepare('SELECT * FROM hono_audit_logs ORDER BY created_at DESC LIMIT 10').all<DbAuditLog>()
  ])

  return {
    userCount: Number(userCount?.total ?? 0),
    activeUserCount: Number(activeUserCount?.total ?? 0),
    roleCount: Number(roleCount?.total ?? 0),
    todayLogCount: Number(todayLogCount?.total ?? 0),
    recentLogs: recentLogs.results
  }
}
