import type { FC } from 'hono/jsx'

interface IconProps {
  class?: string
  size?: number
}

const svg = (d: string): FC<IconProps> => {
  return ({ class: cls, size = 18 }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={cls}
    >
      <path d={d} />
    </svg>
  )
}

const svgMulti = (paths: string[]): FC<IconProps> => {
  return ({ class: cls, size = 18 }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class={cls}
    >
      {paths.map((d) => (
        <path d={d} />
      ))}
    </svg>
  )
}

export const IconDashboard: FC<IconProps> = svgMulti([
  'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  'M9 22V12h6v10',
])

export const IconUsers: FC<IconProps> = svgMulti([
  'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
  'M23 21v-2a4 4 0 0 0-3-3.87',
  'M16 3.13a4 4 0 0 1 0 7.75',
])

export const IconShield: FC<IconProps> = svg('M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z')

export const IconLock: FC<IconProps> = svgMulti([
  'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z',
  'M7 11V7a5 5 0 0 1 10 0v4',
])

export const IconSettings: FC<IconProps> = svgMulti([
  'M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z',
])

export const IconUser: FC<IconProps> = svgMulti([
  'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
])

export const IconMenu: FC<IconProps> = svgMulti([
  'M4 6h16',
  'M4 12h16',
  'M4 18h16',
])

export const IconLogOut: FC<IconProps> = svgMulti([
  'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4',
  'M16 17l5-5-5-5',
  'M21 12H9',
])

export const iconMap: Record<string, FC<IconProps>> = {
  dashboard: IconDashboard,
  users: IconUsers,
  shield: IconShield,
  lock: IconLock,
  settings: IconSettings,
  user: IconUser,
  menu: IconMenu,
  logout: IconLogOut,
}
