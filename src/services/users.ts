import type { PaginatedResponse, UserListItem } from '../types/app'
import { apiGet } from './api'

export async function fetchUsers(): Promise<PaginatedResponse<UserListItem>> {
  return apiGet<PaginatedResponse<UserListItem>>('/users')
}
