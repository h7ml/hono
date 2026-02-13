import type { FC } from 'hono/jsx'

export const LoginPage: FC = () => (
  <form method="post" action="/login" class="form-stack">
    <label>
      用户名
      <input name="username" placeholder="admin" required />
    </label>
    <label>
      密码
      <input name="password" type="password" placeholder="******" required />
    </label>
    <button type="submit">登录</button>
    <p class="subtle">
      演示账号：admin/admin123、manager/manager123、viewer/viewer123
    </p>
    <p class="subtle">access token 15 分钟，refresh token 7 天。</p>
  </form>
)
