interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = Record<string, unknown>>(colName?: string): Promise<T | null>
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
  run(): Promise<unknown>
}

interface D1Database {
  prepare(query: string): D1PreparedStatement
}

interface CloudflareBindings {
  DB: D1Database
}
