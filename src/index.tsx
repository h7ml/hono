import type { FC } from 'hono/jsx'
import { Context, Hono } from 'hono'
import { AdminLayout } from './components/layout/AdminLayout'
import { AuthLayout } from './components/layout/AuthLayout'
import { appRoutes } from './config/routes'
import { clearSession, readSession, writeSession } from './lib/auth'
import { findActiveUserByCredentials, getUsersPage } from './lib/db/users'
import { hasPermission } from './lib/permissions'
import {
  DashboardPage,
  ForbiddenPage,
  NotFoundPage,
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

const app = new Hono<{ Bindings: CloudflareBindings }>()

app.use(renderer)

function renderAdminPage(
  path: string,
  title: string,
  content: JSX.Element,
  c: Context<{ Bindings: CloudflareBindings }>,
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

const pageMap: Record<string, FC> = {
  '/dashboard': DashboardPage,
  '/users': UsersPage,
  '/roles': RolesPage,
  '/permissions': PermissionsPage,
  '/settings': SettingsPage,
  '/profile': ProfilePage
}

app.get('/', (c) => c.redirect('/dashboard'))

for (const route of appRoutes) {
  const Page = pageMap[route.path]
  if (Page) {
    app.get(route.path, (c) =>
      renderAdminPage(route.path, route.meta.title, <Page />, c, route.meta.permission)
    )
  }
}

app.get('/login', (c) => {
  if (readSession(c)) {
    return c.redirect('/dashboard')
  }

  const error = c.req.query('error')
  return c.render(
    <AuthLayout title="登录 HaloLight">
      {error ? <p class="subtle">登录失败：用户名或密码错误</p> : null}
      <LoginPage />
    </AuthLayout>
  )
})

app.post('/login', async (c) => {
  const body = await c.req.parseBody()
  const username = (body.username ?? '').toString().trim()
  const password = (body.password ?? '').toString()

  if (!username || !password) {
    return c.redirect('/login?error=invalid_credentials')
  }

  const user = await findActiveUserByCredentials(c.env.DB, username, password)
  if (!user) {
    return c.redirect('/login?error=invalid_credentials')
  }

  writeSession(c, user.name, user.role)

  const redirect = c.req.query('redirect') ?? '/dashboard'
  return c.redirect(redirect)
})

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

  writeSession(c, user.name, user.role)
  return c.json({ id: user.id, name: user.name, role: user.role })
})

app.get('/logout', (c) => {
  clearSession(c)
  return c.redirect('/login')
})

app.get('/register', (c) => {
  if (readSession(c)) {
    return c.redirect('/dashboard')
  }
  return c.render(
    <AuthLayout title="注册账号">
      <RegisterPage />
    </AuthLayout>
  )
})

app.get('/forgot-password', (c) => {
  if (readSession(c)) {
    return c.redirect('/dashboard')
  }
  return c.render(
    <AuthLayout title="找回密码">
      <ForgotPasswordPage />
    </AuthLayout>
  )
})

app.get('/reset-password', (c) => {
  if (readSession(c)) {
    return c.redirect('/dashboard')
  }
  return c.render(
    <AuthLayout title="重置密码">
      <ResetPasswordPage />
    </AuthLayout>
  )
})

app.get('/api/routes', (c) => c.json({ list: appRoutes }))

app.get('/api/users', async (c) => {
  const page = Number(c.req.query('page') ?? '1')
  const pageSize = Number(c.req.query('pageSize') ?? '10')
  const data = await getUsersPage(c.env.DB, { page, pageSize })
  return c.json(data)
})

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
      <div class="stack-gap">
        <p>页面不存在。</p>
        <a href="/login" class="link-btn">返回登录</a>
      </div>
    </AuthLayout>
  )
})

export default app
