import type { FC } from 'hono/jsx'
import type { DbCheckinAccount, DbCheckinLog, PaginatedResponse } from '../../types/app'
import { IconZap, IconPlus, IconPencil, IconTrash, IconClock, IconRefresh, IconCheck } from '../../components/icons'

interface CheckinPageProps {
  accounts: DbCheckinAccount[]
  logs: PaginatedResponse<DbCheckinLog>
  pushplusToken: string
}

const StatusBadge: FC<{ status: string }> = ({ status }) => (
  <span class={`badge badge-sm font-medium ${status === 'active' ? 'badge-success' : 'badge-error'}`}>
    {status === 'active' ? '启用' : '停用'}
  </span>
)

export const CheckinPage: FC<CheckinPageProps> = ({ accounts, logs, pushplusToken }) => {
  const pages = Array.from({ length: logs.totalPages }, (_, i) => i + 1)

  return (
    <div class="space-y-5">
      {/* 页头 */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <IconZap size={22} class="text-primary/60" />
            AnyRouter 签到
          </h2>
          <p class="text-sm text-base-content/50 mt-0.5">共 {accounts.length} 个账户</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-warning btn-sm gap-1.5" data-action="checkin-run">
            <IconRefresh size={16} />
            立即签到
          </button>
          <button class="btn btn-primary btn-sm gap-1.5" data-action="open-add-checkin">
            <IconPlus size={16} />
            添加账户
          </button>
        </div>
      </div>

      {/* PushPlus 配置 */}
      <div class="page-section overflow-hidden" data-settings-group="notification">
        <div class="px-6 py-4 border-b border-base-300/30">
          <h3 class="font-bold text-base">通知设置</h3>
        </div>
        <div class="p-6">
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <div class="sm:w-1/3 min-w-0">
              <div class="font-medium text-sm">PushPlus Token</div>
              <div class="text-xs text-base-content/40 mt-0.5">留空则不推送</div>
            </div>
            <div class="flex-1 flex gap-2">
              <input
                type="text"
                class="input input-bordered input-sm flex-1"
                data-setting-key="notification.pushplus_token"
                value={pushplusToken}
                placeholder="输入 PushPlus Token"
              />
              <button class="btn btn-sm btn-ghost gap-1" data-action="save-settings">
                <IconCheck size={14} />
                保存
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 账户列表 */}
      {accounts.length === 0 ? (
        <div class="page-section py-16 text-center">
          <IconZap size={48} class="mx-auto text-base-content/10 mb-3" />
          <p class="text-base-content/40">暂无签到账户</p>
        </div>
      ) : (
        <>
          {/* 桌面表格 */}
          <div class="hidden md:block page-section overflow-hidden">
            <div class="overflow-x-auto">
              <table class="table table-sm table-enhanced">
                <thead>
                  <tr>
                    <th>标签</th>
                    <th>上游地址</th>
                    <th>状态</th>
                    <th>最后签到</th>
                    <th>结果</th>
                    <th class="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((a) => (
                    <tr data-label={a.label} data-upstream={a.upstream_url} data-cookie={a.session_cookie} data-custom={a.custom_fields}>
                      <td class="font-medium text-sm">{a.label || `#${a.id}`}</td>
                      <td class="text-sm text-base-content/60">{a.upstream_url}</td>
                      <td><StatusBadge status={a.status} /></td>
                      <td class="whitespace-nowrap">
                        {a.last_checkin_at ? (
                          <div class="flex items-center gap-1.5 text-xs text-base-content/50">
                            <IconClock size={12} />
                            {a.last_checkin_at}
                          </div>
                        ) : (
                          <span class="text-xs text-base-content/30">-</span>
                        )}
                      </td>
                      <td class="max-w-[200px] truncate text-sm text-base-content/60">{a.last_checkin_result ?? '-'}</td>
                      <td>
                        <div class="flex justify-end gap-1">
                          <button class="action-btn" data-action="checkin-run-single" data-id={a.id}>签到</button>
                          <button class="action-btn" data-action="edit-checkin" data-id={a.id}>编辑</button>
                          <button class="action-btn" data-action="toggle-checkin-status" data-id={a.id}>
                            {a.status === 'active' ? '停用' : '启用'}
                          </button>
                          <button class="action-btn action-btn-danger" data-action="delete-checkin" data-id={a.id}>删除</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 移动端卡片 */}
          <div class="md:hidden space-y-3">
            {accounts.map((a) => (
              <div class="page-section p-4" data-label={a.label} data-upstream={a.upstream_url} data-cookie={a.session_cookie} data-custom={a.custom_fields}>
                <div class="flex items-center justify-between mb-2">
                  <span class="font-semibold text-sm">{a.label || `#${a.id}`}</span>
                  <StatusBadge status={a.status} />
                </div>
                <div class="text-xs text-base-content/50 mb-1">{a.upstream_url}</div>
                {a.last_checkin_result && (
                  <div class="text-xs text-base-content/60 truncate mb-2">{a.last_checkin_result}</div>
                )}
                <div class="flex items-center justify-between pt-2 border-t border-base-300/30">
                  {a.last_checkin_at ? (
                    <span class="text-[11px] text-base-content/40 flex items-center gap-1">
                      <IconClock size={10} />
                      {a.last_checkin_at}
                    </span>
                  ) : (
                    <span class="text-[11px] text-base-content/30">未签到</span>
                  )}
                  <div class="flex gap-1">
                    <button class="action-btn" data-action="checkin-run-single" data-id={a.id}>签到</button>
                    <button class="action-btn" data-action="edit-checkin" data-id={a.id}>编辑</button>
                    <button class="action-btn" data-action="toggle-checkin-status" data-id={a.id}>
                      {a.status === 'active' ? '停用' : '启用'}
                    </button>
                    <button class="action-btn action-btn-danger" data-action="delete-checkin" data-id={a.id}>删除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 签到日志 */}
      <div>
        <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
          <IconClock size={18} class="text-primary/60" />
          签到日志
        </h3>
        {logs.list.length === 0 ? (
          <div class="page-section py-12 text-center">
            <p class="text-base-content/40">暂无签到日志</p>
          </div>
        ) : (
          <>
            <div class="hidden md:block page-section overflow-hidden">
              <div class="overflow-x-auto">
                <table class="table table-sm table-enhanced">
                  <thead>
                    <tr>
                      <th>时间</th>
                      <th>账户</th>
                      <th>结果</th>
                      <th>消息</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.list.map((log) => (
                      <tr>
                        <td class="whitespace-nowrap">
                          <div class="flex items-center gap-1.5 text-xs text-base-content/50">
                            <IconClock size={12} />
                            {log.created_at}
                          </div>
                        </td>
                        <td class="font-medium text-sm">{log.account_label || `#${log.account_id}`}</td>
                        <td>
                          <span class={`badge badge-sm ${log.success ? 'badge-success' : 'badge-error'}`}>
                            {log.success ? '成功' : '失败'}
                          </span>
                        </td>
                        <td class="max-w-[300px] truncate text-sm text-base-content/60">{log.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="md:hidden space-y-3">
              {logs.list.map((log) => (
                <div class="page-section p-4">
                  <div class="flex items-start justify-between mb-1">
                    <span class={`badge badge-sm ${log.success ? 'badge-success' : 'badge-error'}`}>
                      {log.success ? '成功' : '失败'}
                    </span>
                    <span class="text-[11px] text-base-content/40 flex items-center gap-1">
                      <IconClock size={10} />
                      {log.created_at}
                    </span>
                  </div>
                  <div class="text-sm font-semibold">{log.account_label || `#${log.account_id}`}</div>
                  <div class="text-xs text-base-content/50 mt-1 truncate">{log.message}</div>
                </div>
              ))}
            </div>

            {logs.totalPages > 1 && (
              <div class="flex justify-center mt-4">
                <div class="join">
                  {pages.map((p) => (
                    <a
                      href={`/cron/anyrouter?logPage=${p}`}
                      class={`join-item btn btn-sm ${p === logs.page ? 'btn-primary' : 'btn-ghost'}`}
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

      {/* 新增账户弹窗 */}
      <dialog id="add-checkin-modal" class="modal">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">添加签到账户</h3>
          <div class="space-y-3">
            <div>
              <label class="label"><span class="label-text text-sm">标签</span></label>
              <input type="text" name="label" class="input input-bordered input-sm w-full" placeholder="如：账号1" />
            </div>
            <div>
              <label class="label"><span class="label-text text-sm">Session Cookie</span></label>
              <textarea name="session_cookie" class="textarea textarea-bordered textarea-sm w-full h-20" placeholder="粘贴 session 值" />
            </div>
            <div>
              <label class="label"><span class="label-text text-sm">上游地址</span></label>
              <input type="text" name="upstream_url" class="input input-bordered input-sm w-full" value="https://anyrouter.top" />
            </div>
            <div>
              <label class="label"><span class="label-text text-sm">自定义字段</span></label>
              <textarea name="custom_fields" class="textarea textarea-bordered textarea-sm w-full h-20 font-mono text-xs" placeholder={'{"key": "value"}'} />
            </div>
          </div>
          <div class="modal-action">
            <form method="dialog"><button class="btn btn-sm btn-ghost">取消</button></form>
            <button class="btn btn-sm btn-primary" data-action="submit-add-checkin">确认添加</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* 编辑账户弹窗 */}
      <dialog id="edit-checkin-modal" class="modal">
        <div class="modal-box">
          <h3 class="font-bold text-lg mb-4">编辑签到账户</h3>
          <input type="hidden" name="id" />
          <div class="space-y-3">
            <div>
              <label class="label"><span class="label-text text-sm">标签</span></label>
              <input type="text" name="label" class="input input-bordered input-sm w-full" />
            </div>
            <div>
              <label class="label"><span class="label-text text-sm">Session Cookie</span></label>
              <textarea name="session_cookie" class="textarea textarea-bordered textarea-sm w-full h-20" placeholder="留空则不修改" />
            </div>
            <div>
              <label class="label"><span class="label-text text-sm">上游地址</span></label>
              <input type="text" name="upstream_url" class="input input-bordered input-sm w-full" />
            </div>
            <div>
              <label class="label"><span class="label-text text-sm">自定义字段</span></label>
              <textarea name="custom_fields" class="textarea textarea-bordered textarea-sm w-full h-20 font-mono text-xs" placeholder={'{"key": "value"}'} />
            </div>
          </div>
          <div class="modal-action">
            <form method="dialog"><button class="btn btn-sm btn-ghost">取消</button></form>
            <button class="btn btn-sm btn-primary" data-action="submit-edit-checkin">确认修改</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop"><button>close</button></form>
      </dialog>
    </div>
  )
}
