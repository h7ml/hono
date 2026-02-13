import type { FC } from 'hono/jsx'
import type { UserListItem } from '../../types/app'
import { IconUser, IconMail, IconKey, IconCheck } from '../../components/icons'

interface ProfilePageProps {
  user: UserListItem
}

export const ProfilePage: FC<ProfilePageProps> = ({ user }) => (
  <div class="space-y-6 max-w-2xl">
    {/* 用户卡片 */}
    <div class="page-section overflow-hidden">
      <div class="sidebar-brand px-6 py-8 flex items-center gap-5">
        <div class="avatar placeholder">
          <div class="bg-white/20 text-white w-16 rounded-2xl text-2xl font-bold backdrop-blur-sm">
            <span>{user.name?.[0] ?? '?'}</span>
          </div>
        </div>
        <div>
          <div class="text-xl font-bold text-white">{user.name}</div>
          <div class="text-white/60 text-sm">@{user.username}</div>
          <div class="flex gap-2 mt-2">
            <span class="badge badge-sm bg-white/20 text-white border-0">{user.role}</span>
            <span class={`badge badge-sm border-0 ${user.status === 'active' ? 'bg-success/80 text-success-content' : 'bg-error/80 text-error-content'}`}>
              {user.status === 'active' ? '启用' : '停用'}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* 基本信息 */}
    <div class="page-section overflow-hidden">
      <div class="px-6 py-4 border-b border-base-300/30 flex items-center gap-2">
        <IconUser size={18} class="text-primary/60" />
        <h3 class="font-bold">基本信息</h3>
      </div>
      <div class="p-6">
        <form id="profile-form" class="space-y-4">
          <input type="hidden" name="id" value={user.id} />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="form-control w-full">
              <div class="label"><span class="label-text font-medium">姓名</span></div>
              <input name="name" value={user.name} required class="input input-bordered w-full" />
            </label>
            <label class="form-control w-full">
              <div class="label"><span class="label-text font-medium">邮箱</span></div>
              <div class="join w-full">
                <span class="join-item flex items-center px-3 bg-base-200">
                  <IconMail size={16} class="text-base-content/40" />
                </span>
                <input name="email" type="email" value={user.email} class="input input-bordered w-full join-item" />
              </div>
            </label>
          </div>
          <button type="button" class="btn btn-primary btn-sm gap-1.5" data-action="save-profile">
            <IconCheck size={14} />
            保存修改
          </button>
        </form>
      </div>
    </div>

    {/* 修改密码 */}
    <div class="page-section overflow-hidden">
      <div class="px-6 py-4 border-b border-base-300/30 flex items-center gap-2">
        <IconKey size={18} class="text-warning/60" />
        <h3 class="font-bold">修改密码</h3>
      </div>
      <div class="p-6">
        <form id="password-form" class="space-y-4">
          <label class="form-control w-full max-w-sm">
            <div class="label"><span class="label-text font-medium">当前密码</span></div>
            <input name="current_password" type="password" required class="input input-bordered w-full" placeholder="请输入当前密码" />
          </label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <label class="form-control w-full">
              <div class="label"><span class="label-text font-medium">新密码</span></div>
              <input name="new_password" type="password" required class="input input-bordered w-full" placeholder="请输入新密码" />
            </label>
            <label class="form-control w-full">
              <div class="label"><span class="label-text font-medium">确认新密码</span></div>
              <input name="confirm_password" type="password" required class="input input-bordered w-full" placeholder="再次输入新密码" />
            </label>
          </div>
          <button type="button" class="btn btn-warning btn-sm gap-1.5" data-action="change-password">
            <IconKey size={14} />
            修改密码
          </button>
        </form>
      </div>
    </div>
  </div>
)
