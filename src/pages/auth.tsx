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
    <label>
      角色
      <select name="role" defaultValue="admin">
        <option value="admin">admin</option>
        <option value="manager">manager</option>
        <option value="viewer">viewer</option>
      </select>
    </label>
    <button type="submit">登录</button>
    <p class="subtle">演示说明：access token 15 分钟，refresh token 7 天。</p>
  </form>
)

export const RegisterPage: FC = () => (
  <p class="subtle">注册页面占位，后续可接入真实服务层。</p>
)

export const ForgotPasswordPage: FC = () => (
  <p class="subtle">忘记密码页面占位。</p>
)

export const ResetPasswordPage: FC = () => (
  <p class="subtle">重置密码页面占位。</p>
)
