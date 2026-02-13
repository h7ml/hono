import type { FC, PropsWithChildren } from 'hono/jsx'

interface AuthLayoutProps {
  title: string
}

export const AuthLayout: FC<PropsWithChildren<AuthLayoutProps>> = ({
  children,
  title
}) => {
  return (
    <main class="min-h-screen grid place-items-center p-5 relative overflow-hidden">
      {/* 装饰背景元素 */}
      <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div class="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-secondary/8 blur-3xl" />
        <div class="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div class="auth-card rounded-2xl w-full max-w-md relative z-10">
        <div class="p-8">
          {children}
        </div>
      </div>
    </main>
  )
}
