import type { PaginatedResponse } from '../types/app'
import type { MockUser } from '../mocks/data'
import { apiGet } from './api'

export async function fetchUsers(): Promise<PaginatedResponse<MockUser>> {
  return apiGet<PaginatedResponse<MockUser>>('/users')
}
