import type { DbCronTask, DbCronTaskLog, PaginatedResponse } from '../../types/app'
import type { QueryOptions } from './shared'
import { buildPagination, paginated } from './shared'

interface CountRow { total: number }

export async function getAllCronTasks(db: D1Database): Promise<DbCronTask[]> {
  const result = await db
    .prepare('SELECT * FROM hono_cron_tasks ORDER BY id DESC')
    .all<DbCronTask>()
  return result.results
}

export async function getCronTaskById(db: D1Database, id: number): Promise<DbCronTask | null> {
  return db
    .prepare('SELECT * FROM hono_cron_tasks WHERE id = ?')
    .bind(id)
    .first<DbCronTask>()
}

export async function createCronTask(
  db: D1Database,
  data: {
    name: string
    description?: string
    cron_expr: string
    http_method: string
    url: string
    headers?: string
    body?: string
    timeout_ms?: number
    max_retries?: number
    notify_on_failure?: number
    next_run_at?: string
  }
): Promise<DbCronTask | null> {
  const description = data.description?.trim() || ''
  const headers = data.headers?.trim() || '{}'
  const body = data.body?.trim() || ''
  const timeout_ms = data.timeout_ms ?? 30000
  const max_retries = data.max_retries ?? 0
  const notify_on_failure = data.notify_on_failure ?? 1
  const next_run_at = data.next_run_at ?? null
  return db
    .prepare(
      'INSERT INTO hono_cron_tasks (name, description, cron_expr, http_method, url, headers, body, timeout_ms, max_retries, notify_on_failure, next_run_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *'
    )
    .bind(
      data.name.trim(), description, data.cron_expr.trim(), data.http_method.trim(),
      data.url.trim(), headers, body, timeout_ms, max_retries, notify_on_failure, next_run_at
    )
    .first<DbCronTask>()
}

export async function updateCronTask(
  db: D1Database,
  id: number,
  data: Partial<{
    name: string
    description: string
    cron_expr: string
    http_method: string
    url: string
    headers: string
    body: string
    timeout_ms: number
    max_retries: number
    notify_on_failure: number
    next_run_at: string
  }>
): Promise<DbCronTask | null> {
  const sets: string[] = []
  const vals: unknown[] = []
  if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name.trim()) }
  if (data.description !== undefined) { sets.push('description = ?'); vals.push(data.description.trim()) }
  if (data.cron_expr !== undefined) { sets.push('cron_expr = ?'); vals.push(data.cron_expr.trim()) }
  if (data.http_method !== undefined) { sets.push('http_method = ?'); vals.push(data.http_method.trim()) }
  if (data.url !== undefined) { sets.push('url = ?'); vals.push(data.url.trim()) }
  if (data.headers !== undefined) { sets.push('headers = ?'); vals.push(data.headers.trim() || '{}') }
  if (data.body !== undefined) { sets.push('body = ?'); vals.push(data.body.trim()) }
  if (data.timeout_ms !== undefined) { sets.push('timeout_ms = ?'); vals.push(data.timeout_ms) }
  if (data.max_retries !== undefined) { sets.push('max_retries = ?'); vals.push(data.max_retries) }
  if (data.notify_on_failure !== undefined) { sets.push('notify_on_failure = ?'); vals.push(data.notify_on_failure) }
  if (data.next_run_at !== undefined) { sets.push('next_run_at = ?'); vals.push(data.next_run_at) }
  if (!sets.length) return null
  sets.push("updated_at = datetime('now')")
  vals.push(id)
  return db
    .prepare(`UPDATE hono_cron_tasks SET ${sets.join(', ')} WHERE id = ? RETURNING *`)
    .bind(...vals)
    .first<DbCronTask>()
}

export async function deleteCronTask(db: D1Database, id: number): Promise<boolean> {
  const info = await db
    .prepare('DELETE FROM hono_cron_tasks WHERE id = ?')
    .bind(id)
    .run()
  return (info.meta?.changes ?? 0) > 0
}

export async function toggleCronTaskStatus(db: D1Database, id: number): Promise<DbCronTask | null> {
  return db
    .prepare(
      "UPDATE hono_cron_tasks SET status = CASE WHEN status = 'active' THEN 'paused' ELSE 'active' END, updated_at = datetime('now') WHERE id = ? RETURNING *"
    )
    .bind(id)
    .first<DbCronTask>()
}

export async function getDueCronTasks(db: D1Database): Promise<DbCronTask[]> {
  const result = await db
    .prepare(
      "SELECT * FROM hono_cron_tasks WHERE status = 'active' AND next_run_at IS NOT NULL AND next_run_at <= datetime('now') LIMIT 20"
    )
    .all<DbCronTask>()
  return result.results
}

export async function updateCronTaskResult(
  db: D1Database,
  id: number,
  result: string,
  statusCode: number | null
): Promise<void> {
  await db
    .prepare(
      "UPDATE hono_cron_tasks SET last_run_at = datetime('now'), last_run_result = ?, last_run_status = ?, updated_at = datetime('now') WHERE id = ?"
    )
    .bind(result, statusCode, id)
    .run()
}

export async function updateCronTaskNextRun(db: D1Database, id: number, nextRunAt: string): Promise<void> {
  await db
    .prepare('UPDATE hono_cron_tasks SET next_run_at = ? WHERE id = ?')
    .bind(nextRunAt, id)
    .run()
}

export async function writeCronTaskLog(
  db: D1Database,
  data: {
    task_id: number
    task_name: string
    success: boolean
    status_code?: number | null
    duration_ms: number
    response_preview: string
    trigger_source: string
    message: string
  }
): Promise<void> {
  await db
    .prepare(
      'INSERT INTO hono_cron_task_logs (task_id, task_name, success, status_code, duration_ms, response_preview, trigger_source, message) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(
      data.task_id, data.task_name, data.success ? 1 : 0, data.status_code ?? null,
      data.duration_ms, data.response_preview, data.trigger_source, data.message
    )
    .run()
}

export async function getCronTaskLogsPage(
  db: D1Database,
  opts: QueryOptions
): Promise<PaginatedResponse<DbCronTaskLog>> {
  const { page, pageSize, offset } = buildPagination(opts)
  const totalRow = await db
    .prepare('SELECT COUNT(*) as total FROM hono_cron_task_logs')
    .first<CountRow>()
  const total = Number(totalRow?.total ?? 0)
  const result = await db
    .prepare('SELECT * FROM hono_cron_task_logs ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .bind(pageSize, offset)
    .all<DbCronTaskLog>()
  return paginated(result.results, total, page, pageSize)
}
