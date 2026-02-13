import type { FC } from 'hono/jsx'

export const DashboardPage: FC = () => (
  <div class="space-y-4">
    <h2 class="text-xl font-bold">仪表盘</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="stat bg-base-200 rounded-xl">
        <div class="stat-title">活跃用户</div>
        <div class="stat-value">1,284</div>
      </div>
      <div class="stat bg-base-200 rounded-xl">
        <div class="stat-title">今日请求</div>
        <div class="stat-value">9,430</div>
      </div>
      <div class="stat bg-base-200 rounded-xl">
        <div class="stat-title">异常告警</div>
        <div class="stat-value">2</div>
      </div>
    </div>
  </div>
)
