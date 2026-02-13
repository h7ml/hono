import type { FC } from 'hono/jsx'

export const PermissionsPage: FC = () => (
  <div class="stack-gap">
    <h2>权限管理</h2>
    <p>权限格式统一为 `resource:action`，支持 `*` 和 `resource:*`。</p>
  </div>
)
