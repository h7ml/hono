# HaloLight Hono 管理系统（Cloudflare D1 版）

## 快速开始

```bash
npm install
npm run dev
```

访问：`http://localhost:5173/login`

## D1 初始化

1. 创建数据库：

```bash
npx wrangler d1 create hono-halolight-db
```

2. 将返回的 `database_id` 写入 `wrangler.jsonc` 的：
- `d1_databases[0].database_id`
- `d1_databases[0].preview_database_id`

3. 执行迁移：

```bash
npx wrangler d1 migrations apply hono-halolight-db --local
npx wrangler d1 migrations apply hono-halolight-db --remote
```

## 默认演示账号（由 migration 自动插入）

- `admin / admin123`
- `manager / manager123`
- `viewer / viewer123`

数据库表采用前缀规范：`hono_users`。

## 已对接 API

- `POST /api/auth/login`
- `GET /api/users?page=1&pageSize=10`
- `GET /api/routes`

## 环境变量

- `VITE_ENABLE_MOCK`（默认 `false`）
- `VITE_API_BASE_URL`（默认 `/api`）
- `VITE_BRAND_NAME`
- `VITE_DEMO_USERNAME`

## 部署

```bash
npm run deploy
```
