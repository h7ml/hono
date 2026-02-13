import type { DbRole, DbPermission, RoleWithPermissions } from '../../types/app'
import type { QueryOptions } from './shared'
import { buildPagination, paginated } from './shared'

export async function getAllRoles(db: D1Database): Promise<DbRole[]> {
  const result = await db
    .prepare('SELECT * FROM hono_roles WHERE status = ? ORDER BY id ASC')
    .bind('active')
    .all<DbRole>()
  return result.results
}

export async function getAllRolesWithPermissions(db: D1Database): Promise<RoleWithPermissions[]> {
  const rolesResult = await db
    .prepare('SELECT * FROM hono_roles ORDER BY id ASC')
    .all<DbRole>()

  const rpResult = await db
    .prepare(
      'SELECT rp.role_id, p.* FROM hono_role_permissions rp JOIN hono_permissions p ON p.id = rp.permission_id'
    )
    .all<DbPermission & { role_id: number }>()

  const permMap = new Map<number, DbPermission[]>()
  for (const row of rpResult.results) {
    const { role_id, ...perm } = row
    const arr = permMap.get(role_id) ?? []
    arr.push(perm as DbPermission)
    permMap.set(role_id, arr)
  }

  return rolesResult.results.map((role) => {
    const permissions = permMap.get(role.id) ?? []
    return { ...role, permissions, permissionCount: permissions.length }
  })
}

export async function getRoleById(db: D1Database, id: number): Promise<DbRole | null> {
  return db.prepare('SELECT * FROM hono_roles WHERE id = ?').bind(id).first<DbRole>()
}

export async function createRole(
  db: D1Database,
  data: { code: string; name: string; description?: string }
): Promise<DbRole | null> {
  const result = await db
    .prepare(
      "INSERT INTO hono_roles (code, name, description, status, is_system, created_at, updated_at) VALUES (?, ?, ?, 'active', 0, datetime('now'), datetime('now'))"
    )
    .bind(data.code, data.name, data.description ?? null)
    .run()

  const id = result.meta.last_row_id
  return db.prepare('SELECT * FROM hono_roles WHERE id = ?').bind(id).first<DbRole>()
}

export async function updateRole(
  db: D1Database,
  id: number,
  data: { name?: string; description?: string; status?: string }
): Promise<DbRole | null> {
  const sets: string[] = []
  const vals: unknown[] = []

  if (data.name !== undefined) { sets.push('name = ?'); vals.push(data.name) }
  if (data.description !== undefined) { sets.push('description = ?'); vals.push(data.description) }
  if (data.status !== undefined) { sets.push('status = ?'); vals.push(data.status) }

  if (sets.length === 0) return getRoleById(db, id)

  sets.push("updated_at = datetime('now')")
  vals.push(id)

  await db
    .prepare(`UPDATE hono_roles SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...vals)
    .run()

  return getRoleById(db, id)
}

export async function deleteRole(db: D1Database, id: number): Promise<boolean> {
  const result = await db
    .prepare('DELETE FROM hono_roles WHERE id = ? AND is_system = 0')
    .bind(id)
    .run()
  return (result.meta.changes ?? 0) > 0
}

export async function setRolePermissions(
  db: D1Database,
  roleId: number,
  permissionIds: number[]
): Promise<void> {
  const stmts: D1PreparedStatement[] = [
    db.prepare('DELETE FROM hono_role_permissions WHERE role_id = ?').bind(roleId)
  ]
  for (const pid of permissionIds) {
    stmts.push(
      db.prepare('INSERT INTO hono_role_permissions (role_id, permission_id) VALUES (?, ?)').bind(roleId, pid)
    )
  }
  await db.batch(stmts)
}
