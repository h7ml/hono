import type { FC } from 'hono/jsx'
import type { PaginatedResponse, DbAuditLog } from '../../types/app'
import { IconClipboard, IconClock } from '../../components/icons'

interface AuditLogsPageProps {
  data: PaginatedResponse<DbAuditLog>
}

const actionBadge = (action: string) => {
  const map: Record<string, string> = {
    login: 'badge-info',
    create: 'badge-success',
    update: 'badge-warning',
    delete: 'badge-error',
  }
  return map[action] ?? 'badge-ghost'
}

export const AuditLogsPage: FC<AuditLogsPageProps> = ({ data }) => {
  const pages = Array.from({ length: data.totalPages }, (_, i) => i + 1)

  return (
    <div class="space-y-5">
      {/* 页头 */}
      <div>
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <IconClipboard size={22} class="text-primary/60" />
          审计日志
        </h2>
        <p class="text-sm text-base-content/50 mt-0.5">共 {data.total} 条记录</p>
      </div>

      {data.list.length === 0 ? (
        <div class="page-section py-16 text-center">
          <IconClipboard size={48} class="mx-auto text-base-content/10 mb-3" />
          <p class="text-base-content/40">暂无审计日志</p>
        </div>
      ) : (
        <>
          {/* 桌面表格 */}
          <div class="hidden md:block page-section overflow-hidden">
            <div class="overflow-x-auto">
              <table class="table table-sm table-enhanced">
                <thead>
                  <tr>
                    <th>时间</th>
                    <th>操作人</th>
                    <th>动作</th>
                    <th>资源类型</th>
                    <th>资源ID</th>
                    <th>详情</th>
                  </tr>
                </thead>
                <tbody>
                  {data.list.map((log) => (
                    <tr>
                      <td class="whitespace-nowrap">
                        <div class="flex items-center gap-1.5 text-xs text-base-content/50">
                          <IconClock size={12} />
                          {log.created_at}
                        </div>
                      </td>
                      <td class="font-medium text-sm">{log.user_name}</td>
                      <td>
                        <span class={`badge badge-sm ${actionBadge(log.action)}`}>{log.action}</span>
                      </td>
                      <td class="text-sm">{log.resource_type ?? '-'}</td>
                      <td class="text-sm text-base-content/50">{log.resource_id ?? '-'}</td>
                      <td class="max-w-[200px] truncate text-sm text-base-content/50">{log.detail ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 移动端卡片 */}
          <div class="md:hidden space-y-3">
            {data.list.map((log) => (
              <div class="page-section p-4">
                <div class="flex items-start justify-between mb-2">
                  <span class={`badge badge-sm ${actionBadge(log.action)}`}>{log.action}</span>
                  <span class="text-[11px] text-base-content/40 flex items-center gap-1">
                    <IconClock size={10} />
                    {log.created_at}
                  </span>
                </div>
                <div class="text-sm">
                  <span class="font-semibold">{log.user_name}</span>
                  {log.resource_type && (
                    <span class="text-base-content/50"> · {log.resource_type}{log.resource_id ? ` #${log.resource_id}` : ''}</span>
                  )}
                </div>
                {log.detail && (
                  <div class="text-xs text-base-content/40 mt-1.5 truncate">{log.detail}</div>
                )}
              </div>
            ))}
          </div>

          {/* 分页 */}
          {data.totalPages > 1 && (
            <div class="flex justify-center">
              <div class="join">
                {pages.map((p) => (
                  <a
                    href={`/audit-logs?page=${p}`}
                    class={`join-item btn btn-sm ${p === data.page ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {p}
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
