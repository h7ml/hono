import type { FC } from 'hono/jsx'
import type { DbCronTask, DbCronTaskLog, PaginatedResponse } from '../../types/app'
import { IconGlobe, IconPlus, IconClock, IconBell, IconRefresh } from '../../components/icons'

interface CronTasksPageProps {
  tasks: DbCronTask[]
  logs: PaginatedResponse<DbCronTaskLog>
}

const StatusBadge: FC<{ status: string }> = ({ status }) => (
  <span class={`badge badge-sm font-medium ${status === 'active' ? 'badge-success' : 'badge-error'}`}>
    {status === 'active' ? '启用' : '暂停'}
  </span>
)

const MethodBadge: FC<{ method: string }> = ({ method }) => {
  const cls = method === 'GET' ? 'badge-info' : method === 'POST' ? 'badge-warning' : 'badge-ghost'
  return <span class={`badge badge-sm badge-outline ${cls}`}>{method}</span>
}

const CRON_PRESETS = [
  { label: '每分钟', value: '* * * * *' },
  { label: '每5分钟', value: '*/5 * * * *' },
  { label: '每小时', value: '0 * * * *' },
  { label: '每天 0:00', value: '0 0 * * *' },
  { label: '每天 8:00', value: '0 8 * * *' },
  { label: '每周一 0:00', value: '0 0 * * 1' },
]

export const CronTasksPage: FC<CronTasksPageProps> = ({ tasks, logs }) => {
  const logPages = Array.from({ length: logs.totalPages }, (_, i) => i + 1)

  return (
    <div class="space-y-5">
      {/* 页头 */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <IconGlobe size={22} class="text-primary/60" />
            通用定时任务
          </h2>
          <p class="text-sm text-base-content/50 mt-0.5">共 {tasks.length} 个任务</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-accent btn-sm gap-1.5 hidden" id="batch-run-btn" data-action="crontask-batch-run">
            <IconRefresh size={16} />
            批量执行 (<span id="batch-count">0</span>)
          </button>
          <button class="btn btn-warning btn-sm gap-1.5" data-action="send-daily-summary">
            <IconBell size={16} />
            发送汇总
          </button>
          <button class="btn btn-primary btn-sm gap-1.5" data-action="open-add-crontask">
            <IconPlus size={16} />
            新建任务
          </button>
        </div>
      </div>

      {/* 任务列表 */}
      {tasks.length === 0 ? (
        <div class="page-section py-16 text-center">
          <IconGlobe size={48} class="mx-auto text-base-content/10 mb-3" />
          <p class="text-base-content/40">暂无定时任务</p>
        </div>
      ) : (
        <>
          {/* 桌面表格 */}
          <div class="hidden md:block page-section overflow-hidden">
            <div class="overflow-x-auto">
              <table class="table table-sm table-enhanced">
                <thead>
                  <tr>
                    <th><input type="checkbox" class="checkbox checkbox-xs" data-action="crontask-select-all" /></th>
                    <th>名称</th>
                    <th>方法</th>
                    <th>URL</th>
                    <th>Cron</th>
                    <th>状态</th>
                    <th>最后执行</th>
                    <th class="text-right">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <tr
                      data-name={t.name}
                      data-desc={t.description}
                      data-cron={t.cron_expr}
                      data-method={t.http_method}
                      data-url={t.url}
                      data-headers={t.headers}
                      data-body={t.body}
                      data-timeout={t.timeout_ms}
                      data-retries={t.max_retries}
                      data-notify={t.notify_on_failure}
                    >
                      <td><input type="checkbox" class="checkbox checkbox-xs crontask-check" value={t.id} data-action="crontask-check" /></td>
                      <td class="font-medium text-sm">{t.name}</td>
                      <td><MethodBadge method={t.http_method} /></td>
                      <td class="max-w-[200px] truncate text-sm text-base-content/60">{t.url}</td>
                      <td class="font-mono text-xs text-base-content/60">{t.cron_expr}</td>
                      <td><StatusBadge status={t.status} /></td>
                      <td class="whitespace-nowrap">
                        {t.last_run_at ? (
                          <div class="flex items-center gap-1.5 text-xs text-base-content/50">
                            <IconClock size={12} />
                            {t.last_run_at}
                            {t.last_run_status !== null && (
                              <span class={`badge badge-xs ${t.last_run_status && t.last_run_status >= 200 && t.last_run_status < 300 ? 'badge-success' : 'badge-error'}`}>
                                {t.last_run_status}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span class="text-xs text-base-content/30">-</span>
                        )}
                      </td>
                      <td>
                        <div class="flex justify-end gap-1">
                          <button class="action-btn" data-action="crontask-run-single" data-id={t.id}>执行</button>
                          <button class="action-btn" data-action="edit-crontask" data-id={t.id}>编辑</button>
                          <button class="action-btn" data-action="toggle-crontask-status" data-id={t.id}>
                            {t.status === 'active' ? '暂停' : '启用'}
                          </button>
                          <button class="action-btn action-btn-danger" data-action="delete-crontask" data-id={t.id}>删除</button>
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
            {tasks.map((t) => (
              <div
                class="page-section p-4"
                data-name={t.name}
                data-desc={t.description}
                data-cron={t.cron_expr}
                data-method={t.http_method}
                data-url={t.url}
                data-headers={t.headers}
                data-body={t.body}
                data-timeout={t.timeout_ms}
                data-retries={t.max_retries}
                data-notify={t.notify_on_failure}
              >
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <input type="checkbox" class="checkbox checkbox-xs crontask-check" value={t.id} data-action="crontask-check" />
                    <span class="font-semibold text-sm">{t.name}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <MethodBadge method={t.http_method} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>
                <div class="text-xs text-base-content/50 mb-1 truncate">{t.url}</div>
                <div class="text-xs font-mono text-base-content/40 mb-2">{t.cron_expr}</div>
                {t.last_run_result && (
                  <div class="text-xs text-base-content/60 truncate mb-2">{t.last_run_result}</div>
                )}
                <div class="flex items-center justify-between pt-2 border-t border-base-300/30">
                  {t.last_run_at ? (
                    <span class="text-[11px] text-base-content/40 flex items-center gap-1">
                      <IconClock size={10} />
                      {t.last_run_at}
                    </span>
                  ) : (
                    <span class="text-[11px] text-base-content/30">未执行</span>
                  )}
                  <div class="flex gap-1">
                    <button class="action-btn" data-action="crontask-run-single" data-id={t.id}>执行</button>
                    <button class="action-btn" data-action="edit-crontask" data-id={t.id}>编辑</button>
                    <button class="action-btn" data-action="toggle-crontask-status" data-id={t.id}>
                      {t.status === 'active' ? '暂停' : '启用'}
                    </button>
                    <button class="action-btn action-btn-danger" data-action="delete-crontask" data-id={t.id}>删除</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 执行日志 */}
      <div>
        <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
          <IconClock size={18} class="text-primary/60" />
          执行日志
        </h3>
        {logs.list.length === 0 ? (
          <div class="page-section py-12 text-center">
            <p class="text-base-content/40">暂无执行日志</p>
          </div>
        ) : (
          <>
            <div class="hidden md:block page-section overflow-hidden">
              <div class="overflow-x-auto">
                <table class="table table-sm table-enhanced">
                  <thead>
                    <tr>
                      <th>时间</th>
                      <th>任务</th>
                      <th>结果</th>
                      <th>状态码</th>
                      <th>耗时</th>
                      <th>来源</th>
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
                        <td class="font-medium text-sm">{log.task_name || `#${log.task_id}`}</td>
                        <td>
                          <span class={`badge badge-sm ${log.success ? 'badge-success' : 'badge-error'}`}>
                            {log.success ? '成功' : '失败'}
                          </span>
                        </td>
                        <td class="text-sm text-base-content/60">{log.status_code ?? '-'}</td>
                        <td class="text-sm text-base-content/60">{log.duration_ms}ms</td>
                        <td>
                          <span class={`badge badge-xs ${log.trigger_source === 'manual' ? 'badge-info' : 'badge-ghost'}`}>
                            {log.trigger_source === 'manual' ? '手动' : '调度'}
                          </span>
                        </td>
                        <td class="max-w-[200px] truncate text-sm text-base-content/60">{log.message}</td>
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
                  <div class="text-sm font-semibold">{log.task_name || `#${log.task_id}`}</div>
                  <div class="text-xs text-base-content/50 mt-1">
                    {log.status_code ?? '-'} · {log.duration_ms}ms · {log.trigger_source === 'manual' ? '手动' : '调度'}
                  </div>
                  <div class="text-xs text-base-content/50 mt-1 truncate">{log.message}</div>
                </div>
              ))}
            </div>

            {logs.totalPages > 1 && (
              <div class="flex justify-center mt-4">
                <div class="join">
                  {logPages.map((p) => (
                    <a
                      href={`/cron/tasks?logPage=${p}`}
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

      {/* 新建任务弹窗 */}
      <dialog id="add-crontask-modal" class="modal">
        <div class="modal-box max-w-2xl">
          <h3 class="font-bold text-lg mb-4">新建定时任务</h3>
          <div class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="label"><span class="label-text text-sm">任务名称</span></label>
                <input type="text" name="name" class="input input-bordered input-sm w-full" placeholder="如：健康检查" />
              </div>
              <div>
                <label class="label"><span class="label-text text-sm">Cron 表达式</span></label>
                <div class="flex gap-1.5">
                  <input type="text" name="cron_expr" class="input input-bordered input-sm flex-1 font-mono" value="0 0 * * *" />
                  <select class="select select-bordered select-sm" data-action="cron-preset-change" data-target="add">
                    <option value="">预设</option>
                    {CRON_PRESETS.map((p) => <option value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label class="label"><span class="label-text text-sm">描述</span></label>
              <input type="text" name="description" class="input input-bordered input-sm w-full" placeholder="可选" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label class="label"><span class="label-text text-sm">HTTP 方法</span></label>
                <select name="http_method" class="select select-bordered select-sm w-full">
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                  <option>PATCH</option>
                </select>
              </div>
              <div class="sm:col-span-3">
                <label class="label"><span class="label-text text-sm">URL</span></label>
                <input type="text" name="url" class="input input-bordered input-sm w-full font-mono" placeholder="https://example.com/api" />
              </div>
            </div>
            <div>
              <label class="label"><span class="label-text text-sm">Headers (JSON)</span></label>
              <textarea name="headers" class="textarea textarea-bordered textarea-sm w-full h-16 font-mono text-xs" placeholder={'{"Content-Type": "application/json"}'} />
            </div>
            <div>
              <label class="label"><span class="label-text text-sm">Body</span></label>
              <textarea name="body" class="textarea textarea-bordered textarea-sm w-full h-16 font-mono text-xs" placeholder="请求体（可选）" />
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="label"><span class="label-text text-sm">超时 (ms)</span></label>
                <input type="number" name="timeout_ms" class="input input-bordered input-sm w-full" value="30000" />
              </div>
              <div>
                <label class="label"><span class="label-text text-sm">最大重试</span></label>
                <input type="number" name="max_retries" class="input input-bordered input-sm w-full" value="0" />
              </div>
              <div>
                <label class="label"><span class="label-text text-sm">失败通知</span></label>
                <select name="notify_on_failure" class="select select-bordered select-sm w-full">
                  <option value="1">开启</option>
                  <option value="0">关闭</option>
                </select>
              </div>
            </div>
            {/* curl 导入 */}
            <div class="collapse collapse-arrow bg-base-200/50">
              <input type="checkbox" />
              <div class="collapse-title text-sm font-medium">从 curl 命令导入</div>
              <div class="collapse-content">
                <textarea name="curl_input" class="textarea textarea-bordered textarea-sm w-full h-24 font-mono text-xs" placeholder="粘贴 curl 命令..." />
                <button class="btn btn-xs btn-outline mt-2" data-action="parse-curl-add">解析 curl</button>
              </div>
            </div>
          </div>
          <div class="modal-action">
            <form method="dialog"><button class="btn btn-sm btn-ghost">取消</button></form>
            <button class="btn btn-sm btn-primary" data-action="submit-add-crontask">确认创建</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop"><button>close</button></form>
      </dialog>

      {/* 编辑任务弹窗 */}
      <dialog id="edit-crontask-modal" class="modal">
        <div class="modal-box max-w-2xl">
          <h3 class="font-bold text-lg mb-4">编辑定时任务</h3>
          <input type="hidden" name="id" />
          <div class="space-y-3">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="label"><span class="label-text text-sm">任务名称</span></label>
                <input type="text" name="name" class="input input-bordered input-sm w-full" />
              </div>
              <div>
                <label class="label"><span class="label-text text-sm">Cron 表达式</span></label>
                <div class="flex gap-1.5">
                  <input type="text" name="cron_expr" class="input input-bordered input-sm flex-1 font-mono" />
                  <select class="select select-bordered select-sm" data-action="cron-preset-change" data-target="edit">
                    <option value="">预设</option>
                    {CRON_PRESETS.map((p) => <option value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label class="label"><span class="label-text text-sm">描述</span></label>
              <input type="text" name="description" class="input input-bordered input-sm w-full" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label class="label"><span class="label-text text-sm">HTTP 方法</span></label>
                <select name="http_method" class="select select-bordered select-sm w-full">
                  <option>GET</option>
                  <option>POST</option>
                  <option>PUT</option>
                  <option>DELETE</option>
                  <option>PATCH</option>
                </select>
              </div>
              <div class="sm:col-span-3">
                <label class="label"><span class="label-text text-sm">URL</span></label>
                <input type="text" name="url" class="input input-bordered input-sm w-full font-mono" />
              </div>
            </div>
            <div>
              <label class="label"><span class="label-text text-sm">Headers (JSON)</span></label>
              <textarea name="headers" class="textarea textarea-bordered textarea-sm w-full h-16 font-mono text-xs" />
            </div>
            <div>
              <label class="label"><span class="label-text text-sm">Body</span></label>
              <textarea name="body" class="textarea textarea-bordered textarea-sm w-full h-16 font-mono text-xs" />
            </div>
            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="label"><span class="label-text text-sm">超时 (ms)</span></label>
                <input type="number" name="timeout_ms" class="input input-bordered input-sm w-full" />
              </div>
              <div>
                <label class="label"><span class="label-text text-sm">最大重试</span></label>
                <input type="number" name="max_retries" class="input input-bordered input-sm w-full" />
              </div>
              <div>
                <label class="label"><span class="label-text text-sm">失败通知</span></label>
                <select name="notify_on_failure" class="select select-bordered select-sm w-full">
                  <option value="1">开启</option>
                  <option value="0">关闭</option>
                </select>
              </div>
            </div>
            {/* curl 导入 */}
            <div class="collapse collapse-arrow bg-base-200/50">
              <input type="checkbox" />
              <div class="collapse-title text-sm font-medium">从 curl 命令导入</div>
              <div class="collapse-content">
                <textarea name="curl_input" class="textarea textarea-bordered textarea-sm w-full h-24 font-mono text-xs" placeholder="粘贴 curl 命令..." />
                <button class="btn btn-xs btn-outline mt-2" data-action="parse-curl-edit">解析 curl</button>
              </div>
            </div>
          </div>
          <div class="modal-action">
            <form method="dialog"><button class="btn btn-sm btn-ghost">取消</button></form>
            <button class="btn btn-sm btn-primary" data-action="submit-edit-crontask">确认修改</button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop"><button>close</button></form>
      </dialog>
    </div>
  )
}
