import type { FC } from 'hono/jsx'

export const LoginPage: FC = () => (
  <form method="post" action="/login" class="space-y-3">
    <label class="form-control w-full">
      <div class="label"><span class="label-text">用户名</span></div>
      <input name="username" placeholder="admin" required class="input input-bordered w-full" />
    </label>
    <label class="form-control w-full">
      <div class="label"><span class="label-text">密码</span></div>
      <input name="password" type="password" placeholder="******" required class="input input-bordered w-full" />
    </label>
    <button type="submit" class="btn btn-primary w-full">登录</button>
    <p class="text-sm opacity-60">
      演示账号：admin/admin123、manager/manager123、viewer/viewer123
    </p>
    <p class="text-sm opacity-60">access token 15 分钟，refresh token 7 天。</p>
  </form>
)
