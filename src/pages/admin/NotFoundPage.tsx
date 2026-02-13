import type { FC } from 'hono/jsx'

export const NotFoundPage: FC = () => (
  <div class="stack-gap">
    <h2>404</h2>
    <p>页面不存在。</p>
    <a href="/dashboard" class="link-btn">
      返回仪表盘
    </a>
  </div>
)
