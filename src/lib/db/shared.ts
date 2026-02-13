import type { PaginatedResponse } from '../../types/app'

export interface QueryOptions {
  page: number
  pageSize: number
  search?: string
  status?: string
  role?: string
}

export function buildPagination(opts: QueryOptions) {
  const page = Math.max(1, opts.page)
  const pageSize = Math.min(100, Math.max(1, opts.pageSize))
  const offset = (page - 1) * pageSize
  return { page, pageSize, offset }
}

export function paginated<T>(list: T[], total: number, page: number, pageSize: number): PaginatedResponse<T> {
  return {
    list,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  }
}
