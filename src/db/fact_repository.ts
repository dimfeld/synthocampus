import { getDb } from './index.js';

export function insertFact(person: string, category: string, content: string): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO facts (person, category, content)
    VALUES (?, ?, ?)
  `);
  
  stmt.run(person, category, content);
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