import type { FC } from 'hono/jsx'

export const ForbiddenPage: FC = () => (
  <div class="stack-gap">
    <h2>403</h2>
    <p>当前账户无权访问该页面。</p>
    <a href="/dashboard" class="link-btn">
      返回仪表盘
    </a>
  </div>
)
