import type { FC, PropsWithChildren } from 'hono/jsx'
import { appRoutes, routeGroups } from '../../config/routes'
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
  const matched = appRoutes.find((r) => r.path === currentPath)
  const breadcrumb = matched?.meta.breadcrumb ?? [title]

  return (
    <div class="drawer lg:drawer-open">
      <input id="sidebar-toggle" type="checkbox" class="drawer-toggle" />

      {/* 主内容区 */}
      <div class="drawer-content flex flex-col min-h-screen">
        {/* Navbar */}
        <header class="navbar bg-base-100/70 backdrop-blur-lg border-b border-base-300/50 px-4 lg:px-6 gap-2 sticky top-0 z-30">
          <div class="flex-none lg:hidden">
            <label for="sidebar-toggle" class="btn btn-ghost btn-sm btn-square">
              {(() => {
                const Icon = iconMap['menu']
                return Icon ? <Icon size={20} /> : null
              })()}
            </label>
          </div>

          <div class="flex-1 min-w-0">
            <div class="breadcrumbs text-sm">
              <ul>
                {breadcrumb.map((item, i) => (
                  <li class={i === breadcrumb.length - 1 ? 'text-base-content/50' : 'text-base-content/70'}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div class="flex-none flex items-center gap-1.5">
            <select id="themeMode" class="select select-bordered select-xs w-20" aria-label="主题模式">
              <option value="system">🌗 Auto</option>
              <option value="light">☀️ Light</option>
              <option value="dark">🌙 Dark</option>
            </select>
            <select id="skinName" class="select select-bordered select-xs w-24" aria-label="皮肤">
              {skinOptions.map((s) => (
                <option value={s}>{s}</option>
              ))}
            </select>
            <div class="divider divider-horizontal mx-0 h-6" />
            <a href="/logout" class="btn btn-ghost btn-sm gap-1.5 text-error/70 hover:text-error">
              {(() => {
                const Icon = iconMap['logout']
                return Icon ? <Icon size={16} /> : null
              })()}
              <span class="hidden sm:inline">退出</span>
            </a>
          </div>
        </header>

        {/* 页面内容 */}
        <main class="flex-1 p-4 lg:p-6 animate-fade-in-up">
          {children}
        </main>

        <footer class="text-center text-xs text-base-content/30 py-4 border-t border-base-300/30">
          HaloLight Admin &copy; {new Date().getFullYear()}
        </footer>
      </div>

      {/* 侧边栏 */}
      <div class="drawer-side z-40">
        <label for="sidebar-toggle" class="drawer-overlay" />
        <aside class="sidebar-glass border-r border-base-300/40 w-64 min-h-screen flex flex-col" aria-label="主导航">
          {/* Brand Header */}
          <div class="sidebar-brand px-5 py-5 flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <span class="text-white font-black text-lg">H</span>
            </div>
            <div>
              <div class="text-white font-bold text-base tracking-wide leading-tight">HaloLight</div>
              <div class="text-white/60 text-[10px] tracking-widest uppercase">Admin Panel</div>
            </div>
          </div>

          {/* Navigation */}
          <ul class="menu menu-md flex-1 px-3 py-4 gap-0.5 overflow-y-auto">
            {routeGroups.map((group) => {
              const visible = group.children.filter((r) =>
                hasPermission(permissions, r.meta.permission)
              )
              if (!visible.length) return null
              return (
                <>
                  {group.label && (
                    <li class="menu-title text-[10px] uppercase tracking-[0.15em] text-base-content/40 mt-5 mb-1 px-3">
                      {group.label}
                    </li>
                  )}
                  {visible.map((route) => {
                    const Icon = iconMap[route.meta.icon]
                    const isActive = currentPath === route.path
                    return (
                      <li>
                        <a
                          href={route.path}
                          class={isActive ? 'active font-semibold' : 'hover:bg-base-content/5'}
                          aria-current={isActive ? 'page' : undefined}
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

          {/* User Section */}
          <div class="border-t border-base-300/30 px-4 py-3">
            <a href="/profile" class="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-base-content/5 transition-colors">
              <div class="avatar placeholder">
                <div class="bg-primary text-primary-content w-9 rounded-full text-sm font-bold">
                  <span>{userName?.[0] ?? '?'}</span>
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-semibold truncate">{userName}</div>
                <div class="text-[10px] text-base-content/40">管理员</div>
              </div>
            </a>
          </div>
        </aside>
      </div>
    </div>
  )
}
