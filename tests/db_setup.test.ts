import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { Database } from 'bun:sqlite';
import { up as createFactsTable } from '../src/db/migrations/001_create_facts_table';

describe('Database Setup', () => {
  let db: Database;

  beforeEach(() => {
    // Create in-memory database for testing
    db = new Database(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  test('should create facts table with correct schema', () => {
    // Run migration
    createFactsTable(db);

    // Check if table exists
    const tableInfo = db.query(`
      SELECT sql FROM sqlite_master 
      WHERE type='table' AND name='facts'
    `).get() as { sql: string } | null;

    expect(tableInfo).toBeTruthy();
    expect(tableInfo?.sql).toContain('CREATE TABLE');
    expect(tableInfo?.sql).toContain('facts');
  });

  test('should have all required columns', () => {
    // Run migration
    createFactsTable(db);

    // Get column information
    const columns = db.query('PRAGMA table_info(facts)').all() as Array<{
      name: string;
      type: string;
      notnull: number;
      dflt_value: string | null;
      pk: number;
    }>;

    // Check column count
    expect(columns.length).toBe(8);

    // Check each column
    const columnMap = new Map(columns.map(col => [col.name, col]));

    // id column
    const idCol = columnMap.get('id');
    expect(idCol?.type).toBe('INTEGER');
    expect(idCol?.pk).toBe(1);

    // person column
    const personCol = columnMap.get('person');
    expect(personCol?.type).toBe('TEXT');
    expect(personCol?.notnull).toBe(1);

    // category column
    const categoryCol = columnMap.get('category');
    expect(categoryCol?.type).toBe('TEXT');
    expect(categoryCol?.notnull).toBe(1);

    // content column
    const contentCol = columnMap.get('content');
    expect(contentCol?.type).toBe('TEXT');
    expect(contentCol?.notnull).toBe(1);

    // created_at column
    const createdAtCol = columnMap.get('created_at');
    expect(createdAtCol?.type).toBe('TEXT');
    expect(createdAtCol?.notnull).toBe(1);
    expect(createdAtCol?.dflt_value).toBe('CURRENT_TIMESTAMP');

    // updated_at column
    const updatedAtCol = columnMap.get('updated_at');
    expect(updatedAtCol?.type).toBe('TEXT');
    expect(updatedAtCol?.notnull).toBe(1);
    expect(updatedAtCol?.dflt_value).toBe('CURRENT_TIMESTAMP');

    // deleted column
    const deletedCol = columnMap.get('deleted');
    expect(deletedCol?.type).toBe('INTEGER');
    expect(deletedCol?.notnull).toBe(1);
    expect(deletedCol?.dflt_value).toBe('0');

    // metadata column
    const metadataCol = columnMap.get('metadata');
    expect(metadataCol?.type).toBe('TEXT');
    expect(metadataCol?.dflt_value).toBe("'{}'");
  });

  test('should create indexes', () => {
    // Run migration
    createFactsTable(db);

    // Check indexes
    const indexes = db.query(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND tbl_name='facts'
    `).all() as Array<{ name: string }>;

    const indexNames = indexes.map(idx => idx.name);
    expect(indexNames).toContain('idx_facts_person');
    expect(indexNames).toContain('idx_facts_category');
    expect(indexNames).toContain('idx_facts_deleted');
  });

  test('should validate JSON in metadata column', () => {
    // Run migration
    createFactsTable(db);

    // Insert valid JSON
    const insertValid = db.prepare(`
      INSERT INTO facts (person, category, content, metadata) 
      VALUES (?, ?, ?, ?)
    `);
    
    expect(() => {
      insertValid.run('John', 'preference', 'likes coffee', '{"tags": ["morning"]}');
    }).not.toThrow();

    // Try to insert invalid JSON
    expect(() => {
      insertValid.run('John', 'preference', 'likes tea', 'invalid json');
    }).toThrow();
  });
});