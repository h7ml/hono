import type { FC, PropsWithChildren } from 'hono/jsx'
import { routeGroups } from '../../config/routes'
import { hasPermission } from '../../lib/permissions'
import type { Permission } from '../../types/app'

interface AdminLayoutProps {
  currentPath: string
  permissions: Permission[]
  title: string
  userName: string
}

export const AdminLayout: FC<PropsWithChildren<AdminLayoutProps>> = ({
  children,
  currentPath,
  permissions,
  title,
  userName
}) => {
  return (
    <div class="shell">
      <aside class="sidebar" aria-label="主导航">
        <div class="brand">HaloLight Admin</div>
        <nav class="nav-list">
          {routeGroups.map((group) => {
            const visible = group.children.filter((r) =>
              hasPermission(permissions, r.meta.permission)
            )
            if (!visible.length) return null
            return (
              <>
                {group.label && <div class="nav-group-label">{group.label}</div>}
                {visible.map((route) => (
                  <a
                    href={route.path}
                    class={currentPath === route.path ? 'nav-item active' : 'nav-item'}
                  >
                    <span aria-hidden="true">{route.meta.icon}</span>
                    <span>{route.meta.title}</span>
                  </a>
                ))}
              </>
            )
          })}
        </nav>
      </aside>

      <main class="content">
        <header class="topbar">
          <div>
            <h1>{title}</h1>
            <p class="subtle">统一 IA / 权限 / 主题 / Mock 规范骨架</p>
          </div>
          <div class="top-actions">
            <label class="picker">
              主题
              <select id="themeMode" aria-label="主题模式">
                <option value="system">system</option>
                <option value="light">light</option>
                <option value="dark">dark</option>
              </select>
            </label>
            <label class="picker">
              皮肤
              <select id="skinName" aria-label="皮肤">
                <option value="default">default</option>
                <option value="zinc">zinc</option>
                <option value="slate">slate</option>
                <option value="stone">stone</option>
                <option value="gray">gray</option>
                <option value="neutral">neutral</option>
                <option value="red">red</option>
                <option value="rose">rose</option>
                <option value="orange">orange</option>
                <option value="green">green</option>
                <option value="blue">blue</option>
                <option value="yellow">yellow</option>
                <option value="violet">violet</option>
              </select>
            </label>
            <span class="user-tag">{userName}</span>
            <a href="/logout" class="link-btn">
              退出
            </a>
          </div>
        </header>

        <section class="page-card">{children}</section>
      </main>
    </div>
  )
}
