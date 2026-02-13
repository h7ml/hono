-- 动态 RBAC 表 + 系统设置 + 审计日志

CREATE TABLE IF NOT EXISTS hono_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  is_system INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hono_permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_system INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_hono_perms_ra ON hono_permissions(resource, action);

CREATE TABLE IF NOT EXISTS hono_role_permissions (
  role_id INTEGER NOT NULL REFERENCES hono_roles(id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES hono_permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS hono_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  value_type TEXT NOT NULL DEFAULT 'string',
  group_name TEXT NOT NULL DEFAULT 'general',
  label TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS hono_audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  user_name TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL DEFAULT '',
  resource_id TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '',
  ip TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_hono_audit_created ON hono_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hono_audit_user ON hono_audit_logs(user_id);

-- ======== 种子数据 ========

-- 角色
INSERT INTO hono_roles (code, name, description, is_system) VALUES
  ('admin',   '管理员',   '系统管理员，拥有全部权限', 1),
  ('manager', '运营经理', '运营管理，拥有大部分权限', 1),
  ('viewer',  '观察者',   '只读权限',               1);

-- 权限
INSERT INTO hono_permissions (code, resource, action, name, is_system) VALUES
  ('dashboard:view',     'dashboard',   'view',   '查看仪表盘',   1),
  ('users:list',         'users',       'list',   '查看用户列表', 1),
  ('users:create',       'users',       'create', '创建用户',     1),
  ('users:update',       'users',       'update', '编辑用户',     1),
  ('users:delete',       'users',       'delete', '删除用户',     1),
  ('roles:list',         'roles',       'list',   '查看角色列表', 1),
  ('roles:create',       'roles',       'create', '创建角色',     1),
  ('roles:update',       'roles',       'update', '编辑角色',     1),
  ('roles:delete',       'roles',       'delete', '删除角色',     1),
  ('permissions:list',   'permissions', 'list',   '查看权限列表', 1),
  ('permissions:create', 'permissions', 'create', '创建权限',     1),
  ('permissions:update', 'permissions', 'update', '编辑权限',     1),
  ('permissions:delete', 'permissions', 'delete', '删除权限',     1),
  ('settings:view',      'settings',    'view',   '查看系统设置', 1),
  ('settings:update',    'settings',    'update', '修改系统设置', 1),
  ('audit:list',         'audit',       'list',   '查看审计日志', 1),
  ('profile:view',       'profile',     'view',   '查看个人资料', 1),
  ('profile:update',     'profile',     'update', '修改个人资料', 1);

-- admin: 全部权限
INSERT INTO hono_role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM hono_roles r, hono_permissions p WHERE r.code = 'admin';

-- manager: 大部分读 + 部分写
INSERT INTO hono_role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM hono_roles r, hono_permissions p
  WHERE r.code = 'manager' AND p.code IN (
    'dashboard:view','users:list','users:create','users:update',
    'roles:list','permissions:list','settings:view',
    'profile:view','profile:update'
  );

-- viewer: 只读
INSERT INTO hono_role_permissions (role_id, permission_id)
  SELECT r.id, p.id FROM hono_roles r, hono_permissions p
  WHERE r.code = 'viewer' AND p.code IN (
    'dashboard:view','users:list','profile:view','profile:update'
  );

-- 系统设置
INSERT INTO hono_settings (key, value, value_type, group_name, label, description) VALUES
  ('site.name',             'HaloLight Admin', 'string', 'general', '站点名称',      '管理系统显示名称'),
  ('site.description',      'HaloLight 管理系统', 'string', 'general', '站点描述',    ''),
  ('auth.session_ttl',      '900',          'number', 'auth',    '会话时长(秒)',  'Access Token 有效期'),
  ('auth.refresh_ttl',      '604800',       'number', 'auth',    '刷新时长(秒)',  'Refresh Token 有效期'),
  ('auth.max_login_attempts','5',           'number', 'auth',    '最大登录尝试',  '锁定前最大失败次数'),
  ('ui.default_theme',      'system',       'string', 'ui',      '默认主题',      'light / dark / system'),
  ('ui.default_skin',       'blue',         'string', 'ui',      '默认皮肤',      '默认皮肤色系'),
  ('ui.page_size',          '10',           'number', 'ui',      '默认分页大小',  '列表每页条数');
