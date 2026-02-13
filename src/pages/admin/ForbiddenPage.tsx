import type { FC } from 'hono/jsx'
import { IconAlertTriangle } from '../../components/icons'

export const ForbiddenPage: FC = () => (
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <div class="w-20 h-20 rounded-2xl bg-error/10 flex items-center justify-center mb-6">
      <IconAlertTriangle size={40} class="text-error/60" />
    </div>
    <h2 class="text-6xl font-black text-base-content/10 mb-2">403</h2>
    <p class="text-lg font-semibold mb-1">访问受限</p>
    <p class="text-sm text-base-content/50 mb-6">当前账户无权访问该页面</p>
    <a href="/dashboard" class="btn btn-primary btn-sm">返回仪表盘</a>
  </div>
)
