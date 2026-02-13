import type { FC } from 'hono/jsx'
import type { PaginatedResponse, UserListItem, DbRole } from '../../types/app'
import { IconPlus, IconPencil, IconTrash, IconSearch } from '../../components/icons'

interface UsersPageProps {
  data: PaginatedResponse<UserListItem>
  roles: DbRole[]
  query: { search: string; role: string; status: string }
}

const StatusBadge: FC<{ status: string }> = ({ status }) => (
  <span class={`badge badge-sm font-medium ${status === 'active' ? 'badge-success' : 'badge-error'}`}>
    {status === 'active' ? '启用' : '停用'}
  </span>
)

const Avatar: FC<{ name: string }> = ({ name }) => (
  <div class="avatar placeholder">
    <div class="bg-primary/15 text-primary w-9 rounded-full text-xs font-bold">
      <span>{name?.[0] ?? '?'}</span>
    </div>
  </div>
)

const buildPageUrl = (page: number, query: { search: string; role: string; status: string }) => {
  const params = new URLSearchParams()
  params.set('page', String(page))
  if (query.search) params.set('q', query.search)
  if (query.role) params.set('role', query.role)
  if (query.status) params.set('status', query.status)
  return `/users?${params.toString()}`
}

export const UsersPage: FC<UsersPageProps> = ({ data, roles, query }) => {
  const pages = Array.from({ length: data.totalPages }, (_, i) => i + 1)

  return (
    <div class="space-y-5">
      {/* 页头 */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-2xl font-bold">用户管理</h2>
          <p class="text-sm text-base-content/50 mt-0.5">共 {data.total} 个用户</p>
        </div>
        <button class="btn btn-primary btn-sm gap-1.5" data-action="open-add-user">
          <IconPlus size={16} />
          新增用户
        </button>
      </div>

      {/* 筛选栏 */}
      <form method="get" action="/users" class="page-section p-4 flex flex-wrap gap-3 items-end">
        <label class="form-control flex-1 min-w-[200px]">
          <input
            name="q"
            value={query.search}
            placeholder="搜索用户名 / 姓名 / 邮箱..."
            class="input input-bordered input-sm w-full pl-9"
          />
        </label>
        <select name="role" class="select select-bordered select-sm">
          <option value="">全部角色</option>
          {roles.map((r) => (
            <option value={r.code} selected={query.role === r.code}>{r.name}</option>
          ))}
        </select>
        <select name="status" class="select select-bordered select-sm">
          <option value="">全部状态</option>
          <option value="active" selected={query.status === 'active'}>启用</option>
          <option value="inactive" selected={query.status === 'inactive'}>停用</option>
        </select>
        <button type="submit" class="btn btn-sm btn-primary gap-1">
          <IconSearch size={14} />
          筛选
        </button>
      </form>

      {data.list.length === 0 ? (
        <div class="page-section py-16 text-center">
          <div class="text-5xl mb-3 opacity-20">🔍</div>
          <p class="text-base-content/40">暂无匹配的用户数据</p>
        </div>
      ) : (
        <>
          {/* 桌面表格 */}
          <div class="hidden md:block page-section overflow-hidden">
            <div class="overflow-x-auto">
              <table class="table table-sm table-enhanced">
                <thead>
                  <tr>
                    <th>用户</th>
                    <th>邮箱</th>
                    <th>角色</th>
                    <th>状态</th>
                    <th class="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {data.list.map((u) => (
                    <tr data-name={u.name} data-email={u.email} data-role={u.role}>
                      <td>
                        <div class="flex items-center gap-3">
                          <Avatar name={u.name} />
                          <div>
                            <div class="font-semibold text-sm">{u.name}</div>
                            <div class="text-xs text-base-content/40">@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td class="text-sm text-base-content/60">{u.email || '-'}</td>
                      <td>
                        <span class="badge badge-outline badge-sm">{u.role}</span>
                      </td>
                      <td><StatusBadge status={u.status} /></td>
                      <td>
                        <div class="flex justify-end gap-1">
                          <button class="action-btn" data-action="edit-user" data-id={u.id} title="编辑">
                            <IconPencil size={14} /> 编辑
                          </button>
                          <button class="action-btn" data-action="toggle-status" data-id={u.id} title="切换状态">
                            {u.status === 'active' ? '停用' : '启用'}
                          </button>
                          <button class="action-btn action-btn-danger" data-action="delete-user" data-id={u.id} title="删除">
                            <IconTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 移动端卡片 */}
          <div class="md:hidden space-y-3">
            {data.list.map((u) => (
              <div class="page-section p-4" data-name={u.name} data-email={u.email} data-role={u.role}>
                <div class="flex items-center gap-3">
                  <Avatar name={u.name} />
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-sm truncate">{u.name}</div>
                    <div class="text-xs text-base-content/40">@{u.username} · {u.email}</div>
                  </div>
                  <StatusBadge status={u.status} />
                </div>
                <div class="flex items-center justify-between mt-3 pt-3 border-t border-base-300/30">
                  <span class="badge badge-outline badge-sm">{u.role}</span>
                  <div class="flex gap-1">
                    <button class="action-btn" data-action="edit-user" data-id={u.id}>编辑</button>
                    <button class="action-btn" data-action="toggle-status" data-id={u.id}>
                      {u.status === 'active' ? '停用' : '启用'}
                    </button>
                    <button class="action-btn action-btn-danger" data-action="delete-user" data-id={u.id}>删除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 分页 */}
          {data.totalPages > 1 && (
            <div class="flex justify-center">
              <div class="join">
                {pages.map((p) => (
                  <a
                    href={buildPageUrl(p, query)}
                    class={`join-item btn btn-sm ${p === data.page ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {p}
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 新增用户弹窗 */}
      <dialog id="add-user-modal" class="modal modal-bottom sm:modal-middle">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-5">新增用户</h3>
          <form id="add-user-form" class="space-y-4">
            <label class="form-control w-full">
              <div class="label"><span class="label-text font-medium">用户名</span></div>
              <input name="username" required class="input input-bordered w-full" placeholder="请输入用户名" />
            </label>
            <label class="form-control w-full">
              <div class="label"><span class="label-text font-medium">密码</span></div>
              <input name="password" type="password" required class="input input-bordered w-full" placeholder="请输入密码" />
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="form-control w-full">
                <div class="label"><span class="label-text font-medium">姓名</span></div>
                <input name="name" required class="input input-bordered w-full" placeholder="请输入姓名" />
              </label>
              <label class="form-control w-full">
                <div class="label"><span class="label-text font-medium">邮箱</span></div>
                <input name="email" type="email" class="input input-bordered w-full" placeholder="请输入邮箱" />
              </label>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="form-control w-full">
                <div class="label"><span class="label-text font-medium">角色</span></div>
                <select name="role" class="select select-bordered w-full">
                  {roles.map((r) => (
                    <option value={r.code}>{r.name}</option>
                  ))}
                </select>
              </label>
              <label class="form-control w-full">
                <div class="label"><span class="label-text font-medium">状态</span></div>
                <select name="status" class="select select-bordered w-full">
                  <option value="active">启用</option>
                  <option value="inactive">停用</option>
                </select>
              </label>
            </div>
          </form>
          <div class="modal-action">
            <form method="dialog"><button class="btn btn-ghost btn-sm">取消</button></form>
            <button class="btn btn-primary btn-sm" data-action="submit-add-user">确认创建</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* 编辑用户弹窗 */}
      <dialog id="edit-user-modal" class="modal modal-bottom sm:modal-middle">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-5">编辑用户</h3>
          <form id="edit-user-form" class="space-y-4">
            <input type="hidden" name="id" />
            <label class="form-control w-full">
              <div class="label"><span class="label-text font-medium">用户名</span></div>
              <input name="username" required class="input input-bordered w-full" />
            </label>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="form-control w-full">
                <div class="label"><span class="label-text font-medium">姓名</span></div>
                <input name="name" required class="input input-bordered w-full" />
              </label>
              <label class="form-control w-full">
                <div class="label"><span class="label-text font-medium">邮箱</span></div>
                <input name="email" type="email" class="input input-bordered w-full" />
              </label>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="form-control w-full">
                <div class="label"><span class="label-text font-medium">角色</span></div>
                <select name="role" class="select select-bordered w-full">
                  {roles.map((r) => (
                    <option value={r.code}>{r.name}</option>
                  ))}
                </select>
              </label>
              <label class="form-control w-full">
                <div class="label"><span class="label-text font-medium">状态</span></div>
                <select name="status" class="select select-bordered w-full">
                  <option value="active">启用</option>
                  <option value="inactive">停用</option>
                </select>
              </label>
            </div>
          </form>
          <div class="modal-action">
            <form method="dialog"><button class="btn btn-ghost btn-sm">取消</button></form>
            <button class="btn btn-primary btn-sm" data-action="submit-edit-user">保存修改</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop"><button>close</button></form>
      </dialog>
    </div>
  )
}
