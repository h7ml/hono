import type { Permission } from '../types/app'

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

export async function loadPermissionsForRole(db: D1Database, roleCode: string): Promise<Permission[]> {
  const result = await db.prepare(
    `SELECT p.code FROM hono_permissions p
     JOIN hono_role_permissions rp ON p.id = rp.permission_id
     JOIN hono_roles r ON r.id = rp.role_id
     WHERE r.code = ?`
  ).bind(roleCode).all<{ code: string }>()
  return result.results.map(r => r.code as Permission)
}
