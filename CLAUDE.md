# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev              # 启动 Vite 开发服务器（HMR + Cloudflare Workers 本地模拟）
npm run build            # Vite 生产构建
npm run typecheck        # TypeScript 类型检查（tsc --noEmit）
npm run deploy           # 远程 D1 迁移 + 构建 + wrangler deploy
npm run db:migrate:local # 本地 D1 迁移
npm run db:migrate:remote # 远程 D1 迁移
npx wrangler cf-typegen  # 从 wrangler.jsonc 生成 CloudflareBindings 类型
```

## Architecture

**Tech Stack**: Hono v4 SSR + Cloudflare Workers + D1 SQLite + Tailwind CSS v4 + DaisyUI v5

**SSR-first 单页混合架构**：服务端渲染 HTML，客户端通过 `data-action` 事件委托处理交互，无前端框架路由。

### 核心文件

- `src/index.tsx` — 所有路由（SSR 页面 + REST API）+ scheduled cron handler，单一入口
- `src/client.ts` — 客户端事件委托，通过 `document.addEventListener('click')` 监听 `data-action` 属性分发操作
- `src/renderer.tsx` — Hono JSX 渲染器，挂载 Vite 客户端资源和主题引导脚本

### 目录结构

```
src/
├── components/layout/   # AdminLayout（侧边栏+面包屑）、AuthLayout
├── components/icons.tsx  # SVG 图标组件库
├── config/routes.ts      # 路由定义 + 侧边栏分组
├── lib/auth.ts           # Cookie 会话（6 个 httpOnly cookie）
├── lib/permissions.ts    # RBAC 权限检查（resource:action 格式）
├── lib/db/               # D1 数据层（users, roles, permissions, settings, audit, checkin）
├── lib/checkin.ts        # AnyRouter 签到核心逻辑 + PushPlus 通知
├── pages/admin/          # 管理后台页面组件
├── pages/auth/           # 登录/注册/找回密码页面
├── types/app.ts          # 所有 TypeScript 类型定义
└── style.css             # Tailwind + DaisyUI 主题 + 自定义组件样式
```

### 关键模式

**页面渲染**: `renderAdminPage(path, title, content, context, permission?)` 统一处理会话校验、权限检查、布局包装。

**DB 模块**: 每个模块遵循相同模式——导入 `buildPagination`/`paginated` 工具函数，使用 D1 prepared statements，返回强类型结果。所有表名前缀 `hono_`。

**权限格式**: `resource:action`（如 `users:list`、`checkin:run`），支持通配符 `*` 和 `resource:*`。

**客户端交互**: 按钮添加 `data-action="xxx"` + `data-id` 等属性，`client.ts` 中 switch-case 分发，调用 `apiCall()` 后 `location.reload()` 刷新。

**Cron 调度**: `src/index.tsx` 底部 `cronHandlers` 映射表，key 为 cron 表达式，value 为异步处理函数。新增定时任务只需添加映射条目。

### 数据库迁移

迁移文件位于 `migrations/` 目录，按序号命名（`0001_init.sql`、`0002_rbac_and_settings.sql` 等）。D1 数据库绑定名为 `DB`，通过 `c.env.DB` 访问。

### 主题系统

双主题 `halolight`/`halodark` + 多皮肤（data-skin 属性）。主题状态存储在 localStorage，通过 `renderer.tsx` 中的引导脚本在 HTML 解析前应用，避免闪烁。
