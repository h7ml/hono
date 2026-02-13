import type { FC } from 'hono/jsx'
import type { RoleWithPermissions, DbPermission } from '../../types/app'
import { IconShield, IconPlus, IconTrash, IconCheck } from '../../components/icons'

interface RolesPageProps {
  roles: RoleWithPermissions[]
  allPermissions: DbPermission[]
}

const groupByResource = (permissions: DbPermission[]): Record<string, DbPermission[]> => {
  const grouped: Record<string, DbPermission[]> = {}
  for (const p of permissions) {
    if (!grouped[p.resource]) grouped[p.resource] = []
    grouped[p.resource].push(p)
  }
  return grouped
}

const roleColors = ['bg-primary/8 border-primary/20', 'bg-secondary/8 border-secondary/20', 'bg-accent/8 border-accent/20', 'bg-success/8 border-success/20', 'bg-warning/8 border-warning/20', 'bg-info/8 border-info/20']
const roleIconColors = ['text-primary', 'text-secondary', 'text-accent', 'text-success', 'text-warning', 'text-info']

export const RolesPage: FC<RolesPageProps> = ({ roles, allPermissions }) => {
  const permsByResource = groupByResource(allPermissions)

  return (
    <div class="space-y-5">
      {/* 页头 */}
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold">角色管理</h2>
          <p class="text-sm text-base-content/50 mt-0.5">共 {roles.length} 个角色</p>
        </div>
        <button class="btn btn-primary btn-sm gap-1.5" data-action="open-add-role">
          <IconPlus size={16} />
          新增角色
        </button>
      </div>

      {/* 角色卡片 */}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role, idx) => {
          const colorClass = roleColors[idx % roleColors.length]
          const iconColor = roleIconColors[idx % roleIconColors.length]
          return (
            <div class={`page-section border ${colorClass} overflow-hidden`}>
              <div class="p-5">
                <div class="flex items-start gap-3 mb-3">
                  <div class={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center shrink-0`}>
                    <IconShield size={20} class={iconColor} />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <h3 class="font-bold text-base truncate">{role.name}</h3>
                      {role.is_system ? (
                        <span class="badge badge-ghost badge-xs">系统</span>
                      ) : null}
                    </div>
                    <p class="text-xs text-base-content/50 mt-0.5">{role.description || role.code}</p>
                  </div>
                </div>

                <div class="flex items-center gap-2 mb-3">
                  <span class="badge badge-primary badge-sm gap-1">
                    <IconCheck size={10} />
                    {role.permissionCount} 个权限
                  </span>
                  <span class="badge badge-outline badge-sm">{role.code}</span>
                </div>

                {/* 权限分配 */}
                <details class="collapse collapse-arrow bg-base-200/40 rounded-xl">
                  <summary class="collapse-title text-sm font-medium py-2 min-h-0 px-3">
                    权限列表
                  </summary>
                  <div class="collapse-content px-3 pb-3" data-role-panel={role.id}>
                    {Object.entries(permsByResource).map(([resource, perms]) => (
                      <div class="mb-3 last:mb-0">
                        <div class="text-[10px] font-bold uppercase tracking-wider text-base-content/40 mb-1">{resource}</div>
                        <div class="flex flex-wrap gap-1.5">
                          {perms.map((perm) => {
                            const checked = role.permissions.some((p) => p.id === perm.id)
                            return (
                              <label class={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs cursor-pointer transition-colors ${checked ? 'bg-primary/10 text-primary' : 'bg-base-200/60 text-base-content/50 hover:bg-base-200'}`}>
                                <input
                                  type="checkbox"
                                  name="perm"
                                  value={perm.id}
                                  class="checkbox checkbox-xs checkbox-primary"
                                  data-role-id={role.id}
                                  data-perm-id={perm.id}
                                  checked={checked}
                                />
                                {perm.name}
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                    <button class="btn btn-primary btn-xs mt-3 gap-1" data-action="save-role-perms" data-role-id={role.id}>
                      <IconCheck size={12} /> 保存权限
                    </button>
                  </div>
                </details>
              </div>

              {/* 底部操作 */}
              <div class="border-t border-base-300/30 px-5 py-2.5 flex justify-end gap-1">
                {!role.is_system && (
                  <button class="action-btn action-btn-danger" data-action="delete-role" data-id={role.id}>
                    <IconTrash size={14} /> 删除
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 新增角色弹窗 */}
      <dialog id="role-modal" class="modal modal-bottom sm:modal-middle">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-5" id="role-modal-title">新增角色</h3>
          <form id="role-form" class="space-y-4">
            <input type="hidden" name="id" />
            <label class="form-control w-full">
              <div class="label"><span class="label-text font-medium">角色编码</span></div>
              <input name="code" required class="input input-bordered w-full" placeholder="如 editor" />
            </label>
            <label class="form-control w-full">
              <div class="label"><span class="label-text font-medium">角色名称</span></div>
              <input name="name" required class="input input-bordered w-full" placeholder="如 编辑员" />
            </label>
            <label class="form-control w-full">
              <div class="label"><span class="label-text font-medium">描述</span></div>
              <input name="description" class="input input-bordered w-full" placeholder="可选描述" />
            </label>
          </form>
          <div class="modal-action">
            <form method="dialog"><button class="btn btn-ghost btn-sm">取消</button></form>
            <button class="btn btn-primary btn-sm" data-action="submit-role">确认创建</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop"><button>close</button></form>
      </dialog>
    </div>
  )
}
