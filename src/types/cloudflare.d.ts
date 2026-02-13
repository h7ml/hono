interface D1RunResult {
  meta: {
    last_row_id: number
    changes: number
  }
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
  run(): Promise<D1RunResult>
}

interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch(stmts: D1PreparedStatement[]): Promise<D1RunResult[]>
}

interface CloudflareBindings {
  DB: D1Database
}

interface ScheduledEvent {
  cron: string
  scheduledTime: number
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void
  passThroughOnException(): void
}

type ExportedHandlerScheduledHandler<Env = unknown> = (
  event: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext
) => void | Promise<void>
