import type { FC } from 'hono/jsx'
import type { SettingsGroup } from '../../types/app'
import { IconSettings, IconCheck } from '../../components/icons'

interface SettingsPageProps {
  groups: SettingsGroup[]
}

export const SettingsPage: FC<SettingsPageProps> = ({ groups }) => (
  <div class="space-y-5">
    {/* 页头 */}
    <div>
      <h2 class="text-2xl font-bold flex items-center gap-2">
        <IconSettings size={22} class="text-primary/60" />
        系统设置
      </h2>
      <p class="text-sm text-base-content/50 mt-0.5">管理系统全局配置</p>
    </div>

    {/* 设置分组 */}
    {groups.map((group) => (
      <div class="page-section overflow-hidden" data-settings-group={group.group}>
        <div class="px-6 py-4 border-b border-base-300/30">
          <h3 class="font-bold text-base">{group.label}</h3>
        </div>
        <div class="p-6 space-y-5">
          {group.items.map((item) => (
            <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <div class="sm:w-1/3 min-w-0">
                <div class="font-medium text-sm">{item.label}</div>
                {item.description && (
                  <div class="text-xs text-base-content/40 mt-0.5">{item.description}</div>
                )}
              </div>
              <div class="flex-1 max-w-xs">
                {item.value_type === 'boolean' ? (
                  <input
                    type="checkbox"
                    class="toggle toggle-primary"
                    data-setting-key={item.key}
                    data-type={item.value_type}
                    checked={item.value === 'true'}
                  />
                ) : item.value_type === 'number' ? (
                  <input
                    type="number"
                    class="input input-bordered input-sm w-full"
                    data-setting-key={item.key}
                    data-type={item.value_type}
                    value={item.value}
                  />
                ) : (
                  <input
                    type="text"
                    class="input input-bordered input-sm w-full"
                    data-setting-key={item.key}
                    data-type={item.value_type}
                    value={item.value}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
        <div class="px-6 py-3 border-t border-base-300/30 bg-base-200/20">
          <button class="btn btn-primary btn-sm gap-1.5" data-action="save-settings" data-group={group.group}>
            <IconCheck size={14} />
            保存设置
          </button>
        </div>
      </div>
    ))}
  </div>
)
