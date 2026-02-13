import type { FC, PropsWithChildren } from 'hono/jsx'
import { routeGroups } from '../../config/routes'
import { iconMap } from '../icons'
import { hasPermission } from '../../lib/permissions'
import type { Permission } from '../../types/app'

interface AdminLayoutProps {
  currentPath: string
  permissions: Permission[]
  title: string
  userName: string
}

const skinOptions = [
  'default','zinc','slate','stone','gray','neutral',
  'red','rose','orange','green','blue','yellow','violet'
] as const

export const AdminLayout: FC<PropsWithChildren<AdminLayoutProps>> = ({
  children,
  currentPath,
  permissions,
  title,
  userName
}) => {
  return (
    <div class="drawer lg:drawer-open">
      <input id="sidebar-toggle" type="checkbox" class="drawer-toggle" />

      {/* 主内容区 */}
      <div class="drawer-content flex flex-col min-h-screen">
        {/* navbar */}
        <header class="navbar bg-base-100/80 backdrop-blur border-b border-base-300 px-4 gap-2">
          <div class="flex-none lg:hidden">
            <label for="sidebar-toggle" class="btn btn-ghost btn-sm btn-square">
              {(() => {
                const Icon = iconMap['menu']
                return Icon ? <Icon /> : null
              })()}
            </label>
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-lg font-bold truncate">{title}</h1>
          </div>
          <div class="flex-none flex items-center gap-2 flex-wrap">
            <select id="themeMode" class="select select-bordered select-xs" aria-label="主题模式">
              <option value="system">system</option>
              <option value="light">light</option>
              <option value="dark">dark</option>
            </select>
            <select id="skinName" class="select select-bordered select-xs" aria-label="皮肤">
              {skinOptions.map((s) => (
                <option value={s}>{s}</option>
              ))}
            </select>
            <span class="badge badge-outline">{userName}</span>
            <a href="/logout" class="btn btn-ghost btn-sm gap-1">
              {(() => {
                const Icon = iconMap['logout']
                return Icon ? <Icon size={16} /> : null
              })()}
              退出
            </a>
          </div>
        </header>

        {/* 页面内容 */}
        <main class="flex-1 p-4">
          <div class="card bg-base-100 border border-base-300">
            <div class="card-body p-4">{children}</div>
          </div>
        </main>
      </div>

      {/* 侧边栏 */}
      <div class="drawer-side z-40">
        <label for="sidebar-toggle" class="drawer-overlay" />
        <aside class="sidebar-glass border-r border-base-300 w-64 min-h-screen flex flex-col" aria-label="主导航">
          <div class="px-5 py-4 text-lg font-bold tracking-wide">HaloLight Admin</div>
          <ul class="menu menu-md flex-1 px-3 gap-0.5">
            {routeGroups.map((group) => {
              const visible = group.children.filter((r) =>
                hasPermission(permissions, r.meta.permission)
              )
              if (!visible.length) return null
              return (
                <>
                  {group.label && (
                    <li class="menu-title text-xs uppercase tracking-wider opacity-60 mt-4">
                      {group.label}
                    </li>
                  )}
                  {visible.map((route) => {
                    const Icon = iconMap[route.meta.icon]
                    return (
                      <li>
                        <a
                          href={route.path}
                          class={currentPath === route.path ? 'active' : ''}
                        >
                          {Icon ? <Icon size={18} /> : null}
                          {route.meta.title}
                        </a>
                      </li>
                    )
                  })}
                </>
              )
            })}
          </ul>
        </aside>
      </div>
    </div>
  )
}
