import type { DbPermission } from '../../types/app'

export async function getAllPermissions(db: D1Database): Promise<DbPermission[]> {
  const result = await db
    .prepare('SELECT * FROM hono_permissions ORDER BY resource, action')
    .all<DbPermission>()
  return result.results
}

export async function getPermissionsGroupedByResource(
  db: D1Database
): Promise<Record<string, DbPermission[]>> {
  const all = await getAllPermissions(db)
  const grouped: Record<string, DbPermission[]> = {}
  for (const perm of all) {
    ;(grouped[perm.resource] ??= []).push(perm)
  }
  return grouped
}

export async function getPermissionsForRole(
  db: D1Database,
  roleId: number
): Promise<DbPermission[]> {
  const result = await db
    .prepare(
      'SELECT p.* FROM hono_permissions p JOIN hono_role_permissions rp ON p.id = rp.permission_id WHERE rp.role_id = ?'
    )
    .bind(roleId)
    .all<DbPermission>()
  return result.results
}
