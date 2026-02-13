import type { PaginatedResponse } from '../types/app'

export interface MockUser {
  id: string
  name: string
  email: string
  status: 'active' | 'disabled'
}

const mockUsers: MockUser[] = [
  { id: 'u_1', name: 'Halo Admin', email: 'admin@halolight.dev', status: 'active' },
  { id: 'u_2', name: 'Ops Manager', email: 'ops@halolight.dev', status: 'active' },
  { id: 'u_3', name: 'Data Viewer', email: 'viewer@halolight.dev', status: 'disabled' }
]

export function getUsersPage(page = 1, pageSize = 10): PaginatedResponse<MockUser> {
  const total = mockUsers.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const begin = (page - 1) * pageSize
  const list = mockUsers.slice(begin, begin + pageSize)

  return {
    list,
    total,
    page,
    pageSize,
    totalPages
  }
}
