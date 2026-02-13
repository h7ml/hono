import type { FC } from 'hono/jsx'

export const UsersPage: FC = () => (
  <div class="space-y-3">
    <h2 class="text-xl font-bold">用户管理</h2>
    <p>后端接口 `/api/users` 已对接 Cloudflare D1 并返回标准分页结构。</p>
  </div>
)
