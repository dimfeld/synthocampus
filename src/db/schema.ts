export const factsTableSchema = `
CREATE TABLE IF NOT EXISTS facts (
  id INTEGER PRIMARY KEY,
  person TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted INTEGER NOT NULL DEFAULT 0,
  metadata TEXT DEFAULT '{}' CHECK(json_valid(metadata))
);

CREATE INDEX IF NOT EXISTS idx_facts_person ON facts(person);
CREATE INDEX IF NOT EXISTS idx_facts_category ON facts(category);
CREATE INDEX IF NOT EXISTS idx_facts_deleted ON facts(deleted);
`;