import type { DbCronTask } from '../types/app'
import { getDueCronTasks, updateCronTaskResult, updateCronTaskNextRun, writeCronTaskLog } from './db/cron-tasks'
import { getSetting } from './db/settings'

export interface ParsedCurl {
  method: string
  url: string
  headers: Record<string, string>
  body: string
}

function tokenize(input: string): string[] {
  const tokens: string[] = []
  let i = 0
  while (i < input.length) {
    if (input[i] === '\\' && input[i + 1] === '\n') { i += 2; continue }
    if (/\s/.test(input[i])) { i++; continue }
    let token = ''
    while (i < input.length && !/\s/.test(input[i])) {
      const ch = input[i]
      if (ch === "'") {
        i++
        while (i < input.length && input[i] !== "'") token += input[i++]
        i++
      } else if (ch === '"') {
        i++
        while (i < input.length && input[i] !== '"') {
          if (input[i] === '\\' && i + 1 < input.length) { i++; token += input[i++] }
          else token += input[i++]
        }
        i++
      } else if (ch === '\\' && i + 1 < input.length) {
        i++; token += input[i++]
      } else {
        token += input[i++]
      }
    }
    tokens.push(token)
  }
  return tokens
}

export function parseCurl(input: string): ParsedCurl {
  const trimmed = input.trim().replace(/^curl\s+/, '')
  const tokens = tokenize(trimmed)

  let method = ''
  let url = ''
  const headers: Record<string, string> = {}
  const dataparts: string[] = []
  let i = 0

  while (i < tokens.length) {
    const t = tokens[i]
    if (t === '-X' || t === '--request') {
      method = tokens[++i]; i++
    } else if (t === '-H' || t === '--header') {
      const h = tokens[++i]
      const sep = h.indexOf(':')
      if (sep > 0) headers[h.slice(0, sep).trim()] = h.slice(sep + 1).trim()
      i++
    } else if (t === '-d' || t === '--data' || t === '--data-raw' || t === '--data-binary') {
      dataparts.push(tokens[++i]); i++
    } else if (t === '--url') {
      url = tokens[++i]; i++
    } else if (t === '-b' || t === '--cookie') {
      headers['Cookie'] = tokens[++i]; i++
    } else if (t === '-u' || t === '--user') {
      const cred = tokens[++i]
      headers['Authorization'] = 'Basic ' + btoa(cred)
      i++
    } else if (t === '-A' || t === '--user-agent') {
      headers['User-Agent'] = tokens[++i]; i++
    } else if (t.startsWith('-')) {
      i++
    } else {
      if (!url) url = t
      i++
    }
  }

  const body = dataparts.join('&')
  if (!method) method = body ? 'POST' : 'GET'

  return { method, url, headers, body }
}

function parseField(field: string, min: number, max: number): number[] {
  const result = new Set<number>()
  for (const part of field.split(',')) {
    const [rangeStr, stepStr] = part.split('/')
    const step = stepStr ? parseInt(stepStr, 10) : 1
    let start: number, end: number
    if (rangeStr === '*') {
      start = min; end = max
    } else if (rangeStr.includes('-')) {
      const [a, b] = rangeStr.split('-')
      start = parseInt(a, 10); end = parseInt(b, 10)
    } else {
      start = parseInt(rangeStr, 10); end = start
    }
    for (let v = start; v <= end; v += step) result.add(v)
  }
  return [...result]
}

export function cronNextRun(cronExpr: string, after?: Date): Date {
  const parts = cronExpr.trim().split(/\s+/)
  if (parts.length !== 5) throw new Error(`Invalid cron expression: ${cronExpr}`)

  const minutes = parseField(parts[0], 0, 59)
  const hours = parseField(parts[1], 0, 23)
  const daysOfMonth = parseField(parts[2], 1, 31)
  const months = parseField(parts[3], 1, 12)
  const daysOfWeek = parseField(parts[4], 0, 6)

  const hasDomConstraint = parts[2] !== '*'
  const hasDowConstraint = parts[4] !== '*'

  const base = after ?? new Date()
  const d = new Date(base.getTime())
  d.setUTCSeconds(0, 0)
  d.setUTCMinutes(d.getUTCMinutes() + 1)

  const limit = new Date(base.getTime() + 366 * 86400000)

  while (d <= limit) {
    if (!months.includes(d.getUTCMonth() + 1)) {
      d.setUTCMonth(d.getUTCMonth() + 1, 1)
      d.setUTCHours(0, 0, 0, 0)
      continue
    }

    const domMatch = daysOfMonth.includes(d.getUTCDate())
    const dowMatch = daysOfWeek.includes(d.getUTCDay())
    const dayOk = hasDomConstraint && hasDowConstraint
      ? domMatch || dowMatch
      : hasDomConstraint ? domMatch
      : hasDowConstraint ? dowMatch
      : true

    if (!dayOk) {
      d.setUTCDate(d.getUTCDate() + 1)
      d.setUTCHours(0, 0, 0, 0)
      continue
    }
    if (!hours.includes(d.getUTCHours())) {
      d.setUTCHours(d.getUTCHours() + 1, 0, 0, 0)
      continue
    }
    if (!minutes.includes(d.getUTCMinutes())) {
      d.setUTCMinutes(d.getUTCMinutes() + 1, 0, 0)
      continue
    }
    return new Date(d.getTime())
  }

  throw new Error(`No matching time found within 366 days for: ${cronExpr}`)
}

async function sendPushPlus(token: string, title: string, content: string): Promise<void> {
  await fetch('https://www.pushplus.plus/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, title, content, template: 'txt' }),
  })
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export async function executeCronTask(
  db: D1Database,
  task: DbCronTask,
  triggerSource: 'scheduled' | 'manual'
): Promise<{ ok: boolean; msg: string }> {
  const start = Date.now()
  let lastErr = ''
  const attempts = task.max_retries + 1
  let parsedHeaders: Record<string, string> = {}
  try { parsedHeaders = JSON.parse(task.headers) } catch {}

  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) await delay(2000)
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), task.timeout_ms)
    try {
      const res = await fetch(task.url, {
        method: task.http_method,
        headers: parsedHeaders,
        body: task.body || undefined,
        signal: controller.signal,
      })
      clearTimeout(timer)
      const duration = Date.now() - start
      const text = await res.text()
      const preview = text.slice(0, 500)

      await updateCronTaskResult(db, task.id, preview, res.status)
      await writeCronTaskLog(db, {
        task_id: task.id, task_name: task.name,
        success: res.ok, status_code: res.status,
        duration_ms: duration, response_preview: preview,
        trigger_source: triggerSource, message: res.ok ? 'OK' : `HTTP ${res.status}`,
      })
      await updateCronTaskNextRun(db, task.id, cronNextRun(task.cron_expr).toISOString())

      if (res.ok) return { ok: true, msg: `HTTP ${res.status}` }
      lastErr = `HTTP ${res.status}`
    } catch (e: any) {
      clearTimeout(timer)
      lastErr = e?.message ?? String(e)
    }
  }

  const duration = Date.now() - start
  await updateCronTaskResult(db, task.id, lastErr, 0)
  await writeCronTaskLog(db, {
    task_id: task.id, task_name: task.name,
    success: false, status_code: 0,
    duration_ms: duration, response_preview: lastErr,
    trigger_source: triggerSource, message: lastErr,
  })
  await updateCronTaskNextRun(db, task.id, cronNextRun(task.cron_expr).toISOString())

  if (task.notify_on_failure === 1) {
    const tokenSetting = await getSetting(db, 'notification.pushplus_token')
    const token = tokenSetting?.value?.trim()
    if (token) {
      await sendPushPlus(token, `定时任务失败: ${task.name}`, `任务: ${task.name}\n错误: ${lastErr}`)
    }
  }

  return { ok: false, msg: lastErr }
}

export async function runDueCronTasks(db: D1Database): Promise<string> {
  const tasks = await getDueCronTasks(db)
  if (!tasks.length) return '无到期任务'

  const results: string[] = []
  for (const task of tasks) {
    const r = await executeCronTask(db, task, 'scheduled')
    results.push(`[${task.name}] ${r.ok ? '成功' : '失败'}: ${r.msg}`)
    if (task !== tasks[tasks.length - 1]) await delay(1000)
  }

  return `执行 ${tasks.length} 个任务\n${results.join('\n')}`
}

export async function sendDailySummary(db: D1Database): Promise<void> {
  const tokenSetting = await getSetting(db, 'notification.pushplus_token')
  const token = tokenSetting?.value?.trim()
  if (!token) return

  const checkinLogs = await db
    .prepare("SELECT account_label, success, message FROM hono_checkin_logs WHERE created_at >= date('now') ORDER BY created_at")
    .all<{ account_label: string; success: number; message: string }>()

  const cronLogs = await db
    .prepare("SELECT task_name, success, status_code, duration_ms, message, trigger_source FROM hono_cron_task_logs WHERE created_at >= date('now') ORDER BY created_at")
    .all<{ task_name: string; success: number; status_code: number | null; duration_ms: number; message: string; trigger_source: string }>()

  const checkinRows = checkinLogs.results
  const cronRows = cronLogs.results
  if (!checkinRows.length && !cronRows.length) return

  const lines: string[] = ['📊 每日任务执行汇总', '']

  if (checkinRows.length) {
    const ok = checkinRows.filter((r) => r.success).length
    const fail = checkinRows.length - ok
    lines.push(`【AnyRouter 签到】共 ${checkinRows.length} 次 ✅${ok} ❌${fail}`)
    for (const r of checkinRows) {
      lines.push(`  ${r.success ? '✅' : '❌'} ${r.account_label}: ${r.message}`)
    }
    lines.push('')
  }

  if (cronRows.length) {
    const ok = cronRows.filter((r) => r.success).length
    const fail = cronRows.length - ok
    lines.push(`【定时任务】共 ${cronRows.length} 次 ✅${ok} ❌${fail}`)
    for (const r of cronRows) {
      const src = r.trigger_source === 'manual' ? '手动' : '调度'
      lines.push(`  ${r.success ? '✅' : '❌'} ${r.task_name} [${src}] ${r.status_code ?? '-'} ${r.duration_ms}ms: ${r.message}`)
    }
    lines.push('')
  }

  const total = checkinRows.length + cronRows.length
  const totalOk = checkinRows.filter((r) => r.success).length + cronRows.filter((r) => r.success).length
  lines.push(`合计: ${total} 次执行, 成功 ${totalOk}, 失败 ${total - totalOk}`)

  await sendPushPlus(token, '每日任务汇总', lines.join('\n'))
}
