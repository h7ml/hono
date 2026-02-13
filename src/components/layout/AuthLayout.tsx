import type { FC, PropsWithChildren } from 'hono/jsx'

interface AuthLayoutProps {
  title: string
}

export const AuthLayout: FC<PropsWithChildren<AuthLayoutProps>> = ({
  children,
  title
}) => {
  return (
    <main class="auth-shell">
      <section class="auth-card">
        <h1>{title}</h1>
        {children}
      </section>
    </main>
  )
}
