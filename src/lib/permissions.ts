import type { Permission } from '../types/app'

export const rolePermissions: Record<string, Permission[]> = {
  admin: ['*'],
  manager: [
    'dashboard:view',
    'users:list',
    'roles:list',
    'permissions:list',
    'settings:view',
    'profile:view'
  ],
  viewer: ['dashboard:view', 'users:list', 'profile:view']
}

export function hasPermission(
  granted: Permission[] | undefined,
  required: Permission | undefined
): boolean {
  if (!required) {
    return true
  }
  if (!granted || granted.length === 0) {
    return false
  }
  if (granted.includes('*')) {
    return true
  }
  if (granted.includes(required)) {
    return true
  }

  const [resource] = required.split(':')
  return granted.includes(`${resource}:*`)
}
