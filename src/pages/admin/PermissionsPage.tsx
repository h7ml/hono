import type { FC } from 'hono/jsx'
import type { DbPermission } from '../../types/app'
import { IconLock, IconShield } from '../../components/icons'

interface PermissionsPageProps {
  grouped: Record<string, DbPermission[]>
}

const resourceLabels: Record<string, string> = {
  dashboard: '仪表盘',
  users: '用户',
  roles: '角色',
  permissions: '权限',
  settings: '设置',
  audit: '审计',
  profile: '个人资料',
}

const resourceColors: Record<string, string> = {
  dashboard: 'badge-primary',
  users: 'badge-info',
  roles: 'badge-secondary',
  permissions: 'badge-accent',
  settings: 'badge-warning',
  audit: 'badge-success',
  profile: 'badge-neutral',
}

export const PermissionsPage: FC<PermissionsPageProps> = ({ grouped }) => {
  const totalCount = Object.values(grouped).reduce((sum, perms) => sum + perms.length, 0)

  return (
    <div class="space-y-5">
      {/* 页头 */}
      <div>
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <IconLock size={22} class="text-primary/60" />
          权限管理
        </h2>
        <p class="text-sm text-base-content/50 mt-0.5">共 {totalCount} 个权限，按资源分组</p>
      </div>

      {/* 权限列表 */}
      <div class="space-y-3">
        {Object.entries(grouped).map(([resource, perms]) => (
          <div class="page-section overflow-hidden">
            <details open>
              <summary class="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-base-200/30 transition-colors select-none">
                <IconShield size={18} class="text-primary/50 shrink-0" />
                <span class="font-semibold text-sm flex-1">
                  {resourceLabels[resource] ?? resource}
                </span>
                <span class={`badge badge-sm ${resourceColors[resource] ?? 'badge-ghost'}`}>
                  {perms.length}
                </span>
              </summary>
              <div class="px-5 pb-4">
                <div class="overflow-x-auto">
                  <table class="table table-sm table-enhanced">
                    <thead>
                      <tr>
                        <th>权限码</th>
                        <th>名称</th>
                        <th>描述</th>
                        <th>类型</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perms.map((p) => (
                        <tr>
                          <td>
                            <code class="text-xs bg-base-200/60 px-2 py-0.5 rounded font-mono">{p.code}</code>
                          </td>
                          <td class="font-medium text-sm">{p.name}</td>
                          <td class="text-sm text-base-content/50">{p.description ?? '-'}</td>
                          <td>
                            <span class={`badge badge-sm ${p.is_system ? 'badge-ghost' : 'badge-outline badge-accent'}`}>
                              {p.is_system ? '系统' : '自定义'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  )
}
