import type { FC, PropsWithChildren } from 'hono/jsx'

interface IconProps {
  class?: string
  size?: number
}

const SvgIcon: FC<PropsWithChildren<IconProps>> = ({ class: cls, size = 18, children }) => (
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
    {children}
  </svg>
)

export const IconDashboard: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M9 22V12h6v10" />
  </SvgIcon>
)

export const IconUsers: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </SvgIcon>
)

export const IconUserCheck: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </SvgIcon>
)

export const IconShield: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </SvgIcon>
)

export const IconLock: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </SvgIcon>
)

export const IconSettings: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
  </SvgIcon>
)

export const IconUser: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </SvgIcon>
)

export const IconMenu: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M4 6h16" />
    <path d="M4 12h16" />
    <path d="M4 18h16" />
  </SvgIcon>
)

export const IconLogOut: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </SvgIcon>
)

export const IconClipboard: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
  </SvgIcon>
)

export const IconPlus: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </SvgIcon>
)

export const IconPencil: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="M15 5l4 4" />
  </SvgIcon>
)

export const IconTrash: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </SvgIcon>
)

export const IconSearch: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </SvgIcon>
)

export const IconChevronLeft: FC<IconProps> = (p) => (
  <SvgIcon {...p}><path d="M15 18l-6-6 6-6" /></SvgIcon>
)

export const IconChevronRight: FC<IconProps> = (p) => (
  <SvgIcon {...p}><path d="M9 18l6-6-6-6" /></SvgIcon>
)

export const IconCheck: FC<IconProps> = (p) => (
  <SvgIcon {...p}><path d="M20 6L9 17l-5-5" /></SvgIcon>
)

export const IconX: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </SvgIcon>
)

export const IconEye: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </SvgIcon>
)

export const IconRefresh: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10" />
    <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14" />
  </SvgIcon>
)

export const IconActivity: FC<IconProps> = (p) => (
  <SvgIcon {...p}><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></SvgIcon>
)

export const IconZap: FC<IconProps> = (p) => (
  <SvgIcon {...p}><path d="M13 2L3 14h9l-1 10 10-12h-9l1-10z" /></SvgIcon>
)

export const IconLayers: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </SvgIcon>
)

export const IconMail: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </SvgIcon>
)

export const IconKey: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </SvgIcon>
)

export const IconBell: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </SvgIcon>
)

export const IconCalendar: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </SvgIcon>
)

export const IconClock: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </SvgIcon>
)

export const IconFilter: FC<IconProps> = (p) => (
  <SvgIcon {...p}><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" /></SvgIcon>
)

export const IconAlertTriangle: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" x2="12" y1="9" y2="13" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </SvgIcon>
)

export const IconGlobe: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </SvgIcon>
)

export const IconArrowRight: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </SvgIcon>
)

export const IconTrendingUp: FC<IconProps> = (p) => (
  <SvgIcon {...p}>
    <path d="M23 6l-9.5 9.5-5-5L1 18" />
    <path d="M17 6h6v6" />
  </SvgIcon>
)

export const iconMap: Record<string, FC<IconProps>> = {
  dashboard: IconDashboard,
  users: IconUsers,
  userCheck: IconUserCheck,
  shield: IconShield,
  lock: IconLock,
  settings: IconSettings,
  user: IconUser,
  menu: IconMenu,
  logout: IconLogOut,
  clipboard: IconClipboard,
  plus: IconPlus,
  pencil: IconPencil,
  trash: IconTrash,
  search: IconSearch,
  chevronLeft: IconChevronLeft,
  chevronRight: IconChevronRight,
  check: IconCheck,
  x: IconX,
  eye: IconEye,
  refresh: IconRefresh,
  activity: IconActivity,
  zap: IconZap,
  layers: IconLayers,
  mail: IconMail,
  key: IconKey,
  bell: IconBell,
  calendar: IconCalendar,
  clock: IconClock,
  filter: IconFilter,
  alertTriangle: IconAlertTriangle,
  globe: IconGlobe,
  arrowRight: IconArrowRight,
  trendingUp: IconTrendingUp,
}
