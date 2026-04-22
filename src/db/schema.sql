-- SQLite schema for split-the-bob

CREATE TABLE IF NOT EXISTS splits (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  participants TEXT NOT NULL,
  default_currency TEXT NOT NULL,
  created_at REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  split_id TEXT NOT NULL,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  currency TEXT NOT NULL,
  original_amount REAL NOT NULL,
  original_currency TEXT NOT NULL,
  payed_by TEXT NOT NULL,
  payed_for TEXT NOT NULL,
  expense_date REAL NOT NULL,
  split_method TEXT NOT NULL,
  created_at REAL NOT NULL,
  FOREIGN KEY (split_id) REFERENCES splits(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_expenses_split_id ON expenses(split_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_at ON expenses(created_at);
