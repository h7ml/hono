import type { FC } from 'hono/jsx'

export const ProfilePage: FC = () => (
  <div class="space-y-3">
    <h2 class="text-xl font-bold">个人资料</h2>
    <p>登录后可访问，不需要额外权限。</p>
  </div>
)
