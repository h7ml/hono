CREATE TABLE IF NOT EXISTS hono_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'viewer',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_hono_users_role ON hono_users(role);
CREATE INDEX IF NOT EXISTS idx_hono_users_status ON hono_users(status);

INSERT OR IGNORE INTO hono_users (username, password, name, email, role, status) VALUES
  ('admin', 'admin123', 'Halo Admin', 'admin@halolight.dev', 'admin', 'active'),
  ('manager', 'manager123', 'Ops Manager', 'ops@halolight.dev', 'manager', 'active'),
  ('viewer', 'viewer123', 'Data Viewer', 'viewer@halolight.dev', 'viewer', 'active');
