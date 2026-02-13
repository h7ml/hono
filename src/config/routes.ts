import type { AppRoute, RouteGroup } from '../types/app'

export const appRoutes: AppRoute[] = [
  {
    path: '/dashboard',
    meta: { title: '仪表盘', icon: 'dashboard', permission: 'dashboard:view', breadcrumb: ['首页', '仪表盘'] }
  },
  {
    path: '/users',
    meta: { title: '用户管理', icon: 'users', permission: 'users:list', breadcrumb: ['系统管理', '用户管理'] }
  },
  {
    path: '/roles',
    meta: { title: '角色管理', icon: 'shield', permission: 'roles:list', breadcrumb: ['系统管理', '角色管理'] }
  },
  {
    path: '/permissions',
    meta: { title: '权限管理', icon: 'lock', permission: 'permissions:list', breadcrumb: ['系统管理', '权限管理'] }
  },
  {
    path: '/settings',
    meta: { title: '系统设置', icon: 'settings', permission: 'settings:view', breadcrumb: ['系统配置', '系统设置'] }
  },
  {
    path: '/audit-logs',
    meta: { title: '审计日志', icon: 'clipboard', permission: 'audit:list', breadcrumb: ['系统配置', '审计日志'] }
  },
  {
    path: '/cron/anyrouter',
    meta: { title: 'AnyRouter', icon: 'zap', permission: 'checkin:list', breadcrumb: ['定时任务', 'AnyRouter'] }
  },
  {
    path: '/profile',
    meta: { title: '个人资料', icon: 'user', breadcrumb: ['账户中心', '个人资料'] }
  }
]

export const routeGroups: RouteGroup[] = [
  { label: '', children: [appRoutes[0]] },
  { label: '系统管理', children: appRoutes.slice(1, 4) },
  { label: '系统配置', children: appRoutes.slice(4, 6) },
  { label: '定时任务', children: [appRoutes[6]] },
  { label: '账户中心', children: [appRoutes[7]] }
]

export const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
