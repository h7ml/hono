import type { SkinName, ThemeMode } from './types/app'

const THEME_MODE_KEY = 'halolight.theme.mode'
const SKIN_KEY = 'halolight.theme.skin'

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

document.addEventListener('DOMContentLoaded', initSelectors)
