import type { FC } from 'hono/jsx'
import { IconLock } from '../../components/icons'

export const LoginPage: FC = () => (
  <form method="post" action="/login" class="space-y-5">
    {/* Brand */}
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl sidebar-brand mb-4">
        <span class="text-white font-black text-2xl">H</span>
      </div>
      <h1 class="text-2xl font-bold tracking-tight">欢迎回来</h1>
      <p class="text-sm text-base-content/50 mt-1">登录 HaloLight 管理系统</p>
    </div>

    {/* Form Fields */}
    <label class="form-control w-full">
      <div class="label"><span class="label-text font-medium">用户名</span></div>
      <input
        name="username"
        placeholder="请输入用户名"
        required
        class="input input-bordered w-full focus:input-primary"
        autocomplete="username"
      />
    </label>

    <label class="form-control w-full">
      <div class="label"><span class="label-text font-medium">密码</span></div>
      <input
        name="password"
        type="password"
        placeholder="请输入密码"
        required
        class="input input-bordered w-full focus:input-primary"
        autocomplete="current-password"
      />
    </label>

    <div class="flex items-center justify-between">
      <label class="label cursor-pointer gap-2">
        <input type="checkbox" class="checkbox checkbox-sm checkbox-primary" name="remember" />
        <span class="label-text text-sm">记住我</span>
      </label>
      <a href="/forgot-password" class="text-sm text-primary hover:underline">忘记密码?</a>
    </div>

    <button type="submit" class="btn btn-primary w-full">
      登录
    </button>

    <div class="text-center">
      <span class="text-sm text-base-content/50">还没有账号?</span>
      {' '}
      <a href="/register" class="text-sm text-primary font-medium hover:underline">立即注册</a>
    </div>
  </form>
)
