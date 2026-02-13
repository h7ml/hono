-- 签到账户表
CREATE TABLE hono_checkin_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL DEFAULT '',
  session_cookie TEXT NOT NULL,
  upstream_url TEXT NOT NULL DEFAULT 'https://anyrouter.top',
  status TEXT NOT NULL DEFAULT 'active',
  last_checkin_at TEXT,
  last_checkin_result TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 签到日志表
CREATE TABLE hono_checkin_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  account_label TEXT NOT NULL DEFAULT '',
  success INTEGER NOT NULL DEFAULT 0,
  message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX idx_checkin_logs_created ON hono_checkin_logs(created_at DESC);

-- 权限种子
INSERT INTO hono_permissions (code, resource, action, name, is_system) VALUES
  ('checkin:list', 'checkin', 'list', '查看签到管理', 1),
  ('checkin:create', 'checkin', 'create', '添加签到账户', 1),
  ('checkin:update', 'checkin', 'update', '编辑签到账户', 1),
  ('checkin:delete', 'checkin', 'delete', '删除签到账户', 1),
  ('checkin:run', 'checkin', 'run', '执行签到', 1);

-- admin 角色绑定
INSERT INTO hono_role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM hono_roles r, hono_permissions p
  WHERE r.code = 'admin' AND p.resource = 'checkin';

-- PushPlus Token 设置
INSERT INTO hono_settings (key, value, value_type, group_name, label, description) VALUES
  ('notification.pushplus_token', '', 'string', 'notification', 'PushPlus Token', '留空则不推送');
