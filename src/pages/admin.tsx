import type { FC } from 'hono/jsx'

export const DashboardPage: FC = () => (
  <div class="stack-gap">
    <h2>仪表盘</h2>
    <div class="grid">
      <article class="widget">
        <h3>活跃用户</h3>
        <p>1,284</p>
      </article>
      <article class="widget">
        <h3>今日请求</h3>
        <p>9,430</p>
      </article>
      <article class="widget">
        <h3>异常告警</h3>
        <p>2</p>
      </article>
    </div>
  </div>
)

export const UsersPage: FC = () => (
  <div class="stack-gap">
    <h2>用户管理</h2>
    <p>此页面已对齐 `users:list` 页面权限与分页响应结构。</p>
  </div>
)

export const RolesPage: FC = () => (
  <div class="stack-gap">
    <h2>角色管理</h2>
    <p>内置 `admin / manager / viewer` 示例角色与权限映射。</p>
  </div>
)

export const PermissionsPage: FC = () => (
  <div class="stack-gap">
    <h2>权限管理</h2>
    <p>权限格式统一为 `resource:action`，支持 `*` 和 `resource:*`。</p>
  </div>
)

export const SettingsPage: FC = () => (
  <div class="stack-gap">
    <h2>系统设置</h2>
    <p>主题模式、皮肤及侧边栏状态通过 localStorage 持久化。</p>
  </div>
)

export const ProfilePage: FC = () => (
  <div class="stack-gap">
    <h2>个人资料</h2>
    <p>登录后可访问，不需要额外权限。</p>
  </div>
)

export const ForbiddenPage: FC = () => (
  <div class="stack-gap">
    <h2>403</h2>
    <p>当前账户无权访问该页面。</p>
    <a href="/dashboard" class="link-btn">
      返回仪表盘
    </a>
  </div>
)
