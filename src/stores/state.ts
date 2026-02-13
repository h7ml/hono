import type { SkinName, ThemeMode } from '../types/app'

export interface AuthStoreState {
  isAuthenticated: boolean
  role: string
}

export interface UISettingsState {
  sidebarCollapsed: boolean
  skin: SkinName
  themeMode: ThemeMode
}

export interface NavigationState {
  activePath: string
}

export const defaultAuthState: AuthStoreState = {
  isAuthenticated: false,
  role: 'viewer'
}

export const defaultUISettingsState: UISettingsState = {
  sidebarCollapsed: false,
  skin: 'blue',
  themeMode: 'system'
}

export const defaultNavigationState: NavigationState = {
  activePath: '/dashboard'
}
