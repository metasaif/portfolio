CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE,
  fingerprint TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  budget TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','completed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS inquiries_status_date ON inquiries(status, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS inquiries_date ON inquiries(created_at DESC, id DESC);
