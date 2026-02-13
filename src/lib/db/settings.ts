import type { DbSetting, SettingsGroup } from '../../types/app'

const GROUP_LABELS: Record<string, string> = {
  general: '通用设置',
  auth: '认证设置',
  ui: '界面设置',
  notification: '通知设置'
}

export async function getAllSettings(db: D1Database): Promise<DbSetting[]> {
  const result = await db
    .prepare('SELECT * FROM hono_settings ORDER BY group_name, key')
    .all<DbSetting>()
  return result.results
}

export async function getSettingsGrouped(db: D1Database): Promise<SettingsGroup[]> {
  const all = await getAllSettings(db)
  const map = new Map<string, DbSetting[]>()

  for (const s of all) {
    const arr = map.get(s.group_name) ?? []
    arr.push(s)
    map.set(s.group_name, arr)
  }

  return Array.from(map.entries()).map(([group, items]) => ({
    group,
    label: GROUP_LABELS[group] ?? group,
    items
  }))
}

export async function getSetting(db: D1Database, key: string): Promise<DbSetting | null> {
  return db.prepare('SELECT * FROM hono_settings WHERE key = ?').bind(key).first<DbSetting>()
}

export async function updateSetting(
  db: D1Database,
  key: string,
  value: string
): Promise<void> {
  await db
    .prepare("UPDATE hono_settings SET value = ?, updated_at = datetime('now') WHERE key = ?")
    .bind(value, key)
    .run()
}
