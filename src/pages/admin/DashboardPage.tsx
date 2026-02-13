import type { FC } from 'hono/jsx'

export const DashboardPage: FC = () => (
  <div class="stack-gap">
    <h2>仪表盘</h2>
    <div class="grid">
      <article class="widget">
        <h3>活跃用户</h3>
        <p>1,284</p>
      </article>
      <article class="widget">
        <h3>今日请求</h3>
        <p>9,430</p>
      </article>
      <article class="widget">
        <h3>异常告警</h3>
        <p>2</p>
      </article>
    </div>
  </div>
)
