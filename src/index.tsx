import { Context, Hono } from 'hono'
import { AdminLayout } from './components/layout/AdminLayout'
import { AuthLayout } from './components/layout/AuthLayout'
import { appRoutes } from './config/routes'
import { clearSession, readSession, writeSession } from './lib/auth'
import { hasPermission } from './lib/permissions'
import { getUsersPage } from './mocks/data'
import {
  DashboardPage,
  ForbiddenPage,
  PermissionsPage,
  ProfilePage,
  RolesPage,
  SettingsPage,
  UsersPage
} from './pages/admin'
import {
  ForgotPasswordPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage
} from './pages/auth'
import { renderer } from './renderer'

const app = new Hono()

app.use(renderer)

function redirectToLogin(path: string): Response {
  return Response.redirect(`/login?redirect=${encodeURIComponent(path)}`, 302)
}

function renderAdminPage(
  path: string,
  title: string,
  content: JSX.Element,
  c: Context,
  permission?: `${string}:${string}` | '*'
): Response {
  const session = readSession(c)
  if (!session) {
    return redirectToLogin(path)
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

app.get('/', (c) => c.redirect('/dashboard'))

app.get('/dashboard', (c) => {
  return renderAdminPage('/dashboard', '仪表盘', <DashboardPage />, c, 'dashboard:view')
})

app.get('/users', (c) => {
  return renderAdminPage('/users', '用户管理', <UsersPage />, c, 'users:list')
})

app.get('/roles', (c) => {
  return renderAdminPage('/roles', '角色管理', <RolesPage />, c, 'roles:list')
})

app.get('/permissions', (c) => {
  return renderAdminPage('/permissions', '权限管理', <PermissionsPage />, c, 'permissions:list')
})

app.get('/settings', (c) => {
  return renderAdminPage('/settings', '系统设置', <SettingsPage />, c, 'settings:view')
})

app.get('/profile', (c) => {
  return renderAdminPage('/profile', '个人资料', <ProfilePage />, c)
})

app.get('/login', (c) => {
  if (readSession(c)) {
    return c.redirect('/dashboard')
  }
  return c.render(
    <AuthLayout title="登录 HaloLight">
      <LoginPage />
    </AuthLayout>
  )
})

app.post('/login', async (c) => {
  const body = await c.req.parseBody()
  const username = (body.username ?? 'admin').toString()
  const role = (body.role ?? 'admin').toString()
  writeSession(c, username, role)

  const redirect = c.req.query('redirect') ?? '/dashboard'
  return c.redirect(redirect)
})

app.get('/logout', (c) => {
  clearSession(c)
  return c.redirect('/login')
})

app.get('/register', (c) => {
  return c.render(
    <AuthLayout title="注册账号">
      <RegisterPage />
    </AuthLayout>
  )
})

app.get('/forgot-password', (c) => {
  return c.render(
    <AuthLayout title="找回密码">
      <ForgotPasswordPage />
    </AuthLayout>
  )
})

app.get('/reset-password', (c) => {
  return c.render(
    <AuthLayout title="重置密码">
      <ResetPasswordPage />
    </AuthLayout>
  )
})

app.get('/api/routes', (c) => c.json({ list: appRoutes }))

app.get('/api/users', (c) => {
  const page = Number(c.req.query('page') ?? '1')
  const pageSize = Number(c.req.query('pageSize') ?? '10')
  return c.json(getUsersPage(page, pageSize))
})

export default app
