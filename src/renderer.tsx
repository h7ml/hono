import { jsxRenderer } from 'hono/jsx-renderer'
import { Link, Script, ViteClient } from 'vite-ssr-components/hono'

const themeBootstrapScript = `
(() => {
  const mode = localStorage.getItem('halolight.theme.mode') || 'system';
  const skin = localStorage.getItem('halolight.theme.skin') || 'blue';
  const root = document.documentElement;
  const dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.classList.toggle('dark', dark);
  root.classList.toggle('light', !dark);
  root.dataset.skin = skin;
})();
`

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>HaloLight Admin</title>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <ViteClient />
        <Link href="/src/style.css" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Script src="/src/client.ts" />
      </body>
    </html>
  )
})
