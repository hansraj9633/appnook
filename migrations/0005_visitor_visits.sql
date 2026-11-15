-- Count each public site load once. A new visit ID is generated on every
-- full site load, while duplicate requests from the same load are ignored.
CREATE TABLE IF NOT EXISTS visitor_visits (
  visit_id TEXT PRIMARY KEY,
  visited_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_visitor_visits_visited_at
  ON visitor_visits (visited_at);
