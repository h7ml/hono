# HaloLight Hono 管理系统骨架

## 快速开始

```bash
npm install
npm run dev
```

访问：`http://localhost:5173/login`

## 已集成功能

- HaloLight IA 路由与权限元信息（`/dashboard`、`/users`、`/roles`、`/permissions`、`/settings`、`/profile`）
- Admin/Auth 双布局
- 认证流程占位（双 Token cookie：15 分钟 access + 7 天 refresh）
- 主题模式 `light/dark/system` + skin 持久化
- 状态模块骨架（`auth`、`ui-settings`、`navigation`）
- Mock/API 服务层与分页响应结构

## 环境变量

复制 `.env.example` 并按需调整：

- `VITE_ENABLE_MOCK`
- `VITE_API_BASE_URL`
- `VITE_BRAND_NAME`
- `VITE_DEMO_USERNAME`

## Cloudflare 部署

```bash
npm run deploy
```
