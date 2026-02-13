import type { FC } from 'hono/jsx'

export const NotFoundPage: FC = () => (
  <div class="space-y-3">
    <h2 class="text-xl font-bold">404</h2>
    <p>页面不存在。</p>
    <a href="/dashboard" class="btn btn-primary btn-sm">返回仪表盘</a>
  </div>
)
