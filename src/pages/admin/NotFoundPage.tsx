import type { FC } from 'hono/jsx'
import { IconSearch } from '../../components/icons'

export const NotFoundPage: FC = () => (
  <div class="flex flex-col items-center justify-center py-20 text-center">
    <div class="w-20 h-20 rounded-2xl bg-warning/10 flex items-center justify-center mb-6">
      <IconSearch size={40} class="text-warning/60" />
    </div>
    <h2 class="text-6xl font-black text-base-content/10 mb-2">404</h2>
    <p class="text-lg font-semibold mb-1">页面未找到</p>
    <p class="text-sm text-base-content/50 mb-6">请检查访问地址是否正确</p>
    <a href="/dashboard" class="btn btn-primary btn-sm">返回仪表盘</a>
  </div>
)
