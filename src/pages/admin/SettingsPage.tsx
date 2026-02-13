import type { FC } from 'hono/jsx'

export const SettingsPage: FC = () => (
  <div class="stack-gap">
    <h2>系统设置</h2>
    <p>主题模式、皮肤及侧边栏状态通过 localStorage 持久化。</p>
  </div>
)
