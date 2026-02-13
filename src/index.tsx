import type { FC } from 'hono/jsx'
import { Context, Hono } from 'hono'
import { AdminLayout } from './components/layout/AdminLayout'
import { AuthLayout } from './components/layout/AuthLayout'
import { appRoutes } from './config/routes'
import { clearSession, readSession, writeSession } from './lib/auth'
import { hasPermission, loadPermissionsForRole } from './lib/permissions'

import { findActiveUserByCredentials, getUsersPage, getUserById, createUser, updateUser, deleteUser, toggleUserStatus } from './lib/db/users'
import { getAllRoles, getAllRolesWithPermissions, createRole, updateRole, deleteRole, setRolePermissions } from './lib/db/roles'
import { getAllPermissions, getPermissionsGroupedByResource } from './lib/db/permissions'
import { getAllSettings, getSettingsGrouped, updateSetting } from './lib/db/settings'
import { getAuditLogsPage, writeAuditLog, getDashboardStats } from './lib/db/audit'

import {
  DashboardPage, UsersPage, RolesPage, PermissionsPage,
  SettingsPage, ProfilePage, AuditLogsPage,
  ForbiddenPage, NotFoundPage
} from './pages/admin'
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage
} from './pages/auth'
import { renderer } from './renderer'

type AppContext = Context<{ Bindings: CloudflareBindings }>

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use(renderer)

function renderAdminPage(
  path: string,
  title: string,
  content: JSX.Element,
  c: AppContext,
  permission?: `${string}:${string}` | '*'
) {
  const session = readSession(c)
  if (!session) {
    return c.redirect(`/login?redirect=${encodeURIComponent(path)}`)
  }
  if (!hasPermission(session.permissions, permission)) {
    return c.render(
      <AdminLayout
        currentPath={path}
        permissions={session.permissions}
        title="无权限"
        userName={session.name}
      >
        <ForbiddenPage />
      </AdminLayout>
    )
  }
  return c.render(
    <AdminLayout
      currentPath={path}
      permissions={session.permissions}
      title={title}
      userName={session.name}
    >
      {content}
    </AdminLayout>
  )
}

function getSession(c: AppContext) {
  return readSession(c)
}

function getClientIp(c: Context) {
  return c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? ''
}

// ── SSR 页面路由 ──

app.get('/', (c) => c.redirect('/dashboard'))

app.get('/dashboard', async (c) => {
  const stats = await getDashboardStats(c.env.DB)
  return renderAdminPage('/dashboard', '仪表盘', <DashboardPage stats={stats} />, c, 'dashboard:view')
})

app.get('/users', async (c) => {
  const page = Number(c.req.query('page') ?? '1')
  const search = c.req.query('q') ?? ''
  const role = c.req.query('role') ?? ''
  const status = c.req.query('status') ?? ''
  const data = await getUsersPage(c.env.DB, { page, pageSize: 10, search, role, status })
  const roles = await getAllRoles(c.env.DB)
  return renderAdminPage('/users', '用户管理', <UsersPage data={data} roles={roles} query={{ search, role, status }} />, c, 'users:list')
})

app.get('/roles', async (c) => {
  const roles = await getAllRolesWithPermissions(c.env.DB)
  const allPermissions = await getAllPermissions(c.env.DB)
  return renderAdminPage('/roles', '角色管理', <RolesPage roles={roles} allPermissions={allPermissions} />, c, 'roles:list')
})

app.get('/permissions', async (c) => {
  const grouped = await getPermissionsGroupedByResource(c.env.DB)
  return renderAdminPage('/permissions', '权限管理', <PermissionsPage grouped={grouped} />, c, 'permissions:list')
})

app.get('/settings', async (c) => {
  const groups = await getSettingsGrouped(c.env.DB)
  return renderAdminPage('/settings', '系统设置', <SettingsPage groups={groups} />, c, 'settings:view')
})

app.get('/audit-logs', async (c) => {
  const page = Number(c.req.query('page') ?? '1')
  const data = await getAuditLogsPage(c.env.DB, { page, pageSize: 20 })
  return renderAdminPage('/audit-logs', '审计日志', <AuditLogsPage data={data} />, c, 'audit:list')
})

app.get('/profile', async (c) => {
  const session = readSession(c)
  const user = session ? await getUserById(c.env.DB, session.id) : null
  return renderAdminPage(
    '/profile', '个人资料',
    <ProfilePage user={user ?? { id: 0, username: '', name: session?.name ?? '', email: '', role: session?.role ?? '', status: 'active' }} />,
    c
  )
})

// ── 认证页面 ──

app.get('/login', (c) => {
  if (readSession(c)) return c.redirect('/dashboard')
  const error = c.req.query('error')
  return c.render(
    <AuthLayout title="登录 HaloLight">
      {error ? <div class="alert alert-error text-sm">登录失败：用户名或密码错误</div> : null}
      <LoginPage />
    </AuthLayout>
  )
})

app.post('/login', async (c) => {
  const body = await c.req.parseBody()
  const username = (body.username ?? '').toString().trim()
  const password = (body.password ?? '').toString()
  if (!username || !password) return c.redirect('/login?error=invalid_credentials')
  const user = await findActiveUserByCredentials(c.env.DB, username, password)
  if (!user) return c.redirect('/login?error=invalid_credentials')
  const permissions = await loadPermissionsForRole(c.env.DB, user.role)
  writeSession(c, { id: user.id, name: user.name, role: user.role, permissions })
  return c.redirect(c.req.query('redirect') ?? '/dashboard')
})

app.get('/logout', (c) => {
  clearSession(c)
  return c.redirect('/login')
})

app.get('/register', (c) => {
  if (readSession(c)) return c.redirect('/dashboard')
  return c.render(
    <AuthLayout title="注册账号">
      <RegisterPage />
    </AuthLayout>
  )
})

app.get('/forgot-password', (c) => {
  if (readSession(c)) return c.redirect('/dashboard')
  return c.render(
    <AuthLayout title="找回密码">
      <ForgotPasswordPage />
    </AuthLayout>
  )
})

app.get('/reset-password', (c) => {
  if (readSession(c)) return c.redirect('/dashboard')
  return c.render(
    <AuthLayout title="重置密码">
      <ResetPasswordPage />
    </AuthLayout>
  )
})

// ── 认证 API ──

app.post('/api/auth/login', async (c) => {
  const body = await c.req.json<{ username?: string; password?: string }>()
  const username = (body.username ?? '').trim()
  const password = body.password ?? ''
  if (!username || !password) {
    return c.json({ code: 'INVALID_INPUT', message: '用户名和密码不能为空' }, 400)
  }
  const user = await findActiveUserByCredentials(c.env.DB, username, password)
  if (!user) {
    return c.json({ code: 'UNAUTHORIZED', message: '用户名或密码错误' }, 401)
  }
  const permissions = await loadPermissionsForRole(c.env.DB, user.role)
  writeSession(c, { id: user.id, name: user.name, role: user.role, permissions })
  return c.json({ id: user.id, name: user.name, role: user.role, permissions })
})

// ── 数据 API ──

app.get('/api/routes', (c) => c.json({ list: appRoutes }))

app.get('/api/dashboard/stats', async (c) => {
  const data = await getDashboardStats(c.env.DB)
  return c.json(data)
})

// Users API
app.get('/api/users', async (c) => {
  const page = Number(c.req.query('page') ?? '1')
  const pageSize = Number(c.req.query('pageSize') ?? '10')
  const search = c.req.query('q') ?? ''
  const role = c.req.query('role') ?? ''
  const status = c.req.query('status') ?? ''
  const data = await getUsersPage(c.env.DB, { page, pageSize, search, role, status })
  return c.json(data)
})

app.post('/api/users', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'users:create')) return c.json({ error: 'Forbidden' }, 403)
  const body = await c.req.json()
  const user = await createUser(c.env.DB, body)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'users:create', resource_type: 'user',
    resource_id: String(user?.id ?? ''), detail: `创建用户 ${body.username}`,
    ip: getClientIp(c)
  })
  return c.json({ ok: true, data: user })
})

app.put('/api/users/:id', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'users:update')) return c.json({ error: 'Forbidden' }, 403)
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const user = await updateUser(c.env.DB, id, body)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'users:update', resource_type: 'user',
    resource_id: String(id), detail: `更新用户 #${id}`,
    ip: getClientIp(c)
  })
  return c.json({ ok: true, data: user })
})

app.delete('/api/users/:id', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'users:delete')) return c.json({ error: 'Forbidden' }, 403)
  const id = Number(c.req.param('id'))
  const ok = await deleteUser(c.env.DB, id)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'users:delete', resource_type: 'user',
    resource_id: String(id), detail: `删除用户 #${id}`,
    ip: getClientIp(c)
  })
  return c.json({ ok })
})

app.patch('/api/users/:id/status', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'users:update')) return c.json({ error: 'Forbidden' }, 403)
  const id = Number(c.req.param('id'))
  const user = await toggleUserStatus(c.env.DB, id)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'users:update', resource_type: 'user',
    resource_id: String(id), detail: `切换用户 #${id} 状态`,
    ip: getClientIp(c)
  })
  return c.json({ ok: true, data: user })
})

// Roles API
app.get('/api/roles', async (c) => {
  const data = await getAllRolesWithPermissions(c.env.DB)
  return c.json(data)
})

app.post('/api/roles', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'roles:create')) return c.json({ error: 'Forbidden' }, 403)
  const body = await c.req.json()
  const role = await createRole(c.env.DB, body)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'roles:create', resource_type: 'role',
    resource_id: String(role?.id ?? ''), detail: `创建角色 ${body.code}`,
    ip: getClientIp(c)
  })
  return c.json({ ok: true, data: role })
})

app.put('/api/roles/:id', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'roles:update')) return c.json({ error: 'Forbidden' }, 403)
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const role = await updateRole(c.env.DB, id, body)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'roles:update', resource_type: 'role',
    resource_id: String(id), detail: `更新角色 #${id}`,
    ip: getClientIp(c)
  })
  return c.json({ ok: true, data: role })
})

app.delete('/api/roles/:id', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'roles:delete')) return c.json({ error: 'Forbidden' }, 403)
  const id = Number(c.req.param('id'))
  const ok = await deleteRole(c.env.DB, id)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'roles:delete', resource_type: 'role',
    resource_id: String(id), detail: `删除角色 #${id}`,
    ip: getClientIp(c)
  })
  return c.json({ ok })
})

app.put('/api/roles/:id/permissions', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'roles:update')) return c.json({ error: 'Forbidden' }, 403)
  const id = Number(c.req.param('id'))
  const body = await c.req.json<{ permissionIds: number[] }>()
  await setRolePermissions(c.env.DB, id, body.permissionIds)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'roles:update', resource_type: 'role',
    resource_id: String(id), detail: `更新角色 #${id} 权限 (${body.permissionIds.length} 项)`,
    ip: getClientIp(c)
  })
  return c.json({ ok: true })
})

// Permissions API
app.get('/api/permissions', async (c) => {
  const data = await getAllPermissions(c.env.DB)
  return c.json(data)
})

// Settings API
app.get('/api/settings', async (c) => {
  const data = await getAllSettings(c.env.DB)
  return c.json(data)
})

app.put('/api/settings/:key', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'settings:update')) return c.json({ error: 'Forbidden' }, 403)
  const key = c.req.param('key')
  const body = await c.req.json<{ value: string }>()
  await updateSetting(c.env.DB, key, body.value)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'settings:update', resource_type: 'setting',
    resource_id: key, detail: `更新设置 ${key}`,
    ip: getClientIp(c)
  })
  return c.json({ ok: true })
})

// Audit Logs API
app.get('/api/audit-logs', async (c) => {
  const page = Number(c.req.query('page') ?? '1')
  const pageSize = Number(c.req.query('pageSize') ?? '20')
  const data = await getAuditLogsPage(c.env.DB, { page, pageSize })
  return c.json(data)
})

// ── 404 ──

app.notFound((c) => {
  const session = readSession(c)
  if (session) {
    return c.render(
      <AdminLayout currentPath="" permissions={session.permissions} title="页面未找到" userName={session.name}>
        <NotFoundPage />
      </AdminLayout>
    )
  }
  return c.render(
    <AuthLayout title="404">
      <div class="space-y-3">
        <p>页面不存在。</p>
        <a href="/login" class="btn btn-primary btn-sm">返回登录</a>
      </div>
    </AuthLayout>
  )
})

export default app
