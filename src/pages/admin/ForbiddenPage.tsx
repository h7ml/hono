import type { FC } from 'hono/jsx'

export const ForbiddenPage: FC = () => (
  <div class="space-y-3">
    <h2 class="text-xl font-bold">403</h2>
    <p>当前账户无权访问该页面。</p>
    <a href="/dashboard" class="btn btn-primary btn-sm">返回仪表盘</a>
  </div>
)
