import type { FC } from 'hono/jsx'
import type { DashboardStats } from '../../types/app'
import { IconUsers, IconUserCheck, IconShield, IconZap, IconArrowRight, IconClock, iconMap } from '../../components/icons'

interface DashboardPageProps {
  stats: DashboardStats
}

export const DashboardPage: FC<DashboardPageProps> = ({ stats }) => (
  <div class="space-y-6">
    {/* 统计卡片 */}
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="stat stat-gradient-blue rounded-2xl shadow-lg">
        <div class="stat-figure">
          <IconUsers size={36} />
        </div>
        <div class="stat-title">用户总数</div>
        <div class="stat-value">{stats.userCount}</div>
        <div class="stat-desc">系统注册用户</div>
      </div>

      <div class="stat stat-gradient-green rounded-2xl shadow-lg">
        <div class="stat-figure">
          <IconUserCheck size={36} />
        </div>
        <div class="stat-title">活跃用户</div>
        <div class="stat-value">{stats.activeUserCount}</div>
        <div class="stat-desc">当前启用状态</div>
      </div>

      <div class="stat stat-gradient-purple rounded-2xl shadow-lg">
        <div class="stat-figure">
          <IconShield size={36} />
        </div>
        <div class="stat-title">角色数量</div>
        <div class="stat-value">{stats.roleCount}</div>
        <div class="stat-desc">权限角色组</div>
      </div>

      <div class="stat stat-gradient-amber rounded-2xl shadow-lg">
        <div class="stat-figure">
          <IconZap size={36} />
        </div>
        <div class="stat-title">今日操作</div>
        <div class="stat-value">{stats.todayLogCount}</div>
        <div class="stat-desc">审计日志条目</div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 最近操作 */}
      <div class="lg:col-span-2 page-section p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-bold flex items-center gap-2">
            <IconClock size={18} class="text-primary/60" />
            最近操作
          </h3>
          <a href="/audit-logs" class="text-xs text-primary hover:underline flex items-center gap-1">
            查看全部 <IconArrowRight size={12} />
          </a>
        </div>

        {stats.recentLogs.length > 0 ? (
          <div class="overflow-x-auto -mx-2">
            <table class="table table-sm table-enhanced">
              <thead>
                <tr>
                  <th>时间</th>
                  <th>操作人</th>
                  <th>动作</th>
                  <th>资源</th>
                  <th>详情</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLogs.map((log) => (
                  <tr>
                    <td class="whitespace-nowrap text-xs text-base-content/50">{log.created_at}</td>
                    <td class="font-medium text-sm">{log.user_name}</td>
                    <td>
                      <span class="badge badge-sm badge-outline badge-primary">{log.action}</span>
                    </td>
                    <td class="text-sm">
                      {log.resource_type ?? '-'}
                      {log.resource_id ? <span class="text-base-content/40"> #{log.resource_id}</span> : ''}
                    </td>
                    <td class="max-w-[200px] truncate text-sm text-base-content/60">{log.detail ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div class="text-center py-12">
            <IconClock size={40} class="mx-auto text-base-content/15 mb-3" />
            <p class="text-sm text-base-content/40">暂无操作记录</p>
          </div>
        )}
      </div>

      {/* 快捷入口 */}
      <div class="page-section p-6">
        <h3 class="text-lg font-bold mb-4">快捷入口</h3>
        <div class="space-y-2">
          <a href="/users" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-base-200/60 transition-colors group">
            <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <IconUsers size={18} class="text-primary" />
            </div>
            <div class="flex-1">
              <div class="text-sm font-semibold">用户管理</div>
              <div class="text-xs text-base-content/40">管理系统用户</div>
            </div>
            <IconArrowRight size={16} class="text-base-content/20 group-hover:text-primary transition-colors" />
          </a>

          <a href="/roles" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-base-200/60 transition-colors group">
            <div class="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
              <IconShield size={18} class="text-secondary" />
            </div>
            <div class="flex-1">
              <div class="text-sm font-semibold">角色管理</div>
              <div class="text-xs text-base-content/40">配置角色权限</div>
            </div>
            <IconArrowRight size={16} class="text-base-content/20 group-hover:text-secondary transition-colors" />
          </a>

          <a href="/settings" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-base-200/60 transition-colors group">
            <div class="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              {(() => {
                const Icon = iconMap['settings']
                return Icon ? <Icon size={18} class="text-accent" /> : null
              })()}
            </div>
            <div class="flex-1">
              <div class="text-sm font-semibold">系统设置</div>
              <div class="text-xs text-base-content/40">调整系统配置</div>
            </div>
            <IconArrowRight size={16} class="text-base-content/20 group-hover:text-accent transition-colors" />
          </a>

          <a href="/audit-logs" class="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-base-200/60 transition-colors group">
            <div class="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              {(() => {
                const Icon = iconMap['clipboard']
                return Icon ? <Icon size={18} class="text-warning" /> : null
              })()}
            </div>
            <div class="flex-1">
              <div class="text-sm font-semibold">审计日志</div>
              <div class="text-xs text-base-content/40">查看操作记录</div>
            </div>
            <IconArrowRight size={16} class="text-base-content/20 group-hover:text-warning transition-colors" />
          </a>
        </div>
      </div>
    </div>
  </div>
)
