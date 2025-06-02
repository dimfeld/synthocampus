import { getDb } from './index.js';

export function insertFact(person: string, category: string, content: string): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO facts (person, category, content)
    VALUES (?, ?, ?)
  `);
  
  stmt.run(person, category, content);
}