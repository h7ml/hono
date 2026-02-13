export type ThemeMode = 'light' | 'dark' | 'system'

export type SkinName =
  | 'default'
  | 'zinc'
  | 'slate'
  | 'stone'
  | 'gray'
  | 'neutral'
  | 'red'
  | 'rose'
  | 'orange'
  | 'green'
  | 'blue'
  | 'yellow'
  | 'violet'

export type Permission = `${string}:${string}` | '*'

export interface RouteMeta {
  title: string
  icon: string
  permission?: Permission
  hidden?: boolean
  keepAlive?: boolean
  breadcrumb?: string[]
}

export interface AppRoute {
  path: string
  meta: RouteMeta
}

export interface RouteGroup {
  label: string
  icon?: string
  children: AppRoute[]
}

export interface User {
  id: string
  name: string
  role: string
  permissions: Permission[]
}

export interface UserListItem {
  id: number
  username: string
  name: string
  email: string
  role: string
  status: string
}

export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
