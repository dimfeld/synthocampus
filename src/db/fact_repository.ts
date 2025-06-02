import { getDb } from './index.js';

function _logFactHistory(factId: number, changeType: 'CREATE' | 'UPDATE' | 'DELETE', oldData: object, newData: object): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO fact_history (fact_id, change_type, old_data, new_data)
    VALUES (?, ?, ?, ?)
  `);
  
  stmt.run(factId, changeType, JSON.stringify(oldData), JSON.stringify(newData));
}

export function insertFact(person: string, category: string, content: string): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO facts (person, category, content)
    VALUES (?, ?, ?)
  `);
  
  const result = stmt.run(person, category, content);
  
  // Log the creation in fact_history
  const newFactData = {
    id: result.lastInsertRowid,
    person,
    category,
    content,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted: 0,
    metadata: {}
  };
  
  _logFactHistory(result.lastInsertRowid as number, 'CREATE', {}, newFactData);
}

export function getFacts(person: string, category?: string): Array<{id: number, person: string, category: string, content: string, created_at: string}> {
  const db = getDb();
  
  if (category) {
    const stmt = db.prepare(`
      SELECT id, person, category, content, created_at 
      FROM facts 
      WHERE person = ? AND category = ? AND deleted = 0
    `);
    return stmt.all(person, category);
  } else {
    const stmt = db.prepare(`
      SELECT id, person, category, content, created_at 
      FROM facts 
      WHERE person = ? AND deleted = 0
    `);
    return stmt.all(person);
  }
}