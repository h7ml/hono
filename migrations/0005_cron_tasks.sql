-- 通用定时任务表
CREATE TABLE hono_cron_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cron_expr TEXT NOT NULL DEFAULT '0 0 * * *',
  http_method TEXT NOT NULL DEFAULT 'GET',
  url TEXT NOT NULL,
  headers TEXT NOT NULL DEFAULT '{}',
  body TEXT NOT NULL DEFAULT '',
  timeout_ms INTEGER NOT NULL DEFAULT 30000,
  max_retries INTEGER NOT NULL DEFAULT 0,
  notify_on_failure INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  next_run_at TEXT,
  last_run_at TEXT,
  last_run_result TEXT,
  last_run_status INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_cron_tasks_schedule ON hono_cron_tasks(status, next_run_at);

-- 执行日志表
CREATE TABLE hono_cron_task_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL,
  task_name TEXT NOT NULL DEFAULT '',
  success INTEGER NOT NULL DEFAULT 0,
  status_code INTEGER,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  response_preview TEXT NOT NULL DEFAULT '',
  trigger_source TEXT NOT NULL DEFAULT 'scheduled',
  message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_cron_task_logs_created ON hono_cron_task_logs(created_at DESC);
CREATE INDEX idx_cron_task_logs_task ON hono_cron_task_logs(task_id, created_at DESC);

-- 权限种子
INSERT INTO hono_permissions (code, resource, action, name, is_system) VALUES
  ('crontask:list', 'crontask', 'list', '查看定时任务', 1),
  ('crontask:create', 'crontask', 'create', '创建定时任务', 1),
  ('crontask:update', 'crontask', 'update', '编辑定时任务', 1),
  ('crontask:delete', 'crontask', 'delete', '删除定时任务', 1),
  ('crontask:run', 'crontask', 'run', '执行定时任务', 1);

-- admin 角色绑定
INSERT INTO hono_role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM hono_roles r, hono_permissions p
  WHERE r.code = 'admin' AND p.resource = 'crontask';
