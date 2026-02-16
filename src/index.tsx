import type { Child } from 'hono/jsx'
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
import { getAllCheckinAccounts, createCheckinAccount, updateCheckinAccount, deleteCheckinAccount, toggleCheckinAccountStatus, getCheckinLogsPage } from './lib/db/checkin'
import { getAllCronTasks, createCronTask, updateCronTask, deleteCronTask, toggleCronTaskStatus, getCronTaskLogsPage } from './lib/db/cron-tasks'
import { getSetting } from './lib/db/settings'
import { runCheckin, runCheckinSingle } from './lib/checkin'
import { parseCurl, cronNextRun, executeCronTask, runDueCronTasks, sendDailySummary } from './lib/cron-runner'
import { getCronTaskById } from './lib/db/cron-tasks'

import {
  DashboardPage, UsersPage, RolesPage, PermissionsPage,
  SettingsPage, ProfilePage, AuditLogsPage, CheckinPage, CronTasksPage,
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
  content: Child,
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

app.get('/cron/anyrouter', async (c) => {
  const accounts = await getAllCheckinAccounts(c.env.DB)
  const logPage = Number(c.req.query('logPage') ?? '1')
  const logs = await getCheckinLogsPage(c.env.DB, { page: logPage, pageSize: 20 })
  const tokenSetting = await getSetting(c.env.DB, 'notification.pushplus_token')
  return renderAdminPage('/cron/anyrouter', 'AnyRouter', <CheckinPage accounts={accounts} logs={logs} pushplusToken={tokenSetting?.value ?? ''} />, c, 'checkin:list')
})

app.get('/cron/tasks', async (c) => {
  const tasks = await getAllCronTasks(c.env.DB)
  const logPage = Number(c.req.query('logPage') ?? '1')
  const logs = await getCronTaskLogsPage(c.env.DB, { page: logPage, pageSize: 20 })
  return renderAdminPage('/cron/tasks', '通用任务', <CronTasksPage tasks={tasks} logs={logs} />, c, 'crontask:list')
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

// Checkin API
app.get('/api/checkin/accounts', async (c) => {
  const data = await getAllCheckinAccounts(c.env.DB)
  return c.json(data)
})

app.post('/api/checkin/accounts', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'checkin:create')) return c.json({ error: 'Forbidden' }, 403)
  const body = await c.req.json()
  const account = await createCheckinAccount(c.env.DB, body)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'checkin:create', resource_type: 'checkin_account',
    resource_id: String(account?.id ?? ''), detail: `添加签到账户 ${body.label}`,
    ip: getClientIp(c)
  })
  return c.json({ ok: true, data: account })
})

app.put('/api/checkin/accounts/:id', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'checkin:update')) return c.json({ error: 'Forbidden' }, 403)
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  const account = await updateCheckinAccount(c.env.DB, id, body)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'checkin:update', resource_type: 'checkin_account',
    resource_id: String(id), detail: `更新签到账户 #${id}`,
    ip: getClientIp(c)
  })
  return c.json({ ok: true, data: account })
})

app.delete('/api/checkin/accounts/:id', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'checkin:delete')) return c.json({ error: 'Forbidden' }, 403)
  const id = Number(c.req.param('id'))
  const ok = await deleteCheckinAccount(c.env.DB, id)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'checkin:delete', resource_type: 'checkin_account',
    resource_id: String(id), detail: `删除签到账户 #${id}`,
    ip: getClientIp(c)
  })
  return c.json({ ok })
})

app.patch('/api/checkin/accounts/:id/status', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'checkin:update')) return c.json({ error: 'Forbidden' }, 403)
  const id = Number(c.req.param('id'))
  const account = await toggleCheckinAccountStatus(c.env.DB, id)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'checkin:update', resource_type: 'checkin_account',
    resource_id: String(id), detail: `切换签到账户 #${id} 状态`,
    ip: getClientIp(c)
  })
  return c.json({ ok: true, data: account })
})

app.post('/api/checkin/run', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'checkin:run')) return c.json({ error: 'Forbidden' }, 403)
  const message = await runCheckin(c.env.DB)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'checkin:run', resource_type: 'checkin',
    resource_id: '', detail: '手动执行签到',
    ip: getClientIp(c)
  })
  return c.json({ ok: true, message })
})

app.post('/api/checkin/run/:id', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'checkin:run')) return c.json({ error: 'Forbidden' }, 403)
  const id = Number(c.req.param('id'))
  const message = await runCheckinSingle(c.env.DB, id)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'checkin:run', resource_type: 'checkin_account',
    resource_id: String(id), detail: `单个签到 #${id}`,
    ip: getClientIp(c)
  })
  return c.json({ ok: true, message })
})

app.get('/api/checkin/logs', async (c) => {
  const page = Number(c.req.query('page') ?? '1')
  const pageSize = Number(c.req.query('pageSize') ?? '20')
  const data = await getCheckinLogsPage(c.env.DB, { page, pageSize })
  return c.json(data)
})

// Cron Tasks API
app.get('/api/cron/tasks', async (c) => {
  const data = await getAllCronTasks(c.env.DB)
  return c.json(data)
})

app.post('/api/cron/tasks', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'crontask:create')) return c.json({ error: 'Forbidden' }, 403)
  const body = await c.req.json()
  const nextRun = cronNextRun(body.cron_expr).toISOString()
  const task = await createCronTask(c.env.DB, { ...body, next_run_at: nextRun })
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'crontask:create', resource_type: 'cron_task',
    resource_id: String(task?.id ?? ''), detail: `创建定时任务 ${body.name}`,
    ip: getClientIp(c)
  })
  return c.json({ ok: true, data: task })
})

app.put('/api/cron/tasks/:id', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'crontask:update')) return c.json({ error: 'Forbidden' }, 403)
  const id = Number(c.req.param('id'))
  const body = await c.req.json()
  if (body.cron_expr) body.next_run_at = cronNextRun(body.cron_expr).toISOString()
  const task = await updateCronTask(c.env.DB, id, body)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'crontask:update', resource_type: 'cron_task',
    resource_id: String(id), detail: `更新定时任务 #${id}`,
    ip: getClientIp(c)
  })
  return c.json({ ok: true, data: task })
})

app.delete('/api/cron/tasks/:id', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'crontask:delete')) return c.json({ error: 'Forbidden' }, 403)
  const id = Number(c.req.param('id'))
  const ok = await deleteCronTask(c.env.DB, id)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'crontask:delete', resource_type: 'cron_task',
    resource_id: String(id), detail: `删除定时任务 #${id}`,
    ip: getClientIp(c)
  })
  return c.json({ ok })
})

app.patch('/api/cron/tasks/:id/status', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'crontask:update')) return c.json({ error: 'Forbidden' }, 403)
  const id = Number(c.req.param('id'))
  const task = await toggleCronTaskStatus(c.env.DB, id)
  if (task && task.status === 'active') {
    await updateCronTask(c.env.DB, id, { next_run_at: cronNextRun(task.cron_expr).toISOString() })
  }
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'crontask:update', resource_type: 'cron_task',
    resource_id: String(id), detail: `切换定时任务 #${id} 状态`,
    ip: getClientIp(c)
  })
  return c.json({ ok: true, data: task })
})

app.post('/api/cron/tasks/:id/run', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'crontask:run')) return c.json({ error: 'Forbidden' }, 403)
  const id = Number(c.req.param('id'))
  const task = await getCronTaskById(c.env.DB, id)
  if (!task) return c.json({ error: 'Not found' }, 404)
  const result = await executeCronTask(c.env.DB, task, 'manual')
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'crontask:run', resource_type: 'cron_task',
    resource_id: String(id), detail: `手动执行定时任务 ${task.name}`,
    ip: getClientIp(c)
  })
  return c.json({ ok: result.ok, message: result.msg })
})

app.post('/api/cron/tasks/parse-curl', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  const body = await c.req.json<{ curl: string }>()
  const parsed = parseCurl(body.curl)
  return c.json(parsed)
})

app.post('/api/cron/daily-summary', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'crontask:run')) return c.json({ error: 'Forbidden' }, 403)
  await sendDailySummary(c.env.DB)
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'crontask:run', resource_type: 'daily_summary',
    resource_id: '', detail: '手动发送每日汇总',
    ip: getClientIp(c)
  })
  return c.json({ ok: true, message: '汇总已发送' })
})

app.post('/api/cron/tasks/batch-run', async (c) => {
  const session = getSession(c)
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  if (!hasPermission(session.permissions, 'crontask:run')) return c.json({ error: 'Forbidden' }, 403)
  const body = await c.req.json<{ ids: number[] }>()
  if (!body.ids?.length) return c.json({ error: '请选择任务' }, 400)
  const results: string[] = []
  for (const id of body.ids) {
    const task = await getCronTaskById(c.env.DB, id)
    if (!task) { results.push(`#${id}: 不存在`); continue }
    const r = await executeCronTask(c.env.DB, task, 'manual')
    results.push(`${task.name}: ${r.ok ? '成功' : '失败'} - ${r.msg}`)
  }
  await writeAuditLog(c.env.DB, {
    user_id: session.id, user_name: session.name,
    action: 'crontask:run', resource_type: 'cron_task',
    resource_id: body.ids.join(','), detail: `批量执行 ${body.ids.length} 个任务`,
    ip: getClientIp(c)
  })
  return c.json({ ok: true, message: results.join('\n') })
})

app.get('/api/cron/tasks/logs', async (c) => {
  const page = Number(c.req.query('page') ?? '1')
  const pageSize = Number(c.req.query('pageSize') ?? '20')
  const data = await getCronTaskLogsPage(c.env.DB, { page, pageSize })
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

const cronHandlers: Record<string, (db: D1Database) => Promise<unknown>> = {
  '0 0 * * *': async (db) => { await runCheckin(db); await sendDailySummary(db) },
  '*/5 * * * *': runDueCronTasks,
}

const scheduled: ExportedHandlerScheduledHandler<CloudflareBindings> = async (event, env, ctx) => {
  const handler = cronHandlers[event.cron]
  if (handler) ctx.waitUntil(handler(env.DB))
}

export default { fetch: app.fetch, scheduled }
