import type { AppRoute } from '../types/app'

export const appRoutes: AppRoute[] = [
  {
    path: '/dashboard',
    meta: {
      title: '仪表盘',
      icon: '📊',
      permission: 'dashboard:view',
      breadcrumb: ['首页', '仪表盘']
    }
  },
  {
    path: '/users',
    meta: {
      title: '用户管理',
      icon: '👥',
      permission: 'users:list',
      breadcrumb: ['系统管理', '用户管理']
    }
  },
  {
    path: '/roles',
    meta: {
      title: '角色管理',
      icon: '🛡️',
      permission: 'roles:list',
      breadcrumb: ['系统管理', '角色管理']
    }
  },
  {
    path: '/permissions',
    meta: {
      title: '权限管理',
      icon: '🔐',
      permission: 'permissions:list',
      breadcrumb: ['系统管理', '权限管理']
    }
  },
  {
    path: '/settings',
    meta: {
      title: '系统设置',
      icon: '⚙️',
      permission: 'settings:view',
      breadcrumb: ['系统配置', '系统设置']
    }
  },
  {
    path: '/profile',
    meta: {
      title: '个人资料',
      icon: '🙋',
      breadcrumb: ['账户中心', '个人资料']
    }
  }
]

export const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password']
