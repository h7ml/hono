import type { FC, PropsWithChildren } from 'hono/jsx'

interface AuthLayoutProps {
  title: string
}

export const AuthLayout: FC<PropsWithChildren<AuthLayoutProps>> = ({
  children,
  title
}) => {
  return (
    <main class="min-h-screen grid place-items-center p-5">
      <div class="card bg-base-100 border border-base-300 w-full max-w-md">
        <div class="card-body">
          <h1 class="card-title text-2xl">{title}</h1>
          {children}
        </div>
      </div>
    </main>
  )
}
