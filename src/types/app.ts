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

// ── Database Row Types ──

export interface DbRole {
  id: number
  code: string
  name: string
  description: string | null
  status: string
  is_system: number
  created_at: string
  updated_at: string
}

export interface DbPermission {
  id: number
  code: string
  resource: string
  action: string
  name: string
  description: string | null
  is_system: number
  created_at: string
}

export interface RoleWithPermissions extends DbRole {
  permissions: DbPermission[]
  permissionCount: number
}

export interface DbSetting {
  key: string
  value: string
  value_type: string
  group_name: string
  label: string
  description: string | null
  updated_at: string
}

export interface SettingsGroup {
  group: string
  label: string
  items: DbSetting[]
}

export interface DbAuditLog {
  id: number
  user_id: number | null
  user_name: string
  action: string
  resource_type: string | null
  resource_id: string | null
  detail: string | null
  ip: string | null
  created_at: string
}

export interface DashboardStats {
  userCount: number
  activeUserCount: number
  roleCount: number
  todayLogCount: number
  recentLogs: DbAuditLog[]
}
