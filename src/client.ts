import type { SkinName, ThemeMode } from './types/app'

const THEME_MODE_KEY = 'halolight.theme.mode'
const SKIN_KEY = 'halolight.theme.skin'

// ── 主题 ──

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

function applyTheme(mode: ThemeMode): void {
  const actual = resolveTheme(mode)
  document.documentElement.dataset.theme = actual === 'dark' ? 'halodark' : 'halolight'
}

function applySkin(skin: SkinName): void {
  document.documentElement.dataset.skin = skin
}

function initSelectors(): void {
  const modeSelect = document.getElementById('themeMode') as HTMLSelectElement | null
  const skinSelect = document.getElementById('skinName') as HTMLSelectElement | null

  const savedMode = (localStorage.getItem(THEME_MODE_KEY) as ThemeMode | null) ?? 'system'
  const savedSkin = (localStorage.getItem(SKIN_KEY) as SkinName | null) ?? 'blue'

  applyTheme(savedMode)
  applySkin(savedSkin)

  if (modeSelect) {
    modeSelect.value = savedMode
    modeSelect.addEventListener('change', () => {
      const next = modeSelect.value as ThemeMode
      localStorage.setItem(THEME_MODE_KEY, next)
      applyTheme(next)
    })
  }

  if (skinSelect) {
    skinSelect.value = savedSkin
    skinSelect.addEventListener('change', () => {
      const next = skinSelect.value as SkinName
      localStorage.setItem(SKIN_KEY, next)
      applySkin(next)
    })
  }
}

// ── Toast ──

function createToastContainer(): HTMLElement {
  let container = document.getElementById('toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'toast-container'
    container.className = 'toast toast-top toast-end z-50'
    document.body.appendChild(container)
  }
  return container
}

function showToast(message: string, type: 'success' | 'error' | 'warning' = 'success') {
  const container = createToastContainer()
  const alertClass = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-error' : 'alert-warning'
  const div = document.createElement('div')
  div.className = `alert ${alertClass} text-sm py-2 px-4`
  div.textContent = message
  container.appendChild(div)
  setTimeout(() => div.remove(), 3000)
}

// ── API ──

async function apiCall(method: string, url: string, data?: unknown) {
  const opts: RequestInit = { method, headers: { 'Content-Type': 'application/json' } }
  if (data) opts.body = JSON.stringify(data)
  const res = await fetch(url, opts)
  const json = await res.json() as Record<string, unknown>
  if (!res.ok) throw new Error((json.error || json.message || 'Request failed') as string)
  return json
}

// ── Modal ──

function openModal(id: string) {
  (document.getElementById(id) as HTMLDialogElement)?.showModal()
}

function closeModal(id: string) {
  (document.getElementById(id) as HTMLDialogElement)?.close()
}

// ── 表单数据收集 ──

function getInputValue(container: Element, name: string): string {
  return (container.querySelector(`[name="${name}"]`) as HTMLInputElement | HTMLSelectElement | null)?.value ?? ''
}

// ── 事件委托 ──

document.addEventListener('click', async (e) => {
  const target = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null
  if (!target) return
  const action = target.dataset.action

  try {
    switch (action) {
      // ── Users ──
      case 'open-add-user': {
        openModal('add-user-modal')
        break
      }
      case 'submit-add-user': {
        const modal = document.getElementById('add-user-modal')
        if (!modal) break
        const data = {
          username: getInputValue(modal, 'username'),
          password: getInputValue(modal, 'password'),
          name: getInputValue(modal, 'name'),
          email: getInputValue(modal, 'email'),
          role: getInputValue(modal, 'role')
        }
        await apiCall('POST', '/api/users', data)
        showToast('用户创建成功')
        closeModal('add-user-modal')
        location.reload()
        break
      }
      case 'edit-user': {
        const modal = document.getElementById('edit-user-modal')
        if (!modal) break
        const id = target.dataset.id ?? ''
        const row = target.closest('tr')
        if (!row) break
        ;(modal.querySelector('[name="id"]') as HTMLInputElement).value = id
        const nameInput = modal.querySelector('[name="name"]') as HTMLInputElement
        const emailInput = modal.querySelector('[name="email"]') as HTMLInputElement
        const roleInput = modal.querySelector('[name="role"]') as HTMLSelectElement
        if (nameInput) nameInput.value = row.dataset.name ?? ''
        if (emailInput) emailInput.value = row.dataset.email ?? ''
        if (roleInput) roleInput.value = row.dataset.role ?? ''
        openModal('edit-user-modal')
        break
      }
      case 'submit-edit-user': {
        const modal = document.getElementById('edit-user-modal')
        if (!modal) break
        const id = getInputValue(modal, 'id')
        const data = {
          name: getInputValue(modal, 'name'),
          email: getInputValue(modal, 'email'),
          role: getInputValue(modal, 'role')
        }
        await apiCall('PUT', `/api/users/${id}`, data)
        showToast('用户更新成功')
        closeModal('edit-user-modal')
        location.reload()
        break
      }
      case 'delete-user': {
        const id = target.dataset.id
        if (!id) break
        if (!confirm('确认删除该用户？')) break
        await apiCall('DELETE', `/api/users/${id}`)
        showToast('用户已删除')
        location.reload()
        break
      }
      case 'toggle-status': {
        const id = target.dataset.id
        if (!id) break
        await apiCall('PATCH', `/api/users/${id}/status`)
        showToast('状态已切换')
        location.reload()
        break
      }

      // ── Roles ──
      case 'open-add-role': {
        openModal('role-modal')
        break
      }
      case 'submit-role': {
        const modal = document.getElementById('role-modal')
        if (!modal) break
        const data = {
          code: getInputValue(modal, 'code'),
          name: getInputValue(modal, 'name'),
          description: getInputValue(modal, 'description')
        }
        await apiCall('POST', '/api/roles', data)
        showToast('角色创建成功')
        closeModal('role-modal')
        location.reload()
        break
      }
      case 'delete-role': {
        const id = target.dataset.id
        if (!id) break
        if (!confirm('确认删除该角色？')) break
        await apiCall('DELETE', `/api/roles/${id}`)
        showToast('角色已删除')
        location.reload()
        break
      }
      case 'save-role-perms': {
        const roleId = target.dataset.roleId
        if (!roleId) break
        const container = target.closest('[data-role-panel]') ?? document
        const checked = container.querySelectorAll<HTMLInputElement>('input[name="perm"]:checked')
        const permissionIds = Array.from(checked).map((el) => Number(el.value))
        await apiCall('PUT', `/api/roles/${roleId}/permissions`, { permissionIds })
        showToast('权限已保存')
        break
      }

      // ── Settings ──
      case 'save-settings': {
        const group = target.closest('[data-settings-group]') ?? document
        const inputs = group.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-setting-key]')
        for (const input of inputs) {
          const key = input.dataset.settingKey
          if (!key) continue
          await apiCall('PUT', `/api/settings/${key}`, { value: input.value })
        }
        showToast('设置已保存')
        break
      }

      // ── Profile ──
      case 'save-profile': {
        const form = document.getElementById('profile-form')
        if (!form) break
        const id = getInputValue(form, 'id')
        const data = {
          name: getInputValue(form, 'name'),
          email: getInputValue(form, 'email')
        }
        await apiCall('PUT', `/api/users/${id}`, data)
        showToast('资料已更新')
        break
      }
    }
  } catch (err) {
    showToast((err as Error).message, 'error')
  }
})

// ── 初始化 ──

document.addEventListener('DOMContentLoaded', initSelectors)
